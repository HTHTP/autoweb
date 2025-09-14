/**
 * 在线编译器 - 支持Vue3单文件组件实时编译
 * 类似 CodeSandbox 的浏览器内编译方案
 */

import * as compilerSfc from '@vue/compiler-sfc'
import { transform } from '@babel/standalone'

export interface FileDescriptor {
  filename: string
  code: string
  compiled?: {
    js?: string
    css?: string
    errors?: string[]
  }
}

export interface CompileOptions {
  // 是否启用TypeScript支持
  typescript?: boolean
  // 自定义import映射
  importMap?: Record<string, string>
  // CDN配置
  cdn?: {
    vue?: string
    elementPlus?: string
  }
}

export class OnlineCompiler {
  private importMap: Record<string, string>
  private styleManager: StyleManager

  constructor(options: CompileOptions = {}) {
    this.importMap = {
      'vue': 'https://unpkg.com/vue@3/dist/vue.esm-browser.js',
      'element-plus': 'https://unpkg.com/element-plus@2.4.0/dist/index.esm.js',
      '@element-plus/icons-vue': 'https://unpkg.com/@element-plus/icons-vue@2.1.0/dist/index.esm.js',
      ...options.importMap
    }
    
    this.styleManager = new StyleManager()
  }

  /**
   * 编译Vue单文件组件
   */
  async compileVueSFC(filename: string, source: string): Promise<{
    js: string
    css?: string
    errors: string[]
  }> {
    const errors: string[] = []

    try {
      // 解析SFC
      const { descriptor, errors: parseErrors } = compilerSfc.parse(source, {
        filename,
        sourceMap: false
      })

      if (parseErrors.length) {
        errors.push(...parseErrors.map(e => e.message))
      }

      let compiledScript = ''
      let compiledStyle = ''

      // 编译script部分
      if (descriptor.script || descriptor.scriptSetup) {
        const scriptResult = await this.compileScript(descriptor, filename)
        if (scriptResult.errors.length) {
          errors.push(...scriptResult.errors)
        } else {
          compiledScript = scriptResult.code
        }
      }

      // 编译template部分
      let compiledTemplate = ''
      if (descriptor.template) {
        const templateResult = compilerSfc.compileTemplate({
          source: descriptor.template.content,
          filename,
          id: this.generateId(filename),
          scoped: descriptor.styles.some(s => s.scoped),
          slotted: descriptor.slotted,
          compilerOptions: {
            mode: 'module'
          }
        })

        if (templateResult.errors.length) {
          errors.push(...templateResult.errors.map(e => 
            typeof e === 'string' ? e : e.message
          ))
        } else {
          compiledTemplate = templateResult.code
        }
      }

      // 编译style部分
      if (descriptor.styles.length) {
        for (const style of descriptor.styles) {
          const styleResult = await compilerSfc.compileStyle({
            source: style.content,
            filename,
            id: this.generateId(filename),
            scoped: style.scoped
          })

          if (styleResult.errors.length) {
            errors.push(...styleResult.errors.map(e => e.message))
          } else {
            compiledStyle += styleResult.code
          }
        }
      }

      // 组合最终的JavaScript代码
      const finalJS = this.buildFinalModule(
        compiledScript,
        compiledTemplate,
        filename
      )

      return {
        js: finalJS,
        css: compiledStyle,
        errors
      }
    } catch (error) {
      errors.push((error as Error).message)
      return {
        js: '',
        errors
      }
    }
  }

  /**
   * 编译普通JavaScript/TypeScript文件
   */
  async compileJS(filename: string, source: string): Promise<{
    js: string
    errors: string[]
  }> {
    const errors: string[] = []

    try {
      // 转换import语句
      const transformedSource = this.transformImports(source)

      // 如果是TypeScript文件，进行类型转换
      if (filename.endsWith('.ts')) {
        const result = transform(transformedSource, {
          presets: ['typescript'],
          filename
        })
        
        return {
          js: result.code || '',
          errors
        }
      }

      return {
        js: transformedSource,
        errors
      }
    } catch (error) {
      errors.push((error as Error).message)
      return {
        js: '',
        errors
      }
    }
  }

  /**
   * 编译整个项目
   */
  async compileProject(files: Record<string, string>): Promise<{
    modules: Record<string, any>
    styles: string
    errors: string[]
    entryPoint: string
  }> {
    const modules: Record<string, any> = {}
    const errors: string[] = []
    let combinedStyles = ''

    // 编译所有文件
    for (const [filename, source] of Object.entries(files)) {
      if (filename.endsWith('.vue')) {
        const result = await this.compileVueSFC(filename, source)
        modules[filename] = result.js
        if (result.css) {
          combinedStyles += result.css
        }
        errors.push(...result.errors)
      } else if (filename.endsWith('.js') || filename.endsWith('.ts')) {
        const result = await this.compileJS(filename, source)
        modules[filename] = result.js
        errors.push(...result.errors)
      } else if (filename.endsWith('.css')) {
        combinedStyles += source
      }
    }

    // 生成入口点
    const entryPoint = this.generateEntryPoint(files)

    return {
      modules,
      styles: combinedStyles,
      errors,
      entryPoint
    }
  }

  /**
   * 转换import语句为CDN链接
   */
  private transformImports(source: string): string {
    return source.replace(
      /import\s+(.+)\s+from\s+['"](.+)['"]/g,
      (match, imports, moduleName) => {
        if (this.importMap[moduleName]) {
          return `import ${imports} from '${this.importMap[moduleName]}'`
        }
        
        // 处理相对路径导入
        if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
          return match // 保持原样，后续处理
        }

        // 尝试从unpkg加载
        const unpkgUrl = `https://unpkg.com/${moduleName}@latest/dist/index.esm.js`
        return `import ${imports} from '${unpkgUrl}'`
      }
    )
  }

  /**
   * 编译script部分
   */
  private async compileScript(
    descriptor: compilerSfc.SFCDescriptor, 
    filename: string
  ): Promise<{ code: string; errors: string[] }> {
    const errors: string[] = []

    try {
      const scriptResult = compilerSfc.compileScript(descriptor, {
        id: this.generateId(filename),
        babelParserPlugins: ['typescript', 'jsx']
      })

      let code = scriptResult.content

      // 转换import语句
      code = this.transformImports(code)

      return { code, errors }
    } catch (error) {
      errors.push((error as Error).message)
      return { code: '', errors }
    }
  }

  /**
   * 构建最终模块
   */
  private buildFinalModule(
    script: string,
    template: string,
    filename: string
  ): string {
    const id = this.generateId(filename)

    return `
// ${filename}
${script}

${template}

// 导出组件
if (typeof render !== 'undefined') {
  _sfc_main.render = render
}

_sfc_main.__file = '${filename}'
_sfc_main.__scopeId = 'data-v-${id}'

export default _sfc_main
`
  }

  /**
   * 生成入口点
   */
  private generateEntryPoint(files: Record<string, string>): string {
    // 查找App.vue或main.js作为入口
    const entryFiles = ['src/App.vue', 'App.vue', 'src/main.js', 'main.js']
    const entryFile = entryFiles.find(file => files[file])

    if (!entryFile) {
      // 如果没有找到标准入口，使用第一个Vue文件
      const vueFiles = Object.keys(files).filter(f => f.endsWith('.vue'))
      if (vueFiles.length > 0) {
        return this.generateVueAppEntryPoint(vueFiles[0])
      }
    }

    return entryFile ? this.generateVueAppEntryPoint(entryFile) : ''
  }

  /**
   * 生成Vue应用入口点
   */
  private generateVueAppEntryPoint(appFile: string): string {
    return `
import { createApp } from 'vue'
import App from './${appFile}'

// 创建Vue应用
const app = createApp(App)

// 挂载应用
app.mount('#app')

// 导出应用实例供调试使用
window.__VUE_APP__ = app
`
  }

  /**
   * 生成组件ID
   */
  private generateId(filename: string): string {
    return btoa(filename).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)
  }
}

/**
 * 样式管理器
 */
class StyleManager {
  private styleElements = new Map<string, HTMLStyleElement>()

  /**
   * 添加样式
   */
  addStyle(id: string, css: string): void {
    let styleEl = this.styleElements.get(id)
    
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.setAttribute('data-vue-ssr-id', id)
      document.head.appendChild(styleEl)
      this.styleElements.set(id, styleEl)
    }

    styleEl.textContent = css
  }

  /**
   * 移除样式
   */
  removeStyle(id: string): void {
    const styleEl = this.styleElements.get(id)
    if (styleEl) {
      document.head.removeChild(styleEl)
      this.styleElements.delete(id)
    }
  }

  /**
   * 清空所有样式
   */
  clearAll(): void {
    this.styleElements.forEach((styleEl) => {
      document.head.removeChild(styleEl)
    })
    this.styleElements.clear()
  }
}

/**
 * 创建模块解析器
 */
export class ModuleResolver {
  private modules = new Map<string, any>()

  /**
   * 注册模块
   */
  register(name: string, module: any): void {
    this.modules.set(name, module)
  }

  /**
   * 解析模块
   */
  resolve(name: string): any {
    return this.modules.get(name)
  }

  /**
   * 动态导入模块
   */
  async dynamicImport(url: string): Promise<any> {
    try {
      return await import(url)
    } catch (error) {
      console.error(`Failed to import module: ${url}`, error)
      throw error
    }
  }
}

// 导出默认编译器实例
export const defaultCompiler = new OnlineCompiler()
/**
 * ES模块解析器 - 处理动态导入和CDN依赖管理
 */

export interface ImportMap {
  [moduleId: string]: string
}

export interface ResolverOptions {
  // CDN基础URL
  cdnBase?: string
  // 自定义导入映射
  importMap?: ImportMap
  // 是否启用缓存
  cache?: boolean
}

export class ModuleResolver {
  private importMap: ImportMap = {}
  private moduleCache = new Map<string, any>()
  private cdnBase: string
  private cacheEnabled: boolean

  constructor(options: ResolverOptions = {}) {
    this.cdnBase = options.cdnBase || 'https://unpkg.com'
    this.cacheEnabled = options.cache !== false
    
    // 设置默认导入映射
    this.importMap = {
      'vue': 'https://unpkg.com/vue@3/dist/vue.esm-browser.js',
      'element-plus': 'https://unpkg.com/element-plus@2.4.0/dist/index.esm.js',
      '@element-plus/icons-vue': 'https://unpkg.com/@element-plus/icons-vue@2.1.0/dist/index.esm.js',
      ...options.importMap
    }
  }

  /**
   * 解析模块URL
   */
  resolveModuleUrl(moduleId: string): string {
    // 检查是否已有映射
    if (this.importMap[moduleId]) {
      return this.importMap[moduleId]
    }

    // 相对路径不处理
    if (moduleId.startsWith('./') || moduleId.startsWith('../')) {
      return moduleId
    }

    // 绝对URL不处理
    if (moduleId.startsWith('http://') || moduleId.startsWith('https://')) {
      return moduleId
    }

    // 使用CDN解析
    return this.resolveFromCDN(moduleId)
  }

  /**
   * 从CDN解析模块
   */
  private resolveFromCDN(moduleId: string): string {
    // 处理作用域包名
    if (moduleId.startsWith('@')) {
      return `${this.cdnBase}/${moduleId}@latest/dist/index.esm.js`
    }

    // 常见的NPM包映射
    const commonPackages: Record<string, string> = {
      'lodash': `${this.cdnBase}/lodash-es@latest/lodash.js`,
      'axios': `${this.cdnBase}/axios@latest/dist/esm/axios.min.js`,
      'dayjs': `${this.cdnBase}/dayjs@latest/esm/index.js`,
      'mitt': `${this.cdnBase}/mitt@latest/dist/mitt.es.js`,
      'pinia': `${this.cdnBase}/pinia@latest/dist/pinia.esm-browser.js`
    }

    if (commonPackages[moduleId]) {
      return commonPackages[moduleId]
    }

    // 默认从unpkg解析
    return `${this.cdnBase}/${moduleId}@latest/dist/index.esm.js`
  }

  /**
   * 动态导入模块
   */
  async importModule(moduleId: string): Promise<any> {
    const url = this.resolveModuleUrl(moduleId)

    // 检查缓存
    if (this.cacheEnabled && this.moduleCache.has(url)) {
      return this.moduleCache.get(url)
    }

    try {
      const module = await import(url)
      
      // 缓存模块
      if (this.cacheEnabled) {
        this.moduleCache.set(url, module)
      }

      return module
    } catch (error) {
      console.error(`Failed to import module: ${moduleId} from ${url}`, error)
      throw new Error(`Module import failed: ${moduleId}`)
    }
  }

  /**
   * 转换代码中的import语句
   */
  transformImports(code: string): string {
    return code.replace(
      /import\s+(.+?)\s+from\s+['"](.+?)['"]/g,
      (_, imports, moduleId) => {
        const resolvedUrl = this.resolveModuleUrl(moduleId)
        return `import ${imports} from '${resolvedUrl}'`
      }
    )
  }

  /**
   * 添加导入映射
   */
  addImportMap(map: ImportMap): void {
    Object.assign(this.importMap, map)
  }

  /**
   * 获取当前导入映射
   */
  getImportMap(): ImportMap {
    return { ...this.importMap }
  }

  /**
   * 生成importmap脚本标签内容
   */
  generateImportMapScript(): string {
    return JSON.stringify({
      imports: this.importMap
    }, null, 2)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.moduleCache.clear()
  }

  /**
   * 预加载模块
   */
  async preloadModules(moduleIds: string[]): Promise<void> {
    const promises = moduleIds.map(id => this.importModule(id))
    await Promise.allSettled(promises)
  }
}

/**
 * 依赖分析器 - 分析代码中的依赖关系
 */
export class DependencyAnalyzer {
  /**
   * 分析代码中的import依赖
   */
  static analyzeImports(code: string): string[] {
    const importRegex = /import\s+.+?\s+from\s+['"](.+?)['"]/g
    const dependencies: string[] = []
    let match

    while ((match = importRegex.exec(code)) !== null) {
      const moduleId = match[1]
      if (!moduleId.startsWith('./') && !moduleId.startsWith('../')) {
        dependencies.push(moduleId)
      }
    }

    return [...new Set(dependencies)] // 去重
  }

  /**
   * 分析动态import依赖
   */
  static analyzeDynamicImports(code: string): string[] {
    const dynamicImportRegex = /import\s*\(\s*['"](.+?)['"]\s*\)/g
    const dependencies: string[] = []
    let match

    while ((match = dynamicImportRegex.exec(code)) !== null) {
      const moduleId = match[1]
      if (!moduleId.startsWith('./') && !moduleId.startsWith('../')) {
        dependencies.push(moduleId)
      }
    }

    return [...new Set(dependencies)]
  }

  /**
   * 分析所有依赖
   */
  static analyzeAllDependencies(code: string): {
    staticImports: string[]
    dynamicImports: string[]
    all: string[]
  } {
    const staticImports = this.analyzeImports(code)
    const dynamicImports = this.analyzeDynamicImports(code)
    const all = [...new Set([...staticImports, ...dynamicImports])]

    return {
      staticImports,
      dynamicImports,
      all
    }
  }
}

// 创建默认解析器实例
export const defaultResolver = new ModuleResolver()

// 导出工具函数
export const resolveModule = (moduleId: string) => defaultResolver.resolveModuleUrl(moduleId)
export const importModule = (moduleId: string) => defaultResolver.importModule(moduleId)
export const transformImports = (code: string) => defaultResolver.transformImports(code)
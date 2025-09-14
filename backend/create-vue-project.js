const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 配置
const API_BASE_URL = 'http://localhost:3000';
const PROJECTS_DIR = path.join(__dirname, 'generated-projects');

// 确保项目目录存在
if (!fs.existsSync(PROJECTS_DIR)) {
    fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

/**
 * 创建实际的Vue项目文件
 */
async function createVueProject() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    console.log('🚀 AutoWeb 项目生成器');
    console.log('═'.repeat(60));
    console.log(`⏰ 开始时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log('');
    
    try {
        // 检查服务器连接
        console.log('🔍 检查服务器连接...');
        const healthCheck = await axios.get(`${API_BASE_URL}/health`);
        console.log('✅ 服务器连接正常');
        console.log(`🔑 API密钥: ${healthCheck.data.environment.apiKeyConfigured ? '已配置' : '未配置'}`);
        console.log('');
        
        // 项目描述
        const projectDescription = `创建一个现代化的智能手表电商网站，包含以下功能：

【核心页面】
1. 首页 - 产品轮播、热门推荐、品牌故事
2. 产品列表页 - 筛选、排序、分页
3. 产品详情页 - 图片画廊、规格选择、评价展示
4. 购物车页面 - 商品管理、结算流程
5. 用户中心 - 个人信息、订单管理

【技术栈】
- Vue 3 + Composition API
- TypeScript
- Vue Router 4
- Pinia 状态管理
- Element Plus UI组件
- Vite 构建工具

【设计风格】
- 深色主题为主
- 现代简约设计
- 流畅动画效果
- 完全响应式布局

【组件结构】
- 布局组件：Header、Footer、Sidebar
- 公共组件：ProductCard、Loading、Modal
- 页面组件：对应各个页面
- 业务组件：购物车、用户登录等

请创建完整的项目结构，包含所有必要的文件、组件和配置。`;

        console.log('📝 项目需求:');
        console.log(projectDescription);
        console.log('');
        console.log('🎯 开始生成项目...');
        
        const startTime = Date.now();
        
        // 调用AI生成API
        const response = await axios.post(`${API_BASE_URL}/api/generate`, {
            description: projectDescription,
            options: {
                enableThinking: true,
                useStructuredOutput: true,
                includeValidation: true
            }
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (!response.data.success) {
            console.log('❌ 项目生成失败:', response.data.error);
            return;
        }
        
        const { data: projectData, metadata } = response.data;
        
        console.log('✅ 项目生成成功!');
        console.log(`⏱️  耗时: ${duration}ms`);
        console.log(`📦 项目名称: ${projectData.projectName}`);
        console.log(`📁 文件数量: ${projectData.files.length}`);
        console.log(`📦 依赖数量: ${projectData.dependencies.length}`);
        console.log('');
        
        // 创建项目目录
        const projectName = projectData.projectName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        const projectDir = path.join(PROJECTS_DIR, `${projectName}-${timestamp}`);
        
        console.log(`📁 创建项目目录: ${projectDir}`);
        fs.mkdirSync(projectDir, { recursive: true });
        
        // 创建package.json文件
        console.log('📦 创建 package.json...');
        const packageJson = {
            name: projectName,
            version: '1.0.0',
            type: 'module',
            description: projectData.description,
            scripts: {
                dev: 'vite',
                build: 'vue-tsc && vite build',
                preview: 'vite preview',
                'type-check': 'vue-tsc --noEmit'
            },
            dependencies: {},
            devDependencies: {
                '@vitejs/plugin-vue': '^5.0.0',
                'typescript': '^5.0.0',
                'vue-tsc': '^2.0.0',
                'vite': '^5.0.0'
            }
        };
        
        // 添加项目依赖
        projectData.dependencies.forEach(dep => {
            if (dep.includes('vue')) {
                packageJson.dependencies[dep] = '^3.0.0';
            } else if (dep.includes('router')) {
                packageJson.dependencies['vue-router'] = '^4.0.0';
            } else if (dep.includes('pinia')) {
                packageJson.dependencies['pinia'] = '^2.0.0';
            } else if (dep.includes('element')) {
                packageJson.dependencies['element-plus'] = '^2.0.0';
            } else {
                packageJson.dependencies[dep] = 'latest';
            }
        });
        
        fs.writeFileSync(
            path.join(projectDir, 'package.json'),
            JSON.stringify(packageJson, null, 2),
            'utf8'
        );
        
        // 创建vite.config.ts
        console.log('⚙️  创建 vite.config.ts...');
        const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    host: true
  }
})`;
        
        fs.writeFileSync(path.join(projectDir, 'vite.config.ts'), viteConfig, 'utf8');
        
        // 创建tsconfig.json
        console.log('📝 创建 tsconfig.json...');
        const tsConfig = {
            compilerOptions: {
                target: 'ES2020',
                useDefineForClassFields: true,
                module: 'ESNext',
                lib: ['ES2020', 'DOM', 'DOM.Iterable'],
                skipLibCheck: true,
                moduleResolution: 'bundler',
                allowImportingTsExtensions: true,
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: true,
                jsx: 'preserve',
                strict: true,
                noUnusedLocals: true,
                noUnusedParameters: true,
                noFallthroughCasesInSwitch: true,
                baseUrl: '.',
                paths: {
                    '@/*': ['src/*']
                }
            },
            include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
            references: [{ path: './tsconfig.node.json' }]
        };
        
        fs.writeFileSync(
            path.join(projectDir, 'tsconfig.json'),
            JSON.stringify(tsConfig, null, 2),
            'utf8'
        );
        
        // 创建index.html
        console.log('🌐 创建 index.html...');
        const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectData.projectName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`;
        
        fs.writeFileSync(path.join(projectDir, 'index.html'), indexHtml, 'utf8');
        
        // 创建README.md
        console.log('📖 创建 README.md...');
        const readme = `# ${projectData.projectName}

${projectData.description}

## 🚀 功能特性

${projectData.features.map(feature => `- ${feature}`).join('\n')}

## 🛠️ 技术栈

${projectData.dependencies.map(dep => `- ${dep}`).join('\n')}

## 📦 安装依赖

\`\`\`bash
npm install
\`\`\`

## 🏃‍♂️ 运行项目

\`\`\`bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
\`\`\`

## 📁 项目结构

\`\`\`
${projectData.files.map(file => file.path).sort().join('\n')}
\`\`\`

## 📝 生成信息

- 生成时间: ${new Date().toLocaleString('zh-CN')}
- 生成耗时: ${duration}ms
- 文件数量: ${projectData.files.length}
- AI模型: 豆包深度思考模型

---

*此项目由 AutoWeb AI 自动生成*
`;
        
        fs.writeFileSync(path.join(projectDir, 'README.md'), readme, 'utf8');
        
        // 创建所有项目文件
        console.log('');
        console.log('📁 开始创建项目文件...');
        console.log('─'.repeat(50));
        
        let createdFiles = 0;
        const filesByType = {};
        
        for (const file of projectData.files) {
            createdFiles++;
            
            // 统计文件类型
            if (!filesByType[file.type]) {
                filesByType[file.type] = 0;
            }
            filesByType[file.type]++;
            
            const filePath = path.join(projectDir, file.path);
            const fileDir = path.dirname(filePath);
            
            // 确保目录存在
            if (!fs.existsSync(fileDir)) {
                fs.mkdirSync(fileDir, { recursive: true });
            }
            
            // 写入文件内容
            fs.writeFileSync(filePath, file.content, 'utf8');
            
            // 实时显示进度
            const progress = ((createdFiles / projectData.files.length) * 100).toFixed(1);
            console.log(`[${progress}%] ✅ ${file.path} (${file.type})`);
            
            // 短暂延迟，模拟创建过程
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        console.log('─'.repeat(50));
        console.log('');
        
        // 创建项目信息文件
        const projectInfo = {
            name: projectData.projectName,
            description: projectData.description,
            generatedAt: new Date().toISOString(),
            generationTime: duration,
            fileCount: projectData.files.length,
            dependencyCount: projectData.dependencies.length,
            featureCount: projectData.features.length,
            files: projectData.files.map(f => ({
                path: f.path,
                type: f.type,
                size: f.content.length
            })),
            dependencies: projectData.dependencies,
            features: projectData.features,
            validation: metadata.validation,
            filesByType: filesByType
        };
        
        fs.writeFileSync(
            path.join(projectDir, 'project-info.json'),
            JSON.stringify(projectInfo, null, 2),
            'utf8'
        );
        
        // 显示完成信息
        console.log('🎉 项目创建完成!');
        console.log('═'.repeat(60));
        console.log(`📁 项目位置: ${projectDir}`);
        console.log(`📊 创建统计:`);
        console.log(`   - 总文件数: ${createdFiles}`);
        console.log(`   - 总耗时: ${duration}ms`);
        
        console.log(`📋 文件类型分布:`);
        Object.entries(filesByType).forEach(([type, count]) => {
            console.log(`   - ${type}: ${count} 个文件`);
        });
        
        if (metadata.validation) {
            console.log(`✅ 验证结果: ${metadata.validation.valid ? '通过' : '失败'}`);
            if (metadata.validation.errors.length > 0) {
                console.log(`⚠️  错误: ${metadata.validation.errors.length} 个`);
            }
            if (metadata.validation.warnings.length > 0) {
                console.log(`💡 警告: ${metadata.validation.warnings.length} 个`);
            }
        }
        
        console.log('');
        console.log('🚀 快速开始:');
        console.log(`   cd "${projectDir}"`);
        console.log('   npm install');
        console.log('   npm run dev');
        console.log('');
        
        // 创建启动脚本
        const startScript = `@echo off
cd /d "${projectDir}"
echo 正在安装依赖...
npm install
echo.
echo 启动开发服务器...
npm run dev
pause`;
        
        fs.writeFileSync(path.join(projectDir, 'start.bat'), startScript, 'utf8');
        console.log('📝 已创建 start.bat 启动脚本 (双击即可运行)');
        
        return projectDir;
        
    } catch (error) {
        console.log('❌ 创建项目失败:', error.message);
        if (error.response) {
            console.log(`   状态码: ${error.response.status}`);
            console.log(`   详情: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        return null;
    }
}

// 主程序
async function main() {
    console.log('🧙‍♂️ AutoWeb Vue项目生成器');
    console.log('');
    
    const projectDir = await createVueProject();
    
    if (projectDir) {
        console.log('');
        console.log('🎊 恭喜！您的Vue项目已成功创建！');
        console.log('💡 接下来您可以:');
        console.log('   1. 使用VS Code打开项目目录');
        console.log('   2. 运行 npm install 安装依赖');
        console.log('   3. 运行 npm run dev 启动开发服务器');
        console.log('   4. 在浏览器中查看您的网站');
    } else {
        console.log('');
        console.log('😞 项目创建失败，请检查:');
        console.log('   - 服务器是否正在运行');
        console.log('   - API密钥是否正确配置');
        console.log('   - 网络连接是否正常');
    }
}

// 运行主程序
main().catch(error => {
    console.error('❌ 程序执行失败:', error.message);
    process.exit(1);
});
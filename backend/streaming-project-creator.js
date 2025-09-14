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

// 流式输出控制
class StreamingProjectCreator {
    constructor() {
        this.logBuffer = [];
        this.currentStep = 0;
        this.totalSteps = 0;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString('zh-CN');
        const colors = {
            info: '\x1b[37m',     // 白色
            success: '\x1b[32m',  // 绿色
            warning: '\x1b[33m',  // 黄色
            error: '\x1b[31m',    // 红色
            progress: '\x1b[36m', // 青色
            create: '\x1b[35m'    // 紫色
        };
        
        const colorCode = colors[type] || colors.info;
        const resetCode = '\x1b[0m';
        
        const logLine = `[${timestamp}] ${message}`;
        console.log(`${colorCode}${logLine}${resetCode}`);
        this.logBuffer.push(logLine);
        
        return logLine;
    }

    progress(current, total, action) {
        const percentage = ((current / total) * 100).toFixed(1);
        const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
        this.log(`[${percentage}%] ${progressBar} ${action}`, 'progress');
    }

    async delay(ms = 100) {
        await new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * 流式创建Vue项目
 */
async function createVueProjectStreaming() {
    const creator = new StreamingProjectCreator();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    creator.log('🚀 AutoWeb 流式项目生成器启动', 'success');
    creator.log('═'.repeat(60));
    creator.log(`⏰ 开始时间: ${new Date().toLocaleString('zh-CN')}`);
    creator.log('');
    
    try {
        // 步骤 1: 检查服务器连接
        creator.log('🔍 步骤 1: 检查服务器连接...', 'info');
        await creator.delay(200);
        
        const healthCheck = await axios.get(`${API_BASE_URL}/health`);
        creator.log('✅ 服务器连接成功', 'success');
        creator.log(`🔑 API密钥状态: ${healthCheck.data.environment.apiKeyConfigured ? '已配置' : '未配置'}`, 'info');
        creator.log('');
        await creator.delay(300);
        
        if (!healthCheck.data.environment.apiKeyConfigured) {
            creator.log('⚠️  警告: API密钥未配置，可能影响生成效果', 'warning');
            creator.log('');
        }
        
        // 步骤 2: 准备项目描述
        creator.log('📝 步骤 2: 准备项目需求...', 'info');
        await creator.delay(200);
        
        const projectDescription = `创建一个现代化的智能手表电商展示网站，要求：

【核心功能】
1. 产品展示系统 - 支持多图轮播、规格筛选
2. 购物车功能 - 添加商品、数量调整、价格计算
3. 用户系统 - 登录注册、个人中心、订单管理
4. 搜索功能 - 产品搜索、分类筛选、价格排序
5. 响应式设计 - 完美适配手机、平板、桌面

【技术要求】
- Vue 3 + Composition API + TypeScript
- Vue Router 4 路由管理
- Pinia 状态管理
- Element Plus UI框架
- Vite 构建工具
- Axios HTTP客户端

【设计风格】
- 深色科技主题
- 流畅动画效果
- 现代卡片布局
- 清晰视觉层次

请创建完整的项目结构，包含所有页面、组件和配置文件。`;

        creator.log('📋 项目需求已定义', 'success');
        creator.log('');
        await creator.delay(300);
        
        // 步骤 3: 调用AI生成
        creator.log('🧠 步骤 3: 调用AI深度思考模型...', 'info');
        creator.log('⏳ 正在进行深度分析和代码生成...', 'warning');
        
        const startTime = Date.now();
        
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
            creator.log(`❌ AI生成失败: ${response.data.error}`, 'error');
            return null;
        }
        
        const { data: projectData, metadata } = response.data;
        
        creator.log('✅ AI生成完成!', 'success');
        creator.log(`⏱️  AI生成耗时: ${duration}ms`, 'info');
        creator.log(`📦 项目名称: ${projectData.projectName}`, 'info');
        creator.log(`📝 项目描述: ${projectData.description}`, 'info');
        creator.log(`📁 生成文件数: ${projectData.files.length}`, 'info');
        creator.log(`📦 依赖包数: ${projectData.dependencies.length}`, 'info');
        creator.log('');
        await creator.delay(500);
        
        // 步骤 4: 创建项目目录结构
        creator.log('📁 步骤 4: 创建项目目录结构...', 'info');
        
        const projectName = projectData.projectName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        const projectDir = path.join(PROJECTS_DIR, `${projectName}-${timestamp}`);
        
        creator.log(`📂 创建主项目目录: ${projectName}-${timestamp}`, 'create');
        fs.mkdirSync(projectDir, { recursive: true });
        await creator.delay(100);
        
        // 分析需要创建的目录
        const directories = new Set();
        projectData.files.forEach(file => {
            const dir = path.dirname(file.path);
            if (dir !== '.') {
                const parts = dir.split('/');
                for (let i = 1; i <= parts.length; i++) {
                    directories.add(parts.slice(0, i).join('/'));
                }
            }
        });
        
        const sortedDirs = Array.from(directories).sort();
        creator.log(`📋 需要创建 ${sortedDirs.length} 个子目录`, 'info');
        
        // 流式创建目录
        for (let i = 0; i < sortedDirs.length; i++) {
            const dir = sortedDirs[i];
            const fullDirPath = path.join(projectDir, dir);
            
            creator.progress(i + 1, sortedDirs.length, `创建目录: ${dir}`);
            fs.mkdirSync(fullDirPath, { recursive: true });
            await creator.delay(50);
        }
        
        creator.log('✅ 目录结构创建完成', 'success');
        creator.log('');
        await creator.delay(300);
        
        // 步骤 5: 创建配置文件
        creator.log('⚙️  步骤 5: 创建项目配置文件...', 'info');
        
        // 创建 package.json
        creator.log('📝 正在创建 package.json...', 'create');
        const packageJson = {
            name: projectName,
            version: '1.0.0',
            type: 'module',
            description: projectData.description,
            scripts: {
                dev: 'vite',
                build: 'vue-tsc && vite build',
                preview: 'vite preview',
                'type-check': 'vue-tsc --noEmit',
                lint: 'eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore'
            },
            dependencies: {},
            devDependencies: {
                '@vitejs/plugin-vue': '^5.0.0',
                'typescript': '^5.0.0',
                'vue-tsc': '^2.0.0',
                'vite': '^5.0.0',
                '@types/node': '^20.0.0'
            }
        };
        
        // 智能添加依赖
        const depMap = {
            'vue': '^3.4.0',
            'vue-router': '^4.0.0',
            'pinia': '^2.0.0',
            'element-plus': '^2.0.0',
            'axios': '^1.0.0',
            '@element-plus/icons-vue': '^2.0.0'
        };
        
        projectData.dependencies.forEach(dep => {
            if (depMap[dep]) {
                packageJson.dependencies[dep] = depMap[dep];
            } else {
                packageJson.dependencies[dep] = 'latest';
            }
        });
        
        fs.writeFileSync(
            path.join(projectDir, 'package.json'),
            JSON.stringify(packageJson, null, 2),
            'utf8'
        );
        creator.log('  ✅ package.json 创建完成', 'success');
        await creator.delay(100);
        
        // 创建 vite.config.ts
        creator.log('📝 正在创建 vite.config.ts...', 'create');
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
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})`;
        
        fs.writeFileSync(path.join(projectDir, 'vite.config.ts'), viteConfig, 'utf8');
        creator.log('  ✅ vite.config.ts 创建完成', 'success');
        await creator.delay(100);
        
        // 创建 tsconfig.json
        creator.log('📝 正在创建 tsconfig.json...', 'create');
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
            exclude: ['node_modules', 'dist']
        };
        
        fs.writeFileSync(
            path.join(projectDir, 'tsconfig.json'),
            JSON.stringify(tsConfig, null, 2),
            'utf8'
        );
        creator.log('  ✅ tsconfig.json 创建完成', 'success');
        await creator.delay(100);
        
        // 创建 index.html
        creator.log('📝 正在创建 index.html...', 'create');
        const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${projectData.description}" />
    <title>${projectData.projectName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`;
        
        fs.writeFileSync(path.join(projectDir, 'index.html'), indexHtml, 'utf8');
        creator.log('  ✅ index.html 创建完成', 'success');
        await creator.delay(100);
        
        creator.log('✅ 配置文件创建完成', 'success');
        creator.log('');
        await creator.delay(300);
        
        // 步骤 6: 流式创建项目文件
        creator.log('📄 步骤 6: 流式创建项目文件...', 'info');
        creator.log(`📊 总共需要创建 ${projectData.files.length} 个文件`, 'info');
        creator.log('');
        
        const filesByType = {};
        
        for (let i = 0; i < projectData.files.length; i++) {
            const file = projectData.files[i];
            const fileIndex = i + 1;
            
            // 统计文件类型
            if (!filesByType[file.type]) {
                filesByType[file.type] = 0;
            }
            filesByType[file.type]++;
            
            // 显示创建进度
            creator.progress(fileIndex, projectData.files.length, `创建文件: ${file.path}`);
            
            const filePath = path.join(projectDir, file.path);
            const fileDir = path.dirname(filePath);
            
            // 确保目录存在
            if (!fs.existsSync(fileDir)) {
                creator.log(`  📁 创建子目录: ${path.relative(projectDir, fileDir)}`, 'create');
                fs.mkdirSync(fileDir, { recursive: true });
            }
            
            // 分析文件内容
            const lines = file.content.split('\n');
            const fileSize = (file.content.length / 1024).toFixed(1);
            
            creator.log(`  📝 写入文件: ${file.path}`, 'create');
            creator.log(`     类型: ${file.type} | 大小: ${fileSize}KB | 行数: ${lines.length}`, 'info');
            
            // 模拟内容写入过程（对于大文件）
            if (file.content.length > 1000) {
                creator.log(`     正在写入内容...`, 'warning');
                await creator.delay(100);
            }
            
            // 写入文件
            fs.writeFileSync(filePath, file.content, 'utf8');
            
            // 验证文件创建
            if (fs.existsSync(filePath)) {
                creator.log(`     ✅ ${file.path} 创建成功`, 'success');
            } else {
                creator.log(`     ❌ ${file.path} 创建失败`, 'error');
            }
            
            // 短暂延迟，展示创建过程
            await creator.delay(80);
        }
        
        creator.log('');
        creator.log('✅ 所有项目文件创建完成', 'success');
        creator.log('');
        await creator.delay(300);
        
        // 步骤 7: 创建项目文档
        creator.log('📚 步骤 7: 创建项目文档...', 'info');
        
        // 创建 README.md
        creator.log('📝 正在创建 README.md...', 'create');
        const readme = `# ${projectData.projectName}

${projectData.description}

## 🚀 功能特性

${projectData.features.map(feature => `- ✨ ${feature}`).join('\n')}

## 🛠️ 技术栈

${projectData.dependencies.map(dep => `- 📦 ${dep}`).join('\n')}

## 📁 项目结构

\`\`\`
${Object.entries(filesByType).map(([type, count]) => `${type}: ${count} 个文件`).join('\n')}
\`\`\`

## 🏃‍♂️ 快速开始

### 安装依赖
\`\`\`bash
npm install
\`\`\`

### 启动开发服务器
\`\`\`bash
npm run dev
\`\`\`

### 构建生产版本
\`\`\`bash
npm run build
\`\`\`

### 预览生产版本
\`\`\`bash
npm run preview
\`\`\`

## 📊 生成信息

- 🕐 生成时间: ${new Date().toLocaleString('zh-CN')}
- ⏱️ AI生成耗时: ${duration}ms
- 📁 文件数量: ${projectData.files.length}
- 📦 依赖数量: ${projectData.dependencies.length}
- 🎯 特性数量: ${projectData.features.length}
- 🤖 AI模型: 豆包深度思考模型

## 📋 文件清单

${projectData.files.map((file, index) => `${index + 1}. \`${file.path}\` (${file.type})`).join('\n')}

---

*此项目由 AutoWeb AI 自动生成*
`;
        
        fs.writeFileSync(path.join(projectDir, 'README.md'), readme, 'utf8');
        creator.log('  ✅ README.md 创建完成', 'success');
        await creator.delay(100);
        
        // 创建项目信息文件
        creator.log('📝 正在创建 project-info.json...', 'create');
        const projectInfo = {
            metadata: {
                name: projectData.projectName,
                description: projectData.description,
                generatedAt: new Date().toISOString(),
                generationTime: duration,
                generator: 'AutoWeb AI (豆包深度思考模型)'
            },
            statistics: {
                fileCount: projectData.files.length,
                dependencyCount: projectData.dependencies.length,
                featureCount: projectData.features.length,
                filesByType: filesByType,
                totalSize: projectData.files.reduce((sum, f) => sum + f.content.length, 0)
            },
            structure: {
                files: projectData.files.map(f => ({
                    path: f.path,
                    type: f.type,
                    size: f.content.length,
                    lines: f.content.split('\n').length
                })),
                dependencies: projectData.dependencies,
                features: projectData.features
            },
            validation: metadata.validation || null
        };
        
        fs.writeFileSync(
            path.join(projectDir, 'project-info.json'),
            JSON.stringify(projectInfo, null, 2),
            'utf8'
        );
        creator.log('  ✅ project-info.json 创建完成', 'success');
        await creator.delay(100);
        
        // 创建启动脚本
        creator.log('📝 正在创建启动脚本...', 'create');
        const startScript = `@echo off
echo ========================================
echo   ${projectData.projectName}
echo   AutoWeb AI 生成的 Vue 项目
echo ========================================
echo.

cd /d "${projectDir}"

echo 📦 正在安装项目依赖...
call npm install

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败，请检查网络连接
    pause
    exit /b 1
)

echo.
echo ✅ 依赖安装完成
echo 🚀 正在启动开发服务器...
echo.

call npm run dev

pause`;
        
        fs.writeFileSync(path.join(projectDir, 'start.bat'), startScript, 'utf8');
        creator.log('  ✅ start.bat 启动脚本创建完成', 'success');
        
        creator.log('✅ 项目文档创建完成', 'success');
        creator.log('');
        await creator.delay(300);
        
        // 步骤 8: 生成完成报告
        const totalTime = Date.now() - startTime;
        creator.log('🎉 项目创建完成!', 'success');
        creator.log('═'.repeat(60));
        creator.log(`📁 项目位置: ${projectDir}`, 'info');
        creator.log(`📊 创建统计:`, 'info');
        creator.log(`   - 总文件数: ${projectData.files.length}`, 'info');
        creator.log(`   - 配置文件: 4 个`, 'info');
        creator.log(`   - 文档文件: 2 个`, 'info');
        creator.log(`   - 总耗时: ${totalTime}ms`, 'info');
        
        creator.log(`📋 文件类型分布:`, 'info');
        Object.entries(filesByType).forEach(([type, count]) => {
            creator.log(`   - ${type}: ${count} 个文件`, 'info');
        });
        
        if (metadata.validation) {
            creator.log(`✅ 验证结果: ${metadata.validation.valid ? '通过' : '失败'}`, 
                       metadata.validation.valid ? 'success' : 'warning');
            if (metadata.validation.errors.length > 0) {
                creator.log(`⚠️  错误: ${metadata.validation.errors.length} 个`, 'warning');
            }
            if (metadata.validation.warnings.length > 0) {
                creator.log(`💡 警告: ${metadata.validation.warnings.length} 个`, 'warning');
            }
        }
        
        creator.log('');
        creator.log('🚀 接下来您可以:', 'info');
        creator.log(`   1. 打开项目: code "${projectDir}"`, 'info');
        creator.log(`   2. 安装依赖: cd "${projectDir}" && npm install`, 'info');
        creator.log(`   3. 启动项目: npm run dev`, 'info');
        creator.log(`   4. 或者直接双击 start.bat 文件`, 'info');
        creator.log('');
        
        return projectDir;
        
    } catch (error) {
        creator.log(`❌ 创建项目失败: ${error.message}`, 'error');
        if (error.response) {
            creator.log(`   HTTP状态: ${error.response.status}`, 'error');
            creator.log(`   错误详情: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
        }
        return null;
    }
}

// 主程序
async function main() {
    console.log('🎭 AutoWeb 流式 Vue 项目生成器');
    console.log('');
    
    const projectDir = await createVueProjectStreaming();
    
    if (projectDir) {
        console.log('');
        console.log('🎊 恭喜！您的Vue项目已成功创建！');
        console.log('💡 项目特点:');
        console.log('   ✨ 完全由AI生成的现代化Vue3项目');
        console.log('   🛠️ 包含完整的TypeScript配置');
        console.log('   📱 响应式设计，支持所有设备');
        console.log('   🎨 现代化UI组件和动画效果');
        console.log('   📦 预配置的开发环境');
        console.log('');
        console.log('🔥 立即开始开发：');
        console.log(`   1. 使用 VS Code 打开: code "${projectDir}"`);
        console.log('   2. 安装依赖并启动: 双击 start.bat');
        console.log('   3. 在浏览器中查看效果');
    } else {
        console.log('');
        console.log('😞 项目创建失败，请检查:');
        console.log('   - 🔌 服务器是否正在运行 (node server.js)');
        console.log('   - 🔑 API密钥是否正确配置 (.env 文件)');
        console.log('   - 🌐 网络连接是否正常');
        console.log('   - 💾 磁盘空间是否充足');
    }
}

// 运行主程序
main().catch(error => {
    console.error('❌ 程序执行失败:', error.message);
    process.exit(1);
});
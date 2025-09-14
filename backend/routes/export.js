const express = require('express');
const router = express.Router();
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs').promises;

/**
 * 导出代码为ZIP文件
 * POST /api/export
 */
router.post('/export', async (req, res) => {
    try {
        const { code, projectName = 'vue-project' } = req.body;
        
        if (!code || code.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供要导出的代码'
            });
        }

        console.log(`开始导出项目: ${projectName}`);

        // 解析代码（假设是JSON格式）
        let projectFiles;
        try {
            projectFiles = JSON.parse(code);
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                message: '代码格式无效，无法解析JSON',
                error: parseError.message
            });
        }

        // 创建ZIP文件
        const zip = new AdmZip();
        
        // 添加项目文件到ZIP
        for (const [filePath, content] of Object.entries(projectFiles)) {
            // 移除项目名称前缀（如果存在）
            const cleanPath = filePath.replace(/^[^/]+\//, '');
            
            console.log(`添加文件: ${cleanPath}`);
            zip.addFile(cleanPath, Buffer.from(content, 'utf8'));
        }

        // 添加README文件
        const readmeContent = generateReadme(projectName);
        zip.addFile('README.md', Buffer.from(readmeContent, 'utf8'));

        // 添加.gitignore文件
        const gitignoreContent = generateGitignore();
        zip.addFile('.gitignore', Buffer.from(gitignoreContent, 'utf8'));

        // 生成ZIP文件
        const zipBuffer = zip.toBuffer();
        
        // 设置响应头
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${projectName}.zip"`,
            'Content-Length': zipBuffer.length
        });

        // 发送ZIP文件
        res.send(zipBuffer);
        
        console.log(`项目导出成功: ${projectName}.zip (${zipBuffer.length} bytes)`);

    } catch (error) {
        console.error('代码导出失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误',
            error: error.message
        });
    }
});

/**
 * 预览项目结构
 * POST /api/export/preview
 */
router.post('/export/preview', async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code || code.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供要预览的代码'
            });
        }

        // 解析代码
        let projectFiles;
        try {
            projectFiles = JSON.parse(code);
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                message: '代码格式无效，无法解析JSON',
                error: parseError.message
            });
        }

        // 生成项目结构预览
        const structure = generateProjectStructure(projectFiles);
        
        res.json({
            success: true,
            structure: structure,
            fileCount: Object.keys(projectFiles).length,
            totalSize: calculateTotalSize(projectFiles)
        });

    } catch (error) {
        console.error('预览生成失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误',
            error: error.message
        });
    }
});

/**
 * 导出单个文件
 * POST /api/export/file
 */
router.post('/export/file', async (req, res) => {
    try {
        const { code, fileName, filePath } = req.body;
        
        if (!code || code.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供要导出的代码'
            });
        }

        if (!fileName) {
            return res.status(400).json({
                success: false,
                message: '请提供文件名'
            });
        }

        // 解析代码
        let projectFiles;
        try {
            projectFiles = JSON.parse(code);
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                message: '代码格式无效，无法解析JSON',
                error: parseError.message
            });
        }

        // 查找指定文件
        const targetFile = filePath ? projectFiles[filePath] : 
                          Object.entries(projectFiles).find(([path]) => 
                              path.endsWith(fileName)
                          )?.[1];

        if (!targetFile) {
            return res.status(404).json({
                success: false,
                message: '指定文件不存在'
            });
        }

        // 设置响应头
        const ext = path.extname(fileName);
        const mimeTypes = {
            '.vue': 'text/plain',
            '.js': 'application/javascript',
            '.ts': 'application/typescript',
            '.json': 'application/json',
            '.html': 'text/html',
            '.css': 'text/css',
            '.md': 'text/markdown'
        };

        res.set({
            'Content-Type': mimeTypes[ext] || 'text/plain',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': Buffer.byteLength(targetFile, 'utf8')
        });

        res.send(targetFile);
        
        console.log(`单文件导出成功: ${fileName}`);

    } catch (error) {
        console.error('单文件导出失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误',
            error: error.message
        });
    }
});

/**
 * 生成项目README文件内容
 */
function generateReadme(projectName) {
    return `# ${projectName}

这是一个使用AI生成的Vue 3项目。

## 技术栈

- Vue 3 (Composition API)
- Element Plus
- Vite

## 开发

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
\`\`\`

## 项目结构

\`\`\`
${projectName}/
├── index.html          # HTML入口文件
├── package.json        # 项目依赖配置
├── vite.config.js      # Vite配置文件
└── src/
    ├── main.js         # Vue应用入口
    ├── App.vue         # 根组件
    └── components/     # 组件目录
\`\`\`

## 特性

- 🚀 Vue 3 Composition API
- 🎨 Element Plus UI组件
- ⚡ Vite快速构建
- 📱 响应式设计
- 🎯 TypeScript支持（可选）

## 部署

构建完成后，将 \`dist\` 目录部署到您的服务器即可。

---

*本项目由AI自动生成，如有问题请手动调整代码。*
`;
}

/**
 * 生成.gitignore文件内容
 */
function generateGitignore() {
    return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Cache
.cache/
.parcel-cache/

# Logs
logs/
*.log

# Coverage
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
`;
}

/**
 * 生成项目结构预览
 */
function generateProjectStructure(projectFiles) {
    const structure = [];
    const paths = Object.keys(projectFiles).sort();
    
    for (const filePath of paths) {
        const cleanPath = filePath.replace(/^[^/]+\//, '');
        const depth = (cleanPath.match(/\//g) || []).length;
        const fileName = path.basename(cleanPath);
        const isFile = !cleanPath.endsWith('/');
        
        structure.push({
            path: cleanPath,
            name: fileName,
            depth: depth,
            isFile: isFile,
            size: isFile ? Buffer.byteLength(projectFiles[filePath], 'utf8') : 0
        });
    }
    
    return structure;
}

/**
 * 计算项目总大小
 */
function calculateTotalSize(projectFiles) {
    let totalSize = 0;
    for (const content of Object.values(projectFiles)) {
        totalSize += Buffer.byteLength(content, 'utf8');
    }
    return totalSize;
}

module.exports = router;
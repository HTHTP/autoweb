const fs = require('fs').promises;
const path = require('path');

/**
 * 文件保存服务
 * 用于保存AI生成的代码到本地文件系统
 */
class FileSaveService {
    constructor() {
        this.outputDir = path.join(__dirname, '../output');
        this.projectsDir = path.join(this.outputDir, 'projects');
        this.jsonDir = path.join(this.outputDir, 'json');
        
        // 确保目录存在
        this.ensureDirectories();
    }

    /**
     * 确保输出目录存在
     */
    async ensureDirectories() {
        try {
            await fs.mkdir(this.outputDir, { recursive: true });
            await fs.mkdir(this.projectsDir, { recursive: true });
            await fs.mkdir(this.jsonDir, { recursive: true });
            console.log('📁 输出目录已创建');
        } catch (error) {
            console.error('❌ 创建输出目录失败:', error.message);
        }
    }

    /**
     * 保存原始JSON代码
     */
    async saveJsonCode(code, metadata = {}) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `generated-${timestamp}.json`;
            const filePath = path.join(this.jsonDir, fileName);

            // 解析代码以获取文件信息
            let fileCount = 0;
            let fileList = [];
            try {
                const parsedCode = JSON.parse(code);
                fileList = Object.keys(parsedCode);
                fileCount = fileList.length;
            } catch (e) {
                console.warn('解析代码失败，无法获取文件信息');
            }

            // 创建包含元数据的JSON文件
            // 使用注释格式保存元数据，方便导入时识别
            const metadataComment = JSON.stringify({
                timestamp: new Date().toISOString(),
                description: metadata.description || '未知项目',
                components: metadata.components || [],
                style: metadata.style || 'modern',
                mode: metadata.mode || 'unknown',
                aiGenerated: metadata.aiGenerated || false,
                fallback: metadata.fallback || null,
                fileCount: fileCount,
                fileList: fileList.slice(0, 5), // 只保存前5个文件名
                version: '1.0.0',
                canImport: true,
                ...metadata
            }, null, 2);

            // 创建带有元数据注释的文件内容
            const fileContent = `/*${metadataComment}*/\n${code}`;

            await fs.writeFile(filePath, fileContent, 'utf8');
            
            console.log(`💾 JSON代码已保存: ${fileName}`);
            console.log(`📊 文件包含 ${fileCount} 个项目文件`);

            return {
                success: true,
                fileName,
                filePath,
                fileCount,
                metadata: {
                    timestamp: new Date().toISOString(),
                    description: metadata.description,
                    fileCount,
                    size: fileContent.length
                }
            };
        } catch (error) {
            console.error('❌ 保存JSON代码失败:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 保存为完整的Vue项目结构
     */
    async saveVueProject(code, metadata = {}) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const projectName = metadata.projectName || `vue-project-${timestamp}`;
            const projectPath = path.join(this.projectsDir, projectName);

            // 创建项目目录
            await fs.mkdir(projectPath, { recursive: true });

            // 解析代码
            const projectFiles = JSON.parse(code);

            // 保存每个文件
            for (const [filePath, content] of Object.entries(projectFiles)) {
                // 移除项目名称前缀（如果存在）
                const cleanPath = filePath.replace(/^[^/]+\//, '');
                const fullPath = path.join(projectPath, cleanPath);
                
                // 确保目录存在
                const dir = path.dirname(fullPath);
                await fs.mkdir(dir, { recursive: true });
                
                // 写入文件
                await fs.writeFile(fullPath, content, 'utf8');
            }

            // 添加项目元数据文件
            const metadataFile = {
                name: projectName,
                generated: new Date().toISOString(),
                description: metadata.description || '',
                components: metadata.components || [],
                style: metadata.style || 'modern',
                mode: metadata.mode || 'unknown',
                aiModel: metadata.aiModel || 'unknown',
                files: Object.keys(projectFiles).map(p => p.replace(/^[^/]+\//, ''))
            };

            await fs.writeFile(
                path.join(projectPath, 'project-metadata.json'),
                JSON.stringify(metadataFile, null, 2),
                'utf8'
            );

            // 添加安装说明
            const installGuide = this.generateInstallGuide(projectName);
            await fs.writeFile(
                path.join(projectPath, 'INSTALL.md'),
                installGuide,
                'utf8'
            );

            console.log(`🚀 Vue项目已保存: ${projectName}`);
            return {
                success: true,
                projectPath: projectPath,
                projectName: projectName,
                fileCount: Object.keys(projectFiles).length
            };
        } catch (error) {
            console.error('❌ 保存Vue项目失败:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 生成安装指南
     */
    generateInstallGuide(projectName) {
        return `# ${projectName} 安装指南

## 快速开始

这是一个由AI生成的Vue 3项目。

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

### 3. 构建生产版本

\`\`\`bash
npm run build
\`\`\`

## 项目信息

- 📅 生成时间: ${new Date().toLocaleString('zh-CN')}
- 🛠️ 技术栈: Vue 3 + Element Plus + Vite
- 🤖 生成方式: AI自动生成

## 注意事项

- 项目使用Vue 3 Composition API
- 集成了Element Plus UI组件库
- 使用Vite作为构建工具
- 如有问题，请检查依赖版本兼容性

## 文件结构

查看 \`project-metadata.json\` 了解详细的文件信息。

---

*由AI Vue Code Generator自动生成*
`;
    }

    /**
     * 获取保存的项目列表
     */
    async getSavedProjects() {
        try {
            const projects = await fs.readdir(this.projectsDir);
            const projectList = [];

            for (const projectName of projects) {
                const projectPath = path.join(this.projectsDir, projectName);
                const metadataPath = path.join(projectPath, 'project-metadata.json');
                
                try {
                    const stats = await fs.stat(projectPath);
                    if (stats.isDirectory()) {
                        let metadata = null;
                        
                        try {
                            const metadataContent = await fs.readFile(metadataPath, 'utf8');
                            metadata = JSON.parse(metadataContent);
                        } catch (metaError) {
                            // 如果元数据文件不存在，创建基础信息
                            metadata = {
                                name: projectName,
                                generated: stats.birthtime.toISOString(),
                                description: '未知描述'
                            };
                        }

                        projectList.push({
                            name: projectName,
                            path: projectPath,
                            metadata: metadata,
                            created: stats.birthtime
                        });
                    }
                } catch (statError) {
                    console.warn(`跳过无效项目: ${projectName}`);
                }
            }

            return projectList.sort((a, b) => b.created - a.created);
        } catch (error) {
            console.error('❌ 获取项目列表失败:', error.message);
            return [];
        }
    }

    /**
     * 获取保存的JSON文件列表
     */
    async getSavedJsonFiles() {
        try {
            const files = await fs.readdir(this.jsonDir);
            const jsonFiles = [];

            for (const fileName of files) {
                if (fileName.endsWith('.json')) {
                    const filePath = path.join(this.jsonDir, fileName);
                    const stats = await fs.stat(filePath);
                    
                    jsonFiles.push({
                        name: fileName,
                        path: filePath,
                        size: stats.size,
                        created: stats.birthtime
                    });
                }
            }

            return jsonFiles.sort((a, b) => b.created - a.created);
        } catch (error) {
            console.error('❌ 获取JSON文件列表失败:', error.message);
            return [];
        }
    }

    /**
     * 清理旧文件（保留最近50个）
     */
    async cleanupOldFiles() {
        try {
            // 清理JSON文件
            const jsonFiles = await this.getSavedJsonFiles();
            if (jsonFiles.length > 50) {
                const filesToDelete = jsonFiles.slice(50);
                for (const file of filesToDelete) {
                    await fs.unlink(file.path);
                    console.log(`🗑️ 删除旧JSON文件: ${file.name}`);
                }
            }

            // 清理项目文件（保留最近20个）
            const projects = await this.getSavedProjects();
            if (projects.length > 20) {
                const projectsToDelete = projects.slice(20);
                for (const project of projectsToDelete) {
                    await fs.rmdir(project.path, { recursive: true });
                    console.log(`🗑️ 删除旧项目: ${project.name}`);
                }
            }

            console.log('🧹 文件清理完成');
        } catch (error) {
            console.error('❌ 清理文件失败:', error.message);
        }
    }

    /**
     * 获取存储统计信息
     */
    async getStorageStats() {
        try {
            const projects = await this.getSavedProjects();
            const jsonFiles = await this.getSavedJsonFiles();
            
            // 计算总大小
            let totalSize = 0;
            
            for (const jsonFile of jsonFiles) {
                totalSize += jsonFile.size;
            }

            return {
                projectCount: projects.length,
                jsonFileCount: jsonFiles.length,
                totalSize: totalSize,
                outputDir: this.outputDir,
                latestProject: projects[0]?.name || '无',
                latestGenerated: projects[0]?.created || null
            };
        } catch (error) {
            console.error('❌ 获取存储统计失败:', error.message);
            return {
                projectCount: 0,
                jsonFileCount: 0,
                totalSize: 0,
                outputDir: this.outputDir,
                latestProject: '无',
                latestGenerated: null
            };
        }
    }
}

// 创建全局实例
const fileSaveService = new FileSaveService();

// 定期清理旧文件（每小时执行一次）
setInterval(() => {
    fileSaveService.cleanupOldFiles();
}, 60 * 60 * 1000);

module.exports = fileSaveService;
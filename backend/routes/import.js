const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

/**
 * 获取可导入的JSON文件列表
 */
router.get('/json-files', async (req, res) => {
    try {
        const jsonDir = path.join(__dirname, '../output/json');
        
        // 确保目录存在
        try {
            await fs.access(jsonDir);
        } catch {
            return res.json({ files: [] });
        }
        
        const files = await fs.readdir(jsonDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        const fileList = await Promise.all(
            jsonFiles.map(async (filename) => {
                const filePath = path.join(jsonDir, filename);
                const stats = await fs.stat(filePath);
                
                // 尝试读取文件元数据
                let metadata = {};
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    
                    // 检查是否有元数据注释（新格式）
                    const commentMatch = content.match(/^\/\*([\s\S]*?)\*\//);
                    if (commentMatch) {
                        try {
                            metadata = JSON.parse(commentMatch[1]);
                        } catch (e) {
                            // 忽略元数据解析错误
                        }
                        // 解析实际内容获取文件数量
                        const jsonContent = content.replace(/^\/\*[\s\S]*?\*\/\s*/, '');
                        const jsonData = JSON.parse(jsonContent);
                        metadata.fileCount = Object.keys(jsonData).length;
                    } else {
                        // 处理旧格式
                        const jsonData = JSON.parse(content);
                        
                        // 检查是否是旧格式（有metadata和code结构）
                        if (jsonData.metadata && jsonData.code) {
                            metadata = jsonData.metadata;
                            metadata.fileCount = Object.keys(jsonData.code).length;
                        } else {
                            // 直接计算文件数量
                            metadata.fileCount = Object.keys(jsonData).length;
                        }
                    }
                    
                } catch (e) {
                    console.warn(`读取文件元数据失败: ${filename}`, e.message);
                }
                
                return {
                    filename,
                    size: stats.size,
                    created: stats.mtime,
                    modified: stats.mtime,
                    metadata: metadata || {}
                };
            })
        );
        
        // 按修改时间倒序排列
        fileList.sort((a, b) => new Date(b.modified) - new Date(a.modified));
        
        res.json({ 
            success: true,
            files: fileList,
            total: fileList.length
        });
    } catch (error) {
        console.error('获取JSON文件列表失败:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

/**
 * 获取指定JSON文件的内容
 */
router.get('/json-file/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const jsonDir = path.join(__dirname, '../output/json');
        const filePath = path.join(jsonDir, filename);
        
        // 安全检查，防止路径遍历攻击
        if (!filename.endsWith('.json') || filename.includes('..')) {
            return res.status(400).json({ 
                success: false,
                error: '无效的文件名' 
            });
        }
        
        const content = await fs.readFile(filePath, 'utf8');
        
        // 处理不同的文件格式
        let jsonData;
        let metadata = {};
        
        // 检查是否有元数据注释
        const commentMatch = content.match(/^\/\*([\s\S]*?)\*\//);
        if (commentMatch) {
            try {
                metadata = JSON.parse(commentMatch[1]);
            } catch (e) {
                // 忽略元数据解析错误
            }
            // 移除注释，解析实际的JSON内容
            const jsonContent = content.replace(/^\/\*[\s\S]*?\*\/\s*/, '');
            jsonData = JSON.parse(jsonContent);
        } else {
            // 尝试解析整个文件
            const parsedContent = JSON.parse(content);
            
            // 检查是否是旧格式（有metadata和code结构）
            if (parsedContent.metadata && parsedContent.code) {
                metadata = parsedContent.metadata;
                jsonData = parsedContent.code;
            } else {
                // 直接使用文件内容
                jsonData = parsedContent;
            }
        }
        
        res.json({
            success: true,
            filename,
            content: jsonData,
            metadata: metadata
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ 
                success: false,
                error: '文件不存在' 
            });
        } else {
            console.error('读取JSON文件失败:', error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }
});

/**
 * 删除指定的JSON文件
 */
router.delete('/json-file/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const jsonDir = path.join(__dirname, '../output/json');
        const filePath = path.join(jsonDir, filename);
        
        // 安全检查
        if (!filename.endsWith('.json') || filename.includes('..')) {
            return res.status(400).json({ 
                success: false,
                error: '无效的文件名' 
            });
        }
        
        await fs.unlink(filePath);
        
        res.json({
            success: true,
            message: '文件删除成功'
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ 
                success: false,
                error: '文件不存在' 
            });
        } else {
            console.error('删除JSON文件失败:', error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }
});

/**
 * 重命名JSON文件
 */
router.put('/json-file/:filename/rename', async (req, res) => {
    try {
        const { filename } = req.params;
        const { newName } = req.body;
        
        if (!newName || !newName.endsWith('.json')) {
            return res.status(400).json({ 
                success: false,
                error: '新文件名必须以.json结尾' 
            });
        }
        
        const jsonDir = path.join(__dirname, '../output/json');
        const oldPath = path.join(jsonDir, filename);
        const newPath = path.join(jsonDir, newName);
        
        // 安全检查
        if (filename.includes('..') || newName.includes('..')) {
            return res.status(400).json({ 
                success: false,
                error: '无效的文件名' 
            });
        }
        
        await fs.rename(oldPath, newPath);
        
        res.json({
            success: true,
            message: '文件重命名成功',
            newFilename: newName
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ 
                success: false,
                error: '文件不存在' 
            });
        } else {
            console.error('重命名JSON文件失败:', error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }
});

module.exports = router;
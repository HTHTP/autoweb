const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const ArkAIService = require('../services/ai-service');

/**
 * 获取所有调试文件列表
 */
router.get('/files', (req, res) => {
    try {
        const debugDir = path.join(__dirname, '../debug');
        
        if (!fs.existsSync(debugDir)) {
            return res.json({ files: [] });
        }
        
        const files = fs.readdirSync(debugDir)
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const filePath = path.join(debugDir, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    created: stats.mtime,
                    size: stats.size
                };
            })
            .sort((a, b) => new Date(b.created) - new Date(a.created));
        
        res.json({ files });
    } catch (error) {
        console.error('获取调试文件列表失败:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 使用指定的调试文件测试JSON解析
 */
router.post('/test-parsing/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const debugDir = path.join(__dirname, '../debug');
        const filePath = path.join(debugDir, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: '调试文件不存在' });
        }
        
        // 读取调试文件
        const debugData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`🧪 开始测试解析: ${filename}`);
        console.log(`📊 原始代码长度: ${debugData.extractedLength}`);
        
        // 使用AI服务测试解析
        const aiService = new ArkAIService();
        const validation = aiService.validateGeneratedCode(debugData.extractedCode);
        
        const result = {
            filename,
            timestamp: new Date().toISOString(),
            original: {
                length: debugData.extractedLength,
                preview: debugData.firstChars
            },
            validation: {
                isValid: validation.valid,
                error: validation.error,
                hasCleanedCode: !!validation.cleanedCode,
                cleanedLength: validation.cleanedCode ? validation.cleanedCode.length : 0
            },
            testSuccess: validation.valid,
            fallbackUsed: !validation.valid
        };
        
        if (validation.valid) {
            console.log(`✅ 测试成功: ${filename} - JSON解析通过`);
            result.parsedFiles = Object.keys(validation.parsedCode || {}).length;
            result.fileList = Object.keys(validation.parsedCode || {}).slice(0, 10);
        } else {
            console.log(`❌ 测试失败: ${filename} - ${validation.error}`);
        }
        
        res.json(result);
    } catch (error) {
        console.error('测试解析失败:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 获取指定调试文件的详细信息
 */
router.get('/file/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const debugDir = path.join(__dirname, '../debug');
        const filePath = path.join(debugDir, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: '调试文件不存在' });
        }
        
        const debugData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.json(debugData);
    } catch (error) {
        console.error('读取调试文件失败:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * 批量测试所有调试文件
 */
router.post('/test-all', async (req, res) => {
    try {
        const debugDir = path.join(__dirname, '../debug');
        
        if (!fs.existsSync(debugDir)) {
            return res.json({ results: [], summary: { total: 0, passed: 0, failed: 0 } });
        }
        
        const files = fs.readdirSync(debugDir).filter(file => file.endsWith('.json'));
        const aiService = new ArkAIService();
        const results = [];
        
        console.log(`🧪 开始批量测试 ${files.length} 个调试文件...`);
        
        for (const filename of files) {
            try {
                const filePath = path.join(debugDir, filename);
                const debugData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                const validation = aiService.validateGeneratedCode(debugData.extractedCode);
                
                results.push({
                    filename,
                    success: validation.valid,
                    error: validation.error,
                    length: debugData.extractedLength,
                    parsedFiles: validation.valid ? Object.keys(validation.parsedCode || {}).length : 0
                });
                
                console.log(`${validation.valid ? '✅' : '❌'} ${filename}: ${validation.valid ? '成功' : validation.error}`);
            } catch (error) {
                results.push({
                    filename,
                    success: false,
                    error: error.message,
                    length: 0,
                    parsedFiles: 0
                });
            }
        }
        
        const summary = {
            total: results.length,
            passed: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            successRate: results.length > 0 ? (results.filter(r => r.success).length / results.length * 100).toFixed(1) + '%' : '0%'
        };
        
        console.log(`📊 批量测试完成: ${summary.passed}/${summary.total} 成功 (${summary.successRate})`);
        
        res.json({ results, summary });
    } catch (error) {
        console.error('批量测试失败:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
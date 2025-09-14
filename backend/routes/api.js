const express = require('express');
const router = express.Router();
const DouBaoAIService = require('../services/aiService');
const { validateVueProject, generateFileTree } = require('../utils/vueProjectValidator');

// 初始化AI服务
let aiService;
try {
    aiService = new DouBaoAIService();
} catch (error) {
    console.error('❌ AI服务初始化失败:', error.message);
}

/**
 * POST /api/generate
 * 根据文字描述生成Vue项目
 */
router.post('/generate', async (req, res) => {
    try {
        const { description, options = {} } = req.body;

        // 验证输入
        if (!description || typeof description !== 'string' || description.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: '请提供有效的项目描述',
                code: 'INVALID_DESCRIPTION'
            });
        }

        if (!aiService) {
            return res.status(500).json({
                success: false,
                error: 'AI服务未正确初始化，请检查API密钥配置',
                code: 'AI_SERVICE_NOT_INITIALIZED'
            });
        }

        console.log(`📝 收到生成请求: ${description.substring(0, 100)}...`);

        // 设置选项
        const {
            enableThinking = true,
            useStructuredOutput = true,
            includeValidation = true
        } = options;

        // 调用AI服务生成项目
        const startTime = Date.now();
        const generatedProject = await aiService.generateVueProject(
            description,
            enableThinking,
            useStructuredOutput
        );

        const generationTime = Date.now() - startTime;
        console.log(`⏱️ 生成耗时: ${generationTime}ms`);

        // 验证生成的项目结构（如果启用）
        let validation = { valid: true, errors: [], warnings: [] };
        if (includeValidation && useStructuredOutput) {
            validation = validateVueProject(generatedProject);
            if (!validation.valid) {
                console.warn('⚠️ 生成的项目结构验证失败:', validation.errors);
            }
        }

        // 生成文件树
        let fileTree = '';
        if (useStructuredOutput && generatedProject.files) {
            fileTree = generateFileTree(generatedProject.files);
        }

        // 返回结果
        const response = {
            success: true,
            data: generatedProject,
            metadata: {
                generationTime,
                description: description.substring(0, 200),
                timestamp: new Date().toISOString(),
                options: {
                    enableThinking,
                    useStructuredOutput,
                    includeValidation
                },
                validation,
                fileTree,
                stats: useStructuredOutput && generatedProject.files ? {
                    fileCount: generatedProject.files.length,
                    fileTypes: [...new Set(generatedProject.files.map(f => f.type))],
                    dependencyCount: generatedProject.dependencies ? generatedProject.dependencies.length : 0,
                    featureCount: generatedProject.features ? generatedProject.features.length : 0
                } : null
            }
        };

        res.json(response);

    } catch (error) {
        console.error('❌ 生成项目时出错:', error);
        
        let errorMessage = '生成项目时发生内部错误';
        let errorCode = 'INTERNAL_ERROR';

        if (error.message.includes('API')) {
            errorMessage = 'AI服务API调用失败，请检查网络连接和API密钥';
            errorCode = 'API_ERROR';
        } else if (error.message.includes('timeout')) {
            errorMessage = '请求超时，项目可能过于复杂，请尝试简化描述';
            errorCode = 'TIMEOUT_ERROR';
        }

        res.status(500).json({
            success: false,
            error: errorMessage,
            code: errorCode,
            details: error.message
        });
    }
});

/**
 * POST /api/generate/stream
 * 流式生成Vue项目
 */
router.post('/generate/stream', async (req, res) => {
    try {
        const { description } = req.body;

        if (!description || typeof description !== 'string' || description.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: '请提供有效的项目描述'
            });
        }

        if (!aiService) {
            return res.status(500).json({
                success: false,
                error: 'AI服务未正确初始化'
            });
        }

        // 设置流式响应头
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        console.log(`📝 开始流式生成: ${description.substring(0, 100)}...`);

        // 流式处理回调
        const onChunk = (type, content) => {
            const data = JSON.stringify({ type, content, timestamp: Date.now() });
            res.write(`data: ${data}\n\n`);
        };

        // 发送开始信号
        res.write(`data: ${JSON.stringify({ type: 'start', content: '开始生成...', timestamp: Date.now() })}\n\n`);

        try {
            const result = await aiService.generateVueProjectStream(description, onChunk);
            
            // 发送完成信号
            res.write(`data: ${JSON.stringify({ 
                type: 'complete', 
                content: '生成完成', 
                result,
                timestamp: Date.now() 
            })}\n\n`);
            
        } catch (error) {
            res.write(`data: ${JSON.stringify({ 
                type: 'error', 
                content: error.message,
                timestamp: Date.now() 
            })}\n\n`);
        }

        res.end();

    } catch (error) {
        console.error('❌ 流式生成出错:', error);
        res.status(500).json({
            success: false,
            error: '流式生成失败',
            details: error.message
        });
    }
});

/**
 * GET /api/test
 * 测试AI服务连接
 */
router.get('/test', async (req, res) => {
    try {
        if (!aiService) {
            return res.status(500).json({
                success: false,
                error: 'AI服务未初始化',
                details: 'ARK_API_KEY环境变量可能未设置'
            });
        }

        const isConnected = await aiService.testConnection();
        
        if (isConnected) {
            res.json({
                success: true,
                message: '豆包AI服务连接正常',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({
                success: false,
                error: '豆包AI服务连接失败',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('❌ 测试连接出错:', error);
        res.status(500).json({
            success: false,
            error: '测试连接时发生错误',
            details: error.message
        });
    }
});

/**
 * POST /api/validate
 * 验证Vue项目结构
 */
router.post('/validate', (req, res) => {
    try {
        const { project } = req.body;

        if (!project) {
            return res.status(400).json({
                success: false,
                error: '请提供要验证的项目数据'
            });
        }

        const validation = validateVueProject(project);
        const fileTree = project.files ? generateFileTree(project.files) : '';

        res.json({
            success: true,
            validation,
            fileTree,
            stats: project.files ? {
                fileCount: project.files.length,
                fileTypes: [...new Set(project.files.map(f => f.type))],
                dependencyCount: project.dependencies ? project.dependencies.length : 0
            } : null
        });

    } catch (error) {
        console.error('❌ 验证项目出错:', error);
        res.status(500).json({
            success: false,
            error: '验证项目时发生错误',
            details: error.message
        });
    }
});

module.exports = router;
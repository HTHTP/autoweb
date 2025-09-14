const express = require('express');
const router = express.Router();
const ArkAIService = require('../services/ai-service');
const taskManager = require('../services/task-manager');

/**
 * 修改现有代码
 * POST /api/modify
 */
router.post('/modify', async (req, res) => {
    try {
        const { currentCode, modification } = req.body;
        
        // 验证输入
        if (!currentCode || currentCode.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供当前代码'
            });
        }

        if (!modification || modification.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供修改要求'
            });
        }

        console.log('收到代码修改请求:', modification);

        const aiService = new ArkAIService();
        const result = await aiService.modifyVue3Code(currentCode, modification);
        
        if (result.success) {
            // 验证修改后的代码格式
            const validation = aiService.validateGeneratedCode(result.code);
            if (!validation.valid) {
                console.warn('修改后代码验证失败:', validation.error);
                return res.json({
                    success: false,
                    message: '代码修改失败：格式验证不通过',
                    error: validation.error
                });
            }
            
            res.json({
                success: true,
                code: result.code,
                message: '代码修改成功'
            });
        } else {
            res.json({
                success: false,
                message: '代码修改失败',
                error: result.error
            });
        }

    } catch (error) {
        console.error('代码修改失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误',
            error: error.message
        });
    }
});

/**
 * 异步修改代码
 * POST /api/modify/async
 */
router.post('/modify/async', async (req, res) => {
    try {
        const { currentCode, modification } = req.body;
        
        // 验证输入
        if (!currentCode || currentCode.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供当前代码'
            });
        }

        if (!modification || modification.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供修改要求'
            });
        }

        console.log('收到异步代码修改请求:', modification);

        // 创建异步任务
        const taskId = taskManager.createTask('modify', modification);
        
        // 立即返回任务ID
        res.json({
            success: true,
            taskId: taskId,
            message: '代码修改任务已启动'
        });

        // 异步执行代码修改
        try {
            await taskManager.executeTask(taskId, async (updateProgress) => {
                const aiService = new ArkAIService();
                
                updateProgress('正在连接AI服务...', 20);
                
                updateProgress('正在修改代码...', 50);
                const result = await aiService.modifyVue3Code(currentCode, modification);
                
                if (!result.success) {
                    throw new Error(result.error || 'AI修改失败');
                }
                
                updateProgress('正在验证代码格式...', 80);
                const validation = aiService.validateGeneratedCode(result.code);
                
                if (!validation.valid) {
                    throw new Error(`代码格式验证失败: ${validation.error}`);
                }
                
                updateProgress('代码修改完成', 100);
                return result.code;
            });
        } catch (error) {
            console.error('异步修改任务执行失败:', error);
        }

    } catch (error) {
        console.error('修改请求处理失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误',
            error: error.message
        });
    }
});

/**
 * 批量修改代码
 * POST /api/modify/batch
 */
router.post('/modify/batch', async (req, res) => {
    try {
        const { modifications } = req.body;
        
        if (!Array.isArray(modifications) || modifications.length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供修改列表'
            });
        }

        console.log(`收到批量修改请求，共 ${modifications.length} 个修改`);

        const results = [];
        const aiService = new ArkAIService();
        let currentCode = modifications[0].currentCode;

        for (let i = 0; i < modifications.length; i++) {
            const { modification } = modifications[i];
            
            try {
                console.log(`执行第 ${i + 1} 个修改: ${modification}`);
                
                const result = await aiService.modifyVue3Code(currentCode, modification);
                
                if (result.success) {
                    const validation = aiService.validateGeneratedCode(result.code);
                    if (validation.valid) {
                        currentCode = result.code; // 更新当前代码用于下一次修改
                        results.push({
                            index: i,
                            success: true,
                            modification: modification,
                            message: '修改成功'
                        });
                    } else {
                        results.push({
                            index: i,
                            success: false,
                            modification: modification,
                            error: validation.error
                        });
                        break; // 停止后续修改
                    }
                } else {
                    results.push({
                        index: i,
                        success: false,
                        modification: modification,
                        error: result.error
                    });
                    break; // 停止后续修改
                }
            } catch (error) {
                results.push({
                    index: i,
                    success: false,
                    modification: modification,
                    error: error.message
                });
                break; // 停止后续修改
            }
        }

        const successCount = results.filter(r => r.success).length;
        
        res.json({
            success: successCount > 0,
            code: successCount > 0 ? currentCode : null,
            message: `批量修改完成：${successCount}/${modifications.length} 个修改成功`,
            results: results
        });

    } catch (error) {
        console.error('批量修改失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误',
            error: error.message
        });
    }
});

/**
 * 智能代码优化
 * POST /api/modify/optimize
 */
router.post('/optimize', async (req, res) => {
    try {
        const { currentCode, optimizationType = 'performance' } = req.body;
        
        if (!currentCode || currentCode.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供当前代码'
            });
        }

        const optimizationPrompts = {
            performance: '优化代码性能，减少不必要的计算和渲染',
            accessibility: '提升代码的可访问性，添加必要的aria属性和语义化标签',
            responsive: '优化响应式设计，确保在各种设备上都能良好显示',
            seo: '优化SEO，添加必要的meta标签和结构化数据',
            security: '提升代码安全性，防止XSS和其他安全漏洞'
        };

        const modification = optimizationPrompts[optimizationType] || optimizationPrompts.performance;
        
        console.log(`收到代码优化请求: ${optimizationType}`);

        const aiService = new ArkAIService();
        const result = await aiService.modifyVue3Code(currentCode, modification);
        
        if (result.success) {
            const validation = aiService.validateGeneratedCode(result.code);
            if (!validation.valid) {
                return res.json({
                    success: false,
                    message: '代码优化失败：格式验证不通过',
                    error: validation.error
                });
            }
            
            res.json({
                success: true,
                code: result.code,
                message: `代码${optimizationType}优化成功`,
                optimizationType: optimizationType
            });
        } else {
            res.json({
                success: false,
                message: '代码优化失败',
                error: result.error
            });
        }

    } catch (error) {
        console.error('代码优化失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误',
            error: error.message
        });
    }
});

module.exports = router;
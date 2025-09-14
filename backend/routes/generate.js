const express = require('express');
const router = express.Router();
const ArkAIService = require('../services/ai-service');
const taskManager = require('../services/task-manager');
const fileSaveService = require('../services/file-save-service');

/**
 * 代码生成接口（异步处理）
 * POST /api/generate
 */
router.post('/generate', async (req, res) => {
    try {
        const { description, components = ['Element Plus'], style = 'modern' } = req.body;
        
        // 验证输入
        if (!description || description.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供功能描述'
            });
        }

        console.log('收到代码生成请求:', description);

        // 创建异步任务
        const taskId = taskManager.createTask('generate', description);
        
        // 立即返回任务ID
        res.json({
            success: true,
            taskId: taskId,
            message: '代码生成任务已启动',
            mode: 'async'
        });

        // 在后台执行生成任务
        setImmediate(async () => {
            try {
                const aiService = new ArkAIService();
                taskManager.updateTask(taskId, 'processing', { message: '正在生成代码...', progress: 10 });
                
                // 调用AI生成代码
                const result = await aiService.generateVue3Code(description, components, style);
                taskManager.updateTask(taskId, 'processing', { message: '正在验证代码...', progress: 60 });
                
                let finalCode;
                let saveMetadata = {
                    description,
                    components,
                    style,
                    mode: 'async',
                    aiModel: aiService.model,
                    timestamp: new Date().toISOString()
                };

                if (result.success) {
                    console.log('===== AI代码验证阶段 =====');
                    console.log('AI返回代码长度:', result.code?.length || 0);
                    console.log('开始验证AI生成的代码...');
                    
                    // 验证生成的代码
                    const validation = aiService.validateGeneratedCode(result.code);
                    if (!validation.valid) {
                        console.warn('❌ 代码验证失败:', validation.error);
                        console.log('验证失败详情:', {
                            error: validation.error,
                            hasCleanedCode: !!validation.cleanedCode,
                            originalCodeLength: result.code?.length || 0,
                            cleanedCodeLength: validation.cleanedCode?.length || 0
                        });
                        
                        // 如果有清理后的代码，尝试使用它
                        if (validation.cleanedCode) {
                            console.log('🔧 尝试使用清理后的代码...');
                            try {
                                const testParsed = JSON.parse(validation.cleanedCode); // 再次验证清理后的代码
                                console.log('✅ 清理后的代码解析成功，包含文件数量:', Object.keys(testParsed).length);
                                finalCode = validation.cleanedCode;
                                saveMetadata.aiGenerated = true;
                                saveMetadata.codeFixed = true;
                                saveMetadata.validationPassed = false;
                                saveMetadata.usedCleanedCode = true;
                                console.log('✅ 使用清理后的代码成功');
                            } catch (cleanError) {
                                console.warn('❌ 清理后的代码仍然无效:', cleanError.message);
                                console.log('清理代码解析错误详情:', {
                                    error: cleanError.message,
                                    position: cleanError.message.match(/position (\d+)/)?.[1] || '未知'
                                });
                                const defaultCode = aiService.generateDefaultVue3Project(description);
                                finalCode = JSON.stringify(defaultCode, null, 2);
                                saveMetadata.fallback = 'default_template';
                                saveMetadata.validationError = validation.error;
                                saveMetadata.cleanError = cleanError.message;
                                saveMetadata.aiGenerated = false;
                                console.log('💡 回退到默认模板');
                            }
                        } else {
                            console.log('🚫 没有清理后的代码可用');
                            // 没有清理后的代码，使用默认模板
                            console.warn('💡 直接使用默认模板，原因:', validation.error);
                            const defaultCode = aiService.generateDefaultVue3Project(description);
                            finalCode = JSON.stringify(defaultCode, null, 2);
                            saveMetadata.fallback = 'default_template';
                            saveMetadata.validationError = validation.error;
                            saveMetadata.aiGenerated = false;
                            saveMetadata.noCleanedCode = true;
                            console.log('💡 默认模板生成完成，文件数量:', Object.keys(JSON.parse(finalCode)).length);
                        }
                    } else {
                        console.log('✅ AI代码验证通过！');
                        console.log('验证通过详情:', {
                            parsedFiles: Object.keys(validation.parsedCode || {}).length,
                            hasRequiredFiles: true
                        });
                        finalCode = validation.cleanedCode || result.code;
                        saveMetadata.aiGenerated = true;
                        saveMetadata.validationPassed = true;
                        console.log('✅ 使用AI生成的原始代码');
                    }
                } else {
                    console.log('❌ AI生成失败:', result.error);
                    console.log('AI生成失败详情:', {
                        error: result.error,
                        fallbackReason: 'ai_generation_failed'
                    });
                    // AI失败时使用默认模板
                    console.warn('💡 AI生成失败，使用默认模板:', result.error);
                    const defaultCode = aiService.generateDefaultVue3Project(description);
                    finalCode = JSON.stringify(defaultCode, null, 2);
                    saveMetadata.fallback = 'default_template';
                    saveMetadata.aiError = result.error;
                }

                taskManager.updateTask(taskId, 'processing', { message: '正在保存文件...', progress: 80 });

                // 保存代码到本地文件系统
                try {
                    // 保存JSON格式
                    const jsonSaveResult = await fileSaveService.saveJsonCode(finalCode, saveMetadata);
                    
                    // 保存为Vue项目结构
                    const projectSaveResult = await fileSaveService.saveVueProject(finalCode, {
                        ...saveMetadata,
                        projectName: `async-${Date.now()}`
                    });

                    console.log('💾 代码已保存到本地:', {
                        json: jsonSaveResult.success ? jsonSaveResult.fileName : '失败',
                        project: projectSaveResult.success ? projectSaveResult.projectName : '失败'
                    });

                    // 在任务结果中包含保存信息
                    saveMetadata.localSave = {
                        json: jsonSaveResult,
                        project: projectSaveResult
                    };
                } catch (saveError) {
                    console.error('保存到本地失败:', saveError.message);
                    saveMetadata.saveError = saveError.message;
                }

                // 任务完成
                taskManager.updateTask(taskId, 'completed', {
                    message: saveMetadata.fallback ? '代码生成成功（使用默认模板）' : '代码生成成功',
                    progress: 100,
                    code: finalCode,
                    metadata: saveMetadata
                });

            } catch (error) {
                console.error('异步生成失败:', error);
                
                // 降级到默认模板
                try {
                    const aiService = new ArkAIService();
                    const defaultCode = aiService.generateDefaultVue3Project(description);
                    const finalCode = JSON.stringify(defaultCode, null, 2);
                    
                    const saveMetadata = {
                        description,
                        components,
                        style,
                        mode: 'async',
                        fallback: 'default_template',
                        error: error.message,
                        timestamp: new Date().toISOString()
                    };

                    // 保存降级代码
                    try {
                        await fileSaveService.saveJsonCode(finalCode, saveMetadata);
                        await fileSaveService.saveVueProject(finalCode, {
                            ...saveMetadata,
                            projectName: `fallback-${Date.now()}`
                        });
                    } catch (saveError) {
                        console.error('保存降级代码失败:', saveError.message);
                    }

                    taskManager.updateTask(taskId, 'completed', {
                        message: '代码生成成功（使用默认模板）',
                        progress: 100,
                        code: finalCode,
                        metadata: saveMetadata
                    });
                } catch (fallbackError) {
                    console.error('降级处理也失败了:', fallbackError);
                    taskManager.updateTask(taskId, 'failed', {
                        message: '代码生成失败',
                        error: fallbackError.message
                    });
                }
            }
        });

    } catch (error) {
        console.error('创建生成任务失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * 查询生成进度
 * GET /api/generate/progress/:taskId
 */
router.get('/generate/progress/:taskId', (req, res) => {
    try {
        const { taskId } = req.params;
        const task = taskManager.getTask(taskId);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: '任务不存在'
            });
        }

        // 返回任务状态和进度
        res.json({
            success: true,
            taskId: taskId,
            status: task.status,
            progress: task.progress || 0,
            message: task.message || '',
            code: task.code || null,
            metadata: task.metadata || {},
            error: task.error || null
        });
    } catch (error) {
        console.error('查询进度失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * 获取生成结果
 * GET /api/generate/result/:taskId
 */
router.get('/generate/result/:taskId', (req, res) => {
    try {
        const { taskId } = req.params;
        const task = taskManager.getTask(taskId);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: '任务不存在'
            });
        }

        if (task.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: '任务尚未完成',
                status: task.status
            });
        }

        // 返回生成的代码
        res.json({
            success: true,
            taskId: taskId,
            code: task.code,
            message: task.message,
            metadata: task.metadata
        });

        // 清理已完成的任务（可选）
        setTimeout(() => {
            taskManager.deleteTask(taskId);
        }, 300000); // 5分钟后清理

    } catch (error) {
        console.error('获取结果失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * 修改已生成的代码
 * POST /api/generate/modify
 */
router.post('/generate/modify', async (req, res) => {
    try {
        const { code, modification, style = 'modern' } = req.body;
        
        if (!code || !modification) {
            return res.status(400).json({
                success: false,
                message: '请提供代码和修改说明'
            });
        }

        console.log('收到代码修改请求:', modification);

        // 创建异步任务
        const taskId = taskManager.createTask('modify', modification);
        
        // 立即返回任务ID
        res.json({
            success: true,
            taskId: taskId,
            message: '代码修改任务已启动'
        });

        // 在后台执行修改任务
        setImmediate(async () => {
            try {
                const aiService = new ArkAIService();
                taskManager.updateTask(taskId, 'processing', { message: '正在修改代码...', progress: 30 });
                
                const result = await aiService.modifyVue3Code(code, modification, style);
                
                let finalCode;
                let saveMetadata = {
                    modification,
                    style,
                    mode: 'modify',
                    aiModel: aiService.model,
                    timestamp: new Date().toISOString()
                };

                if (result.success) {
                    finalCode = result.code;
                    saveMetadata.aiGenerated = true;
                } else {
                    // 修改失败时返回原代码
                    finalCode = code;
                    saveMetadata.fallback = 'original_code';
                    saveMetadata.aiError = result.error;
                }

                taskManager.updateTask(taskId, 'processing', { message: '正在保存文件...', progress: 80 });

                // 保存修改后的代码
                try {
                    const jsonSaveResult = await fileSaveService.saveJsonCode(finalCode, saveMetadata);
                    const projectSaveResult = await fileSaveService.saveVueProject(finalCode, {
                        ...saveMetadata,
                        projectName: `modify-${Date.now()}`
                    });

                    console.log('💾 修改后代码已保存到本地:', {
                        json: jsonSaveResult.success ? jsonSaveResult.fileName : '失败',
                        project: projectSaveResult.success ? projectSaveResult.projectName : '失败'
                    });

                    saveMetadata.localSave = {
                        json: jsonSaveResult,
                        project: projectSaveResult
                    };
                } catch (saveError) {
                    console.error('保存修改代码失败:', saveError.message);
                    saveMetadata.saveError = saveError.message;
                }

                // 任务完成
                taskManager.updateTask(taskId, 'completed', {
                    message: saveMetadata.fallback ? '代码修改失败，返回原代码' : '代码修改成功',
                    progress: 100,
                    code: finalCode,
                    metadata: saveMetadata
                });

            } catch (error) {
                console.error('修改任务失败:', error);
                taskManager.updateTask(taskId, 'failed', {
                    message: '代码修改失败',
                    error: error.message
                });
            }
        });

    } catch (error) {
        console.error('创建修改任务失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * 导出生成的代码为文件
 * POST /api/generate/export
 */
router.post('/generate/export', async (req, res) => {
    try {
        const { code, format = 'zip', projectName = 'vue-project' } = req.body;
        
        if (!code) {
            return res.status(400).json({
                success: false,
                message: '请提供要导出的代码'
            });
        }

        console.log('收到代码导出请求:', format);

        // 创建异步任务
        const taskId = taskManager.createTask('export', `导出为${format}格式`);
        
        // 立即返回任务ID
        res.json({
            success: true,
            taskId: taskId,
            message: '代码导出任务已启动'
        });

        // 在后台执行导出任务
        setImmediate(async () => {
            try {
                taskManager.updateTask(taskId, 'processing', { message: '正在准备导出...', progress: 20 });
                
                // 保存项目文件
                const projectSaveResult = await fileSaveService.saveVueProject(code, {
                    projectName: projectName,
                    format: format,
                    timestamp: new Date().toISOString()
                });

                if (projectSaveResult.success) {
                    taskManager.updateTask(taskId, 'completed', {
                        message: '代码导出成功',
                        progress: 100,
                        exportPath: projectSaveResult.projectPath,
                        metadata: {
                            format: format,
                            projectName: projectName,
                            files: projectSaveResult.files
                        }
                    });
                } else {
                    taskManager.updateTask(taskId, 'failed', {
                        message: '代码导出失败',
                        error: projectSaveResult.error
                    });
                }

            } catch (error) {
                console.error('导出任务失败:', error);
                taskManager.updateTask(taskId, 'failed', {
                    message: '代码导出失败',
                    error: error.message
                });
            }
        });

    } catch (error) {
        console.error('创建导出任务失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});

module.exports = router;
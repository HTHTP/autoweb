const express = require('express')
const { generateHTML } = require('../utils/codeGenerator')

const router = express.Router()

// 存储生成进度的映射
const progressMap = new Map()

// 生成网页的主要路由
router.post('/', async (req, res) => {
    try {
        const { description, components = [], style = 'modern' } = req.body

        if (!description || description.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供网页描述'
            })
        }

        console.log('收到生成请求:', { description, components, style })

        // 生成任务ID
        const taskId = Date.now().toString()

        // 初始化进度
        progressMap.set(taskId, {
            status: '开始生成网页',
            progress: 0,
            completed: false,
            error: null,
            result: null
        })

        // 异步生成代码
        generateCodeAsync(taskId, description.trim(), components, style)

        res.json({
            success: true,
            taskId: taskId,
            message: '生成任务已开始，请通过任务ID查询进度'
        })

    } catch (error) {
        console.error('启动生成任务失败:', error)
        res.status(500).json({
            success: false,
            message: error.message || '启动生成任务失败'
        })
    }
})

// 查询生成进度的路由
router.get('/progress/:taskId', (req, res) => {
    const { taskId } = req.params
    const progress = progressMap.get(taskId)

    if (!progress) {
        return res.status(404).json({
            success: false,
            message: '任务不存在'
        })
    }

    res.json({
        success: true,
        ...progress
    })
})

// 异步生成代码的函数
async function generateCodeAsync(taskId, description, components, style) {
    try {
        // 定义进度回调函数
        const progressCallback = (status) => {
            const progress = progressMap.get(taskId)
            if (progress) {
                const progressSteps = [
                    '开始生成网页',
                    '开始 UI 设计',
                    'UI 设计完成',
                    '开始生成网页代码',
                    '代码生成完毕',
                    '开始生成网页配图',
                    '生成网页配图完成',
                    '开始部署网页',
                    '部署网页完成'
                ]

                const currentStep = progressSteps.indexOf(status)
                const progressPercent = currentStep >= 0 ? Math.floor((currentStep + 1) / progressSteps.length * 100) : 0

                progress.status = status
                progress.progress = progressPercent
                console.log(`任务 ${taskId}: ${status} (${progressPercent}%)`)
            }
        }

        // 调用代码生成器
        const generatedCode = await generateHTML({
            description,
            components,
            style
        }, progressCallback)

        // 更新完成状态
        const progress = progressMap.get(taskId)
        if (progress) {
            progress.completed = true
            progress.progress = 100
            progress.status = '网页生成完成'
            progress.result = generatedCode
        }

        console.log(`任务 ${taskId} 完成`)

    } catch (error) {
        console.error(`任务 ${taskId} 失败:`, error)
        const progress = progressMap.get(taskId)
        if (progress) {
            progress.completed = true
            progress.error = error.message
            progress.status = '生成失败'
        }
    }
}

module.exports = router

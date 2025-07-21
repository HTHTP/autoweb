const express = require('express')
const { generateHTML } = require('../utils/codeGenerator')

const router = express.Router()

// 生成网页代码
router.post('/generate', async (req, res) => {
    try {
        const { description, components = [], style = 'modern' } = req.body

        if (!description || description.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供网页描述'
            })
        }

        console.log('收到生成请求:', { description, components, style })

        // 调用代码生成器
        const generatedCode = await generateHTML({
            description: description.trim(),
            components,
            style
        })

        res.json({
            success: true,
            code: generatedCode,
            message: '网页生成成功'
        })

    } catch (error) {
        console.error('生成代码失败:', error)
        res.status(500).json({
            success: false,
            message: error.message || '生成失败，请稍后重试'
        })
    }
})

module.exports = router

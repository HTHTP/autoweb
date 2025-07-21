const express = require('express')
const { modifyHTML } = require('../utils/codeGenerator')

const router = express.Router()

// 修改网页代码
router.post('/modify', async (req, res) => {
    try {
        const { currentCode, modification } = req.body

        if (!currentCode || !modification) {
            return res.status(400).json({
                success: false,
                message: '请提供当前代码和修改说明'
            })
        }

        console.log('收到修改请求:', { modification })

        // 调用代码修改器
        const modifiedCode = await modifyHTML({
            currentCode,
            modification: modification.trim()
        })

        res.json({
            success: true,
            code: modifiedCode,
            message: '代码修改成功'
        })

    } catch (error) {
        console.error('修改代码失败:', error)
        res.status(500).json({
            success: false,
            message: error.message || '修改失败，请稍后重试'
        })
    }
})

module.exports = router

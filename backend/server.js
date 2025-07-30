// 首先加载环境变量
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const generateRoute = require('./routes/generate')
const modifyRoute = require('./routes/modify')
const exportRoute = require('./routes/export')

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))

// 路由
app.use('/api/generate', generateRoute)
app.use('/api/modify', modifyRoute)
app.use('/api/export', exportRoute)

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        hasDeepSeekApiKey: !!process.env.DEEPSEEK_API_KEY,
        hasArkApiKey: !!process.env.ARK_API_KEY
    })
})

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`)
    console.log(`DeepSeek API Key 配置状态: ${process.env.DEEPSEEK_API_KEY ? '已配置' : '未配置'}`)
    console.log(`豆包 ARK API Key 配置状态: ${process.env.ARK_API_KEY ? '已配置' : '未配置'}`)
})

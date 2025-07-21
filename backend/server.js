const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))

// 引入路由处理器
const generateRoute = require('./routes/generate')
const modifyRoute = require('./routes/modify')
const exportRoute = require('./routes/export')

// 注册路由
app.use('/api', generateRoute)
app.use('/api', modifyRoute)
app.use('/api', exportRoute)

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'AI网页生成器后端服务运行正常' })
})

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    })
})

// 404 处理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: '接口不存在'
    })
})

app.listen(PORT, () => {
    console.log(`🚀 服务器启动成功，端口: ${PORT}`)
    console.log(`📖 健康检查: http://localhost:${PORT}/health`)
})

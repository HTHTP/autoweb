const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use('/public', express.static(path.join(__dirname, 'public')));

// 导入路由
const generateRoutes = require('./routes/generate');
const debugRoutes = require('./routes/debug');
const importRoutes = require('./routes/import');
const modifyRoutes = require('./routes/modify');
const exportRoutes = require('./routes/export');

// 使用路由
app.use('/api', generateRoutes);
app.use('/api', modifyRoutes);
app.use('/api', exportRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/import', importRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'AI Vue Code Generator Backend is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? err.message : '服务器异常'
    });
});

// 404 处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '接口不存在'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 AI Vue Code Generator Backend is running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🎯 API endpoints:`);
    console.log(`   POST http://localhost:${PORT}/api/generate - 生成Vue3代码`);
    console.log(`   GET  http://localhost:${PORT}/api/generate/progress/:taskId - 查询生成进度`);
    console.log(`   POST http://localhost:${PORT}/api/modify - 修改代码`);
    console.log(`   POST http://localhost:${PORT}/api/export - 导出代码`);
});

module.exports = app;
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 导入路由
const apiRoutes = require('./routes/api');

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// API路由
app.use('/api', apiRoutes);

// 基础路由
app.get('/', (req, res) => {
    res.json({ 
        message: 'AutoWeb API 服务正在运行',
        status: 'success',
        timestamp: new Date().toISOString(),
        endpoints: {
            generate: 'POST /api/generate',
            generateStream: 'POST /api/generate/stream',
            test: 'GET /api/test',
            validate: 'POST /api/validate'
        }
    });
});

// 健康检查路由
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: {
            nodeVersion: process.version,
            platform: process.platform,
            apiKeyConfigured: !!process.env.ARK_API_KEY
        }
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 AutoWeb API 服务器运行在端口 ${PORT}`);
    console.log(`📍 访问地址: http://localhost:${PORT}`);
    
    // 检查环境变量
    if (!process.env.ARK_API_KEY) {
        console.warn('⚠️  警告: 未设置 ARK_API_KEY 环境变量');
        console.log('请创建 .env 文件并设置您的豆包API密钥');
    } else {
        console.log('✅ 豆包API密钥已配置');
    }
});

module.exports = app;

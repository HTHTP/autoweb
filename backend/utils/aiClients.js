// AI 客户端配置 - 豆包 API 客户端初始化
const OpenAI = require('openai')

// 初始化豆包聊天API客户端
const arkChatClient = new OpenAI({
    apiKey: process.env.ARK_API_KEY || '',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3'
})

// 初始化豆包图像生成API客户端
const arkImageClient = new OpenAI({
    apiKey: process.env.ARK_API_KEY || '',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3'
})

// 配置豆包模型ID
const CHAT_MODEL = 'ep-20250728192938-68tdn'  // 聊天模型
const IMAGE_MODEL = 'ep-20250728193153-qrpp4' // 图像生成模型

// 检查API Key是否配置
function checkAPIKey() {
    return !!process.env.ARK_API_KEY
}

module.exports = {
    arkChatClient,
    arkImageClient,
    CHAT_MODEL,
    IMAGE_MODEL,
    checkAPIKey
}
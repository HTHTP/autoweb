#!/usr/bin/env node

// 豆包API测试脚本
require('dotenv').config()
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

// 配置模型ID
const CHAT_MODEL = 'ep-20250728192938-68tdn'
const IMAGE_MODEL = 'ep-20250728193153-qrpp4'

// 测试聊天API
async function testChatAPI() {
    try {
        console.log('🗣️ 测试豆包聊天API...')
        
        const response = await arkChatClient.chat.completions.create({
            model: CHAT_MODEL,
            messages: [
                {
                    role: 'user',
                    content: '请简单介绍一下Vue3框架'
                }
            ],
            temperature: 0.7,
            max_tokens: 200
        })

        const content = response?.choices?.[0]?.message?.content
        console.log('✅ 聊天API测试成功!')
        console.log('回复内容:', content?.substring(0, 100) + '...')
        return true
    } catch (error) {
        console.error('❌ 聊天API测试失败:', error.message)
        return false
    }
}

// 测试图像生成API
async function testImageAPI() {
    try {
        console.log('🎨 测试豆包图像生成API...')
        
        const response = await arkImageClient.images.generate({
            model: IMAGE_MODEL,
            prompt: '现代简约风格，科技公司官网主图，蓝色调，专业设计',
            size: '1024x1024',
            response_format: 'url'
        })

        const imageUrl = response?.data?.[0]?.url
        console.log('✅ 图像生成API测试成功!')
        console.log('图片URL:', imageUrl)
        return true
    } catch (error) {
        console.error('❌ 图像生成API测试失败:', error.message)
        return false
    }
}

// 运行所有测试
async function runAllTests() {
    console.log('🚀 开始测试豆包API功能...\n')
    
    // 检查API Key配置
    if (!process.env.ARK_API_KEY) {
        console.error('❌ 未配置ARK_API_KEY，请在.env文件中设置')
        return
    }
    
    console.log('✅ API Key已配置\n')
    
    // 测试聊天API
    const chatSuccess = await testChatAPI()
    console.log('')
    
    // 测试图像生成API
    const imageSuccess = await testImageAPI()
    console.log('')
    
    // 总结测试结果
    console.log('📋 测试结果总结:')
    console.log(`  聊天API: ${chatSuccess ? '✅ 正常' : '❌ 异常'}`)
    console.log(`  图像生成API: ${imageSuccess ? '✅ 正常' : '❌ 异常'}`)
    
    if (chatSuccess && imageSuccess) {
        console.log('\n🎉 所有API测试通过，系统可以正常工作!')
    } else {
        console.log('\n⚠️ 部分API测试失败，请检查配置和网络连接')
    }
}

// 运行测试
runAllTests().catch(console.error)

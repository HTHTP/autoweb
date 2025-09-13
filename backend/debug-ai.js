// 调试AI生成问题的测试脚本
require('dotenv').config()
const { arkChatClient, CHAT_MODEL, checkAPIKey } = require('./utils/aiClients')
const { generateWebpageCodeWithPlaceholders } = require('./utils/webpageCodeGenerator')

async function debugAIGeneration() {
    console.log('🔍 调试AI生成问题...\n')
    
    // 1. 检查API Key配置
    console.log('1. API Key检查:')
    console.log(`   是否配置: ${checkAPIKey()}`)
    console.log(`   Key长度: ${process.env.ARK_API_KEY ? process.env.ARK_API_KEY.length : 0}`)
    console.log()
    
    // 2. 测试基础AI调用
    console.log('2. 测试基础AI调用:')
    try {
        const testMessage = {
            role: "user",
            content: "请回复'测试成功'"
        }
        
        const response = await arkChatClient.chat.completions.create({
            model: CHAT_MODEL,
            messages: [testMessage],
            temperature: 0.3,
            max_tokens: 50
        })
        
        const result = response?.choices?.[0]?.message?.content
        console.log(`   AI响应: ${result}`)
        console.log('   ✅ 基础AI调用成功')
    } catch (error) {
        console.log(`   ❌ 基础AI调用失败: ${error.message}`)
        console.log(`   错误详情: ${error}`)
        return // 如果基础调用失败，不继续测试
    }
    console.log()
    
    // 3. 测试网页代码生成
    console.log('3. 测试网页代码生成:')
    try {
        const testParams = {
            description: '简单的智能手表展示页面',
            components: ['导航栏', '产品展示'],
            style: 'modern',
            uiDesign: {
                layout: '响应式布局',
                colorScheme: { primary: '#409eff' }
            }
        }
        
        console.log('   正在调用generateWebpageCodeWithPlaceholders...')
        const result = await generateWebpageCodeWithPlaceholders(
            testParams.description,
            testParams.components,
            testParams.style,
            testParams.uiDesign
        )
        
        console.log(`   ✅ 代码生成成功`)
        console.log(`   占位符数量: ${result.imagePlaceholders.length}`)
        console.log(`   生成的文件数量: ${Object.keys(result.codeWithPlaceholders).length}`)
        
        // 检查是否包含占位符
        const codeString = JSON.stringify(result.codeWithPlaceholders)
        const hasPlaceholders = codeString.includes('IMAGE_PLACEHOLDER')
        console.log(`   包含占位符: ${hasPlaceholders}`)
        
        if (result.imagePlaceholders.length > 0) {
            console.log('   第一个占位符:', result.imagePlaceholders[0])
        }
        
    } catch (error) {
        console.log(`   ❌ 代码生成失败: ${error.message}`)
        console.log(`   错误详情: ${error.stack}`)
    }
}

debugAIGeneration().then(() => {
    console.log('\n🔍 调试完成')
}).catch(error => {
    console.error('调试异常:', error)
})
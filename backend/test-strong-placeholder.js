// 测试强化占位符生成
require('dotenv').config()
const { arkChatClient, CHAT_MODEL } = require('./utils/aiClients')

async function testStrongPlaceholderGeneration() {
    console.log('🧪 测试强化占位符生成...\n')

    const systemPrompt = {
        role: "system",
        content: `你是Vue3专家。必须在每个需要图片的地方添加IMAGE_PLACEHOLDER注释。

格式示例：
<!-- IMAGE_PLACEHOLDER: {"id": "hero", "type": "hero", "size": "1200x600", "description": "智能手表主图", "alt": "手表"} -->

要求：
1. 必须包含至少3个占位符
2. 每个占位符都要在img标签附近
3. JSON格式必须正确`
    }

    const userMessage = {
        role: "user", 
        content: `生成一个智能手表产品页面的Vue组件，必须包含：
1. hero区域（需要主图占位符）
2. 产品特色（需要图标占位符）
3. 使用场景（需要场景图占位符）

返回JSON格式：{"Home.vue": "vue文件内容"}`
    }

    try {
        console.log('📞 调用AI生成...')
        const response = await arkChatClient.chat.completions.create({
            model: CHAT_MODEL,
            messages: [systemPrompt, userMessage],
            temperature: 0.3,
            max_tokens: 2000
        })

        const content = response?.choices?.[0]?.message?.content
        if (!content) {
            throw new Error('AI没有返回内容')
        }

        console.log('📝 AI返回内容:')
        console.log(content.substring(0, 1000) + '...\n')

        // 检查占位符
        const placeholderCount = (content.match(/IMAGE_PLACEHOLDER/g) || []).length
        console.log(`🔍 找到 ${placeholderCount} 个IMAGE_PLACEHOLDER`)

        if (placeholderCount > 0) {
            console.log('✅ AI成功生成了包含占位符的代码')
            
            // 显示占位符详情
            const placeholders = content.match(/<!--\s*IMAGE_PLACEHOLDER:.*?-->/g) || []
            placeholders.forEach((placeholder, index) => {
                console.log(`占位符 ${index + 1}: ${placeholder.substring(0, 100)}...`)
            })
        } else {
            console.log('❌ AI没有生成任何占位符')
        }

    } catch (error) {
        console.error('❌ 测试失败:', error.message)
    }
}

testStrongPlaceholderGeneration().then(() => {
    console.log('\n🧪 测试完成')
}).catch(error => {
    console.error('测试异常:', error)
})

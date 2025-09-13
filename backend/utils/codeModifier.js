// 代码修改器 - 处理现有代码的修改和优化
const { arkChatClient, CHAT_MODEL } = require('./aiClients')
const templates = require('./templates')

// 代码修改的系统提示词
const CODE_MODIFICATION_SYSTEM_PROMPT = {
    role: "system",
    content: `你是一个专业的前端开发工程师，擅长修改和优化现有的代码。

要求：
1. 仔细分析用户的修改要求
2. 对现有代码进行精确的修改
3. 保持代码的整体结构和功能不变
4. 确保修改后的代码仍然可以正常运行
5. 保持代码风格的一致性

请直接返回修改后的完整代码，不要包含任何解释文字。`
}

// 修改 HTML 代码
async function modifyHTML({ currentCode, modification }) {
    try {
        console.log('开始修改代码...', { modification })

        // 检查是否配置了 API Key
        if (!process.env.ARK_API_KEY) {
            console.warn('未配置 ARK_API_KEY，使用模拟修改')
            return await mockAIModification(currentCode, modification)
        }

        // 使用豆包 API 修改代码
        const modifiedCode = await realAIModification(currentCode, modification)

        return modifiedCode
    } catch (error) {
        console.error('修改代码失败:', error)
        // 如果 API 调用失败，回退到模拟修改
        console.warn('API 调用失败，回退到模拟修改')
        return await mockAIModification(currentCode, modification)
    }
}

// 使用豆包 API 修改代码
async function realAIModification(currentCode, modification) {
    try {
        const userMessage = {
            role: "user",
            content: `请根据以下修改要求，对现有代码进行修改：

修改要求：${modification}

现有代码：
${currentCode}

请返回修改后的完整代码。`
        }

        console.log('正在调用豆包 API 修改代码...')

        const response = await arkChatClient.chat.completions.create({
            model: CHAT_MODEL,
            messages: [CODE_MODIFICATION_SYSTEM_PROMPT, userMessage],
            temperature: 0.3,
            max_tokens: 8000
        })

        const content = response?.choices?.[0]?.message?.content
        if (typeof content !== 'string') {
            throw new Error('AI回复内容为空')
        }

        console.log('豆包 API 修改成功，代码长度:', content.length)
        return content

    } catch (error) {
        console.error('豆包 API 修改失败:', error)
        throw new Error("豆包 API 修改失败: " + error.message)
    }
}

// 模拟 AI 修改
async function mockAIModification(currentCode, modification) {
    console.log('使用模拟修改...')
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))

    let modifiedCode = currentCode

    // 简单的修改逻辑（实际项目中由 LLM 处理）
    if (modification.includes('红色') || modification.includes('红')) {
        modifiedCode = modifiedCode.replace(/blue/gi, 'red')
        modifiedCode = modifiedCode.replace(/#409eff/gi, '#f56c6c')
        modifiedCode = modifiedCode.replace(/primary/gi, 'danger')
    }

    if (modification.includes('绿色') || modification.includes('绿')) {
        modifiedCode = modifiedCode.replace(/blue/gi, 'green')
        modifiedCode = modifiedCode.replace(/#409eff/gi, '#67c23a')
        modifiedCode = modifiedCode.replace(/primary/gi, 'success')
    }

    if (modification.includes('大') || modification.includes('bigger')) {
        modifiedCode = modifiedCode.replace(/font-size:\s*14px/gi, 'font-size: 18px')
        modifiedCode = modifiedCode.replace(/font-size:\s*16px/gi, 'font-size: 20px')
    }

    if (modification.includes('小') || modification.includes('smaller')) {
        modifiedCode = modifiedCode.replace(/font-size:\s*16px/gi, 'font-size: 14px')
        modifiedCode = modifiedCode.replace(/font-size:\s*18px/gi, 'font-size: 16px')
    }

    if (modification.includes('居中') || modification.includes('center')) {
        modifiedCode = modifiedCode.replace(/<div class="container">/gi, '<div class="container" style="text-align: center;">')
    }

    return modifiedCode
}

module.exports = {
    modifyHTML,
    realAIModification,
    mockAIModification
}
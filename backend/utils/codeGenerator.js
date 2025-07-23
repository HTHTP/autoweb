// AI 代码生成器 - 集成 DeepSeek API
const OpenAI = require('openai')
const templates = require('./templates')

// 初始化 DeepSeek API 客户端
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY || ''
})

// 生成 HTML 代码
async function generateHTML({ description, components = [], style = 'modern' }) {
    try {
        console.log('开始生成代码...', { description, components, style })

        // 检查是否配置了 API Key
        if (!process.env.DEEPSEEK_API_KEY) {
            console.warn('未配置 DEEPSEEK_API_KEY，使用模拟生成')
            return await mockAIGeneration(description, components, style)
        }

        // 使用真实的 DeepSeek API 生成代码
        const generatedCode = await realAIGeneration(description, components, style)

        return generatedCode
    } catch (error) {
        console.error('生成代码失败:', error)
        // 如果 API 调用失败，回退到模拟生成
        console.warn('API 调用失败，回退到模拟生成')
        return await mockAIGeneration(description, components, style)
    }
}

// 修改 HTML 代码
async function modifyHTML({ currentCode, modification }) {
    try {
        console.log('开始修改代码...', { modification })

        // 检查是否配置了 API Key
        if (!process.env.DEEPSEEK_API_KEY) {
            console.warn('未配置 DEEPSEEK_API_KEY，使用模拟修改')
            return await mockAIModification(currentCode, modification)
        }

        // 使用真实的 DeepSeek API 修改代码
        const modifiedCode = await realAIModification(currentCode, modification)

        return modifiedCode
    } catch (error) {
        console.error('修改代码失败:', error)
        // 如果 API 调用失败，回退到模拟修改
        console.warn('API 调用失败，回退到模拟修改')
        return await mockAIModification(currentCode, modification)
    }
}

// 使用 DeepSeek API 生成代码 - 参照您的 ChatUtil 类
async function realAIGeneration(description, components, style) {
    try {
        const systemMessage = {
            role: "system",
            content: `你是一个专业的前端开发工程师，擅长使用 HTML、CSS 和 JavaScript 创建美观实用的网页。

要求：
1. 生成完整的 HTML 页面，包含 DOCTYPE、html、head 和 body 标签
2. 使用 Element Plus UI 库（通过 CDN 引入）
3. 使用 Vue 3 框架（通过 CDN 引入）
4. 样式要现代化、响应式，适配移动设备
5. 代码要干净、语义化、可维护
6. 包含适当的交互功能
7. 确保所有必要的外部资源都通过 CDN 正确引入

请直接返回 HTML 代码，不要包含任何解释文字。`
        }

        const userMessage = {
            role: "user",
            content: `请根据以下要求生成网页代码：

描述：${description}
${components.length > 0 ? `需要包含的组件：${components.join('、')}` : ''}
样式风格：${style}

请生成一个完整的、可直接运行的 HTML 页面。`
        }

        console.log('正在调用 DeepSeek API...')

        const response = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [systemMessage, userMessage],
            temperature: 0.7,
            top_p: 0.8,
            max_tokens: 8000
        })

        const content = response?.choices?.[0]?.message?.content
        if (typeof content !== 'string') {
            throw new Error('AI回复内容为空')
        }

        console.log('DeepSeek API 调用成功，代码长度:', content.length)
        return content

    } catch (error) {
        console.error('DeepSeek API 调用失败:', error)
        throw new Error("DeepSeek API 调用失败: " + error.message)
    }
}

// 使用 DeepSeek API 修改代码
async function realAIModification(currentCode, modification) {
    try {
        const systemMessage = {
            role: "system",
            content: `你是一个专业的前端开发工程师，擅长修改和优化现有的 HTML 代码。

要求：
1. 仔细分析用户的修改要求
2. 对现有代码进行精确的修改
3. 保持代码的整体结构和功能不变
4. 确保修改后的代码仍然可以正常运行
5. 保持代码风格的一致性
6.如果需要相应的图片素材，可以自行在网络检索免费的图片素材
请直接返回修改后的完整 HTML 代码，不要包含任何解释文字。`
        }

        const userMessage = {
            role: "user",
            content: `请根据以下修改要求，对现有代码进行修改：

修改要求：${modification}

现有代码：
${currentCode}

请返回修改后的完整代码。`
        }

        console.log('正在调用 DeepSeek API 修改代码...')

        const response = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [systemMessage, userMessage],
            temperature: 0.3,
            top_p: 0.8,
            max_tokens: 8000
        })

        const content = response?.choices?.[0]?.message?.content
        if (typeof content !== 'string') {
            throw new Error('AI回复内容为空')
        }

        console.log('DeepSeek API 修改成功，代码长度:', content.length)
        return content

    } catch (error) {
        console.error('DeepSeek API 修改失败:', error)
        throw new Error("DeepSeek API 修改失败: " + error.message)
    }
}

// 模拟 AI 生成（实际项目中替换为真实的 LLM 调用）
async function mockAIGeneration(description, components, style) {
    console.log('使用模拟生成...')
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // 根据描述选择合适的模板
    let template = templates.basic

    if (description.includes('导航') || description.includes('菜单')) {
        template = templates.withNavigation
    }
    if (description.includes('表格') || description.includes('数据')) {
        template = templates.withTable
    }
    if (description.includes('表单') || description.includes('输入')) {
        template = templates.withForm
    }
    if (description.includes('卡片') || description.includes('商品') || description.includes('产品')) {
        template = templates.withCards
    }

    // 根据样式调整
    const styleClass = getStyleClass(style)

    // 生成最终代码
    return template
        .replace(/{{description}}/g, description)
        .replace(/{{styleClass}}/g, styleClass)
        .replace(/{{timestamp}}/g, new Date().toLocaleString('zh-CN'))
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

// 获取样式类名
function getStyleClass(style) {
    const styles = {
        modern: 'modern-style',
        business: 'business-style',
        cute: 'cute-style',
        tech: 'tech-style'
    }
    return styles[style] || 'modern-style'
}

module.exports = {
    generateHTML,
    modifyHTML
}

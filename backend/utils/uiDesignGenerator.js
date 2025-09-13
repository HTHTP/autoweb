// UI设计生成器 - 处理UI设计方案生成
const { arkChatClient, CHAT_MODEL } = require('./aiClients')

// 生成UI设计方案的系统提示词
const UI_DESIGN_SYSTEM_PROMPT = {
    role: "system",
    content: `你是一个专业的UI/UX设计师，擅长网页界面设计。

任务：根据用户需求生成详细的UI设计方案

要求：
1. 分析用户需求，确定页面布局结构
2. 设计合理的色彩搭配方案
3. 规划组件的排列和层次
4. 考虑用户体验和交互流程
5. 提供具体的设计规范

请返回JSON格式的设计方案，包含：
- layout: 布局结构描述
- colorScheme: 色彩方案
- typography: 字体规范
- components: 组件设计说明
- images: 需要的图片描述列表`
}

// 生成UI设计方案
async function generateUIDesign(description, components, style) {
    try {
        const userMessage = {
            role: "user",
            content: `请为以下需求设计UI方案：

描述：${description}
组件：${components.join('、')}
风格：${style}

请提供详细的UI设计方案。`
        }

        console.log('正在生成UI设计方案...')

        const response = await arkChatClient.chat.completions.create({
            model: CHAT_MODEL,
            messages: [UI_DESIGN_SYSTEM_PROMPT, userMessage],
            temperature: 0.7,
            max_tokens: 2000
        })

        const content = response?.choices?.[0]?.message?.content
        if (!content) {
            throw new Error('UI设计方案生成失败')
        }

        // 尝试解析JSON，如果失败返回默认设计
        try {
            return JSON.parse(content)
        } catch (e) {
            return getDefaultUIDesign(description, components, style)
        }

    } catch (error) {
        console.error('UI设计生成失败:', error)
        return getDefaultUIDesign(description, components, style)
    }
}

// 获取默认UI设计方案
function getDefaultUIDesign(description, components, style) {
    return {
        layout: "响应式布局，头部导航+主内容区+页脚",
        colorScheme: {
            primary: style === 'business' ? '#2c3e50' : '#409eff',
            secondary: '#f8f9fa',
            accent: style === 'cute' ? '#ff6b9d' : '#67c23a'
        },
        typography: {
            headingFont: 'system-ui, sans-serif',
            bodyFont: 'system-ui, sans-serif',
            headingSize: '2rem',
            bodySize: '1rem'
        },
        components: components.map(comp => ({
            name: comp,
            style: `${style}风格的${comp}组件`
        })),
        images: [
            { type: 'hero', description: '主图展示' },
            { type: 'background', description: '背景装饰' },
            { type: 'decoration', description: '细节装饰' }
        ]
    }
}

module.exports = {
    generateUIDesign,
    getDefaultUIDesign
}
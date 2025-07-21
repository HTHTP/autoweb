// 模拟 AI 代码生成器
// 在实际项目中，这里会调用 OpenAI API 或其他 LLM 服务

const templates = require('./templates')

// 生成 HTML 代码
async function generateHTML({ description, components = [], style = 'modern' }) {
    try {
        console.log('开始生成代码...', { description, components, style })

        // 这里模拟 AI 生成过程
        // 实际项目中会调用 OpenAI API
        const generatedCode = await mockAIGeneration(description, components, style)

        return generatedCode
    } catch (error) {
        console.error('生成代码失败:', error)
        throw new Error('代码生成失败')
    }
}

// 修改 HTML 代码
async function modifyHTML({ currentCode, modification }) {
    try {
        console.log('开始修改代码...', { modification })

        // 这里模拟 AI 修改过程
        const modifiedCode = await mockAIModification(currentCode, modification)

        return modifiedCode
    } catch (error) {
        console.error('修改代码失败:', error)
        throw new Error('代码修改失败')
    }
}

// 模拟 AI 生成（实际项目中替换为真实的 LLM 调用）
async function mockAIGeneration(description, components, style) {
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

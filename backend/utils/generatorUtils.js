// 通用工具函数 - 提供各种辅助功能
const templates = require('./templates')

// 模拟 AI 生成（用于API调用失败时的回退）
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

// 生成项目名称
function generateProjectName(description) {
    // 从描述中提取关键词作为项目名
    const words = description.toLowerCase()
        .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, '') // 保留中文、英文和数字
        .split(/\s+/)
        .filter(word => word.length > 1)
        .slice(0, 3) // 取前3个词
    
    if (words.length === 0) {
        return 'my-vue-app'
    }
    
    return words.join('-').replace(/[\u4e00-\u9fa5]/g, 'app') + '-vue'
}

// 格式化时间戳
function formatTimestamp() {
    return new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

// 安全的JSON解析
function safeJSONParse(str, fallback = {}) {
    try {
        return JSON.parse(str)
    } catch (error) {
        console.warn('JSON解析失败:', error.message)
        return fallback
    }
}

// 清理HTML代码
function sanitizeHTML(html) {
    if (typeof html !== 'string') {
        return ''
    }
    
    // 移除潜在的危险标签和属性
    return html
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '') // 移除事件处理器
        .replace(/javascript:/gi, '')
}

// 验证组件名称
function validateComponentName(name) {
    if (typeof name !== 'string' || name.length === 0) {
        return false
    }
    
    // Vue组件名称规则：首字母大写，只能包含字母、数字、连字符
    return /^[A-Z][a-zA-Z0-9-]*$/.test(name)
}

// 生成随机ID
function generateRandomId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 延迟执行
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// 重试函数
async function retry(fn, maxAttempts = 3, delayMs = 1000) {
    let lastError
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error
            console.warn(`第${attempt}次尝试失败:`, error.message)
            
            if (attempt < maxAttempts) {
                await delay(delayMs)
            }
        }
    }
    
    throw lastError
}

// 深拷贝对象
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime())
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item))
    }
    
    if (typeof obj === 'object') {
        const clonedObj = {}
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key])
            }
        }
        return clonedObj
    }
    
    return obj
}

// 检查字符串是否为空
function isEmpty(str) {
    return !str || str.trim().length === 0
}

// 截断文本
function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) {
        return text
    }
    
    return text.substring(0, maxLength) + '...'
}

// 驼峰转短横线
function camelToKebab(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

// 短横线转驼峰
function kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
}

// 首字母大写
function capitalize(str) {
    if (!str) return str
    return str.charAt(0).toUpperCase() + str.slice(1)
}

module.exports = {
    mockAIGeneration,
    getStyleClass,
    generateProjectName,
    formatTimestamp,
    safeJSONParse,
    sanitizeHTML,
    validateComponentName,
    generateRandomId,
    delay,
    retry,
    deepClone,
    isEmpty,
    truncateText,
    camelToKebab,
    kebabToCamel,
    capitalize
}
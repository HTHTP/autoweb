// AI 代码生成器 - 主入口模块
// 导入各个功能模块
const { checkAPIKey } = require('./aiClients')
const { generateUIDesign } = require('./uiDesignGenerator')
const { generateWebpageCode } = require('./webpageCodeGenerator')
const { generateWebpageImages, integrateImagesIntoCode } = require('./imageGenerator')
const { modifyHTML } = require('./codeModifier')
const { mockAIGeneration } = require('./generatorUtils')

// 生成 HTML 代码 - 完整流程
async function generateHTML({ description, components = [], style = 'modern' }, progressCallback = null) {
    try {
        console.log('开始生成网页...')

        // 检查是否配置了 API Key
        if (!checkAPIKey()) {
            console.warn('未配置 ARK_API_KEY，使用模拟生成')
            return await mockAIGeneration(description, components, style)
        }

        // 步骤1: 开始UI设计
        if (progressCallback) progressCallback('开始 UI 设计')
        const uiDesign = await generateUIDesign(description, components, style)

        // 步骤2: UI设计完成
        if (progressCallback) progressCallback('UI 设计完成')

        // 步骤3: 开始生成网页代码
        if (progressCallback) progressCallback('开始生成网页代码')
        const generatedCode = await generateWebpageCode(description, components, style, uiDesign)

        // 步骤4: 代码生成完毕
        if (progressCallback) progressCallback('代码生成完毕')

        // 步骤5: 开始生成网页配图
        if (progressCallback) progressCallback('开始生成网页配图')
        const images = await generateWebpageImages(description, style)

        // 步骤6: 生成网页配图完成
        if (progressCallback) progressCallback('生成网页配图完成')

        // 步骤7: 开始部署网页
        if (progressCallback) progressCallback('开始部署网页')
        const finalCode = await integrateImagesIntoCode(generatedCode, images)

        // 步骤8: 部署网页完成
        if (progressCallback) progressCallback('部署网页完成')

        return finalCode
    } catch (error) {
        console.error('生成代码失败:', error)
        // 如果 API 调用失败，回退到模拟生成
        console.warn('API 调用失败，回退到模拟生成')
        return await mockAIGeneration(description, components, style)
    }
}

// 导出主要功能
module.exports = {
    generateHTML,
    modifyHTML
}

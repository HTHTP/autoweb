// 图片生成器 - 处理网页配图生成和集成
const { arkImageClient, IMAGE_MODEL } = require('./aiClients')

// 生成网页配图
async function generateWebpageImages(description, style) {
    try {
        const images = []

        // 生成主要配图
        const mainImagePrompt = generateImagePrompt(description, style, 'hero')
        console.log('正在生成主图:', mainImagePrompt)

        try {
            const heroImageResponse = await arkImageClient.images.generate({
                model: IMAGE_MODEL,
                prompt: mainImagePrompt,
                size: "1024x1024",
                response_format: "url"
            })

            if (heroImageResponse.data && heroImageResponse.data[0]) {
                images.push({
                    type: 'hero',
                    url: heroImageResponse.data[0].url,
                    description: '主图'
                })
                console.log('主图生成成功:', heroImageResponse.data[0].url)
            }
        } catch (error) {
            console.error('主图生成失败:', error.message)
        }

        // 生成背景图
        const bgImagePrompt = generateImagePrompt(description, style, 'background')
        console.log('正在生成背景图:', bgImagePrompt)

        try {
            const bgImageResponse = await arkImageClient.images.generate({
                model: IMAGE_MODEL,
                prompt: bgImagePrompt,
                size: "1024x1024",
                response_format: "url"
            })

            if (bgImageResponse.data && bgImageResponse.data[0]) {
                images.push({
                    type: 'background',
                    url: bgImageResponse.data[0].url,
                    description: '背景图'
                })
                console.log('背景图生成成功:', bgImageResponse.data[0].url)
            }
        } catch (error) {
            console.error('背景图生成失败:', error.message)
        }

        // 生成装饰图
        const decorImagePrompt = generateImagePrompt(description, style, 'decoration')
        console.log('正在生成装饰图:', decorImagePrompt)

        try {
            const decorImageResponse = await arkImageClient.images.generate({
                model: IMAGE_MODEL,
                prompt: decorImagePrompt,
                size: "1024x1024",
                response_format: "url"
            })

            if (decorImageResponse.data && decorImageResponse.data[0]) {
                images.push({
                    type: 'decoration',
                    url: decorImageResponse.data[0].url,
                    description: '装饰图'
                })
                console.log('装饰图生成成功:', decorImageResponse.data[0].url)
            }
        } catch (error) {
            console.error('装饰图生成失败:', error.message)
        }

        console.log(`成功生成 ${images.length} 张图片`)
        return images

    } catch (error) {
        console.error('图片生成过程失败:', error)
        return []
    }
}

// 将图片集成到代码中
async function integrateImagesIntoCode(codeStructure, images) {
    try {
        if (!images || images.length === 0) {
            return codeStructure
        }

        // 解析代码结构
        let projectStructure
        try {
            projectStructure = JSON.parse(codeStructure)
        } catch (e) {
            return codeStructure
        }

        // 为每种类型的图片找到合适的位置
        const heroImage = images.find(img => img.type === 'hero')
        const bgImage = images.find(img => img.type === 'background')
        const decorImage = images.find(img => img.type === 'decoration')

        // 更新项目文件中的图片引用
        Object.keys(projectStructure).forEach(filePath => {
            if (filePath.endsWith('.vue') && typeof projectStructure[filePath] === 'string') {
                let content = projectStructure[filePath]

                // 替换主图
                if (heroImage) {
                    content = content.replace(
                        /src="[^"]*placeholder[^"]*"/g,
                        `src="${heroImage.url}"`
                    )
                    content = content.replace(
                        /background-image:\s*url\([^)]*placeholder[^)]*\)/g,
                        `background-image: url(${heroImage.url})`
                    )
                }

                // 替换背景图
                if (bgImage) {
                    content = content.replace(
                        /background:\s*linear-gradient[^;]*/g,
                        `background: url(${bgImage.url}) center/cover`
                    )
                }

                // 添加装饰图
                if (decorImage && content.includes('decoration')) {
                    content = content.replace(
                        /src="[^"]*decoration[^"]*"/g,
                        `src="${decorImage.url}"`
                    )
                }

                projectStructure[filePath] = content
            }
        })

        return JSON.stringify(projectStructure, null, 2)

    } catch (error) {
        console.error('图片集成失败:', error)
        return codeStructure
    }
}

// 生成图片提示词
function generateImagePrompt(description, style, imageType) {
    const styleMap = {
        modern: '现代简约风格',
        business: '商务专业风格',
        cute: '可爱卡通风格',
        tech: '科技未来风格'
    }

    const typeMap = {
        hero: '主图，突出主题',
        background: '背景图，简洁大气',
        decoration: '装饰图，精美细致'
    }

    const styleDesc = styleMap[style] || '现代简约风格'
    const typeDesc = typeMap[imageType] || '配图'

    return `${styleDesc}，${typeDesc}，与"${description}"主题相关，高质量，专业设计，网页用图`
}

module.exports = {
    generateWebpageImages,
    integrateImagesIntoCode,
    generateImagePrompt
}
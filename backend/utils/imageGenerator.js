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

// 根据占位符信息生成精准配图
async function generateWebpageImagesFromPlaceholders(imagePlaceholders, description, style) {
    try {
        const images = []

        console.log(`开始根据 ${imagePlaceholders.length} 个占位符生成图片`)

        for (const placeholder of imagePlaceholders) {
            console.log(`正在生成图片: ${placeholder.id} - ${placeholder.description}`)

            try {
                // 根据占位符信息生成精准的提示词
                const imagePrompt = generateImagePromptFromPlaceholder(placeholder, description, style)
                
                // 根据占位符尺寸确定生成尺寸
                const imageSize = determineImageSize(placeholder.size)

                const imageResponse = await arkImageClient.images.generate({
                    model: IMAGE_MODEL,
                    prompt: imagePrompt,
                    size: imageSize,
                    response_format: "url"
                })

                if (imageResponse.data && imageResponse.data[0]) {
                    images.push({
                        id: placeholder.id,
                        type: placeholder.type,
                        url: imageResponse.data[0].url,
                        description: placeholder.description,
                        placeholder: placeholder
                    })
                    console.log(`图片生成成功: ${placeholder.id} - ${imageResponse.data[0].url}`)
                }
            } catch (error) {
                console.error(`图片生成失败 (${placeholder.id}):`, error.message)
                // 即使单个图片失败，也继续生成其他图片
            }
        }

        console.log(`成功生成 ${images.length}/${imagePlaceholders.length} 张图片`)
        return images

    } catch (error) {
        console.error('基于占位符的图片生成过程失败:', error)
        // 回退到原始方法
        return await generateWebpageImages(description, style)
    }
}

// 智能替换占位符并集成图片
async function integrateImagesIntoCodeWithPlaceholders(codeStructure, images, imagePlaceholders) {
    try {
        if (!images || images.length === 0) {
            console.log('没有图片需要集成，返回原始代码')
            return codeStructure
        }

        // 解析代码结构
        let projectStructure
        try {
            projectStructure = typeof codeStructure === 'string' ? JSON.parse(codeStructure) : codeStructure
        } catch (e) {
            console.warn('代码结构解析失败，返回原始内容')
            return codeStructure
        }

        console.log(`开始集成 ${images.length} 张图片到代码中`)

        // 为每个图片找到对应的占位符并替换
        for (const image of images) {
            const placeholder = imagePlaceholders.find(p => p.id === image.id)
            if (!placeholder) {
                console.warn(`找不到图片 ${image.id} 对应的占位符`)
                continue
            }

            // 在对应的文件中替换占位符
            if (projectStructure[placeholder.filePath]) {
                let content = projectStructure[placeholder.filePath]
                
                // 根据占位符类型决定替换方式
                content = replaceImagePlaceholder(content, placeholder, image)
                
                projectStructure[placeholder.filePath] = content
                console.log(`已在 ${placeholder.filePath} 中替换占位符 ${placeholder.id}`)
            } else {
                console.warn(`文件 ${placeholder.filePath} 不存在，跳过占位符 ${placeholder.id}`)
            }
        }

        return JSON.stringify(projectStructure, null, 2)

    } catch (error) {
        console.error('智能图片集成失败:', error)
        // 回退到原始集成方法
        return await integrateImagesIntoCode(codeStructure, images)
    }
}

// 根据占位符信息生成精准的图片提示词（专业级详细版本）
function generateImagePromptFromPlaceholder(placeholder, description, style) {
    // 如果占位符包含详细的专业信息，优先使用
    if (placeholder.materials && placeholder.lighting && placeholder.scene) {
        return generateAdvancedPromptFromPlaceholder(placeholder, description, style)
    }
    
    // 否则使用基础模板生成详细提示词
    return generateDetailedPromptFromTemplate(placeholder, description, style)
}

// 使用占位符详细信息生成高级提示词
function generateAdvancedPromptFromPlaceholder(placeholder, description, style) {
    const productType = placeholder.productType || extractProductType(description)
    const materials = placeholder.materials || '高品质材料'
    const lighting = placeholder.lighting || '柔和自然光'
    const scene = placeholder.scene || '现代简约空间'
    const quality = placeholder.quality || '高清画质'
    
    let prompt = ''
    
    switch (placeholder.type) {
        case 'hero':
            prompt = `生成一张高品质${productType}商品展示图，${productType}风格为${getStyleName(style)}，主体框架采用${materials}，纹理清晰自然，设计精致且兼具功能性；产品造型注重人体工学，线条流畅且结构稳固；整体场景设定为${scene}，背景搭配协调的装饰元素，光线采用${lighting}，形成轻微阴影增强立体感，${quality}，色彩饱和度自然，突出${productType}的材质质感和使用氛围，无多余杂物干扰，适合用于${placeholder.context || '商业展示'}。主题：${description}`
            break
            
        case 'background':
            prompt = `创建一个${getStyleName(style)}的高品质背景图，材质纹理采用${materials}的质感表现，整体设计简洁大气，光影层次丰富，使用${lighting}营造专业氛围，场景设置为${scene}，背景元素包含轻微的纹理变化，深度层次明显，色彩过渡自然，饱和度适中，不抢夺前景内容焦点，${quality}，适合作为${placeholder.context || '网页背景'}，风格与"${description}"主题完美融合`
            break
            
        case 'decoration':
            prompt = `设计一幅${getStyleName(style)}的精美装饰图，主体元素与"${description}"主题紧密关联，采用${materials}材质质感，场景设置在${scene}中，光线运用${lighting}突出重点区域，细节丰富且层次分明，构图遵循视觉美学原则，${quality}，整体设计既有装饰性又不失功能性，适合用于${placeholder.context || '内容装饰'}，能够完美融入整体设计风格`
            break
            
        case 'icon':
            prompt = `制作一个${getStyleName(style)}的专业图标，设计简洁明了，符合"${description}"的主题特征，采用精致的材质表现，线条处理精准，整体造型识别度高，在各种尺寸下都清晰可辨，光线效果简洁，适合用于${placeholder.context || '界面展示'}，${quality}，色彩对比度适宜，既保持视觉美感又确保功能性`
            break
            
        default:
            prompt = `创作一幅${getStyleName(style)}的高品质图像，主题围绕"${description}"展开，材质选用${materials}，场景设置在${scene}中，环境光线使用${lighting}，营造专业且温馨的氛围，${quality}，构图考虑视觉平衡，色彩饱和度自然，适合用于${placeholder.context || '展示用途'}`
    }
    
    return prompt
}

// 使用模板生成详细提示词
function generateDetailedPromptFromTemplate(placeholder, description, style) {
    // 基础风格映射
    const styleTemplates = {
        modern: {
            name: '现代简约风格',
            materials: '进口白橡木、高密度棉麻面料、哑光金属',
            colors: '浅灰色、银色、原木色',
            lighting: '柔和自然光',
            scene: '明亮的现代居室'
        },
        business: {
            name: '商务专业风格',
            materials: '进口黑胡桃木、真皮、不锈钢',
            colors: '深灰色、黑色、金属色',
            lighting: '专业影棚光',
            scene: '简洁的办公环境'
        },
        cute: {
            name: '可爱温馨风格',
            materials: '松木、纯棉面料、环保漆',
            colors: '粉色、米白色、浅木色',
            lighting: '温暖柔和光线',
            scene: '温馨的居家角落'
        },
        tech: {
            name: '科技未来风格',
            materials: '碳纤维、航空铝合金、高科技面料',
            colors: '深蓝色、银色、黑色',
            lighting: '冷色调LED光',
            scene: '现代科技展厅'
        }
    }

    const currentStyle = styleTemplates[style] || styleTemplates.modern

    // 根据图片类型生成详细提示词
    switch (placeholder.type) {
        case 'hero':
            return generateHeroImagePrompt(placeholder, description, currentStyle)
        case 'background':
            return generateBackgroundImagePrompt(placeholder, description, currentStyle)
        case 'decoration':
            return generateDecorationImagePrompt(placeholder, description, currentStyle)
        case 'icon':
            return generateIconImagePrompt(placeholder, description, currentStyle)
        default:
            return generateDefaultDetailedPrompt(placeholder, description, currentStyle)
    }
}

// 获取风格名称
function getStyleName(style) {
    const styleNames = {
        modern: '现代简约风格',
        business: '商务专业风格',
        cute: '可爱温馨风格',
        tech: '科技未来风格'
    }
    return styleNames[style] || '现代简约风格'
}

// 生成主图（Hero）的详细提示词
function generateHeroImagePrompt(placeholder, description, styleTemplate) {
    const productType = extractProductType(description)
    const contextDesc = placeholder.context || '主要展示区域'
    
    return `生成一张高品质${productType}商品展示图，${productType}风格为${styleTemplate.name}，主体框架采用${styleTemplate.materials}，纹理清晰自然，表面处理精致，搭配${styleTemplate.colors}的配色方案，触感柔软且兼具支撑性；产品设计注重人体工学，线条流畅且承重性强；整体场景设定为${styleTemplate.scene}，背景搭配协调的墙面和地板，旁边摆放精选装饰品和绿植，光线采用${styleTemplate.lighting}从侧面射入，形成轻微阴影增强立体感，图片比例为16:9，画质达到8K高清，色彩饱和度自然，突出${productType}的材质质感和使用氛围，无多余杂物干扰，适合用于${contextDesc}的商业展示。主题：${description}`
}

// 生成背景图的详细提示词
function generateBackgroundImagePrompt(placeholder, description, styleTemplate) {
    const contextDesc = placeholder.context || '整体背景'
    
    return `创建一个${styleTemplate.name}的高品质背景图，采用${styleTemplate.colors}的色彩搭配，材质纹理细腻，表面呈现${styleTemplate.materials}的质感，整体设计简洁大气，光影层次丰富，使用${styleTemplate.lighting}营造温馨氛围，背景元素包含轻微的几何图案或纹理，深度层次明显，色彩过渡自然，饱和度适中，不抢夺前景内容焦点，适合作为网页或应用的${contextDesc}，分辨率支持4K显示，风格与"${description}"主题完美融合，营造专业且富有品质感的视觉体验`
}

// 生成装饰图的详细提示词
function generateDecorationImagePrompt(placeholder, description, styleTemplate) {
    const contextDesc = placeholder.context || '装饰区域'
    
    return `设计一幅${styleTemplate.name}的精美装饰图，主体元素与"${description}"主题紧密关联，采用${styleTemplate.materials}材质质感，配色方案以${styleTemplate.colors}为主，细节丰富且层次分明，构图遵循黄金分割比例，光线运用${styleTemplate.lighting}突出重点区域，整体设计既有装饰性又不失功能性，适合用于${contextDesc}的视觉点缀，画面平衡感强，色彩协调统一，分辨率达到高清标准，能够完美融入整体设计风格，提升页面的视觉品质和用户体验`
}

// 生成图标的详细提示词
function generateIconImagePrompt(placeholder, description, styleTemplate) {
    const contextDesc = placeholder.context || '图标展示'
    
    return `制作一个${styleTemplate.name}的专业图标，设计简洁明了，符合"${description}"的主题特征，采用${styleTemplate.colors}的配色，线条粗细适中，边角处理圆润，整体造型识别度高，在小尺寸下依然清晰可辨，背景透明或使用简单的${styleTemplate.lighting}效果，适合用于${contextDesc}的界面展示，矢量风格，支持多种分辨率缩放，色彩对比度适宜，既保持视觉美感又确保功能性的最佳平衡`
}

// 生成默认详细提示词
function generateDefaultDetailedPrompt(placeholder, description, styleTemplate) {
    const contextDesc = placeholder.context || placeholder.description || '展示区域'
    
    return `创作一幅${styleTemplate.name}的高品质图像，主题围绕"${description}"展开，材质选用${styleTemplate.materials}，呈现${styleTemplate.colors}的和谐配色，质感细腻，工艺精良，场景设置在${styleTemplate.scene}中，环境光线使用${styleTemplate.lighting}，营造专业且温馨的氛围，构图考虑视觉平衡和用户视线引导，色彩饱和度控制在自然范围内，细节刻画精准，适合用于${contextDesc}的商业或展示用途，整体效果达到商业摄影水准`
}

// 从描述中提取产品类型
function extractProductType(description) {
    const productKeywords = {
        '椅子|座椅|沙发': '椅子',
        '桌子|餐桌|办公桌': '桌子',
        '床|床垫|卧具': '床',
        '柜子|衣柜|书柜': '柜子',
        '灯具|台灯|吊灯': '灯具',
        '装饰|摆件|艺术品': '装饰品',
        '植物|花卉|绿植': '植物',
        '科技|电子|设备': '科技产品',
        '服装|衣物|时装': '服装',
        '食品|美食|料理': '食品',
        '建筑|房屋|空间': '建筑空间',
        '汽车|车辆|交通': '车辆'
    }
    
    for (const [keywords, type] of Object.entries(productKeywords)) {
        const regex = new RegExp(keywords, 'i')
        if (regex.test(description)) {
            return type
        }
    }
    
    return '产品' // 默认类型
}

// 根据占位符尺寸确定API支持的图片尺寸
function determineImageSize(placeholderSize) {
    if (!placeholderSize) return "1024x1024"
    
    // 解析尺寸
    const sizeMatch = placeholderSize.match(/(\d+)\s*x\s*(\d+)/i)
    if (!sizeMatch) return "1024x1024"
    
    const width = parseInt(sizeMatch[1])
    const height = parseInt(sizeMatch[2])
    
    // 根据宽高比选择合适的API支持的尺寸
    const ratio = width / height
    
    if (ratio > 1.5) {
        // 宽屏
        return "1792x1024"
    } else if (ratio < 0.7) {
        // 竖屏
        return "1024x1792"
    } else {
        // 方形或接近方形
        return "1024x1024"
    }
}

// 智能替换图片占位符
function replaceImagePlaceholder(content, placeholder, image) {
    try {
        // 首先尝试替换结构化占位符
        if (placeholder.fullMatch && content.includes(placeholder.fullMatch)) {
            // 根据占位符类型选择合适的HTML标签
            let replacement
            
            switch (placeholder.type) {
                case 'hero':
                case 'decoration':
                case 'icon':
                    replacement = `<img src="${image.url}" alt="${placeholder.alt || placeholder.description}" style="width: 100%; height: auto;" />`
                    break
                case 'background':
                    replacement = `<div style="background-image: url('${image.url}'); background-size: cover; background-position: center;"></div>`
                    break
                default:
                    replacement = `<img src="${image.url}" alt="${placeholder.alt || placeholder.description}" />`
            }
            
            return content.replace(placeholder.fullMatch, replacement)
        }
        
        // 回退到简单模式的替换
        return content
            .replace(/src="[^"]*placeholder[^"]*"/g, `src="${image.url}"`)
            .replace(/background-image:\s*url\([^)]*placeholder[^)]*\)/g, `background-image: url(${image.url})`)
        
    } catch (error) {
        console.error('替换占位符失败:', error)
        return content
    }
}

module.exports = {
    generateWebpageImages,
    integrateImagesIntoCode,
    generateImagePrompt,
    generateWebpageImagesFromPlaceholders,
    integrateImagesIntoCodeWithPlaceholders,
    generateImagePromptFromPlaceholder
}
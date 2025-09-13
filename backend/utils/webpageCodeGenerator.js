// 网页代码生成器 - 处理Vue3项目代码生成
const { arkChatClient, CHAT_MODEL } = require('./aiClients')
const { generateDefaultVue3Project, createVue3ProjectFiles } = require('./projectTemplates')

// 网页代码生成的系统提示词
const WEBPAGE_CODE_SYSTEM_PROMPT = {
    role: "system",
    content: `你是一个专业的Vue3前端开发工程师。

任务：根据UI设计方案生成完整的Vue3项目代码

要求：
1. 严格按照UI设计方案实现页面
2. 使用Element Plus组件库
3. 代码要组件化、可维护
4. 包含路由配置和项目结构
5. 响应式设计，兼容移动端

请返回JSON格式的项目结构。`
}

// 生成网页代码
async function generateWebpageCode(description, components, style, uiDesign) {
    try {
        const userMessage = {
            role: "user",
            content: `请根据以下信息生成Vue3项目：

需求描述：${description}
UI设计方案：${JSON.stringify(uiDesign)}
组件需求：${components.join('、')}
样式风格：${style}

请生成完整的Vue3项目结构。`
        }

        console.log('正在生成网页代码...')

        const response = await arkChatClient.chat.completions.create({
            model: CHAT_MODEL,
            messages: [WEBPAGE_CODE_SYSTEM_PROMPT, userMessage],
            temperature: 0.5,
            max_tokens: 8000
        })

        const content = response?.choices?.[0]?.message?.content
        if (!content) {
            throw new Error('代码生成失败')
        }

        // 解析并生成Vue3项目
        return await generateVue3Project(content, description, style)

    } catch (error) {
        console.error('代码生成失败:', error)
        // 回退到默认模板
        const defaultProject = await generateDefaultVue3Project(description, style)
        return await createVue3ProjectFiles(defaultProject, description, style)
    }
}

// 生成完整的Vue3项目结构
async function generateVue3Project(aiResponse, description, style) {
    try {
        let projectData;

        // 尝试解析AI返回的JSON
        try {
            projectData = JSON.parse(aiResponse);
        } catch (parseError) {
            console.log('AI返回内容不是JSON格式，使用模板生成');
            projectData = await generateDefaultVue3Project(description, style);
        }

        // 生成完整的项目文件结构
        return await createVue3ProjectFiles(projectData, description, style);

    } catch (error) {
        console.error('生成Vue3项目失败:', error);
        // 回退到默认项目模板
        const defaultProject = await generateDefaultVue3Project(description, style);
        return await createVue3ProjectFiles(defaultProject, description, style);
    }
}

// 使用豆包 API 生成代码
async function realAIGeneration(description, components, style) {
    try {
        const systemMessage = {
            role: "system",
            content: `你是一个专业的Vue3前端开发工程师，擅长创建完整的Vue3项目结构。

要求：
1. 分析用户需求，设计合理的页面结构和组件划分
2. 生成完整的Vue3项目文件结构
3. 使用Element Plus UI库
4. 代码要组件化、模块化、可维护
5. 包含适当的路由配置
6. 样式要现代化、响应式
7. 包含必要的配置文件

请返回JSON格式的项目结构，包含以下字段：
{
  "projectName": "项目名称",
  "pages": [
    {
      "name": "页面名称",
      "path": "路由路径", 
      "component": "组件名称",
      "vue": "Vue组件代码"
    }
  ],
  "components": [
    {
      "name": "组件名称",
      "vue": "Vue组件代码"
    }
  ],
  "router": "路由配置代码",
  "main": "main.js代码",
  "app": "App.vue代码",
  "package": "package.json内容"
}`
        }

        const userMessage = {
            role: "user",
            content: `请根据以下要求生成Vue3项目结构：

描述：${description}
${components.length > 0 ? `需要包含的组件：${components.join('、')}` : ''}
样式风格：${style}

请生成一个完整的Vue3项目结构，包含合理的页面划分和组件设计。`
        }

        console.log('正在调用豆包 API...')

        const response = await arkChatClient.chat.completions.create({
            model: CHAT_MODEL,
            messages: [systemMessage, userMessage],
            temperature: 0.7,
            max_tokens: 8000
        })

        const content = response?.choices?.[0]?.message?.content
        if (typeof content !== 'string') {
            throw new Error('AI回复内容为空')
        }

        console.log('豆包 API 调用成功，内容长度:', content.length)

        // 解析AI返回的JSON结构并生成项目文件
        return await generateVue3Project(content, description, style)

    } catch (error) {
        console.error('豆包 API 调用失败:', error)
        throw new Error("豆包 API 调用失败: " + error.message)
    }
}

// 网页代码生成的系统提示词（带占位符版本）
const WEBPAGE_CODE_WITH_PLACEHOLDERS_SYSTEM_PROMPT = {
    role: "system",
    content: `你是一个专业的Vue3前端开发工程师。

任务：根据UI设计方案生成完整的Vue3项目代码，并在需要图片的地方使用智能占位符

要求：
1. 严格按照UI设计方案实现页面
2. 使用Element Plus组件库
3. 代码要组件化、可维护
4. 包含路由配置和项目结构
5. 响应式设计，兼容移动端
6. 在需要图片的地方使用结构化占位符，格式：
   <!-- IMAGE_PLACEHOLDER: {"id": "unique_id", "type": "hero|background|decoration|icon", "size": "width x height", "description": "详细图片描述", "alt": "替代文本", "context": "使用场景描述", "productType": "产品类型", "materials": "材质要求", "lighting": "光线要求", "scene": "场景设置", "quality": "画质要求"} -->
   
高级占位符示例：
- 商品主图：<!-- IMAGE_PLACEHOLDER: {"id": "hero_1", "type": "hero", "size": "1200x600", "description": "现代简约风格椅子商品展示", "alt": "现代简约椅子", "context": "页面顶部的hero区域", "productType": "椅子", "materials": "进口白橡木+高密度棉麻面料+哑光金属", "lighting": "柔和自然光从右侧窗户射入", "scene": "明亮的北欧风客厅角落，浅米色墙面，原木地板", "quality": "8K高清，4:3比例，突出材质质感"} -->
- 背景图：<!-- IMAGE_PLACEHOLDER: {"id": "bg_1", "type": "background", "size": "1920x1080", "description": "简约现代风格背景", "alt": "", "context": "整个页面的背景", "productType": "背景纹理", "materials": "纹理清晰，材质感强", "lighting": "均匀柔和光线", "scene": "简洁大气的现代空间", "quality": "4K分辨率，色彩自然"} -->

请返回JSON格式的项目结构。`
}

// 生成带智能占位符的网页代码
async function generateWebpageCodeWithPlaceholders(description, components, style, uiDesign) {
    try {
        const userMessage = {
            role: "user",
            content: `请根据以下信息生成带智能占位符的Vue3项目：

需求描述：${description}
UI设计方案：${JSON.stringify(uiDesign, null, 2)}
组件需求：${components.join('、')}
样式风格：${style}

特别注意：
1. 严格按照UI设计方案中的imageRequirements来规划图片位置
2. 为每个图片位置创建对应的智能占位符，占位符信息要与UI设计中的图片需求一致
3. 占位符要包含详细的描述信息，方便后续生成精准的图片
4. 确保占位符的type、size、description都与UI设计中的图片需求匹配

请生成完整的Vue3项目结构。`
        }

        console.log('正在生成带占位符的网页代码...')

        const response = await arkChatClient.chat.completions.create({
            model: CHAT_MODEL,
            messages: [WEBPAGE_CODE_WITH_PLACEHOLDERS_SYSTEM_PROMPT, userMessage],
            temperature: 0.5,
            max_tokens: 8000
        })

        const content = response?.choices?.[0]?.message?.content
        if (!content) {
            throw new Error('代码生成失败')
        }

        // 解析并生成Vue3项目
        const codeStructure = await generateVue3Project(content, description, style)
        
        // 提取占位符信息
        const imagePlaceholders = extractImagePlaceholders(codeStructure)
        
        return {
            codeWithPlaceholders: codeStructure,
            imagePlaceholders: imagePlaceholders
        }

    } catch (error) {
        console.error('带占位符的代码生成失败:', error)
        // 回退到默认方式
        const defaultCode = await generateWebpageCode(description, components, style, uiDesign)
        const fallbackPlaceholders = generateFallbackPlaceholders(description, style)
        
        return {
            codeWithPlaceholders: defaultCode,
            imagePlaceholders: fallbackPlaceholders
        }
    }
}

// 从代码中提取占位符信息
function extractImagePlaceholders(codeStructure) {
    const placeholders = []
    
    try {
        let projectStructure
        if (typeof codeStructure === 'string') {
            projectStructure = JSON.parse(codeStructure)
        } else {
            projectStructure = codeStructure
        }

        // 遍历所有文件，查找占位符
        Object.entries(projectStructure).forEach(([filePath, content]) => {
            if (typeof content === 'string') {
                // 使用正则表达式查找占位符
                const placeholderRegex = /<!--\s*IMAGE_PLACEHOLDER:\s*(\{[^}]+\})\s*-->/g
                let match
                
                while ((match = placeholderRegex.exec(content)) !== null) {
                    try {
                        const placeholderData = JSON.parse(match[1])
                        placeholders.push({
                            ...placeholderData,
                            filePath: filePath,
                            fullMatch: match[0]
                        })
                    } catch (e) {
                        console.warn('解析占位符失败:', match[1])
                    }
                }
            }
        })

        console.log(`提取到 ${placeholders.length} 个图片占位符`)
        return placeholders
        
    } catch (error) {
        console.error('提取占位符失败:', error)
        return generateFallbackPlaceholders()
    }
}

// 生成回退占位符（增强版）
function generateFallbackPlaceholders(description = '', style = 'modern') {
    const productType = extractProductTypeFromDescription(description)
    const styleTemplates = getStyleTemplate(style)
    
    return [
        {
            id: 'hero_1',
            type: 'hero',
            size: '1200x600',
            description: `${style}风格的${productType}商品展示图`,
            alt: `${productType}主要展示图`,
            context: '页面顶部的hero区域',
            productType: productType,
            materials: styleTemplates.materials,
            lighting: styleTemplates.lighting,
            scene: styleTemplates.scene,
            quality: '8K高清，16:9比例，突出材质质感',
            filePath: 'src/views/HomePage.vue',
            fullMatch: '<!-- HERO_PLACEHOLDER -->'
        },
        {
            id: 'bg_1',
            type: 'background',
            size: '1920x1080',
            description: `${style}风格的背景图，简洁大气`,
            alt: '',
            context: '页面背景',
            productType: '背景纹理',
            materials: '纹理清晰，质感丰富',
            lighting: '均匀柔和光线',
            scene: styleTemplates.scene,
            quality: '4K分辨率，色彩自然',
            filePath: 'src/App.vue',
            fullMatch: '<!-- BACKGROUND_PLACEHOLDER -->'
        },
        {
            id: 'feature_1',
            type: 'decoration',
            size: '400x300',
            description: `${style}风格的装饰图`,
            alt: '特色展示',
            context: '功能特色区域',
            productType: '装饰元素',
            materials: styleTemplates.materials,
            lighting: styleTemplates.lighting,
            scene: '局部装饰空间',
            quality: '高清分辨率，细节丰富',
            filePath: 'src/components/ContentPanel.vue',
            fullMatch: '<!-- FEATURE_PLACEHOLDER -->'
        }
    ]
}

// 从描述中提取产品类型
function extractProductTypeFromDescription(description) {
    const productKeywords = {
        '椅子|座椅|沙发|凳子': '椅子',
        '桌子|餐桌|办公桌|茶几': '桌子',
        '床|床垫|卧具': '床',
        '柜子|衣柜|书柜|储物柜': '柜子',
        '灯具|台灯|吊灯|照明': '灯具',
        '装饰|摆件|艺术品': '装饰品',
        '植物|花卉|绿植': '植物',
        '科技|电子|设备|数码': '科技产品',
        '服装|衣物|时装|穿搭': '服装',
        '食品|美食|料理|餐饮': '食品',
        '建筑|房屋|空间|室内': '建筑空间',
        '汽车|车辆|交通工具': '车辆',
        '公司|企业|商务|办公': '商务场景',
        '教育|学习|培训': '教育产品',
        '医疗|健康|护理': '医疗产品',
        '娱乐|游戏|休闲': '娱乐产品'
    }
    
    for (const [keywords, type] of Object.entries(productKeywords)) {
        const regex = new RegExp(keywords, 'i')
        if (regex.test(description)) {
            return type
        }
    }
    
    return '产品' // 默认类型
}

// 获取风格模板
function getStyleTemplate(style) {
    const templates = {
        modern: {
            materials: '进口白橡木、高密度棉麻面料、哑光金属',
            lighting: '柔和自然光从侧面射入',
            scene: '明亮的现代居室环境'
        },
        business: {
            materials: '进口黑胡桃木、真皮、不锈钢',
            lighting: '专业影棚光线',
            scene: '简洁的商务办公环境'
        },
        cute: {
            materials: '松木、纯棉面料、环保漆',
            lighting: '温暖柔和的室内光线',
            scene: '温馨的居家空间'
        },
        tech: {
            materials: '碳纤维、航空铝合金、高科技面料',
            lighting: '冷色调LED光线',
            scene: '现代科技感展厅'
        }
    }
    
    return templates[style] || templates.modern
}

module.exports = {
    generateWebpageCode,
    generateWebpageCodeWithPlaceholders,
    generateVue3Project,
    realAIGeneration,
    extractImagePlaceholders
}
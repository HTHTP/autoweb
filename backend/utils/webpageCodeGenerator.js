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

module.exports = {
    generateWebpageCode,
    generateVue3Project,
    realAIGeneration
}
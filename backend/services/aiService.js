const OpenAI = require('openai');
const { jsonrepair } = require('jsonrepair');

class DouBaoAIService {
    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.ARK_API_KEY,
            baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
            timeout: 1800000, // 30分钟超时，适合深度思考模型
        });
        
        // 深度思考模型ID（需要根据实际情况调整）
        this.thinkingModel = 'doubao-seed-1-6-250615';
        
        // 检查API密钥是否存在
        if (!process.env.ARK_API_KEY) {
            console.error('❌ 错误: 未设置 ARK_API_KEY 环境变量');
            throw new Error('Missing ARK_API_KEY environment variable');
        }
    }

    /**
     * 使用深度思考模型生成Vue项目结构
     * @param {string} description - 用户的项目描述
     * @param {boolean} enableThinking - 是否启用深度思考
     * @param {boolean} useStructuredOutput - 是否使用结构化输出
     * @returns {Promise<Object>} 生成的项目结构
     */
    async generateVueProject(description, enableThinking = true, useStructuredOutput = true) {
        try {
            console.log(`🤖 开始生成Vue项目，描述: ${description}`);
            console.log(`🧠 深度思考模式: ${enableThinking ? '启用' : '禁用'}`);
            console.log(`📋 结构化输出: ${useStructuredOutput ? '启用' : '禁用'}`);

            const messages = [
                {
                    role: 'system',
                    content: `你是一个专业的Vue3前端开发专家。你需要根据用户的描述生成完整的Vue3项目结构。

项目要求：
1. 使用Vue3 Composition API
2. 使用TypeScript
3. 必须使用Element Plus组件库
4. 包含合理的组件结构
5. 包含路由配置
6. 包含基础样式
7. 生成现代化、响应式的界面

请生成包含以下部分的完整项目：
- 主要组件文件
- 路由配置
- 样式文件
- 必要的工具函数
- 类型定义
- Element Plus的正确使用和引入`
                },
                {
                    role: 'user',
                    content: `请为以下项目需求生成Vue3项目结构：${description}

要求生成一个完整的、可运行的Vue3项目，包含所有必要的文件和代码。
项目应该具有良好的用户体验和现代化的设计。
必须使用Element Plus作为UI组件库，包含正确的依赖配置和组件引入。`
                }
            ];

            let requestOptions = {
                model: this.thinkingModel,
                messages: messages,
                temperature: 0.7,
                max_tokens: 4000,
            };

            // 配置深度思考
            if (enableThinking) {
                requestOptions.extra_body = {
                    thinking: {
                        type: "enabled"
                    }
                };
            }

            // 配置结构化输出
            if (useStructuredOutput) {
                requestOptions.response_format = {
                    type: "json_schema",
                    json_schema: {
                        name: "vue_project_structure",
                        strict: true,
                        schema: {
                            type: "object",
                            properties: {
                                projectName: {
                                    type: "string",
                                    description: "项目名称"
                                },
                                description: {
                                    type: "string",
                                    description: "项目描述"
                                },
                                files: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            path: {
                                                type: "string",
                                                description: "文件路径"
                                            },
                                            content: {
                                                type: "string",
                                                description: "文件内容"
                                            },
                                            type: {
                                                type: "string",
                                                enum: ["component", "page", "router", "style", "config", "utils", "types"],
                                                description: "文件类型"
                                            }
                                        },
                                        required: ["path", "content", "type"],
                                        additionalProperties: false
                                    }
                                },
                                dependencies: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    },
                                    description: "项目依赖包"
                                },
                                features: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    },
                                    description: "项目特性"
                                }
                            },
                            required: ["projectName", "description", "files", "dependencies", "features"],
                            additionalProperties: false
                        }
                    }
                };
            }

            const response = await this.client.chat.completions.create(requestOptions);

            // 处理深度思考内容
            if (enableThinking && response.choices[0].message.reasoning_content) {
                console.log('🧠 深度思考过程:');
                console.log(response.choices[0].message.reasoning_content);
            }

            let result;
            if (useStructuredOutput) {
                try {
                    // 尝试直接解析JSON
                    result = JSON.parse(response.choices[0].message.content);
                } catch (parseError) {
                    console.warn('⚠️ JSON解析失败，尝试修复内容:', parseError.message);
                    
                    // 尝试修复常见的JSON问题
                    let content = response.choices[0].message.content;
                    
                    // 移除可能的markdown代码块标记
                    content = content.replace(/```json\s*|\s*```/g, '');
                    
                    try {
                        // 使用jsonrepair库尝试修复JSON
                        const repairedJson = jsonrepair(content);
                        result = JSON.parse(repairedJson);
                        console.log('✅ JSON自动修复成功');
                    } catch (repairError) {
                        console.warn('⚠️ JSON自动修复失败，尝试手动修复');
                        
                        // 手动修复JSON
                        content = this.fixJsonContent(content);
                        
                        try {
                            result = JSON.parse(content);
                            console.log('✅ JSON手动修复成功');
                        } catch (finalError) {
                            console.error('❌ JSON修复完全失败，创建默认结构');
                            
                            // 如果还是失败，返回一个包含原始内容的结构
                            result = {
                                projectName: "AI生成的Vue项目",
                                description: "由于JSON解析错误，请查看错误文件了解详情",
                                files: [
                                    {
                                        path: "generation-error.txt",
                                        content: `原始AI输出内容:\n\n${response.choices[0].message.content}\n\n解析错误: ${parseError.message}`,
                                        type: "error"
                                    },
                                    {
                                        path: "src/App.vue",
                                        content: `<template>
  <div id="app">
    <h1>项目生成遇到问题</h1>
    <p>请查看 generation-error.txt 文件了解详情</p>
  </div>
</template>

<script setup lang="ts">
// 项目生成时遇到JSON解析错误
// 请检查AI输出内容并手动修复
</script>

<style scoped>
#app {
  text-align: center;
  padding: 50px;
}
</style>`,
                                        type: "component"
                                    }
                                ],
                                dependencies: ["vue", "vue-router", "typescript"],
                                features: ["Vue 3", "TypeScript", "错误恢复模式"]
                            };
                        }
                    }
                }
            } else {
                result = {
                    content: response.choices[0].message.content,
                    reasoning: response.choices[0].message.reasoning_content || null
                };
            }

            console.log('✅ Vue项目生成完成');
            return result;

        } catch (error) {
            console.error('❌ 生成Vue项目时出错:', error);
            throw new Error(`AI服务错误: ${error.message}`);
        }
    }

    /**
     * 流式生成Vue项目（用于实时反馈）
     * @param {string} description - 项目描述
     * @param {Function} onChunk - 处理流式数据的回调函数
     * @returns {Promise<string>} 完整的响应内容
     */
    async generateVueProjectStream(description, onChunk) {
        try {
            const messages = [
                {
                    role: 'system',
                    content: '你是一个专业的Vue3前端开发专家。请根据用户描述生成完整的Vue3项目结构。'
                },
                {
                    role: 'user',
                    content: `请为以下需求生成Vue3项目：${description}`
                }
            ];

            const response = await this.client.chat.completions.create({
                model: this.thinkingModel,
                messages: messages,
                stream: true,
                temperature: 0.7,
                max_tokens: 4000,
            });

            let reasoningContent = "";
            let content = "";

            for await (const chunk of response) {
                if (chunk.choices[0].delta.reasoning_content) {
                    reasoningContent += chunk.choices[0].delta.reasoning_content;
                    onChunk('reasoning', chunk.choices[0].delta.reasoning_content);
                } else if (chunk.choices[0].delta.content) {
                    content += chunk.choices[0].delta.content;
                    onChunk('content', chunk.choices[0].delta.content);
                }
            }

            return { content, reasoning: reasoningContent };
        } catch (error) {
            console.error('❌ 流式生成出错:', error);
            throw error;
        }
    }

    /**
     * 测试API连接
     * @returns {Promise<boolean>} 连接是否成功
     */
    async testConnection() {
        try {
            const response = await this.client.chat.completions.create({
                model: this.thinkingModel,
                messages: [{ role: 'user', content: '你好，这是一个API连接测试。' }],
                max_tokens: 50,
            });
            
            console.log('✅ 豆包API连接测试成功');
            return true;
        } catch (error) {
            console.error('❌ 豆包API连接测试失败:', error);
            return false;
        }
    }

    /**
     * 修复JSON内容中的常见问题
     * @param {string} content - 原始JSON内容
     * @returns {string} 修复后的JSON内容
     */
    fixJsonContent(content) {
        try {
            // 移除开头和结尾的空白字符
            content = content.trim();
            
            // 移除可能的markdown标记
            content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            
            // 尝试找到JSON对象的开始和结束
            const startIndex = content.indexOf('{');
            const lastIndex = content.lastIndexOf('}');
            
            if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
                content = content.substring(startIndex, lastIndex + 1);
            }
            
            // 修复文件内容中的引号问题
            content = content.replace(/\\n/g, '\\\\n');
            content = content.replace(/\\t/g, '\\\\t');
            content = content.replace(/\\r/g, '\\\\r');
            
            // 修复可能的控制字符
            content = content.replace(/[\x00-\x1F\x7F]/g, '');
            
            return content;
        } catch (error) {
            console.warn('JSON修复过程中出错:', error.message);
            return content;
        }
    }
}

module.exports = DouBaoAIService;
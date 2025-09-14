const axios = require('axios');
const { VUE3_GENERATION_PROMPT, VUE3_MODIFICATION_PROMPT } = require('../prompts/vue3-prompts');

/**
 * 豆包AI服务配置和调用
 */
class ArkAIService {
    constructor() {
        this.apiKey = process.env.ARK_API_KEY;
        this.baseURL = 'https://ark.cn-beijing.volces.com/api/v3';
        this.model = process.env.ARK_MODEL_ID || 'ep-20250728192938-68tdn'; // 从环境变量读取，有默认值
        
        if (!this.apiKey) {
            throw new Error('ARK_API_KEY is required in environment variables');
        }
    }

    /**
     * 调用豆包AI生成Vue3代码
     */
    async generateVue3Code(userDescription, components = ['Element Plus'], style = 'modern') {
        try {
            console.log('开始调用豆包AI生成Vue3代码...');
            console.log('用户描述:', userDescription);

            const prompt = VUE3_GENERATION_PROMPT.replace('{userDescription}', userDescription);

            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个专业的Vue3前端开发专家，擅长创建现代化、高质量的Vue3应用。请严格按照要求生成代码，确保代码可以正常运行。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 8000,
                    temperature: 0.7,
                    stream: false
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 600000 // 10分钟超时
                }
            );

            if (response.data && response.data.choices && response.data.choices.length > 0) {
                const generatedContent = response.data.choices[0].message.content;
                console.log('豆包AI响应成功');
                
                // 提取JSON代码
                const extractedCode = this.extractJsonFromResponse(generatedContent);
                
                // 💾 保存AI原始响应用于调试
                try {
                    const fs = require('fs');
                    const path = require('path');
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const debugFileName = `ai-raw-response-${timestamp}.json`;
                    const debugDir = path.join(__dirname, '../debug');
                    const debugFilePath = path.join(debugDir, debugFileName);
                    
                    // 确保debug目录存在
                    if (!fs.existsSync(debugDir)) {
                        fs.mkdirSync(debugDir, { recursive: true });
                    }
                    
                    // 保存原始响应和元数据
                    const debugData = {
                        timestamp: new Date().toISOString(),
                        aiModel: this.model,
                        rawResponse: generatedContent,
                        extractedCode: extractedCode,
                        responseLength: generatedContent.length,
                        extractedLength: extractedCode.length,
                        firstChars: extractedCode.substring(0, 500),
                        lastChars: extractedCode.substring(Math.max(0, extractedCode.length - 500)),
                        // 用于后续测试的标记
                        canBeUsedForTesting: true
                    };
                    
                    fs.writeFileSync(debugFilePath, JSON.stringify(debugData, null, 2));
                    console.log(`💾 AI原始响应已保存: ${debugFileName}`);
                    console.log(`📁 调试文件路径: ${debugFilePath}`);
                    console.log(`📊 原始响应长度: ${generatedContent.length}, 提取代码长度: ${extractedCode.length}`);
                } catch (saveError) {
                    console.error('❌ 保存调试文件失败:', saveError.message);
                }
                
                return {
                    success: true,
                    code: extractedCode,
                    rawResponse: generatedContent
                };
            } else {
                throw new Error('AI响应格式异常');
            }
        } catch (error) {
            console.error('豆包AI调用失败:', error.message);
            
            if (error.response) {
                console.error('API错误详情:', error.response.data);
                return {
                    success: false,
                    error: `API调用失败: ${error.response.data.error?.message || error.response.statusText}`,
                    code: null
                };
            }
            
            return {
                success: false,
                error: error.message || '未知错误',
                code: null
            };
        }
    }

    /**
     * 修改现有Vue3代码
     */
    async modifyVue3Code(currentCode, modificationRequest) {
        try {
            console.log('开始调用豆包AI修改Vue3代码...');
            console.log('修改要求:', modificationRequest);

            const prompt = VUE3_MODIFICATION_PROMPT
                .replace('{currentCode}', currentCode)
                .replace('{modificationRequest}', modificationRequest);

            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个专业的Vue3前端开发专家，擅长根据用户需求精确修改Vue3代码。请保持代码质量和最佳实践。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 8000,
                    temperature: 0.5,
                    stream: false
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 600000 // 10分钟超时
                }
            );

            if (response.data && response.data.choices && response.data.choices.length > 0) {
                const modifiedContent = response.data.choices[0].message.content;
                console.log('代码修改成功');
                
                const extractedCode = this.extractJsonFromResponse(modifiedContent);
                return {
                    success: true,
                    code: extractedCode,
                    rawResponse: modifiedContent
                };
            } else {
                throw new Error('AI响应格式异常');
            }
        } catch (error) {
            console.error('代码修改失败:', error.message);
            
            if (error.response) {
                console.error('API错误详情:', error.response.data);
                return {
                    success: false,
                    error: `API调用失败: ${error.response.data.error?.message || error.response.statusText}`,
                    code: null
                };
            }
            
            return {
                success: false,
                error: error.message || '未知错误',
                code: null
            };
        }
    }

    /**
     * 从AI响应中提取JSON代码
     */
    extractJsonFromResponse(responseContent) {
        try {
            // 尝试直接解析JSON
            if (responseContent.trim().startsWith('{')) {
                return responseContent.trim();
            }

            // 查找JSON代码块
            const jsonMatches = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatches && jsonMatches[1]) {
                return jsonMatches[1].trim();
            }

            // 查找普通代码块
            const codeMatches = responseContent.match(/```\s*([\s\S]*?)\s*```/);
            if (codeMatches && codeMatches[1]) {
                const code = codeMatches[1].trim();
                if (code.startsWith('{')) {
                    return code;
                }
            }

            // 查找花括号包围的内容
            const braceMatches = responseContent.match(/\{[\s\S]*\}/);
            if (braceMatches) {
                return braceMatches[0];
            }

            // 如果都找不到，返回原始内容
            console.warn('无法提取JSON代码，返回原始响应');
            return responseContent;
        } catch (error) {
            console.error('提取JSON代码失败:', error.message);
            return responseContent;
        }
    }

    /**
     * 清理和修复AI返回的JSON格式
     */
    cleanJsonString(jsonString) {
        try {
            console.log('===== JSON清理过程开始 =====');
            console.log('原始JSON长度:', jsonString.length);
            console.log('原始JSON前200字符:', jsonString.substring(0, 200));
            
            // 移除可能的markdown代码块标记
            let cleaned = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            
            // 尝试找到JSON对象的开始和结束
            const firstBrace = cleaned.indexOf('{');
            const lastBrace = cleaned.lastIndexOf('}');
            
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                cleaned = cleaned.substring(firstBrace, lastBrace + 1);
            }
            
            console.log('🔧 专门处理文件内容嵌套JSON问题...');
            
            console.log('🔧 使用智能正则方法处理嵌套JSON...');
            
            try {
                // 更智能的方法：逐个处理文件条目
                let processedEntries = [];
                
                // 使用正则匹配 "文件路径": "文件内容" 的模式
                // 这个正则能够正确处理包含换行的文件内容
                const filePattern = /"([^"]+\.(json|js|vue|html|css|ts|jsx|tsx))"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
                
                let match;
                let matchCount = 0;
                while ((match = filePattern.exec(cleaned)) !== null && matchCount < 50) { // 防止无限循环
                    const [fullMatch, filePath, extension, content] = match;
                    matchCount++;
                    
                    console.log(`📄 处理文件 ${matchCount}: ${filePath}`);
                    
                    // 清理文件内容：先还原，再正确转义
                    let cleanContent = content
                        // 还原可能存在的转义
                        .replace(/\\"/g, '"')
                        .replace(/\\n/g, '\n')
                        .replace(/\\r/g, '\r')
                        .replace(/\\t/g, '\t')
                        .replace(/\\\\/g, '\\');
                    
                    // 重新转义
                    let escapedContent = cleanContent
                        .replace(/\\/g, '\\\\')   // 转义反斜杠
                        .replace(/"/g, '\\"')     // 转义双引号
                        .replace(/\n/g, '\\n')    // 转义换行
                        .replace(/\r/g, '\\r')    // 转义回车
                        .replace(/\t/g, '\\t');   // 转义制表符
                    
                    processedEntries.push(`"${filePath}": "${escapedContent}"`);
                }
                
                if (processedEntries.length > 0) {
                    // 重新构建JSON
                    const rebuiltJson = `{\n  ${processedEntries.join(',\n  ')}\n}`;
                    console.log(`✅ 智能处理成功，处理了 ${processedEntries.length} 个文件`);
                    console.log(`📊 重建JSON长度: ${rebuiltJson.length}`);
                    cleaned = rebuiltJson;
                } else {
                    console.log('❌ 没有找到有效的文件条目，使用简单清理');
                    // 回退到简单清理
                    cleaned = cleaned
                        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 移除控制字符
                        .replace(/([^\\])"/g, '$1\\"')  // 转义未转义的引号
                        .replace(/\n/g, '\\n')   // 转义换行
                        .replace(/\r/g, '\\r')   // 转义回车
                        .replace(/\t/g, '\\t');  // 转义制表符
                }
                
            } catch (smartError) {
                console.log('❌ 智能处理失败:', smartError.message);
                console.log('回退到基础清理方法...');
                
                // 最后的回退方法
                cleaned = cleaned
                    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 移除控制字符
                    .replace(/\n/g, '\\n')   // 转义换行
                    .replace(/\r/g, '\\r')   // 转义回车
                    .replace(/\t/g, '\\t');  // 转义制表符
            }
            
            console.log('清理后JSON前200字符:', cleaned.substring(0, 200));
            console.log('===== JSON清理过程完成 =====');
            
            return cleaned;
        } catch (error) {
            console.error('❌ JSON清理失败:', error.message);
            return jsonString;
        }
    }

    /**
     * 验证生成的代码是否为有效JSON
     */
    validateGeneratedCode(code) {
        console.log('===== JSON验证过程开始 =====');
        console.log('待验证代码长度:', code.length);
        
        try {
            // 先尝试直接解析原始代码
            console.log('🔍 尝试解析原始JSON...');
            const originalParsed = JSON.parse(code);
            console.log('✅ 原始JSON解析成功！');
            
            // 检查是否包含必要的文件
            const requiredFiles = ['package.json', 'index.html', 'src/main.js', 'src/App.vue'];
            const fileNames = Object.keys(originalParsed);
            console.log('解析结果包含的文件数量:', fileNames.length);
            console.log('文件列表:', fileNames.slice(0, 10)); // 显示前10个文件
            
            for (const required of requiredFiles) {
                const hasFile = fileNames.some(fileName => fileName.includes(required));
                if (!hasFile) {
                    console.log(`❌ 缺少必要文件: ${required}`);
                    return {
                        valid: false,
                        error: `缺少必要文件: ${required}`,
                        cleanedCode: code
                    };
                }
            }

            console.log('✅ 所有必要文件都存在');
            console.log('===== JSON验证过程结束 - 成功 =====');
            return {
                valid: true,
                parsedCode: originalParsed,
                cleanedCode: code
            };
        } catch (originalError) {
            console.log('❌ 原始JSON解析失败:', originalError.message);
            console.log('错误位置:', originalError.message.match(/position (\d+)/)?.[1] || '未知');
            
            // 显示错误位置附近的内容
            const errorPos = parseInt(originalError.message.match(/position (\d+)/)?.[1]) || 0;
            if (errorPos > 0) {
                const start = Math.max(0, errorPos - 50);
                const end = Math.min(code.length, errorPos + 50);
                console.log('错误位置附近内容:');
                console.log('...', code.substring(start, end), '...');
                console.log('    ', ' '.repeat(50), '^'); // 指向错误位置
            }
            
            console.log('🔧 尝试清理后再解析...');
            try {
                const cleanedCode = this.cleanJsonString(code);
                console.log('清理前后长度对比:', code.length, '->', cleanedCode.length);
                
                const cleanedParsed = JSON.parse(cleanedCode);
                console.log('✅ 清理后JSON解析成功！');
                
                // 检查清理后的代码是否包含必要文件
                const requiredFiles = ['package.json', 'index.html', 'src/main.js', 'src/App.vue'];
                const fileNames = Object.keys(cleanedParsed);
                console.log('清理后文件数量:', fileNames.length);
                console.log('清理后文件列表:', fileNames.slice(0, 10));
                
                for (const required of requiredFiles) {
                    const hasFile = fileNames.some(fileName => fileName.includes(required));
                    if (!hasFile) {
                        console.log(`❌ 清理后仍缺少必要文件: ${required}`);
                        return {
                            valid: false,
                            error: `缺少必要文件: ${required}`,
                            cleanedCode: cleanedCode
                        };
                    }
                }

                console.log('✅ 清理后所有必要文件都存在');
                console.log('===== JSON验证过程结束 - 清理后成功 =====');
                return {
                    valid: true,
                    parsedCode: cleanedParsed,
                    cleanedCode: cleanedCode
                };
            } catch (cleanedError) {
                console.log('❌ 清理后JSON解析仍然失败:', cleanedError.message);
                console.log('清理后错误位置:', cleanedError.message.match(/position (\d+)/)?.[1] || '未知');
                
                // 显示清理后错误位置附近的内容
                const cleanedCode = this.cleanJsonString(code);
                const cleanedErrorPos = parseInt(cleanedError.message.match(/position (\d+)/)?.[1]) || 0;
                if (cleanedErrorPos > 0 && cleanedCode) {
                    const start = Math.max(0, cleanedErrorPos - 50);
                    const end = Math.min(cleanedCode.length, cleanedErrorPos + 50);
                    console.log('清理后错误位置附近内容:');
                    console.log('...', cleanedCode.substring(start, end), '...');
                    console.log('    ', ' '.repeat(50), '^');
                }
                
                console.log('💡 JSON验证失败，将使用默认模板');
                console.log('===== JSON验证过程结束 - 失败 =====');
                return {
                    valid: false,
                    error: `代码格式无效: ${cleanedError.message}`
                };
            }
        }
    }

    /**
     * 生成默认的Vue3项目代码（备用方案）
     */
    generateDefaultVue3Project(description) {
        const projectName = 'vue-project';
        
        return {
            [`${projectName}/package.json`]: JSON.stringify({
                "name": "vue-ai-generated-project",
                "version": "1.0.0",
                "type": "module",
                "scripts": {
                    "dev": "vite",
                    "build": "vite build",
                    "preview": "vite preview"
                },
                "dependencies": {
                    "vue": "^3.5.17",
                    "element-plus": "^2.10.4"
                },
                "devDependencies": {
                    "@vitejs/plugin-vue": "^5.1.4",
                    "vite": "^6.0.1"
                }
            }, null, 2),
            
            [`${projectName}/index.html`]: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Generated Vue App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`,

            [`${projectName}/vite.config.js`]: `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()]
})`,

            [`${projectName}/src/main.js`]: `import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')`,

            [`${projectName}/src/App.vue`]: `<template>
  <div class="app-container">
    <el-card class="main-card">
      <h1>🎉 AI生成的Vue3应用</h1>
      <p>用户需求：${description}</p>
      <el-divider />
      <div class="feature-section">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input v-model="inputText" placeholder="请输入内容" />
          </el-col>
          <el-col :span="12">
            <el-button type="primary" @click="handleClick">确认</el-button>
          </el-col>
        </el-row>
      </div>
      <div v-if="message" class="message-area">
        <el-alert :title="message" type="success" show-icon />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const inputText = ref('')
const message = ref('')

const handleClick = () => {
  if (inputText.value.trim()) {
    message.value = \`您输入了：\${inputText.value}\`
    ElMessage.success('操作成功')
  } else {
    ElMessage.warning('请输入内容')
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.main-card {
  max-width: 800px;
  width: 100%;
}

.feature-section {
  margin: 20px 0;
}

.message-area {
  margin-top: 20px;
}

h1 {
  color: #409eff;
  text-align: center;
  margin-bottom: 20px;
}

p {
  text-align: center;
  color: #606266;
  font-size: 16px;
}
</style>`
        };
    }
}

module.exports = ArkAIService;
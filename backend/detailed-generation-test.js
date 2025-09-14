const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 配置
const API_BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, 'detailed-generation-log');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 详细的文件生成过程记录
 */
async function detailedGenerationTest() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const mainLogFile = path.join(OUTPUT_DIR, `generation-process-${timestamp}.txt`);
    const thinkingFile = path.join(OUTPUT_DIR, `ai-thinking-${timestamp}.txt`);
    const filesProgressFile = path.join(OUTPUT_DIR, `files-creation-${timestamp}.txt`);
    
    let mainLog = '';
    let thinkingLog = '';
    let filesLog = '';
    let currentStep = 0;
    
    function writeMainLog(message) {
        const timeStamp = new Date().toLocaleTimeString('zh-CN');
        const logLine = `[${timeStamp}] ${message}`;
        console.log(logLine);
        mainLog += logLine + '\n';
        
        // 实时写入主日志文件
        fs.appendFileSync(mainLogFile, logLine + '\n', 'utf8');
    }
    
    function writeThinkingLog(content) {
        thinkingLog += content;
        // 实时写入思考日志
        fs.appendFileSync(thinkingFile, content, 'utf8');
    }
    
    function writeFilesLog(content) {
        filesLog += content;
        // 实时写入文件生成日志
        fs.appendFileSync(filesProgressFile, content, 'utf8');
    }
    
    try {
        // 初始化日志文件
        const header = `AutoWeb 详细生成过程记录
时间: ${new Date().toLocaleString('zh-CN')}
${'='.repeat(80)}

`;
        fs.writeFileSync(mainLogFile, header, 'utf8');
        fs.writeFileSync(thinkingFile, `AI深度思考过程记录\n时间: ${new Date().toLocaleString('zh-CN')}\n${'='.repeat(50)}\n\n`, 'utf8');
        fs.writeFileSync(filesProgressFile, `文件创建过程记录\n时间: ${new Date().toLocaleString('zh-CN')}\n${'='.repeat(50)}\n\n`, 'utf8');
        
        writeMainLog('🚀 开始详细生成测试');
        writeMainLog('📁 日志文件已创建:');
        writeMainLog(`   - 主日志: ${mainLogFile}`);
        writeMainLog(`   - AI思考: ${thinkingFile}`);
        writeMainLog(`   - 文件生成: ${filesProgressFile}`);
        writeMainLog('');
        
        // 复杂的项目描述
        const testDescription = `请创建一个完整的智能手表电商网站，具体要求：

【页面结构】
1. 首页 - 包含轮播图、热门产品、品牌介绍
2. 产品详情页 - 产品图片、规格选择、购买组件
3. 购物车页面 - 商品列表、数量调整、结算功能
4. 用户中心 - 个人信息、订单历史

【技术要求】
- 使用 Vue 3 + TypeScript + Vite
- 使用 Vue Router 进行路由管理
- 使用 Pinia 进行状态管理
- 响应式设计，支持移动端和桌面端
- 使用 Element Plus 组件库
- 包含完整的类型定义

【设计要求】
- 现代化深色主题
- 流畅的动画效果
- 良好的用户体验
- 清晰的视觉层次

【具体组件】
1. 公共组件：Header、Footer、ProductCard、Loading
2. 页面组件：HomePage、ProductDetail、ShoppingCart、UserCenter
3. 功能组件：ImageGallery、SpecSelector、CartSidebar、OrderList

请按照以上要求创建完整的项目结构，包含所有必要的文件和代码。`;

        writeMainLog('📝 项目描述已设定 (详见下方)');
        writeMainLog('─'.repeat(60));
        writeMainLog(testDescription);
        writeMainLog('─'.repeat(60));
        writeMainLog('');
        
        // 先尝试标准生成来获取结构化数据
        writeMainLog('🔄 步骤1: 使用标准API获取项目结构');
        const startTime = Date.now();
        
        try {
            const structuredResponse = await axios.post(`${API_BASE_URL}/api/generate`, {
                description: testDescription,
                options: {
                    enableThinking: true,
                    useStructuredOutput: true,
                    includeValidation: true
                }
            });
            
            const structuredTime = Date.now() - startTime;
            writeMainLog(`✅ 结构化生成完成 (耗时: ${structuredTime}ms)`);
            
            if (structuredResponse.data.success) {
                const { data, metadata } = structuredResponse.data;
                
                writeMainLog(`📦 项目信息: ${data.projectName}`);
                writeMainLog(`📝 描述: ${data.description}`);
                writeMainLog(`📁 文件数量: ${data.files ? data.files.length : 0}`);
                writeMainLog(`📦 依赖数量: ${data.dependencies ? data.dependencies.length : 0}`);
                writeMainLog('');
                
                // 记录AI思考过程（如果有的话）
                if (metadata && metadata.reasoning) {
                    writeMainLog('🧠 AI思考过程已记录到思考日志文件');
                    writeThinkingLog('AI深度思考过程:\n');
                    writeThinkingLog('─'.repeat(50) + '\n');
                    writeThinkingLog(metadata.reasoning);
                    writeThinkingLog('\n' + '─'.repeat(50) + '\n\n');
                }
                
                // 详细记录每个文件的生成过程
                if (data.files && data.files.length > 0) {
                    writeMainLog('📄 开始详细记录文件创建过程...');
                    writeFilesLog(`项目名称: ${data.projectName}\n`);
                    writeFilesLog(`总文件数: ${data.files.length}\n`);
                    writeFilesLog(`生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`);
                    
                    // 按文件类型分组
                    const filesByType = {};
                    data.files.forEach(file => {
                        if (!filesByType[file.type]) {
                            filesByType[file.type] = [];
                        }
                        filesByType[file.type].push(file);
                    });
                    
                    writeFilesLog('📊 文件类型统计:\n');
                    Object.keys(filesByType).forEach(type => {
                        writeFilesLog(`   ${type}: ${filesByType[type].length} 个文件\n`);
                    });
                    writeFilesLog('\n' + '='.repeat(80) + '\n\n');
                    
                    // 详细记录每个文件
                    for (let index = 0; index < data.files.length; index++) {
                        const file = data.files[index];
                        currentStep++;
                        const stepHeader = `步骤 ${currentStep}/${data.files.length}: 创建 ${file.path}`;
                        
                        writeMainLog(stepHeader);
                        writeFilesLog(stepHeader + '\n');
                        writeFilesLog('─'.repeat(stepHeader.length) + '\n');
                        writeFilesLog(`文件类型: ${file.type}\n`);
                        writeFilesLog(`文件路径: ${file.path}\n`);
                        writeFilesLog(`内容长度: ${file.content.length} 字符\n`);
                        writeFilesLog(`创建时间: ${new Date().toLocaleTimeString('zh-CN')}\n\n`);
                        
                        // 分析文件内容
                        const lines = file.content.split('\n');
                        writeFilesLog('📋 文件内容分析:\n');
                        writeFilesLog(`   总行数: ${lines.length}\n`);
                        
                        // 统计不同类型的代码行
                        let importLines = 0;
                        let commentLines = 0;
                        let emptyLines = 0;
                        let codeLines = 0;
                        
                        lines.forEach(line => {
                            const trimmed = line.trim();
                            if (trimmed === '') {
                                emptyLines++;
                            } else if (trimmed.startsWith('import ') || trimmed.startsWith('export ')) {
                                importLines++;
                            } else if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
                                commentLines++;
                            } else {
                                codeLines++;
                            }
                        });
                        
                        writeFilesLog(`   导入/导出行: ${importLines}\n`);
                        writeFilesLog(`   注释行: ${commentLines}\n`);
                        writeFilesLog(`   空行: ${emptyLines}\n`);
                        writeFilesLog(`   代码行: ${codeLines}\n\n`);
                        
                        // 记录文件内容的主要部分
                        writeFilesLog('📝 文件内容预览 (前20行):\n');
                        writeFilesLog('```\n');
                        lines.slice(0, 20).forEach((line, lineIndex) => {
                            writeFilesLog(`${(lineIndex + 1).toString().padStart(3, ' ')}: ${line}\n`);
                        });
                        
                        if (lines.length > 20) {
                            writeFilesLog(`... (还有 ${lines.length - 20} 行)\n`);
                        }
                        writeFilesLog('```\n\n');
                        
                        // 完整内容
                        writeFilesLog('📄 完整文件内容:\n');
                        writeFilesLog('```' + (file.path.endsWith('.vue') ? 'vue' : 
                                              file.path.endsWith('.ts') ? 'typescript' : 
                                              file.path.endsWith('.js') ? 'javascript' : '') + '\n');
                        writeFilesLog(file.content);
                        writeFilesLog('\n```\n\n');
                        writeFilesLog('='.repeat(80) + '\n\n');
                        
                        // 模拟逐步创建的过程
                        if (index < 3) { // 只对前3个文件模拟详细过程
                            writeMainLog(`   正在分析 ${file.type} 类型文件的结构...`);
                            await new Promise(resolve => setTimeout(resolve, 500));
                            
                            writeMainLog(`   正在生成 ${file.path} 的基础结构...`);
                            await new Promise(resolve => setTimeout(resolve, 300));
                            
                            writeMainLog(`   正在添加具体实现代码...`);
                            await new Promise(resolve => setTimeout(resolve, 400));
                            
                            writeMainLog(`   ✅ ${file.path} 创建完成`);
                        } else {
                            writeMainLog(`   ✅ ${file.path} 创建完成`);
                        }
                        
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    
                    // 生成项目总结
                    const totalTime = Date.now() - startTime;
                    writeMainLog('');
                    writeMainLog('📊 项目生成完成 - 总结报告');
                    writeMainLog('─'.repeat(50));
                    writeMainLog(`总耗时: ${totalTime}ms`);
                    writeMainLog(`文件数量: ${data.files.length}`);
                    writeMainLog(`依赖数量: ${data.dependencies ? data.dependencies.length : 0}`);
                    writeMainLog(`特性数量: ${data.features ? data.features.length : 0}`);
                    
                    // 依赖列表
                    if (data.dependencies && data.dependencies.length > 0) {
                        writeMainLog('');
                        writeMainLog('📦 项目依赖列表:');
                        data.dependencies.forEach((dep, index) => {
                            writeMainLog(`   ${index + 1}. ${dep}`);
                        });
                    }
                    
                    // 特性列表
                    if (data.features && data.features.length > 0) {
                        writeMainLog('');
                        writeMainLog('🎯 项目特性:');
                        data.features.forEach((feature, index) => {
                            writeMainLog(`   ${index + 1}. ${feature}`);
                        });
                    }
                    
                    // 文件树结构
                    if (metadata.fileTree) {
                        writeMainLog('');
                        writeMainLog('🌳 项目文件树结构:');
                        writeMainLog(metadata.fileTree);
                    }
                    
                    // 验证结果
                    if (metadata.validation) {
                        writeMainLog('');
                        writeMainLog('✅ 项目验证结果:');
                        writeMainLog(`   验证状态: ${metadata.validation.valid ? '通过' : '失败'}`);
                        if (metadata.validation.errors.length > 0) {
                            writeMainLog(`   错误数量: ${metadata.validation.errors.length}`);
                            metadata.validation.errors.forEach((error, index) => {
                                writeMainLog(`   错误${index + 1}: ${error}`);
                            });
                        }
                        if (metadata.validation.warnings.length > 0) {
                            writeMainLog(`   警告数量: ${metadata.validation.warnings.length}`);
                            metadata.validation.warnings.forEach((warning, index) => {
                                writeMainLog(`   警告${index + 1}: ${warning}`);
                            });
                        }
                    }
                    
                    // 生成总结文件
                    const summaryFile = path.join(OUTPUT_DIR, `project-summary-${timestamp}.txt`);
                    let summaryContent = `智能手表电商项目生成总结报告
时间: ${new Date().toLocaleString('zh-CN')}
${'='.repeat(60)}

📊 基本信息:
   项目名称: ${data.projectName}
   项目描述: ${data.description}
   生成耗时: ${totalTime}ms
   文件总数: ${data.files.length}
   依赖总数: ${data.dependencies ? data.dependencies.length : 0}
   特性总数: ${data.features ? data.features.length : 0}

📁 文件类型分布:
`;
                    
                    Object.keys(filesByType).forEach(type => {
                        summaryContent += `   ${type}: ${filesByType[type].length} 个文件\n`;
                    });
                    
                    summaryContent += `\n📄 文件列表:\n`;
                    data.files.forEach((file, index) => {
                        summaryContent += `   ${index + 1}. ${file.path} (${file.type}) - ${file.content.length} 字符\n`;
                    });
                    
                    if (data.dependencies) {
                        summaryContent += `\n📦 依赖列表:\n`;
                        data.dependencies.forEach((dep, index) => {
                            summaryContent += `   ${index + 1}. ${dep}\n`;
                        });
                    }
                    
                    if (data.features) {
                        summaryContent += `\n🎯 特性列表:\n`;
                        data.features.forEach((feature, index) => {
                            summaryContent += `   ${index + 1}. ${feature}\n`;
                        });
                    }
                    
                    fs.writeFileSync(summaryFile, summaryContent, 'utf8');
                    writeMainLog(`📋 项目总结已保存到: ${summaryFile}`);
                }
                
            } else {
                writeMainLog(`❌ 结构化生成失败: ${structuredResponse.data.error}`);
            }
            
        } catch (error) {
            writeMainLog(`❌ 生成失败: ${error.message}`);
            if (error.response) {
                writeMainLog(`   状态码: ${error.response.status}`);
            }
        }
        
        writeMainLog('');
        writeMainLog('🎉 详细生成测试完成！');
        writeMainLog('📁 所有日志文件已保存到: ' + OUTPUT_DIR);
        
    } catch (error) {
        writeMainLog(`❌ 测试过程中发生错误: ${error.message}`);
    }
}

// 主程序
async function main() {
    console.log('🧠 AutoWeb 详细文件生成过程记录器');
    console.log('');
    
    // 检查服务器连接
    try {
        const healthCheck = await axios.get(`${API_BASE_URL}/health`);
        console.log('✅ 服务器连接正常');
        console.log(`📍 服务器地址: ${API_BASE_URL}`);
        console.log(`🔑 API密钥配置: ${healthCheck.data.environment.apiKeyConfigured ? '是' : '否'}`);
        console.log('');
        
        if (!healthCheck.data.environment.apiKeyConfigured) {
            console.log('⚠️  警告: API密钥未配置，测试可能失败');
            console.log('请确保在.env文件中设置了ARK_API_KEY');
            console.log('');
        }
        
    } catch (error) {
        console.log('❌ 服务器连接失败');
        console.log(`   错误: ${error.message}`);
        console.log('   请确保服务器正在运行: node server.js');
        return;
    }
    
    await detailedGenerationTest();
    
    console.log('\n🎉 详细生成测试完成！');
    console.log(`📁 查看生成的日志文件: ${OUTPUT_DIR}`);
}

// 运行主程序
main().catch(error => {
    console.error('❌ 程序执行失败:', error.message);
    process.exit(1);
});
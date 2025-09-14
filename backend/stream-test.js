const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 配置
const API_BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, 'stream-test-results');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 流式测试 - 实时显示AI思考和生成过程
 */
async function streamTest() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(OUTPUT_DIR, `stream-test-${timestamp}.txt`);
    
    let logContent = '';
    let reasoningContent = '';
    let generatedContent = '';
    
    function log(message, saveToFile = true) {
        console.log(message);
        if (saveToFile) {
            logContent += message + '\n';
        }
    }
    
    function logReasoning(content) {
        // 实时显示思考过程，使用不同颜色
        console.log('\x1b[36m%s\x1b[0m', content); // 青色显示思考内容
        reasoningContent += content;
    }
    
    function logGeneration(content) {
        // 实时显示生成内容，使用绿色
        console.log('\x1b[32m%s\x1b[0m', content); // 绿色显示生成内容
        generatedContent += content;
    }
    
    try {
        log('='.repeat(80));
        log('🧠 AutoWeb API 流式深度思考测试');
        log('='.repeat(80));
        log(`⏰ 测试时间: ${new Date().toLocaleString('zh-CN')}`);
        log(`📁 输出文件: ${outputFile}`);
        log('');
        log('🎯 测试说明:');
        log('  - 青色文字 = AI深度思考过程');
        log('  - 绿色文字 = 生成的代码内容');
        log('  - 白色文字 = 系统日志信息');
        log('');
        
        // 测试项目描述
        const testDescription = `创建一个现代化的智能手表电商展示页面，要求：
1. 使用Vue 3 + TypeScript + Vite
2. 包含产品展示区域，支持多张产品图片轮播
3. 产品规格选择（颜色、尺寸、表带材质）
4. 价格显示和促销信息
5. 立即购买和加入购物车功能
6. 用户评价展示区域
7. 相关产品推荐
8. 响应式设计，适配手机和桌面
9. 使用深色主题，现代简约风格
10. 包含购物车侧边栏组件`;

        log('📝 项目描述:');
        log(testDescription);
        log('');
        log('🚀 开始流式生成...');
        log('─'.repeat(60));
        
        // 记录开始时间
        const startTime = Date.now();
        
        try {
            // 发起流式请求
            const response = await axios({
                method: 'post',
                url: `${API_BASE_URL}/api/generate/stream`,
                data: {
                    description: testDescription
                },
                responseType: 'stream',
                timeout: 600000 // 10分钟超时
            });
            
            log('✅ 成功连接到流式API');
            log('');
            
            // 处理流式数据
            let buffer = '';
            let chunkCount = 0;
            
            response.data.on('data', (chunk) => {
                buffer += chunk.toString();
                
                // 处理完整的数据行
                const lines = buffer.split('\n');
                buffer = lines.pop(); // 保留不完整的行
                
                lines.forEach(line => {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            chunkCount++;
                            
                            switch (data.type) {
                                case 'start':
                                    log(`\n🎬 [${new Date().toLocaleTimeString()}] ${data.content}`);
                                    break;
                                    
                                case 'reasoning':
                                    // 显示思考过程
                                    logReasoning(data.content);
                                    break;
                                    
                                case 'content':
                                    // 显示生成内容
                                    logGeneration(data.content);
                                    break;
                                    
                                case 'complete':
                                    const endTime = Date.now();
                                    const duration = endTime - startTime;
                                    log(`\n🎉 [${new Date().toLocaleTimeString()}] 生成完成!`);
                                    log(`⏱️  总耗时: ${duration}ms`);
                                    log(`📦 数据块数量: ${chunkCount}`);
                                    
                                    // 处理完整结果
                                    if (data.result) {
                                        log('\n📋 生成结果摘要:');
                                        log(`   推理内容长度: ${data.result.reasoning ? data.result.reasoning.length : 0} 字符`);
                                        log(`   生成内容长度: ${data.result.content ? data.result.content.length : 0} 字符`);
                                    }
                                    break;
                                    
                                case 'error':
                                    log(`\n❌ [${new Date().toLocaleTimeString()}] 错误: ${data.content}`);
                                    break;
                                    
                                default:
                                    log(`\n🔔 [${new Date().toLocaleTimeString()}] ${data.type}: ${data.content}`);
                            }
                        } catch (e) {
                            // 忽略JSON解析错误
                        }
                    }
                });
            });
            
            response.data.on('end', () => {
                log('\n📡 流式数据传输结束');
                saveResults();
            });
            
            response.data.on('error', (error) => {
                log(`\n❌ 流式数据传输错误: ${error.message}`);
                saveResults();
            });
            
        } catch (error) {
            log(`❌ 流式请求失败: ${error.message}`);
            if (error.response) {
                log(`   状态码: ${error.response.status}`);
                log(`   状态信息: ${error.response.statusText}`);
            }
            saveResults();
        }
        
    } catch (error) {
        log(`❌ 测试过程中发生错误: ${error.message}`);
        saveResults();
    }
    
    function saveResults() {
        try {
            // 构建完整的测试结果
            const fullResult = `${logContent}

${'='.repeat(80)}
🧠 AI 深度思考过程 (${reasoningContent.length} 字符)
${'='.repeat(80)}
${reasoningContent}

${'='.repeat(80)}
📝 生成的代码内容 (${generatedContent.length} 字符)
${'='.repeat(80)}
${generatedContent}

${'='.repeat(80)}
📊 测试统计
${'='.repeat(80)}
测试完成时间: ${new Date().toLocaleString('zh-CN')}
思考内容长度: ${reasoningContent.length} 字符
生成内容长度: ${generatedContent.length} 字符
总内容长度: ${reasoningContent.length + generatedContent.length} 字符
`;
            
            fs.writeFileSync(outputFile, fullResult, 'utf8');
            log(`\n💾 完整测试结果已保存到: ${outputFile}`);
            
            // 额外保存分离的文件
            const reasoningFile = path.join(OUTPUT_DIR, `reasoning-${timestamp}.txt`);
            const contentFile = path.join(OUTPUT_DIR, `generated-content-${timestamp}.txt`);
            
            fs.writeFileSync(reasoningFile, reasoningContent, 'utf8');
            fs.writeFileSync(contentFile, generatedContent, 'utf8');
            
            log(`📄 AI思考过程已保存到: ${reasoningFile}`);
            log(`📄 生成内容已保存到: ${contentFile}`);
            
        } catch (error) {
            log(`❌ 保存结果失败: ${error.message}`);
        }
    }
}

/**
 * 非流式测试 - 对比标准生成
 */
async function standardTest() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(OUTPUT_DIR, `standard-test-${timestamp}.txt`);
    
    let logContent = '';
    
    function log(message) {
        console.log(message);
        logContent += message + '\n';
    }
    
    try {
        log('\n' + '='.repeat(80));
        log('📋 AutoWeb API 标准深度思考测试 (非流式)');
        log('='.repeat(80));
        
        const testDescription = '创建一个简单的产品展示卡片组件，包含图片、标题、价格和购买按钮。使用Vue 3 + TypeScript。';
        log(`📝 项目描述: ${testDescription}`);
        log('');
        
        const startTime = Date.now();
        log('🚀 开始生成...');
        
        const response = await axios.post(`${API_BASE_URL}/api/generate`, {
            description: testDescription,
            options: {
                enableThinking: true,
                useStructuredOutput: true,
                includeValidation: true
            }
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (response.data.success) {
            log(`✅ 生成成功 (耗时: ${duration}ms)`);
            
            const { data, metadata } = response.data;
            
            log('\n📦 项目信息:');
            log(`   名称: ${data.projectName}`);
            log(`   描述: ${data.description}`);
            log(`   文件数量: ${data.files ? data.files.length : 0}`);
            
            // 显示生成的文件
            if (data.files && data.files.length > 0) {
                log('\n📁 生成的文件:');
                data.files.forEach((file, index) => {
                    log(`\n${index + 1}. ${file.path} (${file.type})`);
                    log('-'.repeat(40));
                    log(file.content);
                    log('-'.repeat(40));
                });
            }
            
            // 保存结果
            fs.writeFileSync(outputFile, logContent, 'utf8');
            log(`\n💾 标准测试结果已保存到: ${outputFile}`);
            
        } else {
            log(`❌ 生成失败: ${response.data.error}`);
        }
        
    } catch (error) {
        log(`❌ 标准测试失败: ${error.message}`);
    }
}

// 主程序
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log('🧠 AutoWeb API 深度思考流式测试工具');
        console.log('');
        console.log('用法:');
        console.log('  node stream-test.js              # 运行流式测试');
        console.log('  node stream-test.js --standard   # 运行标准测试');
        console.log('  node stream-test.js --both       # 运行两种测试');
        console.log('  node stream-test.js --help       # 显示帮助');
        console.log('');
        console.log('特性:');
        console.log('  🧠 实时显示AI深度思考过程');
        console.log('  📝 实时显示代码生成过程');
        console.log('  💾 保存完整的测试结果到文件');
        console.log('  🎨 彩色输出区分不同类型内容');
        console.log('');
        return;
    }
    
    console.log('🧠 AutoWeb 深度思考测试启动...');
    console.log('');
    
    // 首先测试服务器连接
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
    
    if (args.includes('--standard')) {
        await standardTest();
    } else if (args.includes('--both')) {
        await streamTest();
        console.log('\n' + '⏳ 等待5秒后运行标准测试...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await standardTest();
    } else {
        // 默认运行流式测试
        await streamTest();
    }
    
    console.log('\n🎉 测试完成！');
}

// 运行主程序
main().catch(error => {
    console.error('❌ 程序执行失败:', error.message);
    process.exit(1);
});
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 配置
const API_BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, 'test-results');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 简单的API测试
 */
async function simpleTest() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(OUTPUT_DIR, `test-result-${timestamp}.txt`);
    
    let logContent = '';
    
    function log(message) {
        console.log(message);
        logContent += message + '\n';
    }
    
    try {
        log('='.repeat(60));
        log('AutoWeb API 简单测试');
        log('='.repeat(60));
        log(`测试时间: ${new Date().toLocaleString('zh-CN')}`);
        log(`输出文件: ${outputFile}`);
        log('');
        
        // 1. 测试服务器健康状态
        log('1. 测试服务器健康状态...');
        try {
            const healthResponse = await axios.get(`${API_BASE_URL}/health`);
            log('✅ 服务器健康检查通过');
            log(`   - 运行时间: ${Math.floor(healthResponse.data.uptime)}秒`);
            log(`   - Node版本: ${healthResponse.data.environment.nodeVersion}`);
            log(`   - API密钥配置: ${healthResponse.data.environment.apiKeyConfigured ? '是' : '否'}`);
        } catch (error) {
            log('❌ 服务器健康检查失败');
            log(`   错误: ${error.message}`);
            return;
        }
        
        log('');
        
        // 2. 测试API连接
        log('2. 测试豆包API连接...');
        try {
            const testResponse = await axios.get(`${API_BASE_URL}/api/test`);
            if (testResponse.data.success) {
                log('✅ 豆包API连接测试成功');
                log(`   消息: ${testResponse.data.message}`);
            } else {
                log('❌ 豆包API连接测试失败');
                log(`   错误: ${testResponse.data.error}`);
                return;
            }
        } catch (error) {
            log('❌ 豆包API连接测试失败');
            log(`   错误: ${error.message}`);
            return;
        }
        
        log('');
        
        // 3. 测试项目生成
        log('3. 测试项目生成...');
        const testDescription = '创建一个简单的个人名片页面网页，包含姓名、职业、联系方式和简介。使用现代化的卡片设计，颜色要温馨。';
        log(`   描述: ${testDescription}`);
        
        const startTime = Date.now();
        
        try {
            const generateResponse = await axios.post(`${API_BASE_URL}/api/generate`, {
                description: testDescription,
                options: {
                    enableThinking: true,
                    useStructuredOutput: true,
                    includeValidation: true
                }
            });
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            if (generateResponse.data.success) {
                log('✅ 项目生成成功');
                log(`   耗时: ${duration}ms`);
                
                const { data, metadata } = generateResponse.data;
                
                // 项目基本信息
                log('');
                log('📦 生成的项目信息:');
                log(`   项目名称: ${data.projectName}`);
                log(`   项目描述: ${data.description}`);
                log(`   文件数量: ${data.files ? data.files.length : 0}`);
                log(`   依赖数量: ${data.dependencies ? data.dependencies.length : 0}`);
                log(`   特性数量: ${data.features ? data.features.length : 0}`);
                
                // 验证结果
                if (metadata.validation) {
                    log('');
                    log('✅ 验证结果:');
                    log(`   验证状态: ${metadata.validation.valid ? '通过' : '失败'}`);
                    if (metadata.validation.errors.length > 0) {
                        log(`   错误数量: ${metadata.validation.errors.length}`);
                        metadata.validation.errors.forEach((error, index) => {
                            log(`   错误${index + 1}: ${error}`);
                        });
                    }
                    if (metadata.validation.warnings.length > 0) {
                        log(`   警告数量: ${metadata.validation.warnings.length}`);
                        metadata.validation.warnings.forEach((warning, index) => {
                            log(`   警告${index + 1}: ${warning}`);
                        });
                    }
                }
                
                // 文件列表
                if (data.files && data.files.length > 0) {
                    log('');
                    log('📁 生成的文件列表:');
                    data.files.forEach((file, index) => {
                        log(`   ${index + 1}. ${file.path} (${file.type})`);
                    });
                }
                
                // 依赖列表
                if (data.dependencies && data.dependencies.length > 0) {
                    log('');
                    log('📦 项目依赖:');
                    data.dependencies.forEach((dep, index) => {
                        log(`   ${index + 1}. ${dep}`);
                    });
                }
                
                // 特性列表
                if (data.features && data.features.length > 0) {
                    log('');
                    log('🎯 项目特性:');
                    data.features.forEach((feature, index) => {
                        log(`   ${index + 1}. ${feature}`);
                    });
                }
                
                // 文件树结构
                if (metadata.fileTree) {
                    log('');
                    log('🌳 文件树结构:');
                    log(metadata.fileTree);
                }
                
                // 显示部分文件内容
                if (data.files && data.files.length > 0) {
                    log('');
                    log('📄 文件内容示例 (前2个文件):');
                    log('-'.repeat(40));
                    
                    data.files.slice(0, 2).forEach((file, index) => {
                        log(`\n${index + 1}. 文件: ${file.path}`);
                        log(`   类型: ${file.type}`);
                        log(`   内容:`);
                        log('-'.repeat(20));
                        
                        // 显示前500个字符
                        const content = file.content.length > 500 
                            ? file.content.substring(0, 500) + '\n... (内容被截断)'
                            : file.content;
                        log(content);
                        log('-'.repeat(20));
                    });
                }
                
                // 统计信息
                if (metadata.stats) {
                    log('');
                    log('📊 统计信息:');
                    log(`   文件总数: ${metadata.stats.fileCount}`);
                    log(`   文件类型: ${metadata.stats.fileTypes.join(', ')}`);
                    log(`   依赖总数: ${metadata.stats.dependencyCount}`);
                    if (metadata.stats.featureCount) {
                        log(`   特性总数: ${metadata.stats.featureCount}`);
                    }
                }
                
            } else {
                log('❌ 项目生成失败');
                log(`   错误: ${generateResponse.data.error}`);
                log(`   错误代码: ${generateResponse.data.code}`);
                if (generateResponse.data.details) {
                    log(`   详细信息: ${generateResponse.data.details}`);
                }
            }
            
        } catch (error) {
            log('❌ 项目生成请求失败');
            log(`   错误: ${error.message}`);
            if (error.response) {
                log(`   状态码: ${error.response.status}`);
                log(`   响应: ${JSON.stringify(error.response.data, null, 2)}`);
            }
        }
        
        log('');
        log('='.repeat(60));
        log('测试完成');
        log('='.repeat(60));
        
    } catch (error) {
        log(`❌ 测试过程中发生意外错误: ${error.message}`);
    } finally {
        // 保存结果到文件
        try {
            fs.writeFileSync(outputFile, logContent, 'utf8');
            log(`\n💾 测试结果已保存到: ${outputFile}`);
        } catch (error) {
            log(`❌ 保存测试结果失败: ${error.message}`);
        }
    }
}

// 检查命令行参数
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log('AutoWeb API 简单测试工具');
    console.log('');
    console.log('用法:');
    console.log('  node simple-test.js           # 运行测试');
    console.log('  node simple-test.js --help    # 显示帮助');
    console.log('');
    console.log('功能:');
    console.log('  - 测试服务器健康状态');
    console.log('  - 测试豆包API连接');
    console.log('  - 生成简单的Vue项目');
    console.log('  - 将结果保存到TXT文件');
    console.log('');
    console.log('输出文件位置: ./test-results/');
    process.exit(0);
}

// 运行测试
console.log('🚀 开始运行AutoWeb API简单测试...');
console.log('');

simpleTest().catch(error => {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
});
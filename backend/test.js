const axios = require('axios');
require('dotenv').config();

// 测试配置
const API_BASE_URL = 'http://localhost:3001';
const TEST_CASES = [
    {
        name: '智能手表电商页面',
        description: '创建一个智能手表电商页面，包含产品展示、详情页面、购物车功能。页面要现代化，使用深色主题，有产品图片轮播、规格选择、价格显示、立即购买和加入购物车按钮。',
        options: {
            enableThinking: true,
            useStructuredOutput: true,
            includeValidation: true
        }
    },
    {
        name: '简单联系页面',
        description: '创建一个联系我们页面，包含联系表单、地址信息、地图展示。',
        options: {
            enableThinking: true,
            useStructuredOutput: true,
            includeValidation: true
        }
    }
];

/**
 * 测试API连接
 */
async function testConnection() {
    try {
        console.log('🔄 测试API连接...');
        const response = await axios.get(`${API_BASE_URL}/api/test`);
        
        if (response.data.success) {
            console.log('✅ API连接测试成功');
            console.log(`📝 消息: ${response.data.message}`);
            return true;
        } else {
            console.log('❌ API连接测试失败');
            console.log(`📝 错误: ${response.data.error}`);
            return false;
        }
    } catch (error) {
        console.log('❌ API连接测试失败');
        console.log(`📝 错误: ${error.message}`);
        if (error.response) {
            console.log(`📝 状态码: ${error.response.status}`);
            console.log(`📝 响应: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        return false;
    }
}

/**
 * 测试项目生成
 */
async function testGeneration(testCase) {
    try {
        console.log(`\n🔄 开始测试: ${testCase.name}`);
        console.log(`📝 描述: ${testCase.description}`);
        
        const startTime = Date.now();
        const response = await axios.post(`${API_BASE_URL}/api/generate`, {
            description: testCase.description,
            options: testCase.options
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (response.data.success) {
            console.log(`✅ 生成成功 (耗时: ${duration}ms)`);
            
            const { data, metadata } = response.data;
            
            // 显示项目信息
            console.log(`📦 项目名称: ${data.projectName}`);
            console.log(`📝 项目描述: ${data.description}`);
            console.log(`📁 文件数量: ${data.files ? data.files.length : 0}`);
            console.log(`📦 依赖数量: ${data.dependencies ? data.dependencies.length : 0}`);
            console.log(`🎯 特性数量: ${data.features ? data.features.length : 0}`);
            
            // 显示验证结果
            if (metadata.validation) {
                console.log(`✅ 验证结果: ${metadata.validation.valid ? '通过' : '失败'}`);
                if (metadata.validation.errors.length > 0) {
                    console.log(`❌ 错误: ${metadata.validation.errors.join(', ')}`);
                }
                if (metadata.validation.warnings.length > 0) {
                    console.log(`⚠️ 警告: ${metadata.validation.warnings.join(', ')}`);
                }
            }
            
            // 显示文件树
            if (metadata.fileTree) {
                console.log('\n📁 文件结构:');
                console.log(metadata.fileTree);
            }
            
            // 显示文件内容示例（仅显示前3个文件的部分内容）
            if (data.files && data.files.length > 0) {
                console.log('\n📄 文件内容示例:');
                data.files.slice(0, 3).forEach((file, index) => {
                    console.log(`\n${index + 1}. ${file.path} (${file.type}):`);
                    const preview = file.content.length > 200 
                        ? file.content.substring(0, 200) + '...'
                        : file.content;
                    console.log(preview);
                });
            }
            
            return { success: true, data: response.data };
            
        } else {
            console.log(`❌ 生成失败`);
            console.log(`📝 错误: ${response.data.error}`);
            console.log(`📝 代码: ${response.data.code}`);
            return { success: false, error: response.data };
        }
        
    } catch (error) {
        console.log(`❌ 生成测试失败: ${testCase.name}`);
        console.log(`📝 错误: ${error.message}`);
        if (error.response) {
            console.log(`📝 状态码: ${error.response.status}`);
            console.log(`📝 响应: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        return { success: false, error: error.message };
    }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
    console.log('🚀 AutoWeb API 测试开始');
    console.log('=' .repeat(50));
    
    // 测试连接
    const connectionOk = await testConnection();
    if (!connectionOk) {
        console.log('\n❌ API连接失败，无法继续测试');
        console.log('请确保:');
        console.log('1. 服务器正在运行 (npm run dev)');
        console.log('2. 端口3001可用');
        console.log('3. ARK_API_KEY环境变量已设置');
        return;
    }
    
    // 运行生成测试
    const results = [];
    for (const testCase of TEST_CASES) {
        const result = await testGeneration(testCase);
        results.push({ testCase: testCase.name, result });
        
        // 测试间隔，避免API限流
        if (testCase !== TEST_CASES[TEST_CASES.length - 1]) {
            console.log('\n⏳ 等待2秒后继续下一个测试...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    // 显示测试总结
    console.log('\n' + '=' .repeat(50));
    console.log('📊 测试总结:');
    const successCount = results.filter(r => r.result.success).length;
    const totalCount = results.length;
    
    console.log(`✅ 成功: ${successCount}/${totalCount}`);
    console.log(`❌ 失败: ${totalCount - successCount}/${totalCount}`);
    
    results.forEach(({ testCase, result }) => {
        console.log(`  ${result.success ? '✅' : '❌'} ${testCase}`);
    });
    
    if (successCount === totalCount) {
        console.log('\n🎉 所有测试通过！');
    } else {
        console.log('\n⚠️ 部分测试失败，请检查配置和网络连接');
    }
}

/**
 * 交互式测试
 */
async function interactiveTest() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    console.log('🎯 AutoWeb 交互式测试');
    console.log('请输入项目描述，输入"quit"退出');
    
    const askForInput = () => {
        rl.question('\n📝 项目描述: ', async (description) => {
            if (description.toLowerCase() === 'quit') {
                rl.close();
                return;
            }
            
            if (description.trim()) {
                await testGeneration({
                    name: '用户自定义测试',
                    description,
                    options: {
                        enableThinking: true,
                        useStructuredOutput: true,
                        includeValidation: true
                    }
                });
            } else {
                console.log('⚠️ 请输入有效的项目描述');
            }
            
            askForInput();
        });
    };
    
    // 首先测试连接
    const connectionOk = await testConnection();
    if (connectionOk) {
        askForInput();
    } else {
        console.log('❌ API连接失败，请检查服务器状态');
        rl.close();
    }
}

// 根据命令行参数决定运行模式
const args = process.argv.slice(2);
if (args.includes('--interactive') || args.includes('-i')) {
    interactiveTest();
} else {
    runAllTests();
}

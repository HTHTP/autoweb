// 简单测试脚本来验证API数据格式
const axios = require('axios');

async function testAPI() {
    try {
        console.log('测试代码生成API...');
        
        // 启动生成任务
        const generateResponse = await axios.post('http://localhost:3000/api/generate', {
            description: '创建一个简单的登录表单',
            components: ['Element Plus'],
            style: 'modern'
        });
        
        console.log('生成响应:', generateResponse.data);
        
        if (generateResponse.data.success && generateResponse.data.taskId) {
            const taskId = generateResponse.data.taskId;
            console.log('任务ID:', taskId);
            
            // 等待一段时间后查询进度
            setTimeout(async () => {
                try {
                    const progressResponse = await axios.get(`http://localhost:3000/api/generate/progress/${taskId}`);
                    console.log('进度响应:', progressResponse.data);
                    
                    if (progressResponse.data.code) {
                        console.log('代码字段类型:', typeof progressResponse.data.code);
                        console.log('代码内容预览:', progressResponse.data.code.substring(0, 200) + '...');
                        
                        // 尝试解析JSON
                        try {
                            const parsedCode = JSON.parse(progressResponse.data.code);
                            console.log('解析成功，项目文件:', Object.keys(parsedCode));
                        } catch (e) {
                            console.log('JSON解析失败:', e.message);
                        }
                    } else {
                        console.log('没有代码字段');
                    }
                } catch (error) {
                    console.error('查询进度失败:', error.message);
                }
            }, 5000);
        }
        
    } catch (error) {
        console.error('测试失败:', error.message);
    }
}

testAPI();
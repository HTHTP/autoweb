// 持续监控任务进度的测试脚本
const axios = require('axios');

async function monitorTask() {
    try {
        console.log('监控现有任务进度...');
        
        const taskId = '354f314f-7710-4232-b93c-36976696e042';
        
        const checkProgress = async () => {
            try {
                const progressResponse = await axios.get(`http://localhost:3000/api/generate/progress/${taskId}`);
                console.log(`${new Date().toLocaleTimeString()} - 状态:`, progressResponse.data.status, '进度:', progressResponse.data.progress + '%');
                
                if (progressResponse.data.status === 'completed') {
                    console.log('任务完成！');
                    console.log('代码字段类型:', typeof progressResponse.data.code);
                    
                    if (progressResponse.data.code) {
                        console.log('代码内容长度:', progressResponse.data.code.length);
                        console.log('代码内容预览:');
                        console.log(progressResponse.data.code.substring(0, 500) + '...');
                        
                        // 尝试解析JSON
                        try {
                            const parsedCode = JSON.parse(progressResponse.data.code);
                            console.log('✅ JSON解析成功');
                            console.log('项目文件列表:', Object.keys(parsedCode));
                        } catch (e) {
                            console.log('❌ JSON解析失败:', e.message);
                        }
                    }
                    
                    clearInterval(timer);
                } else if (progressResponse.data.status === 'failed') {
                    console.log('任务失败:', progressResponse.data.error);
                    clearInterval(timer);
                }
            } catch (error) {
                console.error('查询进度失败:', error.message);
            }
        };
        
        // 立即检查一次
        await checkProgress();
        
        // 每3秒检查一次
        const timer = setInterval(checkProgress, 3000);
        
        // 5分钟后超时
        setTimeout(() => {
            console.log('监控超时');
            clearInterval(timer);
            process.exit(0);
        }, 300000);
        
    } catch (error) {
        console.error('监控失败:', error.message);
    }
}

monitorTask();
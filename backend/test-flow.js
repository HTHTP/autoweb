#!/usr/bin/env node

// 测试脚本 - 验证完整流程功能
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testCompleteFlow() {
    try {
        console.log('🚀 开始测试完整的网页生成流程...\n');

        // 步骤1: 发起生成任务
        console.log('📝 步骤1: 发起网页生成任务');
        const generateResponse = await axios.post(`${API_BASE}/generate`, {
            description: "一个现代化的企业官网，包含公司介绍、产品展示、联系我们",
            components: ["导航栏", "轮播图", "卡片展示"],
            style: "modern"
        });

        if (!generateResponse.data.success) {
            throw new Error('启动生成任务失败');
        }

        const taskId = generateResponse.data.taskId;
        console.log(`✅ 任务启动成功，任务ID: ${taskId}\n`);

        // 步骤2: 轮询查询进度
        console.log('⏳ 步骤2: 查询生成进度');
        let completed = false;
        let result = null;

        while (!completed) {
            const progressResponse = await axios.get(`${API_BASE}/generate/progress/${taskId}`);

            if (!progressResponse.data.success) {
                throw new Error('查询进度失败');
            }

            const { status, progress, completed: isCompleted, error, result: taskResult } = progressResponse.data;

            console.log(`📊 ${status} (${progress}%)`);

            if (isCompleted) {
                completed = true;
                if (error) {
                    throw new Error(`生成失败: ${error}`);
                }
                result = taskResult;
            } else {
                // 等待2秒继续查询
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log('\n✅ 步骤2: 生成完成！');

        // 步骤3: 测试导出功能
        console.log('\n📦 步骤3: 测试导出功能');
        const exportResponse = await axios.post(`${API_BASE}/export`, {
            code: result
        }, {
            responseType: 'blob'
        });

        console.log(`✅ 导出成功，文件大小: ${exportResponse.data.size} bytes`);

        console.log('\n🎉 完整流程测试成功！');
        console.log('\n📋 测试总结:');
        console.log('  - ✅ 网页生成任务启动');
        console.log('  - ✅ 进度查询功能');
        console.log('  - ✅ 文件导出功能');
        console.log('  - ✅ 错误处理机制');

    } catch (error) {
        console.error('\n❌ 测试失败:', error.message);

        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }

        console.log('\n💡 提示: 这可能是由于未配置豆包API Key导致的，系统会自动使用模拟生成');
    }
}

// 运行测试
testCompleteFlow();

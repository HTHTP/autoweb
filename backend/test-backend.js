const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * 测试后端API功能
 */
class BackendTester {
    constructor() {
        this.apiClient = axios.create({
            baseURL: API_BASE_URL,
            timeout: 600000, // 10分钟超时
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * 测试健康检查
     */
    async testHealth() {
        try {
            console.log('🔍 测试健康检查...');
            const response = await axios.get('http://localhost:3000/health');
            console.log('✅ 健康检查通过:', response.data);
            return true;
        } catch (error) {
            console.error('❌ 健康检查失败:', error.message);
            return false;
        }
    }

    /**
     * 测试异步代码生成
     */
    async testAsyncGeneration() {
        try {
            console.log('\n🔍 测试异步代码生成...');
            
            const testRequest = {
                description: '创建一个数据表格页面，显示用户列表，包含姓名、邮箱、状态等字段，支持分页和搜索',
                components: ['Element Plus'],
                style: 'modern'
            };

            // 启动任务
            const startResponse = await this.apiClient.post('/generate', testRequest);
            
            if (!startResponse.data.success) {
                console.error('❌ 任务启动失败:', startResponse.data.message);
                return false;
            }

            const taskId = startResponse.data.taskId;
            console.log('🚀 任务已启动，ID:', taskId);

            // 轮询进度
            let completed = false;
            let attempts = 0;
            const maxAttempts = 300; // 最多等待10分钟（300次 * 2秒 = 600秒）

            while (!completed && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
                attempts++;

                try {
                    const progressResponse = await this.apiClient.get(`/generate/progress/${taskId}`);
                    const progress = progressResponse.data;

                    console.log(`📊 进度: ${progress.status} (${progress.progress || 0}%)`);

                    if (progress.status === 'completed') {
                        completed = true;
                        if (progress.error) {
                            console.error('❌ 任务失败:', progress.error);
                            return false;
                        } else if (progress.code) {
                            console.log('✅ 异步代码生成成功');
                            console.log('📦 代码长度:', progress.code.length);
                            
                            // 验证代码格式
                            try {
                                const codeObj = JSON.parse(progress.code);
                                console.log('📁 生成的文件数量:', Object.keys(codeObj).length);
                                console.log('📂 文件列表:', Object.keys(codeObj).slice(0, 5).join(', '));
                            } catch (parseError) {
                                console.warn('⚠️ 代码格式解析失败:', parseError.message);
                            }
                            
                            return true;
                        } else {
                            console.error('❌ 任务完成但没有返回代码');
                            return false;
                        }
                    } else if (progress.status === 'failed') {
                        console.error('❌ 任务失败:', progress.error);
                        return false;
                    }
                } catch (progressError) {
                    console.warn('⚠️ 查询进度失败:', progressError.message);
                }
            }

            console.error('❌ 任务超时，已等待', attempts * 2, '秒');
            return false;

        } catch (error) {
            console.error('❌ 异步代码生成测试失败:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * 测试代码修改
     */
    async testCodeModification() {
        try {
            console.log('\n🔍 测试代码修改...');
            
            // 使用一个示例代码进行修改测试
            const sampleCode = JSON.stringify({
                'App.vue': `<template>
  <div class="app">
    <h1>计数器: {{ count }}</h1>
    <el-button @click="increment">增加</el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
const increment = () => {
  count.value++
}
</script>`,
                'package.json': `{
  "name": "counter-app",
  "version": "1.0.0",
  "dependencies": {
    "vue": "^3.3.0",
    "element-plus": "^2.3.0"
  }
}`
            });

            console.log('✅ 使用示例代码');

            // 测试修改
            const modifyRequest = {
                code: sampleCode,
                modification: '添加一个重置按钮，点击后将计数器重置为0'
            };

            const modifyResponse = await this.apiClient.post('/generate/modify', modifyRequest);
            
            if (!modifyResponse.data.success) {
                console.error('❌ 修改任务启动失败:', modifyResponse.data.message);
                return false;
            }

            const taskId = modifyResponse.data.taskId;
            console.log('🚀 修改任务已启动，ID:', taskId);

            // 轮询修改进度
            let completed = false;
            let attempts = 0;
            const maxAttempts = 150; // 最多等待5分钟

            while (!completed && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;

                try {
                    const progressResponse = await this.apiClient.get(`/generate/progress/${taskId}`);
                    const progress = progressResponse.data;

                    console.log(`📊 修改进度: ${progress.status} (${progress.progress || 0}%)`);

                    if (progress.status === 'completed') {
                        completed = true;
                        if (progress.code) {
                            console.log('✅ 代码修改成功');
                            console.log('📦 修改后代码长度:', progress.code.length);
                            return true;
                        } else {
                            console.error('❌ 修改完成但没有返回代码');
                            return false;
                        }
                    } else if (progress.status === 'failed') {
                        console.error('❌ 修改任务失败:', progress.error);
                        return false;
                    }
                } catch (progressError) {
                    console.warn('⚠️ 查询修改进度失败:', progressError.message);
                }
            }

            console.error('❌ 修改任务超时');
            return false;

        } catch (error) {
            console.error('❌ 代码修改测试失败:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * 测试代码导出
     */
    async testCodeExport() {
        try {
            console.log('\n🔍 测试代码导出...');
            
            // 使用示例代码进行导出测试
            const sampleCode = JSON.stringify({
                'App.vue': `<template>
  <div class="todo-app">
    <h1>待办事项</h1>
    <el-input v-model="newTodo" placeholder="添加新的待办事项"></el-input>
    <el-button @click="addTodo">添加</el-button>
    <el-list>
      <el-list-item v-for="todo in todos" :key="todo.id">
        {{ todo.text }}
      </el-list-item>
    </el-list>
  </div>
</template>`,
                'package.json': `{
  "name": "todo-app",
  "version": "1.0.0"
}`
            });

            console.log('✅ 使用示例代码进行导出测试');

            // 测试导出
            const exportRequest = {
                code: sampleCode,
                projectName: 'test-export-project'
            };

            const exportResponse = await this.apiClient.post('/generate/export', exportRequest);
            
            if (!exportResponse.data.success) {
                console.error('❌ 导出任务启动失败:', exportResponse.data.message);
                return false;
            }

            const taskId = exportResponse.data.taskId;
            console.log('🚀 导出任务已启动，ID:', taskId);

            // 轮询导出进度
            let completed = false;
            let attempts = 0;
            const maxAttempts = 90; // 最多等待3分钟

            while (!completed && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;

                try {
                    const progressResponse = await this.apiClient.get(`/generate/progress/${taskId}`);
                    const progress = progressResponse.data;

                    console.log(`📊 导出进度: ${progress.status} (${progress.progress || 0}%)`);

                    if (progress.status === 'completed') {
                        completed = true;
                        if (progress.exportPath) {
                            console.log('✅ 代码导出成功');
                            console.log('📁 导出路径:', progress.exportPath);
                            return true;
                        } else {
                            console.error('❌ 导出完成但没有返回路径');
                            return false;
                        }
                    } else if (progress.status === 'failed') {
                        console.error('❌ 导出任务失败:', progress.error);
                        return false;
                    }
                } catch (progressError) {
                    console.warn('⚠️ 查询导出进度失败:', progressError.message);
                }
            }

            console.error('❌ 导出任务超时');
            return false;

        } catch (error) {
            console.error('❌ 代码导出测试失败:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * 运行所有测试
     */
    async runAllTests() {
        console.log('🧪 开始后端API测试\n');
        
        const tests = [
            { name: '健康检查', fn: () => this.testHealth() },
            { name: '异步代码生成', fn: () => this.testAsyncGeneration() },
            { name: '代码修改', fn: () => this.testCodeModification() },
            { name: '代码导出', fn: () => this.testCodeExport() }
        ];

        let passedTests = 0;
        let totalTests = tests.length;

        for (const test of tests) {
            try {
                const result = await test.fn();
                if (result) {
                    passedTests++;
                }
            } catch (error) {
                console.error(`❌ 测试 "${test.name}" 异常:`, error.message);
            }
        }

        console.log(`\n📊 测试完成: ${passedTests}/${totalTests} 个测试通过`);
        
        if (passedTests === totalTests) {
            console.log('🎉 所有测试都通过了！后端功能正常');
        } else {
            console.log('⚠️ 部分测试失败，请检查日志');
        }

        return passedTests === totalTests;
    }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
    const tester = new BackendTester();
    
    console.log('请确保后端服务已启动在 http://localhost:3000');
    console.log('启动命令: npm start 或 npm run dev\n');
    
    tester.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('测试运行失败:', error);
        process.exit(1);
    });
}

module.exports = BackendTester;
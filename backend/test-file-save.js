/**
 * 测试文件保存功能
 */
const fileSaveService = require('./services/file-save-service');

async function testFileSave() {
    console.log('🧪 测试文件保存功能...\n');

    // 测试数据
    const testCode = JSON.stringify({
        "test-project/package.json": JSON.stringify({
            "name": "test-vue-project",
            "version": "1.0.0",
            "dependencies": {
                "vue": "^3.5.17",
                "element-plus": "^2.10.4"
            }
        }, null, 2),
        "test-project/src/App.vue": "<template>\n  <div>Test App</div>\n</template>\n\n<script setup>\nconsole.log('Test Vue App')\n</script>",
        "test-project/index.html": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Test</title>\n</head>\n<body>\n  <div id=\"app\"></div>\n</body>\n</html>"
    }, null, 2);

    const metadata = {
        description: '测试项目',
        components: ['Element Plus'],
        style: 'modern',
        mode: 'test'
    };

    try {
        // 测试保存JSON
        console.log('📄 测试保存JSON...');
        const jsonResult = await fileSaveService.saveJsonCode(testCode, metadata);
        console.log('结果:', jsonResult);

        // 测试保存Vue项目
        console.log('\n📁 测试保存Vue项目...');
        const projectResult = await fileSaveService.saveVueProject(testCode, {
            ...metadata,
            projectName: 'test-project-demo'
        });
        console.log('结果:', projectResult);

        // 测试获取保存的文件列表
        console.log('\n📋 测试获取文件列表...');
        const projects = await fileSaveService.getSavedProjects();
        const jsonFiles = await fileSaveService.getSavedJsonFiles();
        
        console.log('保存的项目数量:', projects.length);
        console.log('保存的JSON文件数量:', jsonFiles.length);

        if (projects.length > 0) {
            console.log('最新项目:', projects[0].name);
        }

        // 测试存储统计
        console.log('\n📊 测试存储统计...');
        const stats = await fileSaveService.getStorageStats();
        console.log('存储统计:', stats);

        console.log('\n✅ 文件保存功能测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

// 运行测试
if (require.main === module) {
    testFileSave();
}

module.exports = testFileSave;
#!/usr/bin/env node

// 完整流程测试脚本
require('dotenv').config()
const { generateHTML } = require('./utils/codeGenerator')

async function testCompleteFlow() {
    try {
        console.log('🚀 开始测试完整的网页生成流程...\n')

        // 测试参数
        const testParams = {
            description: '现代简约风格的智能手表产品展示网站，突出科技感和时尚设计',
            components: ['导航栏', '产品展示区', '功能特色', '使用场景', '页脚'],
            style: 'modern',
            framework: 'vue3'
        }

        console.log('📋 测试参数:')
        console.log(`   描述: ${testParams.description}`)
        console.log(`   组件: ${testParams.components.join('、')}`)
        console.log(`   风格: ${testParams.style}`)
        console.log(`   框架: ${testParams.framework}\n`)

        console.log('🔄 正在生成网页...')
        
        // 调用完整生成流程 - 使用正确的参数格式
        const result = await generateHTML({
            description: testParams.description,
            components: testParams.components,
            style: testParams.style
        }, (progress) => {
            console.log(`   📝 ${progress}`)
        })

        if (result && result.projectPath) {
            console.log('✅ 网页生成成功!')
            console.log(`📁 项目路径: ${result.projectPath}`)
            
            if (result.stats) {
                console.log('\n📊 生成统计:')
                console.log(`   文件数量: ${result.stats.totalFiles}`)
                console.log(`   占位符数量: ${result.stats.placeholders}`)
                console.log(`   生成的图片: ${result.stats.generatedImages}`)
            }

            if (result.aiLogs && result.aiLogs.length > 0) {
                console.log('\n🤖 AI生成日志:')
                result.aiLogs.forEach((log, index) => {
                    console.log(`   ${index + 1}. ${log.step}: ${log.status}`)
                })
            }

            console.log('\n🎉 完整流程测试成功!')
            
        } else {
            console.log('❌ 网页生成失败')
            console.log('结果:', result)
        }

    } catch (error) {
        console.error('❌ 测试失败:', error.message)
        console.error('错误详情:', error)
    }
}

// 运行测试
testCompleteFlow().then(() => {
    console.log('\n✨ 测试完成')
    process.exit(0)
}).catch(error => {
    console.error('测试异常:', error)
    process.exit(1)
})
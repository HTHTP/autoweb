const express = require('express')
const AdmZip = require('adm-zip')
const path = require('path')

const router = express.Router()

// 导出Vue3项目为ZIP
router.post('/', async (req, res) => {
    try {
        const { code } = req.body

        if (!code) {
            return res.status(400).json({
                success: false,
                message: '请提供要导出的代码'
            })
        }

        // 创建 ZIP 文件
        const zip = new AdmZip()

        try {
            // 尝试解析为Vue3项目结构
            const projectStructure = JSON.parse(code)

            // 遍历项目结构，创建文件和文件夹
            for (const [filePath, content] of Object.entries(projectStructure)) {
                if (content === "folder") {
                    // 创建文件夹
                    zip.addFile(filePath, Buffer.alloc(0), '', 0x10)
                } else {
                    // 创建文件
                    zip.addFile(filePath, Buffer.from(content, 'utf8'))
                }
            }

            // 设置响应头
            res.setHeader('Content-Type', 'application/zip')
            res.setHeader('Content-Disposition', 'attachment; filename=vue3-project.zip')

        } catch (parseError) {
            // 如果解析失败，当作HTML文件处理
            console.log('按HTML文件处理导出')

            // 添加主 HTML 文件
            zip.addFile('index.html', Buffer.from(code, 'utf8'))

            // 添加 README 文件
            const readme = `# AI 生成的网页

这是一个由 AI 网页生成器自动生成的网页项目。

## 使用方法

1. 在浏览器中打开 index.html 文件
2. 或者使用本地服务器运行此项目

## 技术栈

- HTML5
- CSS3
- Element Plus (Vue 组件库)
- Vue 3

## 注意事项

- 确保网络连接正常，以便加载外部 CDN 资源
- 如需修改样式，请编辑 index.html 文件中的 <style> 标签
- 如需添加交互功能，请编辑 <script> 标签内容

生成时间: ${new Date().toLocaleString('zh-CN')}
`

            zip.addFile('README.md', Buffer.from(readme, 'utf8'))

            // 设置响应头
            res.setHeader('Content-Type', 'application/zip')
            res.setHeader('Content-Disposition', 'attachment; filename=generated-webpage.zip')
        }

        // 发送 ZIP 文件
        const zipBuffer = zip.toBuffer()
        res.setHeader('Content-Length', zipBuffer.length)
        res.send(zipBuffer)

    } catch (error) {
        console.error('导出失败:', error)
        res.status(500).json({
            success: false,
            message: '导出失败，请稍后重试'
        })
    }
})

module.exports = router

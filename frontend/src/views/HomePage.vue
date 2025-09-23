<template>
  <div class="home-page">
    <!-- 头部导航 -->
    <HeaderComponent :hasGeneratedCode="codeStore.generatedCode.trim() !== ''" @export-code="handleExportCode" />

    <!-- 主要内容区域 -->
    <el-row class="main-container" :gutter="0">
      <!-- 左侧输入面板 -->
      <el-col :span="6" class="input-panel">
        <InputPanel @generate="handleGenerate" />
      </el-col>

      <!-- 右侧内容区域 -->
      <el-col :span="18" class="content-area">
        <ContentPanel @modify="handleModify" @load-demo="handleLoadDemo" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import HeaderComponent from '../components/HeaderComponent.vue'
import InputPanel from '../components/InputPanel.vue'
import ContentPanel from '../components/ContentPanel.vue'
import { useCodeStore } from '../stores/code'
import { ElMessage } from 'element-plus'
import { modifyCode, generateCode } from '../api/generate'
import { io } from 'socket.io-client'

const codeStore = useCodeStore()

// Socket.io连接管理
let socket = null
let wsConnected = false

// 连接Socket.io
const connectWebSocket = () => {
  if (socket && wsConnected) {
    return
  }

  try {
    // 使用socket.io-client创建连接
    socket = io('ws://localhost:3000', {
      transports: ['websocket'],
      timeout: 5000
    })

    socket.on('connect', () => {
      console.log('Socket.io连接已建立')
      wsConnected = true
    })

    // 监听code_chunk事件，这是后端通过io.emit('code_chunk', ...)发送的事件
    socket.on('code_chunk', (data) => {
      try {
        if (data.content) {
          // 将收到的内容追加到编辑器
          codeStore.appendGeneratedCode(data.content)
          console.log('通过Socket.io收到代码块:', data.content.substring(0, 30) + '...')
        }
      } catch (error) {
        console.error('处理code_chunk事件失败:', error)
        console.error('原始数据:', data)
      }
    })

    // 监听generation_complete事件，获取生成完成的完整代码
    socket.on('generation_complete', (data) => {
      try {
        // 无论成功失败，都将生成状态设置为false
        codeStore.setGenerating(false)
        codeStore.setGenerated(true)
        
        if (data.success && data.code) {
          // 使用纯净的code内容更新编辑器
          codeStore.updateHtmlCode(data.code)
          console.log('代码生成已完成，已更新编辑器内容')
          ElMessage.success('代码生成已完成，已提取纯净代码')
        } else if (data.message) {
          console.error('代码生成失败:', data.message)
          ElMessage.error(data.message)
        }
      } catch (error) {
        console.error('处理generation_complete事件失败:', error)
        console.error('原始数据:', data)
        codeStore.setGenerating(false)
        codeStore.setGenerated(true)
      }
    })

    socket.on('disconnect', () => {
      console.log('Socket.io连接已关闭')
      wsConnected = false
    })

    socket.on('connect_error', (error) => {
      console.error('Socket.io连接错误:', error)
      wsConnected = false
    })
  } catch (error) {
    console.error('初始化Socket.io失败:', error)
  }
}

// 关闭Socket.io连接
const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    wsConnected = false
  }
}

// 暴露方法供外部调用
defineExpose({
  connectWebSocket,
  disconnectWebSocket
})

// 生成代码
const handleGenerate = async () => {
  if (codeStore.inputMethod === 'text' && !codeStore.userPrompt.trim()) {
    ElMessage.warning('请输入功能描述')
    return
  }

  try {
    // 清空现有代码
    codeStore.clearCode()
    codeStore.setGenerating(true)

    // 连接WebSocket以接收实时更新
    if (!wsConnected) {
      try {
        connectWebSocket()
      } catch (error) {
        console.error('尝试连接WebSocket失败:', error)
      }
    }

    // 使用正确的generateCode函数发送请求
    await generateCode({
      description: codeStore.userPrompt,
      components: [],
      style: 'modern',
      useChunkedOutput: true,
      useDeepThinking: true
    })

    ElMessage.success('代码生成任务已提交，正在流式输出到编辑器！')
  } catch (error) {
    console.error('发送请求失败:', error)
    codeStore.setGenerating(false)
    ElMessage.error('提交生成任务失败，请重试')
  }
}

// 修改代码
const handleModify = async () => {
  if (!codeStore.modificationText.trim()) {
    ElMessage.warning('请输入修改建议')
    return
  }

  if (!codeStore.generatedCode.trim()) {
    ElMessage.warning('请先生成代码')
    return
  }

  codeStore.setModifying(true)

  try {
    const result = await modifyCode({
      currentCode: codeStore.generatedCode,
      modification: codeStore.modificationText
    })

    if (result.success && result.code) {
      codeStore.setGeneratedCode(result.code)
      codeStore.modificationText = ''
      ElMessage.success('代码修改成功！')
    } else {
      ElMessage.error(result.message || '代码修改失败')
    }
  } catch (error) {
    console.error('修改失败:', error)
    ElMessage.error('代码修改失败，请重试')
  } finally {
    codeStore.setModifying(false)
  }
}

// 加载演示
const handleLoadDemo = () => {
  codeStore.loadDemoCode()
  ElMessage.success('演示代码已加载')
}

// 导出代码
const handleExportCode = () => {
  if (!codeStore.generatedCode.trim()) {
    ElMessage.warning('没有可导出的代码')
    return
  }

  // 创建并下载HTML文件
  const blob = new Blob([codeStore.generatedCode], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `generated-${Date.now()}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success('HTML文件已导出')
}
</script>

<style scoped>
.home-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  height: calc(100vh - 80px);
  background: #f5f7fa;
}

.input-panel {
  background: linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%);
  padding: 0;
  border-right: 1px solid #e1e8ed;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.content-area {
  padding: 24px;
  background: linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%);
  position: relative;
  height: calc(100vh - 80px);
  overflow: hidden;
}
</style>

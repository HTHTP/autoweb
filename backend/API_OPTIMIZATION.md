# 代码生成接口优化说明

## 问题分析

原来的设计有两个接口：

- `/api/generate` - 异步，返回任务 ID，需要轮询
- `/api/generate/sync` - 同步，直接返回结果，但会阻塞

这导致前端使用复杂，需要区分不同的调用方式。

## 优化方案

### 1. 统一接口设计

现在只用一个接口：`POST /api/generate`

接口会根据请求自动选择最佳处理方式：

```javascript
// 前端调用方式统一
const code = await generateCodeSmart(
  {
    description: "创建一个登录表单",
    components: ["Element Plus"],
    style: "modern",
  },
  (status, progress) => {
    // 进度回调
    console.log(status, progress + "%");
  }
);
```

### 2. 智能处理模式

后端会根据以下条件自动选择处理模式：

**同步模式** (立即返回结果)：

- 请求明确指定 `sync: true`
- 或者描述简单（长度 < 100 字符，不包含"复杂"、"多个"等关键词）

**异步模式** (返回任务 ID，轮询进度)：

- 复杂的功能描述
- 预计处理时间较长的请求

### 3. 响应格式统一

```json
{
    "success": true,
    "mode": "sync" | "async",
    "code": "...",        // 同步模式直接返回
    "taskId": "...",      // 异步模式返回任务ID
    "message": "..."
}
```

### 4. 前端调用优化

```typescript
// 新的智能调用方式
const generateCodeSmart = async (data, onProgress?) => {
  const response = await api.post("/generate", data);

  if (response.mode === "sync") {
    // 同步：直接返回结果
    return response.code;
  } else {
    // 异步：自动轮询进度
    return pollTaskProgress(response.taskId, onProgress);
  }
};
```

## 优势

1. **前端简化**：只需要调用一个函数，不用关心底层是同步还是异步
2. **智能选择**：后端自动选择最合适的处理方式
3. **性能优化**：简单请求走同步，复杂请求走异步
4. **向后兼容**：保留原有的异步接口，但推荐使用新接口
5. **降级处理**：AI 失败时自动使用默认模板

## 使用建议

- 推荐使用 `generateCodeSmart()` 函数
- 简单的组件生成会自动使用同步模式，响应更快
- 复杂的页面生成会自动使用异步模式，避免超时
- 前端只需要处理进度回调，不需要关心底层实现

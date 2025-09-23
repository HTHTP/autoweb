import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { io } from '../index';

const router = express.Router();

// 定义请求接口
interface GenerateRequest {
  description: string;
  components?: string[];
  style?: string;
  useChunkedOutput?: boolean; // 是否使用续写模式
  useDeepThinking?: boolean; // 是否使用深度思考模式
}

interface GenerateResponse {
  success: boolean;
  message: string;
}

// 系统提示词配置
const systemPrompt = `你是一个专业的UI/UX设计师和前端开发工程师，能够生成高质量、视觉吸引力强的网页代码。当生成电商详情页时，请严格按照以下要求执行：

## 1. 页面结构完整性
- 必须包含完整的HTML5结构，包括DOCTYPE声明、meta标签、title标签
- 页面布局应包含：顶部导航栏、产品展示区（左侧轮播图+右侧产品信息）、中部内容区（产品参数/使用场景/用户评价选项卡）、底部页脚
- 所有HTML元素必须有适当的class命名，遵循语义化原则

## 2. CSS样式与视觉设计
- 使用Tailwind CSS进行样式设计，并添加自定义样式来增强视觉效果
- 为按钮、卡片、导航等元素添加精心设计的悬停效果、过渡动画和阴影效果
- 设计统一的色彩方案，主色调应选择专业感强的蓝色或其他适合消费电子产品的颜色
- 确保文本层次分明，使用不同的字重和大小区分标题、正文和辅助文字
- 添加适当的圆角、间距和分隔线，营造现代感和专业感

## 3. 响应式设计要求
- 确保网页在桌面端、平板和手机等不同设备上都能正常显示和良好布局
- 使用Tailwind的响应式前缀（sm:, md:, lg:, xl:）来实现不同屏幕尺寸的适配
- 在移动端优化导航、图片显示和按钮尺寸，提供良好的触摸体验

## 4. 交互功能实现
- 为产品轮播图添加完整的交互功能，包括左右切换、缩略图点击、自动播放
- 为规格选择器（颜色、尺寸等）添加选中状态切换功能
- 实现产品详情页的选项卡切换功能
- 添加图片预览模态框功能，点击缩略图可查看大图
- 为数量选择器实现加减功能

## 5. 消费电子产品网页特性
- 产品展示区需突出产品图片和核心卖点
- 价格区域需清晰展示优惠价格、原价和促销信息
- 产品参数部分应使用表格形式清晰展示
- 用户评价部分应包含评分、用户头像、评价内容和图片
- 所有按钮和交互元素都应具有明确的视觉反馈

## 6. 代码可维护性和可扩展性
- 所有CSS类名和ID应具有描述性，易于理解
- 所有JavaScript代码应组织良好，函数命名清晰，添加必要的注释
- 避免冗余代码，遵循DRY原则
- 使用Font Awesome或其他图标库提供高质量图标

请确保生成的代码可以直接运行，无需额外修改。`;

// 创建保存响应的目录
const responsesDir = path.join(__dirname, '../../responses');
if (!fs.existsSync(responsesDir)) {
  fs.mkdirSync(responsesDir, { recursive: true });
}

// 保存助手响应到JSON文件
const saveAssistantResponse = async (
  userMessage: string,
  assistantResponse: string,
  config?: { saveRawResponse?: boolean }
): Promise<void> => {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    
    // 从用户消息中提取关键词
    let keywords = userMessage
      .replace(/^请创建|^创建|^生成|^设计|^开发|^实现|^构建|^制作|^编写|^帮我|^我需要|^需要/g, '')
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 1)
      .slice(0, 5)
      .join('-')
      .replace(/[^\w\-]/g, '')
      .toLowerCase();
    
    // 如果没有足够的关键词，使用默认名称
    if (!keywords) {
      keywords = 'response';
    }
    
    // 生成文件名
    const fileName = `${keywords}-${timestamp}.json`;
    const filePath = path.join(responsesDir, fileName);
    
    // 提取纯HTML部分
    let extractedHtml = '';
    const htmlRegex = /```html\s*([\s\S]*?)\s*```/;
    const match = htmlRegex.exec(assistantResponse);
    
    if (match && match[1]) {
      extractedHtml = match[1];
    }
    
    // 准备响应数据
    const responseData = {
      userMessage,
      assistantResponse: assistantResponse, // 保留原始格式，包括换行符
      code: extractedHtml, // 添加单独的code字段
      timestamp,
    };
    
    // 处理JSON字符串中的等号
    const jsonString = JSON.stringify(responseData, null, 2);
    
    // 保存到文件
    fs.writeFileSync(filePath, jsonString, 'utf8');
    console.log(`响应已保存到: ${filePath}`);
  } catch (error) {
    console.error('保存响应失败:', error);
  }
};

// 创建OpenAI客户端实例
const createOpenAIClient = () => {
  const apiKey = process.env.ARK_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  
  if (!apiKey) {
    throw new Error('ARK_API_KEY 未配置');
  }
  
  return new OpenAI({
    apiKey,
    baseURL,
  });
};

// 使用续写模式(Prefill Response)生成大文件的函数
const sendMessageWithChunkedGeneration = async (
  userMessage: string,
  systemPrompt: string,
  useDeepThinking: boolean = true
): Promise<string> => {
  try {
    const openai = createOpenAIClient();
    
    // 构建消息列表，确保包含系统提示词
const messages = [
  { role: 'system' as const, content: systemPrompt },
  { role: 'user' as const, content: userMessage },
  { role: 'assistant' as const, content: '' } // 空的assistant消息，用于续写模式
];
    
    // 保存完整的生成内容
    let fullGeneratedContent = '';
    
    // 选择模型，始终使用ep系列模型
    const model = 'ep-20250728192938-68tdn';
    
    // 初始化循环计数器和配置
    let loopCount = 0;
    const maxLoops = 20; // 设置最大循环次数，防止死循环
    let isFirstChunk = true;
    
    // 发送第一个请求 - 使用流式输出
      let completion = await openai.chat.completions.create({
        messages: messages,
        model: model,
        max_tokens: 32768, // API最大限制
        temperature: 0.7,
        stream: true, // 开启流式输出
      }, {
        timeout: 1800000, // 30分钟超时
      });
    
    // 循环生成内容，直到完成或达到最大循环次数
    while (true) {
      loopCount++;
      
      // 处理流式响应
      let currentChunk = '';
      let finishReason = null;
      let gotContent = false;
      
      try {
        for await (const part of completion) {
          if (part.choices && part.choices.length > 0) {
            const delta = part.choices[0].delta;
            const content = delta?.content || '';
            
            if (content) {
              // 保存内容
              currentChunk += content;
              gotContent = true;
              // 实时输出到控制台
              process.stdout.write(content);
              // 通过WebSocket实时发送到前端
              io.emit('code_chunk', { content });
            }
            
            // 检查是否有finish_reason
            if (part.choices[0].finish_reason) {
              finishReason = part.choices[0].finish_reason;
            }
          }
        }
      } catch (streamError) {
        console.error('流式处理错误:', streamError instanceof Error ? streamError.message : String(streamError));
      }
      
      // 添加当前块到完整内容
      fullGeneratedContent += currentChunk;
      messages[messages.length - 1].content += currentChunk; // 更新续写内容
      
      isFirstChunk = false;
      
      // 如果是第一次且响应为空，可能是模型需要更多指令
      if (loopCount === 1 && !gotContent) {
        messages[messages.length - 1].content = ''; // 清空续写内容
        messages[messages.length - 2].content += '\n\n请详细生成完整的代码内容。'; // 添加更明确的指令
        completion = await openai.chat.completions.create({
            messages: messages,
            model: model,
            max_tokens: 32768,
            temperature: 0.7,
            stream: true, // 开启流式输出
          }, {
            timeout: 1800000,
          });
        continue;
      }
      
      // 如果不是因为长度限制结束，并且内容不为空，则认为生成完成
      if (finishReason !== 'length' && currentChunk.trim() !== '') {
        break;
      }
      
      // 如果达到最大循环次数，停止生成
      if (loopCount >= maxLoops) {
        console.log(`\n警告：已达到最大循环次数 ${maxLoops}，停止生成内容`);
        break;
      }
      
      // 如果没有获取到任何内容，停止生成
      if (!gotContent) {
        console.log('\n无法获取有效响应，停止生成内容。');
        break;
      }
      
      // 继续生成下一部分
      console.log(`\n继续生成更多内容...（第${loopCount}轮）`);
      completion = await openai.chat.completions.create({
          messages: messages,
          model: model,
          max_tokens: 32768,
          temperature: 0.7,
          stream: true, // 开启流式输出
        }, {
          timeout: 1800000,
        });
    }
    
    // 保存响应
    await saveAssistantResponse(userMessage, fullGeneratedContent);
    
    return fullGeneratedContent;
  } catch (error) {
    console.error('分块生成过程中出错:', error);
    throw error;
  }
};

// 发送消息到API（非流式）
const sendMessageToAPI = async (
  userMessage: string,
  systemPrompt: string,
  useDeepThinking: boolean = true
): Promise<string> => {
  try {
    const openai = createOpenAIClient();
    
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userMessage },
    ];
    
    // 选择模型，始终使用ep系列模型
    const model = 'ep-20250728192938-68tdn';
    
    const response = await openai.chat.completions.create({
      messages: messages,
      model: model,
      max_tokens: 32768,
      temperature: 0.7,
    }, {
      timeout: 1800000, // 30分钟超时
    });
    
    if (!response || !response.choices || response.choices.length === 0 || !response.choices[0].message.content) {
      throw new Error('API 响应格式无效');
    }
    
    const assistantResponse = response.choices[0].message.content;
    
    // 保存响应
    await saveAssistantResponse(userMessage, assistantResponse);
    
    return assistantResponse;
  } catch (error) {
    console.error('调用API失败:', error);
    throw error;
  }
};

// 启动代码生成任务
router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const data: GenerateRequest = req.body;
    const { 
      description, 
      components = [], 
      style = 'modern', 
      useChunkedOutput = true, 
      useDeepThinking = true 
    } = data;
    
    // 构建用户消息
    let userMessage = `需求描述：${description}`;
    if (components && components.length > 0) {
      userMessage += `\n组件列表：${components.join(', ')}`;
    }
    if (style) {
      userMessage += `\n设计风格：${style}`;
    }
    userMessage += `\n请使用HTML、CSS和JavaScript创建一个符合要求的单页应用。确保代码完整、可运行。`;
    
    // 立即返回成功响应给前端
    res.json({
      success: true,
      message: '代码生成任务已启动，将在控制台输出并保存为JSON文件',
    });
    
    // 异步处理代码生成
    setTimeout(async () => {
      try {
        // 定义代码生成函数，根据配置选择不同的方法
        const generateCode = async () => {
          if (useChunkedOutput) {
            return await sendMessageWithChunkedGeneration(userMessage, systemPrompt, useDeepThinking);
          } else {
            return await sendMessageToAPI(userMessage, systemPrompt, useDeepThinking);
          }
        };
        
        // 执行生成，并获取完整响应内容
        const fullResponse = await generateCode();
        console.log('代码生成完成并已保存为JSON文件');
        
        // 从完整响应中提取纯HTML代码部分
        let extractedHtml = '';
        const htmlRegex = /```html\s*([\s\S]*?)\s*```/;
        const match = htmlRegex.exec(fullResponse);
        
        if (match && match[1]) {
          extractedHtml = match[1];
        } else {
          // 如果没有找到```html标记，尝试使用普通的```标记
          const generalCodeRegex = /```\s*([\s\S]*?)\s*```/;
          const generalMatch = generalCodeRegex.exec(fullResponse);
          if (generalMatch && generalMatch[1]) {
            extractedHtml = generalMatch[1];
          }
        }
        
        // 通过WebSocket发送生成完成的信号和完整代码内容
        io.emit('generation_complete', {
          success: true,
          message: '代码生成已完成',
          fullResponse: fullResponse,
          code: extractedHtml
        });
      } catch (error) {
        console.error('代码生成失败:', error);
        // 发送错误信息给前端
        io.emit('generation_complete', {
          success: false,
          message: error instanceof Error ? error.message : '代码生成失败'
        });
      }
    }, 1000);
  } catch (error) {
    console.error('启动生成任务失败:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '启动生成任务失败',
    });
  }
});

export { router as generateRouter };
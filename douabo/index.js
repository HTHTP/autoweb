import OpenAI from 'openai';
import readline from 'readline';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 加载环境变量
dotenv.config();

// 创建OpenAI客户端实例
const openai = new OpenAI({
  apiKey: process.env.ARK_API_KEY,
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

// 创建readline接口用于用户输入
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 对话历史记录
let conversationHistory = [];

// 配置选项
let config = {
  useDeepThinking: true, // 是否使用深度思考模式
  useStreaming: true,    // 是否使用流式输出
  useChunkedOutput: true, // 是否使用续写模式(Prefill Response)（用于生成大文件，突破token限制）
  saveResponses: true,   // 是否保存回答内容
  preserveFormatting: true, // 是否保留原始格式（包括换行符）
  responsesDir: './responses', // 保存回答的目录
  systemPrompt: `你是一个专业的UI/UX设计师和前端开发工程师，能够生成高质量、视觉吸引力强的网页代码。当生成电商详情页时，请严格按照以下要求执行：

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

请确保生成的代码可以直接运行，无需额外修改。`
};

// 确保保存回答的目录存在
if (config.saveResponses) {
  try {
    if (!fs.existsSync(config.responsesDir)) {
      fs.mkdirSync(config.responsesDir, { recursive: true });
    }
  } catch (error) {
    console.error('创建保存目录失败:', error.message);
    config.saveResponses = false; // 如果创建目录失败，禁用保存功能
  }
}

/**
 * 保存助手响应到JSON文件
 * @param {string} userMessage - 用户输入的消息
 * @param {string} assistantMessage - 助手的回复
 * @param {object|null} tokenUsage - token使用量信息
 */
function saveAssistantResponse(userMessage, assistantMessage, tokenUsage = null) {
  if (!config.saveResponses) return;
  
  try {
    // 生成时间戳
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 从用户消息中提取关键词
    let keywords = 'query'; // 默认关键词
    if (userMessage && userMessage.trim()) {
      // 简单的关键词提取：移除常见前缀，取前几个主要词
      const cleanMessage = userMessage
        .replace(/^详细介绍一下|^介绍一下|^详细说明|^说明|^请|^麻烦|^帮我|^我想|^关于|^给我|^讲解|^解释|^什么是|^什么叫|^请告诉我|^我想问|^请问/gi, '')
        .trim();
      
      if (cleanMessage) {
        // 取前3-5个词作为关键词（根据实际情况调整）
        const words = cleanMessage.split(/\s+/);
        keywords = words.slice(0, Math.min(words.length, 5)).join('-');
        // 移除特殊字符
        keywords = keywords.replace(/[^\u4e00-\u9fa5a-zA-Z0-9-]/g, '');
      }
    }
    
    // 生成文件名：关键词-时间戳.json
    const fileName = `${keywords}-${timestamp}-response.json`;
    const filePath = path.join(config.responsesDir, fileName);
    
    // 准备要保存的数据，确保去除所有换行符
    const responseData = {
      timestamp: new Date().toISOString(),
      userMessage: userMessage,
      assistantMessage: assistantMessage.replace(/\n\s*/g, ' ').replace(/\s+/g, ' '),
      model: config.useDeepThinking ? 'doubao-seed-1-6-250615' : 'ep-20250728192938-68tdn',
      tokenUsage: tokenUsage
    };
    
    // 将对象转换为JSON字符串，确保等号被正确转义
    let jsonString = JSON.stringify(responseData, null, 2);
    // 额外处理等号的转义
    jsonString = jsonString.replace(/=/g, '\\u003d');
    
    // 保存为JSON文件
    fs.writeFileSync(filePath, jsonString, 'utf8');
    console.log(`\n回答已保存至: ${filePath}`);
  } catch (error) {
    console.error('保存回答失败:', error.message);
  }
}

/**
 * 向API发送消息并获取响应（非流式）
 * @param {string} userMessage - 用户输入的消息
 * @param {boolean} useDeepThinking - 是否使用深度思考模式
 * @returns {Promise<string>} - API的回复
 */
async function sendMessageToAPI(userMessage, useDeepThinking = config.useDeepThinking) {
  try {
    // 添加用户消息到对话历史
    const userMessageObj = { role: 'user', content: userMessage };
    conversationHistory.push(userMessageObj);

    // 准备消息列表，确保包含系统提示词
    const messages = [
      { role: 'system', content: config.systemPrompt },
      ...conversationHistory
    ];

    const response = await openai.chat.completions.create({
      messages: messages,
      model: useDeepThinking ? 'doubao-seed-1-6-250615' : 'ep-20250728192938-68tdn',
      max_tokens: 32768, // API最大限制为32768
      temperature: 0.7,
      timeout: 1800000, // 30分钟超时，避免深度思考任务因超时而失败
    });

    // 检查响应格式并返回内容
    if (response && response.choices && response.choices.length > 0) {
      let assistantMessage = response.choices[0].message.content;
      
      // 添加助手回复到对话历史
      conversationHistory.push({ role: 'assistant', content: assistantMessage });
      
      // 如果对话历史过长，保留最近的几轮对话
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-10);
      }
      
      // 输出token使用量信息
      let tokenUsage = null;
      if (response.usage) {
        tokenUsage = {
          prompt_tokens: response.usage.prompt_tokens || 0,
          completion_tokens: response.usage.completion_tokens || 0,
          total_tokens: response.usage.total_tokens || 0
        };
        console.log(`\nToken使用量: ${JSON.stringify(tokenUsage)}`);
      }
      
      // 根据配置决定是否保留格式
      let formattedAssistantMessage = assistantMessage;
      if (!config.preserveFormatting) {
        // 去除换行符，方便复制代码
        formattedAssistantMessage = assistantMessage.replace(/\n\s*/g, ' ').replace(/\s+/g, ' ');
      }
      
      // 保存回答内容和token使用量
      saveAssistantResponse(userMessage, formattedAssistantMessage, tokenUsage);
      
      // 在终端显示处理后的内容
      if (!config.preserveFormatting) {
        console.log(formattedAssistantMessage);
      }
      
      return formattedAssistantMessage;
    } else {
      throw new Error('无效的API响应');
    }
  } catch (error) {
    console.error('API调用错误:', error.message);
    // 移除最后添加的用户消息，因为调用失败了
    if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === 'user') {
      conversationHistory.pop();
    }
    return '抱歉，处理您的请求时出错了。';
  }
}

/**
 * 流式发送消息到API并获取响应
 * @param {string} userMessage - 用户输入的消息
 * @param {boolean} useDeepThinking - 是否使用深度思考模式
 */
async function sendMessageToAPIWithStreaming(userMessage, useDeepThinking = config.useDeepThinking) {
  try {
    // 添加用户消息到对话历史
    const userMessageObj = { role: 'user', content: userMessage };
    conversationHistory.push(userMessageObj);

    // 显示正在思考的提示
    process.stdout.write('Doubao: ');
    
    let fullResponse = '';
    // 准备消息列表，确保包含系统提示词
    const messages = [
      { role: 'system', content: config.systemPrompt },
      ...conversationHistory
    ];
    const stream = await openai.chat.completions.create({
      messages: messages,
      model: useDeepThinking ? 'doubao-seed-1-6-250615' : 'ep-20250728192938-68tdn',
      max_tokens: 32768, // API最大限制为32768
      temperature: 0.7,
      stream: true,
      timeout: 1800000, // 30分钟超时
    });

    // 处理流式输出
    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0 && chunk.choices[0].delta?.content) {
        let content = chunk.choices[0].delta.content;
        
        // 根据配置决定是否保留格式
        if (!config.preserveFormatting) {
          // 去除换行符，方便复制代码
          content = content.replace(/\n\s*/g, ' ').replace(/\s+/g, ' ');
          process.stdout.write(content);
          fullResponse += content; // 保存去除换行符的内容
        } else {
          process.stdout.write(content);
          fullResponse += content; // 保持代码一致性，直接使用处理后的content
        }
      }
    }
    
    console.log(); // 换行
    
    // 添加助手回复到对话历史
    conversationHistory.push({ role: 'assistant', content: fullResponse });
    
    // 如果对话历史过长，保留最近的几轮对话
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }
    
    // 输出token使用量信息 - 流式响应没有直接的usage信息，这里我们使用估算值
    // 一个中文大约是2个token，一个英文单词大约是1.3个token
    const estimatedTokens = {
      prompt_tokens: Math.ceil(conversationHistory.map(msg => msg.content).join('').length * 0.75),
      completion_tokens: Math.ceil(fullResponse.length * 0.75),
      total_tokens: Math.ceil((conversationHistory.map(msg => msg.content).join('').length + fullResponse.length) * 0.75)
    };
    console.log(`\nToken使用量估算: ${JSON.stringify(estimatedTokens)}`);
    
    // 保存回答内容和token使用量
    saveAssistantResponse(userMessage, fullResponse, estimatedTokens);
  } catch (error) {
    console.error('\nAPI调用错误:', error.message);
    // 移除最后添加的用户消息，因为调用失败了
    if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === 'user') {
      conversationHistory.pop();
    }
  }
}

/**
 * 使用续写模式(Prefill Response)生成大文件的函数
 * 基于豆包API文档中推荐的方法，通过检查finish_reason来突破最大token限制
 * @param {string} userMessage - 用户输入的消息
 * @param {boolean} useDeepThinking - 是否使用深度思考模式
 * @returns {Promise<string>} - 完整的生成内容
 */
async function sendMessageWithChunkedGeneration(userMessage, useDeepThinking = config.useDeepThinking) {
  try {
    // 简化提示信息，让用户更直接地看到流式输出
    process.stdout.write('Doubao: ');
    
    // 添加用户消息到对话历史
    conversationHistory.push({ role: 'user', content: userMessage });
    
    // 构建消息列表，确保包含系统提示词，并设置空assistant消息以便使用续写模式
    const messages = [
      { role: 'system', content: config.systemPrompt },
      ...conversationHistory,
      { role: 'assistant', content: '' } // 空的assistant消息，用于续写模式
    ];
    
    // 保存完整的生成内容
    let fullGeneratedContent = '';
    
    // 选择模型
    const model = useDeepThinking ? 'doubao-seed-1-6-250615' : 'ep-20250728192938-68tdn';
    
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
              // 实时显示内容并保存格式化后的内容
              let displayContent = content;
              let processedContent = content;
              if (!config.preserveFormatting) {
                // 去除换行符，方便复制代码
                displayContent = content.replace(/\n\s*/g, ' ').replace(/\s+/g, ' ');
                processedContent = displayContent;
              }
              process.stdout.write(displayContent);
              currentChunk += processedContent; // 只保存处理后的内容
              
              gotContent = true;
            }
            
            // 检查是否有finish_reason
            if (part.choices[0].finish_reason) {
              finishReason = part.choices[0].finish_reason;
            }
          }
        }
      } catch (streamError) {
        console.error('流式处理错误:', streamError.message);
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
      // 清除正在思考的提示并继续使用流式输出
      process.stdout.write('Doubao: ');
      completion = await openai.chat.completions.create({
        messages: messages,
        model: model,
        max_tokens: 32768,
        temperature: 0.7,
        stream: true, // 开启流式输出
        timeout: 1800000,
      });
    }
    
    // 添加助手回复到对话历史
    conversationHistory.push({ role: 'assistant', content: fullGeneratedContent });
    
    // 如果对话历史过长，保留最近的几轮对话
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }
    
    // 输出token使用量信息 - 续写模式使用估算值
    const estimatedTokens = {
      prompt_tokens: Math.ceil(conversationHistory.map(msg => msg.content).join('').length * 0.75),
      completion_tokens: Math.ceil(fullGeneratedContent.length * 0.75),
      total_tokens: Math.ceil((conversationHistory.map(msg => msg.content).join('').length + fullGeneratedContent.length) * 0.75)
    };
    console.log(`\nToken使用量估算: ${JSON.stringify(estimatedTokens)}`);
    
    // 保存回答内容和token使用量
    saveAssistantResponse(userMessage, fullGeneratedContent, estimatedTokens);
    
    return fullGeneratedContent;
  } catch (error) {
    console.error('分块生成过程中出错:', error.message);
    return '抱歉，处理您的请求时出错了。';
  }
}

/**
 * 主程序函数，处理用户输入和API交互
 */
async function main() {
  // 检查API密钥是否设置
  if (!process.env.ARK_API_KEY) {
    console.error('错误: 未设置ARK_API_KEY环境变量。请在.env文件中配置您的API密钥。');
    console.log('您可以复制.env.example并重命名为.env，然后填入您的API密钥。');
    rl.close();
    return;
  }

  console.log('欢迎使用Doubao API客户端！');
  console.log('可用命令:');
  console.log('  exit           - 退出程序');
  console.log('  stream on      - 开启流式输出');
  console.log('  stream off     - 关闭流式输出');
  console.log('  deep on        - 开启深度思考模式');
  console.log('  deep off       - 关闭深度思考模式');
  console.log('  chunked on     - 开启续写模式(Prefill Response)（用于生成大文件，突破token限制）');
  console.log('  chunked off    - 关闭续写模式');
  console.log('  save on        - 开启保存回答功能');
  console.log('  save off       - 关闭保存回答功能');
  console.log('  format on      - 保留原始格式（包括换行符）');
  console.log('  format off     - 去除换行符，方便复制代码');
  console.log('  clear          - 清除对话历史');
  console.log('  status         - 显示当前配置状态');
  console.log('  prompt show    - 显示当前系统提示词');
  console.log('  prompt update <提示词> - 更新系统提示词');
  console.log('输入您的问题开始对话...');
  console.log();

  // 显示当前状态
  function showStatus() {
    console.log('当前状态:');
    console.log(`  流式输出: ${config.useStreaming ? '开启' : '关闭'}`);
    console.log(`  深度思考: ${config.useDeepThinking ? '开启' : '关闭'}`);
    console.log(`  续写模式: ${config.useChunkedOutput ? '开启' : '关闭'}`);
    console.log(`  保存回答: ${config.saveResponses ? '开启' : '关闭'}`);
    console.log(`  保留格式: ${config.preserveFormatting ? '开启' : '关闭'}`);
    console.log(`  对话轮次: ${conversationHistory.length / 2}`);
    console.log('  系统提示词: 已设置');
  }

  // 递归函数处理用户输入
  async function processUserInput() {
    rl.question('您: ', async (userInput) => {
      // 处理控制命令 - 移除首尾空格并转换为小写以增强鲁棒性
      const normalizedInput = userInput.trim().toLowerCase();
      
      if (normalizedInput === 'exit') {
        console.log('程序已退出，再见！');
        rl.close();
        return;
      } else if (normalizedInput === 'stream on') {
        config.useStreaming = true;
        console.log('已开启流式输出');
        processUserInput();
        return;
      } else if (normalizedInput === 'stream off') {
        config.useStreaming = false;
        console.log('已关闭流式输出');
        processUserInput();
        return;
      } else if (normalizedInput === 'deep on') {
        config.useDeepThinking = true;
        console.log('已开启深度思考模式（响应时间可能较长）');
        processUserInput();
        return;
      } else if (normalizedInput === 'deep off') {
        config.useDeepThinking = false;
        console.log('已关闭深度思考模式');
        processUserInput();
        return;
      } else if (normalizedInput === 'clear') {
        conversationHistory = [];
        console.log('对话历史已清除');
        processUserInput();
        return;
      } else if (normalizedInput === 'status') {
        showStatus();
        processUserInput();
        return;
      } else if (normalizedInput === 'chunked on') {
        config.useChunkedOutput = true;
        console.log('已开启续写模式(Prefill Response)（用于生成大文件，突破token限制）');
        processUserInput();
        return;
      } else if (normalizedInput === 'chunked off') {
        config.useChunkedOutput = false;
        console.log('已关闭续写模式');
        processUserInput();
        return;
      } else if (normalizedInput === 'save on') {
        // 确保保存回答的目录存在
        try {
          if (!fs.existsSync(config.responsesDir)) {
            fs.mkdirSync(config.responsesDir, { recursive: true });
          }
          config.saveResponses = true;
          console.log('已开启保存回答功能，回答将保存至:', config.responsesDir);
        } catch (error) {
          console.error('创建保存目录失败:', error.message);
        }
        processUserInput();
        return;
      } else if (normalizedInput === 'save off') {
        config.saveResponses = false;
        console.log('已关闭保存回答功能');
        processUserInput();
        return;
      } else if (normalizedInput === 'format on') {
        config.preserveFormatting = true;
        console.log('已开启保留格式功能，输出将包含原始的换行符和格式');
        processUserInput();
        return;
      } else if (normalizedInput === 'format off') {
        config.preserveFormatting = false;
        console.log('已关闭保留格式功能，输出将去除换行符，方便复制代码');
        processUserInput();
        return;
      } else if (normalizedInput === 'prompt show') {
        console.log('\n当前系统提示词:');
        console.log(config.systemPrompt);
        console.log();
        processUserInput();
        return;
      } else if (normalizedInput.startsWith('prompt update')) {
        const newPrompt = userInput.substring('prompt update'.length).trim();
        if (newPrompt) {
          config.systemPrompt = newPrompt;
          console.log('系统提示词已更新。');
        } else {
          console.log('错误: 请提供新的系统提示词。');
        }
        processUserInput();
        return;
      }

      // 显示正在思考的提示
      if (!config.useStreaming) {
        process.stdout.write('Doubao: 正在思考...\r');
      }

      try {
        // 根据配置选择不同的发送方式
        if (config.useChunkedOutput) {
          // 显示正在思考的提示
          process.stdout.write('Doubao: ');
          await sendMessageWithChunkedGeneration(userInput);
          console.log(); // 换行
        } else if (config.useStreaming) {
          await sendMessageToAPIWithStreaming(userInput);
        } else {
          const response = await sendMessageToAPI(userInput);
          // 清除正在思考的提示并显示响应
          process.stdout.write('\r' + ' '.repeat(process.stdout.columns) + '\r');
          // 根据配置决定是否保留格式
          if (!config.preserveFormatting) {
            // 移除换行符和多余的空白
            const formattedResponse = response.replace(/\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
            console.log(`Doubao: ${formattedResponse}`);
          } else {
            console.log(`Doubao: ${response}`);
          }
        }
      } catch (error) {
        console.error('发生错误:', error.message);
      }

      // 继续处理下一个用户输入
      processUserInput();
    });
  }

  // 开始处理用户输入
  processUserInput();
}

// 启动程序
main().catch(error => {
  console.error('程序启动失败:', error);
  rl.close();
});
import OpenAI from 'openai';
import readline from 'readline';
import dotenv from 'dotenv';

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
  useDeepThinking: false, // 是否使用深度思考模式
  useStreaming: false,    // 是否使用流式输出
  useChunkedOutput: false // 是否使用分块输出模式（用于生成大文件）
};

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

    const response = await openai.chat.completions.create({
      messages: conversationHistory,
      model: useDeepThinking ? 'doubao-seed-1-6-250615' : 'ep-20250728192938-68tdn',
      max_tokens: 32768, // API最大限制为32768
      temperature: 0.7,
      timeout: 1800000, // 30分钟超时，避免深度思考任务因超时而失败
    });

    // 检查响应格式并返回内容
    if (response && response.choices && response.choices.length > 0) {
      const assistantMessage = response.choices[0].message.content;
      // 添加助手回复到对话历史
      conversationHistory.push({ role: 'assistant', content: assistantMessage });
      
      // 如果对话历史过长，保留最近的几轮对话
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-10);
      }
      
      return assistantMessage;
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
    const stream = await openai.chat.completions.create({
      messages: conversationHistory,
      model: useDeepThinking ? 'doubao-seed-1-6-250615' : 'ep-20250728192938-68tdn',
      max_tokens: 32768, // API最大限制为32768
      temperature: 0.7,
      stream: true,
      timeout: 1800000, // 30分钟超时
    });

    // 处理流式输出
    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0 && chunk.choices[0].delta?.content) {
        const content = chunk.choices[0].delta.content;
        process.stdout.write(content);
        fullResponse += content;
      }
    }
    
    console.log(); // 换行
    
    // 添加助手回复到对话历史
    conversationHistory.push({ role: 'assistant', content: fullResponse });
    
    // 如果对话历史过长，保留最近的几轮对话
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }
  } catch (error) {
    console.error('\nAPI调用错误:', error.message);
    // 移除最后添加的用户消息，因为调用失败了
    if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === 'user') {
      conversationHistory.pop();
    }
  }
}

/**
 * 分块生成大文件的函数
 * @param {string} userMessage - 用户输入的消息
 * @param {boolean} useDeepThinking - 是否使用深度思考模式
 * @returns {Promise<string>} - 完整的生成内容
 */
async function sendMessageWithChunkedGeneration(userMessage, useDeepThinking = config.useDeepThinking) {
  try {
    console.log('正在使用分块输出模式生成大文件...');
    console.log('这可能需要一些时间，请耐心等待...');
    
    // 保存完整的生成内容
    let fullGeneratedContent = '';
    
    // 第一轮：请求生成文件结构和前一部分
    let currentChunk = 1;
    let continueGenerating = true;
    
    // 第一轮的消息
    const initialMessages = [
      ...conversationHistory,
      {
        role: 'user',
        content: `${userMessage}\n\n请生成此代码。由于内容可能很长，我将使用分块模式接收。请先返回文件结构和前2000个字符的代码内容，不要在最后说"请告诉我是否需要继续"之类的话。`
      }
    ];
    
    // 发送第一轮请求
    console.log(`正在生成第${currentChunk}部分...`);
    const firstResponse = await openai.chat.completions.create({
      messages: initialMessages,
      model: useDeepThinking ? 'doubao-seed-1-6-250615' : 'ep-20250728192938-68tdn',
      max_tokens: 32768, // API最大限制
      temperature: 0.7,
      timeout: 1800000, // 30分钟超时
    });
    
    // 获取第一轮响应
    if (firstResponse && firstResponse.choices && firstResponse.choices.length > 0) {
      const firstPart = firstResponse.choices[0].message.content;
      fullGeneratedContent = firstPart;
      console.log(firstPart);
    }
    
    // 循环生成后续部分，直到内容完成
    while (continueGenerating) {
      currentChunk++;
      console.log(`\n正在生成第${currentChunk}部分...`);
      
      // 请求下一部分
      const nextResponse = await openai.chat.completions.create({
        messages: [
          ...initialMessages,
          { role: 'assistant', content: fullGeneratedContent },
          {
            role: 'user',
            content: `请继续生成剩余内容，从上一部分结束的地方开始，不要重复已经生成的内容。`
          }
        ],
        model: useDeepThinking ? 'doubao-seed-1-6-250615' : 'ep-20250728192938-68tdn',
        max_tokens: 32768,
        temperature: 0.7,
        timeout: 1800000,
      });
      
      // 处理下一部分响应
      if (nextResponse && nextResponse.choices && nextResponse.choices.length > 0) {
        const nextPart = nextResponse.choices[0].message.content;
        
        // 检查是否还有更多内容可生成
        if (nextPart.includes('生成完毕') || nextPart.includes('已经完成') || 
            nextPart.includes('没有更多内容') || nextPart.length < 500) {
          continueGenerating = false;
        }
        
        // 添加到完整内容
        fullGeneratedContent += nextPart;
        console.log(nextPart);
      } else {
        continueGenerating = false;
      }
    }
    
    console.log('\n文件生成完成！');
    
    // 添加完整对话到历史记录
    conversationHistory.push({ role: 'user', content: userMessage });
    conversationHistory.push({ role: 'assistant', content: fullGeneratedContent });
    
    // 如果对话历史过长，保留最近的几轮对话
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }
    
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
  console.log('  chunked on     - 开启分块输出模式（用于生成大文件）');
  console.log('  chunked off    - 关闭分块输出模式');
  console.log('  clear          - 清除对话历史');
  console.log('  status         - 显示当前配置状态');
  console.log('输入您的问题开始对话...');
  console.log();

  // 显示当前状态
  function showStatus() {
    console.log('当前状态:');
    console.log(`  流式输出: ${config.useStreaming ? '开启' : '关闭'}`);
    console.log(`  深度思考: ${config.useDeepThinking ? '开启' : '关闭'}`);
    console.log(`  分块输出: ${config.useChunkedOutput ? '开启' : '关闭'}`);
    console.log(`  对话轮次: ${conversationHistory.length / 2}`);
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
        console.log('已开启分块输出模式（用于生成大文件）');
        processUserInput();
        return;
      } else if (normalizedInput === 'chunked off') {
        config.useChunkedOutput = false;
        console.log('已关闭分块输出模式');
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
          await sendMessageWithChunkedGeneration(userInput);
        } else if (config.useStreaming) {
          await sendMessageToAPIWithStreaming(userInput);
        } else {
          const response = await sendMessageToAPI(userInput);
          // 清除正在思考的提示并显示响应
          process.stdout.write('\r' + ' '.repeat(process.stdout.columns) + '\r');
          console.log(`Doubao: ${response}`);
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
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
  useDeepThinking: true, // 是否使用深度思考模式
  useStreaming: true,    // 是否使用流式输出
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
      max_tokens: 200000, // 深度思考模型可能需要更多token
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
      max_tokens: 2000,
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
  console.log('  clear          - 清除对话历史');
  console.log('  status         - 显示当前配置状态');
  console.log('输入您的问题开始对话...');
  console.log();

  // 显示当前状态
  function showStatus() {
    console.log('当前状态:');
    console.log(`  流式输出: ${config.useStreaming ? '开启' : '关闭'}`);
    console.log(`  深度思考: ${config.useDeepThinking ? '开启' : '关闭'}`);
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
      }

      // 显示正在思考的提示
      if (!config.useStreaming) {
        process.stdout.write('Doubao: 正在思考...\r');
      }

      try {
        // 根据配置选择不同的发送方式
        if (config.useStreaming) {
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
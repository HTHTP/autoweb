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

/**
 * 向API发送消息并获取响应
 * @param {string} userMessage - 用户输入的消息
 * @returns {Promise<string>} - API的回复
 */
async function sendMessageToAPI(userMessage) {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ],
      model: 'ep-20250728192938-68tdn',
      max_tokens: 1000,
      temperature: 0.7
    });

    // 检查响应格式并返回内容
    if (response && response.choices && response.choices.length > 0) {
      return response.choices[0].message.content;
    } else {
      throw new Error('无效的API响应');
    }
  } catch (error) {
    console.error('API调用错误:', error.message);
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

  console.log('欢迎使用Doubao API客户端！输入您的问题，输入"exit"退出程序。');

  // 递归函数处理用户输入
  async function processUserInput() {
    rl.question('您: ', async (userInput) => {
      // 检查是否退出程序
      if (userInput.toLowerCase() === 'exit') {
        console.log('程序已退出，再见！');
        rl.close();
        return;
      }

      // 显示正在思考的提示
      process.stdout.write('Doubao: 正在思考...\r');

      try {
        // 发送消息到API并获取响应
        const response = await sendMessageToAPI(userInput);
        console.log(`Doubao: ${response}`);
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
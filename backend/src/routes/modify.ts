import express from 'express';
import axios from 'axios';
import { errorResponse, successResponse } from '../utils/responseUtils';
import { saveToJsonFile, generateTimestampFilename, extractKeywords } from '../utils/fileUtils';
import path from 'path';

const router = express.Router();

// 定义请求接口
export interface ModifyRequest {
  currentCode: string;
  modification: string;
}

// 系统提示词配置
const systemPrompt = `
你是一名顶级的前端工程师，擅长修改和优化现有代码。

你的任务是根据用户提供的当前代码和修改要求，对代码进行精确的修改。

### 修改要求：
- 严格按照用户的修改要求进行修改
- 保持原有代码的结构和风格
- 只修改必要的部分，不做额外的优化或改动
- 确保修改后的代码可以正常运行
- 不添加用户要求之外的功能

### 技术栈要求：
- React 18
- Tailwind CSS v3
- Font Awesome 图标
- 响应式设计

请根据以上要求，对用户提供的代码进行精确修改。
`;

// 发送消息到API进行代码修改
const sendModifyRequestToAPI = async (
  currentCode: string,
  modification: string
): Promise<string> => {
  try {
    const apiKey = process.env.ARK_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.ark.cn/v1';
    
    if (!apiKey) {
      throw new Error('ARK_API_KEY 未配置');
    }
    
    // 构建用户消息
    const userMessage = `
当前代码：
${currentCode}

修改要求：
${modification}

请根据修改要求对当前代码进行修改，只返回修改后的完整代码，不要添加任何额外的说明文字。
`;
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];
    
    const response = await axios.post(
      `${baseURL}/chat/completions`,
      {
        model: 'gpt-4',
        messages,
        max_tokens: 32768,
        temperature: 0.7,
        timeout: 1800000, // 30分钟超时
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
    
    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      throw new Error('API 响应格式无效');
    }
    
    const modifiedCode = response.data.choices[0].message.content;
    
    // 保存修改历史
    const responsesDir = path.join(__dirname, '../../responses');
    const keywords = extractKeywords(modification, 3);
    const fileName = generateTimestampFilename(`modified-${keywords}`, 'json');
    const filePath = path.join(responsesDir, fileName);
    
    saveToJsonFile(filePath, {
      originalCode: currentCode,
      modificationRequest: modification,
      modifiedCode,
      timestamp: new Date().toISOString(),
    });
    
    return modifiedCode;
  } catch (error) {
    console.error('调用修改API失败:', error);
    throw error;
  }
};

// 修改代码接口
router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const data: ModifyRequest = req.body;
    const { currentCode, modification } = data;
    
    if (!currentCode || !modification) {
      return errorResponse(res, '当前代码和修改要求不能为空');
    }
    
    console.log('开始修改代码请求...');
    const modifiedCode = await sendModifyRequestToAPI(currentCode, modification);
    
    console.log('代码修改成功');
    return successResponse(res, {
      code: modifiedCode,
      message: '代码修改成功',
    });
  } catch (error) {
    console.error('修改代码失败:', error);
    return errorResponse(
      res,
      error instanceof Error ? error.message : '修改代码失败',
      500
    );
  }
});

export { router as modifyRouter };
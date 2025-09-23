import fs from 'fs';
import path from 'path';

/**
 * 确保目录存在，如果不存在则创建
 */
export const ensureDirectoryExists = (directoryPath: string): void => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

/**
 * 保存数据到JSON文件
 * @param filePath 文件路径
 * @param data 要保存的数据
 * @param prettyPrint 是否格式化输出
 */
export const saveToJsonFile = <T>(
  filePath: string,
  data: T,
  prettyPrint: boolean = true
): void => {
  try {
    // 确保目录存在
    const directoryPath = path.dirname(filePath);
    ensureDirectoryExists(directoryPath);
    
    // 处理JSON字符串中的等号
    const jsonString = JSON.stringify(data, null, prettyPrint ? 2 : 0).replace(/=/g, '\\u003d');
    
    // 保存文件
    fs.writeFileSync(filePath, jsonString, 'utf8');
    console.log(`数据已保存到: ${filePath}`);
  } catch (error) {
    console.error(`保存文件失败: ${filePath}`, error);
    throw error;
  }
};

/**
 * 从JSON文件读取数据
 * @param filePath 文件路径
 * @returns 解析后的数据
 */
export const readFromJsonFile = <T>(filePath: string): T => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }
    
    const jsonString = fs.readFileSync(filePath, 'utf8');
    // 处理JSON字符串中的等号转义
    const unescapedJsonString = jsonString.replace(/\\u003d/g, '=');
    
    return JSON.parse(unescapedJsonString) as T;
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error);
    throw error;
  }
};

/**
 * 生成基于时间戳的文件名
 * @param prefix 文件名前缀
 * @param extension 文件扩展名
 * @returns 生成的文件名
 */
export const generateTimestampFilename = (
  prefix: string = 'response',
  extension: string = 'json'
): string => {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
  return `${prefix}-${timestamp}.${extension}`;
};

/**
 * 从文本中提取关键词
 * @param text 输入文本
 * @param maxCount 最大关键词数量
 * @returns 提取的关键词
 */
export const extractKeywords = (
  text: string,
  maxCount: number = 5
): string => {
  // 移除常见前缀
  let keywords = text
    .replace(/^请创建|^创建|^生成|^设计|^开发|^实现|^构建|^制作|^编写|^帮我|^我需要|^需要/g, '')
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 1)
    .slice(0, maxCount)
    .join('-')
    .replace(/[^\w\-]/g, '')
    .toLowerCase();
  
  // 如果没有足够的关键词，使用默认名称
  if (!keywords) {
    keywords = 'response';
  }
  
  return keywords;
};

/**
 * 获取目录中的JSON文件列表
 * @param directoryPath 目录路径
 * @returns 文件列表信息
 */
export const getDirectoryFiles = (directoryPath: string): Array<{
  filename: string;
  path: string;
  size: number;
  created: Date;
  metadata?: any;
}> => {
  try {
    // 确保目录存在
    if (!fs.existsSync(directoryPath)) {
      return [];
    }
    
    // 读取目录中的所有文件
    const files = fs.readdirSync(directoryPath);
    
    // 过滤出JSON文件并获取详细信息
    return files
      .filter(filename => filename.endsWith('.json'))
      .map(filename => {
        const filePath = path.join(directoryPath, filename);
        const stats = fs.statSync(filePath);
        
        // 尝试读取文件元数据
        let metadata = undefined;
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(fileContent.replace(/\\u003d/g, '='));
          metadata = {
            aiGenerated: true,
            description: data.prompt || data.request || 'AI生成的HTML文件'
          };
        } catch (error) {
          // 无法解析文件内容，跳过元数据提取
          console.warn(`无法读取文件元数据: ${filePath}`, error);
        }
        
        return {
          filename,
          path: filePath,
          size: stats.size,
          created: stats.birthtime,
          metadata
        };
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime()); // 按创建时间降序排列
    
  } catch (error) {
    console.error(`获取目录文件列表失败: ${directoryPath}`, error);
    return [];
  }
};
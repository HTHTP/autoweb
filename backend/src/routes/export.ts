import express from 'express';
import { errorResponse, successResponse } from '../utils/responseUtils';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// 定义请求接口
export interface ExportRequest {
  code: string;
  format?: 'zip' | 'single'; // zip: 导出为压缩包, single: 导出单个文件
  filename?: string; // 自定义文件名
}

// 确保临时目录存在
const tempDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// 清理临时文件
const cleanupTempFiles = () => {
  try {
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      const now = Date.now();
      
      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        const stat = fs.statSync(filePath);
        // 删除24小时前的临时文件
        if (now - stat.mtimeMs > 24 * 60 * 60 * 1000) {
          fs.unlinkSync(filePath);
        }
      });
    }
  } catch (error) {
    console.error('清理临时文件失败:', error);
  }
};

// 定期清理临时文件（每小时执行一次）
setInterval(cleanupTempFiles, 60 * 60 * 1000);

// 从代码中提取HTML和CSS内容
const extractCodeContents = (code: string) => {
  // 提取HTML内容（假设代码中包含完整的HTML结构）
  let htmlContent = code;
  
  // 提取CSS内容
  let cssContent = '';
  const cssMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (cssMatch && cssMatch[1]) {
    cssContent = cssMatch[1];
  }
  
  // 提取JavaScript内容
  let jsContent = '';
  const jsMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (jsMatch && jsMatch[1]) {
    jsContent = jsMatch[1];
  }
  
  return {
    htmlContent,
    cssContent,
    jsContent,
  };
};

// 导出代码为单个文件
const exportSingleFile = async (code: string, filename: string): Promise<string> => {
  const filePath = path.join(tempDir, filename);
  
  try {
    fs.writeFileSync(filePath, code, 'utf8');
    return filePath;
  } catch (error) {
    console.error('写入单个文件失败:', error);
    throw error;
  }
};

// 导出代码为压缩包
const exportAsZip = async (code: string, filename: string): Promise<string> => {
  const zipFilePath = path.join(tempDir, `${filename}.zip`);
  
  try {
    // 创建输出流
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // 设置压缩级别
    });
    
    // 处理错误
    output.on('error', (err) => {
      throw err;
    });
    
    // 完成事件
    await new Promise<void>((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      
      // 连接归档和输出流
      archive.pipe(output);
      
      // 提取代码内容
      const { htmlContent, cssContent, jsContent } = extractCodeContents(code);
      
      // 添加HTML文件
      archive.append(htmlContent, { name: 'index.html' });
      
      // 如果有CSS内容，添加CSS文件
      if (cssContent.trim()) {
        archive.append(cssContent, { name: 'styles.css' });
      }
      
      // 如果有JavaScript内容，添加JS文件
      if (jsContent.trim()) {
        archive.append(jsContent, { name: 'script.js' });
      }
      
      // 完成归档
      archive.finalize();
    });
    
    return zipFilePath;
  } catch (error) {
    console.error('创建压缩包失败:', error);
    throw error;
  }
};

// 导出代码接口
router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const data: ExportRequest = req.body;
    const { code, format = 'single', filename = `export-${uuidv4()}` } = data;
    
    if (!code) {
      return errorResponse(res, '代码内容不能为空');
    }
    
    console.log('开始导出代码请求...');
    
    let filePath: string;
    let contentType: string;
    let downloadFilename: string;
    
    if (format === 'zip') {
      // 导出为压缩包
      filePath = await exportAsZip(code, filename);
      contentType = 'application/zip';
      downloadFilename = `${filename}.zip`;
    } else {
      // 导出为单个文件
      const safeFilename = filename.endsWith('.html') ? filename : `${filename}.html`;
      filePath = await exportSingleFile(code, safeFilename);
      contentType = 'text/html';
      downloadFilename = safeFilename;
    }
    
    console.log('代码导出成功');
    
    // 设置响应头，触发文件下载
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    
    // 发送文件
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    // 文件发送完成后删除临时文件
    fileStream.on('end', () => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('删除临时文件失败:', error);
      }
    });
  } catch (error) {
    console.error('导出代码失败:', error);
    return errorResponse(
      res,
      error instanceof Error ? error.message : '导出代码失败',
      500
    );
  }
});

export { router as exportRouter };
import express from 'express';
import path from 'path';
import { getDirectoryFiles } from '../utils/fileUtils';
import { readFromJsonFile } from '../utils/fileUtils';

const router = express.Router();

/**
 * 获取默认目录的JSON文件列表
 * 默认目录: c:\Users\hulzh\Desktop\demo\douabo\backend\responses
 */
router.get('/json-files', (req, res) => {
  try {
    // 默认目录路径
    // 使用相对路径指向backend文件夹下的responses目录
const defaultDirectoryPath = path.join(__dirname, '../../responses');
    
    // 获取目录中的JSON文件列表
    const files = getDirectoryFiles(defaultDirectoryPath);
    
    res.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文件列表失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * 获取指定文件的内容
 */
router.get('/file-content/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    // 使用相对路径指向backend文件夹下的responses目录
    const defaultDirectoryPath = path.join(__dirname, '../../responses');
    
    const filePath = path.join(defaultDirectoryPath, filename);
    
    // 读取文件内容
    const content = readFromJsonFile(filePath);
    
    res.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('读取文件内容失败:', error);
    res.status(404).json({
      success: false,
      message: '文件不存在或无法读取',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export const importRouter = router;
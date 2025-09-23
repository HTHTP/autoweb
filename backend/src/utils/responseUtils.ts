import { Response } from 'express';

/**
 * 成功响应处理函数
 */
export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = '操作成功'
): Response => {
  return res.json({
    success: true,
    message,
    data,
  });
};

/**
 * 错误响应处理函数
 */
export const errorResponse = (
  res: Response,
  message: string = '操作失败',
  statusCode: number = 400,
  error?: any
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

/**
 * 分页响应处理函数
 */
export const paginationResponse = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = '查询成功'
): Response => {
  const totalPages = Math.ceil(total / pageSize);
  
  return res.json({
    success: true,
    message,
    data: {
      items: data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    },
  });
};
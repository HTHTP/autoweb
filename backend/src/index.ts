import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { generateRouter } from './routes/generate.js';
import { modifyRouter } from './routes/modify';
import { exportRouter } from './routes/export';
import { importRouter } from './routes/import';

// 加载环境变量
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5175",
    methods: ["GET", "POST"],
  }
});

const PORT = process.env.PORT || 3000;

// 导出io实例，供其他路由使用
export { io };

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// 路由配置
app.use('/api/generate', generateRouter);
app.use('/api/modify', modifyRouter);
app.use('/api/export', exportRouter);
app.use('/api/import', importRouter);

// 根路径健康检查
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend server is running',
    version: '1.0.0'
  });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// WebSocket连接处理
io.on('connection', (socket: Socket) => {
  console.log('用户已连接:', socket.id);
  
  // 用户断开连接
  socket.on('disconnect', () => {
    console.log('用户已断开连接:', socket.id);
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is running`);
});

export default app;
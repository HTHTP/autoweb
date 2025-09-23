require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 确保dist目录存在
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 启动TypeScript编译并监视文件变化
const tscProcess = spawn('npx', ['tsc', '-w'], {
  stdio: 'inherit',
  shell: true
});

// 启动Node.js并监视dist目录变化
let nodeProcess = null;

// 等待TypeScript编译完成后启动Node.js
setTimeout(() => {
  startNodeProcess();
}, 2000);

// 启动Node.js进程
function startNodeProcess() {
  if (nodeProcess) {
    nodeProcess.kill();
  }
  
  nodeProcess = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });
  
  nodeProcess.on('exit', (code) => {
    console.log(`Node process exited with code ${code}`);
  });
}

// 监听SIGINT信号（Ctrl+C）
process.on('SIGINT', () => {
  console.log('Shutting down development server...');
  if (nodeProcess) {
    nodeProcess.kill();
  }
  tscProcess.kill();
  process.exit(0);
});
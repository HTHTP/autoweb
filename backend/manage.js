#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * 后端项目启动和管理脚本
 */
class ProjectManager {
    constructor() {
        this.projectRoot = __dirname;
        this.processes = new Map();
    }

    /**
     * 检查环境配置
     */
    checkEnvironment() {
        console.log('🔍 检查环境配置...');
        
        // 检查.env文件
        const envPath = path.join(this.projectRoot, '.env');
        if (!fs.existsSync(envPath)) {
            console.error('❌ .env文件不存在，请创建.env文件并配置API密钥');
            return false;
        }

        // 检查必要的依赖
        const packagePath = path.join(this.projectRoot, 'package.json');
        if (!fs.existsSync(packagePath)) {
            console.error('❌ package.json文件不存在');
            return false;
        }

        // 检查node_modules
        const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
        if (!fs.existsSync(nodeModulesPath)) {
            console.warn('⚠️ node_modules不存在，请先运行 npm install');
            return false;
        }

        console.log('✅ 环境配置检查通过');
        return true;
    }

    /**
     * 安装依赖
     */
    async installDependencies() {
        console.log('📦 安装项目依赖...');
        
        return new Promise((resolve, reject) => {
            const npm = spawn('npm', ['install'], {
                cwd: this.projectRoot,
                stdio: 'inherit',
                shell: true
            });

            npm.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ 依赖安装成功');
                    resolve(true);
                } else {
                    console.error('❌ 依赖安装失败');
                    reject(new Error('npm install failed'));
                }
            });

            npm.on('error', (error) => {
                console.error('❌ npm install错误:', error.message);
                reject(error);
            });
        });
    }

    /**
     * 启动开发服务器
     */
    async startDevelopment() {
        console.log('🚀 启动开发服务器...');
        
        const server = spawn('npm', ['run', 'dev'], {
            cwd: this.projectRoot,
            stdio: 'inherit',
            shell: true
        });

        this.processes.set('dev-server', server);

        server.on('close', (code) => {
            console.log(`开发服务器退出，代码: ${code}`);
            this.processes.delete('dev-server');
        });

        server.on('error', (error) => {
            console.error('❌ 开发服务器启动失败:', error.message);
        });

        // 等待服务器启动
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        return server;
    }

    /**
     * 启动生产服务器
     */
    async startProduction() {
        console.log('🚀 启动生产服务器...');
        
        const server = spawn('npm', ['start'], {
            cwd: this.projectRoot,
            stdio: 'inherit',
            shell: true
        });

        this.processes.set('prod-server', server);

        server.on('close', (code) => {
            console.log(`生产服务器退出，代码: ${code}`);
            this.processes.delete('prod-server');
        });

        server.on('error', (error) => {
            console.error('❌ 生产服务器启动失败:', error.message);
        });

        return server;
    }

    /**
     * 运行测试
     */
    async runTests() {
        console.log('🧪 运行后端测试...');
        
        return new Promise((resolve, reject) => {
            const test = spawn('node', ['test-backend.js'], {
                cwd: this.projectRoot,
                stdio: 'inherit',
                shell: true
            });

            test.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ 所有测试通过');
                    resolve(true);
                } else {
                    console.error('❌ 测试失败');
                    resolve(false);
                }
            });

            test.on('error', (error) => {
                console.error('❌ 测试运行错误:', error.message);
                reject(error);
            });
        });
    }

    /**
     * 显示项目状态
     */
    showStatus() {
        console.log('\n📊 项目状态:');
        console.log(`   根目录: ${this.projectRoot}`);
        console.log(`   运行中的进程: ${this.processes.size}`);
        
        for (const [name, process] of this.processes.entries()) {
            console.log(`   - ${name}: PID ${process.pid}`);
        }
        
        // 检查端口占用
        this.checkPorts();
    }

    /**
     * 检查端口占用
     */
    checkPorts() {
        const { spawn } = require('child_process');
        
        // 检查3000端口
        const netstat = spawn('netstat', ['-ano'], { shell: true });
        let output = '';
        
        netstat.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        netstat.on('close', () => {
            const port3000 = output.includes(':3000');
            console.log(`   端口3000: ${port3000 ? '✅ 已占用' : '❌ 未使用'}`);
        });
    }

    /**
     * 清理进程
     */
    cleanup() {
        console.log('🧹 清理进程...');
        
        for (const [name, process] of this.processes.entries()) {
            console.log(`停止 ${name}...`);
            process.kill('SIGTERM');
        }
        
        this.processes.clear();
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        console.log(`
🚀 AI Vue Code Generator 后端管理脚本

使用方法:
  node manage.js <command> [options]

命令:
  install     安装项目依赖
  dev         启动开发服务器 (端口3000)
  start       启动生产服务器
  test        运行后端测试
  status      显示项目状态
  check       检查环境配置
  help        显示此帮助信息

示例:
  node manage.js install       # 安装依赖
  node manage.js dev          # 启动开发服务器
  node manage.js test         # 运行测试

注意:
  - 确保已配置.env文件中的API密钥
  - 开发服务器默认运行在 http://localhost:3000
  - 使用 Ctrl+C 停止服务器
        `);
    }
}

// 主函数
async function main() {
    const manager = new ProjectManager();
    const command = process.argv[2];

    // 设置进程退出处理
    process.on('SIGINT', () => {
        console.log('\n🛑 收到中断信号，正在清理...');
        manager.cleanup();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 收到终止信号，正在清理...');
        manager.cleanup();
        process.exit(0);
    });

    try {
        switch (command) {
            case 'install':
                await manager.installDependencies();
                break;

            case 'dev':
                if (!manager.checkEnvironment()) {
                    process.exit(1);
                }
                console.log('🎯 开发模式启动...');
                await manager.startDevelopment();
                console.log('💡 服务器运行在 http://localhost:3000');
                console.log('🧪 可以运行 "node manage.js test" 测试API');
                console.log('按 Ctrl+C 停止服务器');
                
                // 保持进程运行
                await new Promise(() => {});
                break;

            case 'start':
                if (!manager.checkEnvironment()) {
                    process.exit(1);
                }
                console.log('🎯 生产模式启动...');
                await manager.startProduction();
                console.log('💡 服务器运行在 http://localhost:3000');
                
                // 保持进程运行
                await new Promise(() => {});
                break;

            case 'test':
                const testResult = await manager.runTests();
                process.exit(testResult ? 0 : 1);
                break;

            case 'status':
                manager.showStatus();
                break;

            case 'check':
                const envOk = manager.checkEnvironment();
                process.exit(envOk ? 0 : 1);
                break;

            case 'help':
            case '--help':
            case '-h':
                manager.showHelp();
                break;

            default:
                console.error(`❌ 未知命令: ${command}`);
                console.log('运行 "node manage.js help" 查看可用命令');
                process.exit(1);
        }
    } catch (error) {
        console.error('❌ 执行失败:', error.message);
        process.exit(1);
    }
}

// 运行主函数
if (require.main === module) {
    main();
}

module.exports = ProjectManager;
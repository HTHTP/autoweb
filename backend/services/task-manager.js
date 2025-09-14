const { v4: uuidv4 } = require('uuid');

/**
 * 异步任务管理器
 * 用于管理AI代码生成任务的进度和状态
 */
class TaskManager {
    constructor() {
        this.tasks = new Map(); // 存储任务信息
        this.taskTimeout = 600000; // 10分钟超时
        
        // 定期清理过期任务
        setInterval(() => {
            this.cleanupExpiredTasks();
        }, 60000); // 每分钟清理一次
    }

    /**
     * 创建新任务
     */
    createTask(type, description) {
        const taskId = uuidv4();
        const task = {
            id: taskId,
            type: type, // 'generate' | 'modify'
            description: description,
            status: 'pending',
            progress: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            result: null,
            error: null,
            completed: false
        };

        this.tasks.set(taskId, task);
        console.log(`创建任务: ${taskId} - ${type}`);
        
        // 设置任务超时
        setTimeout(() => {
            this.markTaskTimeout(taskId);
        }, this.taskTimeout);

        return taskId;
    }

    /**
     * 更新任务状态
     */
    updateTaskStatus(taskId, status, progress = null) {
        const task = this.tasks.get(taskId);
        if (!task) {
            console.warn(`任务不存在: ${taskId}`);
            return false;
        }

        task.status = status;
        if (progress !== null) {
            task.progress = Math.min(100, Math.max(0, progress));
        }
        task.updatedAt = new Date();

        console.log(`更新任务状态: ${taskId} - ${status} (${task.progress}%)`);
        return true;
    }

    /**
     * 更新任务（带详细信息）
     */
    updateTask(taskId, status, details = {}) {
        const task = this.tasks.get(taskId);
        if (!task) {
            console.warn(`任务不存在: ${taskId}`);
            return false;
        }

        task.status = status;
        task.updatedAt = new Date();

        // 更新进度
        if (details.progress !== undefined) {
            task.progress = Math.min(100, Math.max(0, details.progress));
        }

        // 更新消息
        if (details.message) {
            task.message = details.message;
        }

        // 更新代码结果
        if (details.code) {
            task.code = details.code;
        }

        // 更新元数据
        if (details.metadata) {
            task.metadata = details.metadata;
        }

        // 更新错误信息
        if (details.error) {
            task.error = details.error;
        }

        // 更新导出路径
        if (details.exportPath) {
            task.exportPath = details.exportPath;
        }

        // 如果状态是完成或失败，标记为已完成
        if (status === 'completed' || status === 'failed') {
            task.completed = true;
            if (status === 'completed' && task.progress < 100) {
                task.progress = 100;
            }
        }

        console.log(`更新任务: ${taskId} - ${status} (${task.progress}%) - ${task.message || ''}`);
        return true;
    }

    /**
     * 标记任务完成
     */
    completeTask(taskId, result, error = null) {
        const task = this.tasks.get(taskId);
        if (!task) {
            console.warn(`任务不存在: ${taskId}`);
            return false;
        }

        task.status = error ? 'failed' : 'completed';
        task.progress = error ? task.progress : 100;
        task.completed = true;
        task.result = result;
        task.error = error;
        task.updatedAt = new Date();

        console.log(`任务完成: ${taskId} - ${task.status}`);
        return true;
    }

    /**
     * 标记任务超时
     */
    markTaskTimeout(taskId) {
        const task = this.tasks.get(taskId);
        if (!task || task.completed) {
            return;
        }

        task.status = 'timeout';
        task.error = '任务执行超时';
        task.completed = true;
        task.updatedAt = new Date();

        console.log(`任务超时: ${taskId}`);
    }

    /**
     * 获取任务信息
     */
    getTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            return null;
        }

        return {
            id: task.id,
            type: task.type,
            status: task.status,
            progress: task.progress,
            completed: task.completed,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            message: task.message,
            code: task.code,
            metadata: task.metadata,
            error: task.error,
            exportPath: task.exportPath
        };
    }

    /**
     * 获取任务进度
     */
    getTaskProgress(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            return {
                success: false,
                error: '任务不存在'
            };
        }

        return {
            success: true,
            status: task.status,
            progress: task.progress,
            completed: task.completed,
            error: task.error,
            result: task.result
        };
    }

    /**
     * 删除任务
     */
    deleteTask(taskId) {
        const deleted = this.tasks.delete(taskId);
        if (deleted) {
            console.log(`删除任务: ${taskId}`);
        }
        return deleted;
    }

    /**
     * 清理过期任务
     */
    cleanupExpiredTasks() {
        const now = new Date();
        const expiredTasks = [];

        for (const [taskId, task] of this.tasks.entries()) {
            const ageMs = now - task.updatedAt;
            const maxAgeMs = task.completed ? 3600000 : this.taskTimeout; // 完成的任务保留1小时，未完成的按超时时间

            if (ageMs > maxAgeMs) {
                expiredTasks.push(taskId);
            }
        }

        expiredTasks.forEach(taskId => {
            this.deleteTask(taskId);
        });

        if (expiredTasks.length > 0) {
            console.log(`清理过期任务: ${expiredTasks.length} 个`);
        }
    }

    /**
     * 获取所有任务统计
     */
    getStats() {
        const stats = {
            total: this.tasks.size,
            pending: 0,
            running: 0,
            completed: 0,
            failed: 0,
            timeout: 0
        };

        for (const task of this.tasks.values()) {
            switch (task.status) {
                case 'pending':
                    stats.pending++;
                    break;
                case 'running':
                case 'processing':
                    stats.running++;
                    break;
                case 'completed':
                    stats.completed++;
                    break;
                case 'failed':
                    stats.failed++;
                    break;
                case 'timeout':
                    stats.timeout++;
                    break;
            }
        }

        return stats;
    }

    /**
     * 执行异步任务
     */
    async executeTask(taskId, asyncFunction) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error('任务不存在');
        }

        try {
            this.updateTaskStatus(taskId, 'running', 10);
            
            // 执行异步函数
            const result = await asyncFunction(
                // 进度回调函数
                (status, progress) => {
                    this.updateTaskStatus(taskId, status, progress);
                }
            );

            this.completeTask(taskId, result);
            return result;
        } catch (error) {
            this.completeTask(taskId, null, error.message);
            throw error;
        }
    }
}

// 创建全局任务管理器实例
const taskManager = new TaskManager();

module.exports = taskManager;
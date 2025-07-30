import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// 创建 axios 实例，设置合理的超时时间
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 600000, // 60 秒超时
    headers: {
        'Content-Type': 'application/json',
    },
});

// 添加请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        console.log('发送请求:', config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 添加响应拦截器
apiClient.interceptors.response.use(
    (response) => {
        console.log('收到响应:', response.status);
        return response;
    },
    (error) => {
        console.error('请求失败:', error.message);
        if (error.code === 'ECONNABORTED') {
            console.error('请求超时，AI 服务响应较慢');
        }
        return Promise.reject(error);
    }
);

export interface GenerateRequest {
    description: string;
    components: string[];
    style: string;
}

export interface ModifyRequest {
    currentCode: string;
    modification: string;
}

export interface GenerateResponse {
    success: boolean;
    taskId?: string;
    code?: string;
    message: string;
}

export interface ProgressResponse {
    success: boolean;
    status: string;
    progress: number;
    completed: boolean;
    error?: string;
    result?: string;
}

// 启动代码生成任务
export const generateCode = async (data: GenerateRequest): Promise<GenerateResponse> => {
    try {
        console.log('开始生成代码请求...', data);
        const response = await apiClient.post('/generate', data);
        console.log('生成任务启动成功');
        return response.data;
    } catch (error) {
        console.error('启动生成任务失败:', error);
        throw error;
    }
};

// 查询生成进度
export const getGenerateProgress = async (taskId: string): Promise<ProgressResponse> => {
    try {
        const response = await apiClient.get(`/generate/progress/${taskId}`);
        return response.data;
    } catch (error) {
        console.error('查询进度失败:', error);
        throw error;
    }
};

// 带进度回调的代码生成函数
export const generateCodeWithProgress = async (
    data: GenerateRequest,
    onProgress?: (status: string, progress: number) => void
): Promise<string> => {
    try {
        // 启动生成任务
        const startResponse = await generateCode(data);

        if (!startResponse.success || !startResponse.taskId) {
            throw new Error(startResponse.message || '启动生成任务失败');
        }

        const taskId = startResponse.taskId;

        // 轮询查询进度
        return new Promise((resolve, reject) => {
            const pollProgress = async () => {
                try {
                    const progressResponse = await getGenerateProgress(taskId);

                    if (!progressResponse.success) {
                        reject(new Error('查询进度失败'));
                        return;
                    }

                    // 回调进度更新
                    if (onProgress) {
                        onProgress(progressResponse.status, progressResponse.progress);
                    }

                    // 检查是否完成
                    if (progressResponse.completed) {
                        if (progressResponse.error) {
                            reject(new Error(progressResponse.error));
                        } else if (progressResponse.result) {
                            resolve(progressResponse.result);
                        } else {
                            reject(new Error('生成完成但没有结果'));
                        }
                        return;
                    }

                    // 继续轮询
                    setTimeout(pollProgress, 2000); // 每2秒查询一次
                } catch (error) {
                    reject(error);
                }
            };

            pollProgress();
        });
    } catch (error) {
        console.error('生成代码失败:', error);
        throw error;
    }
};

export const modifyCode = async (data: ModifyRequest) => {
    try {
        console.log('开始修改代码请求...', data);
        const response = await apiClient.post('/modify', data);
        console.log('代码修改成功');
        return response.data;
    } catch (error) {
        console.error('修改代码失败:', error);
        throw error;
    }
};

export const exportCode = async (code: string) => {
    try {
        console.log('开始导出代码请求...');
        const response = await apiClient.post('/export', { code }, {
            responseType: 'blob'
        });
        console.log('代码导出成功');
        return response.data;
    } catch (error) {
        console.error('导出代码失败:', error);
        throw error;
    }
};

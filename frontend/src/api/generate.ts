import axios from 'axios'

// 后端服务地址
const API_BASE_URL = 'http://localhost:3000/api'

export interface GenerateRequest {
    description: string
    components?: string[]
    style?: string
}

export interface GenerateResponse {
    code: string
    success: boolean
    message?: string
}

export interface ModifyRequest {
    currentCode: string
    modification: string
}

// 创建 axios 实例
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
})

// 根据描述生成网页代码
export const generateCode = async (request: GenerateRequest): Promise<GenerateResponse> => {
    try {
        const response = await api.post('/generate', request)
        return response.data
    } catch (error) {
        console.error('生成代码失败:', error)
        throw error
    }
}

// 修改现有代码
export const modifyCode = async (request: ModifyRequest): Promise<GenerateResponse> => {
    try {
        const response = await api.post('/modify', request)
        return response.data
    } catch (error) {
        console.error('修改代码失败:', error)
        throw error
    }
}

// 导出代码为 ZIP
export const exportCode = async (code: string): Promise<Blob> => {
    try {
        const response = await api.post('/export', { code }, {
            responseType: 'blob'
        })
        return response.data
    } catch (error) {
        console.error('导出代码失败:', error)
        throw error
    }
}

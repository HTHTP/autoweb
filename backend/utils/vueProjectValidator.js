/**
 * Vue项目结构JSON Schema定义和验证
 */

// Vue项目文件类型枚举
const FILE_TYPES = {
    COMPONENT: 'component',
    PAGE: 'page',
    ROUTER: 'router',
    STYLE: 'style',
    CONFIG: 'config',
    UTILS: 'utils',
    TYPES: 'types'
};

// Vue项目JSON Schema
const VUE_PROJECT_SCHEMA = {
    type: "object",
    properties: {
        projectName: {
            type: "string",
            description: "项目名称",
            minLength: 1,
            maxLength: 100
        },
        description: {
            type: "string",
            description: "项目描述",
            minLength: 1,
            maxLength: 500
        },
        files: {
            type: "array",
            description: "项目文件列表",
            minItems: 1,
            items: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description: "文件路径",
                        pattern: "^[a-zA-Z0-9/_.-]+\\.(vue|ts|js|css|scss|less|json|md)$"
                    },
                    content: {
                        type: "string",
                        description: "文件内容",
                        minLength: 1
                    },
                    type: {
                        type: "string",
                        enum: Object.values(FILE_TYPES),
                        description: "文件类型"
                    }
                },
                required: ["path", "content", "type"],
                additionalProperties: false
            }
        },
        dependencies: {
            type: "array",
            description: "项目依赖包",
            items: {
                type: "string",
                pattern: "^[a-zA-Z0-9@/_.-]+$"
            }
        },
        features: {
            type: "array",
            description: "项目特性",
            items: {
                type: "string",
                minLength: 1,
                maxLength: 100
            }
        }
    },
    required: ["projectName", "description", "files", "dependencies", "features"],
    additionalProperties: false
};

/**
 * 验证Vue项目结构
 * @param {Object} projectData - 项目数据
 * @returns {Object} 验证结果
 */
function validateVueProject(projectData) {
    const errors = [];
    const warnings = [];

    try {
        // 基本结构验证
        if (!projectData || typeof projectData !== 'object') {
            errors.push('项目数据必须是一个对象');
            return { valid: false, errors, warnings };
        }

        // 检查必需字段
        const requiredFields = ['projectName', 'description', 'files', 'dependencies', 'features'];
        for (const field of requiredFields) {
            if (!projectData[field]) {
                errors.push(`缺少必需字段: ${field}`);
            }
        }

        // 验证项目名称
        if (projectData.projectName) {
            if (typeof projectData.projectName !== 'string') {
                errors.push('项目名称必须是字符串');
            } else if (projectData.projectName.length === 0) {
                errors.push('项目名称不能为空');
            } else if (projectData.projectName.length > 100) {
                errors.push('项目名称长度不能超过100个字符');
            }
        }

        // 验证文件列表
        if (projectData.files) {
            if (!Array.isArray(projectData.files)) {
                errors.push('文件列表必须是数组');
            } else {
                if (projectData.files.length === 0) {
                    errors.push('至少需要一个文件');
                }

                projectData.files.forEach((file, index) => {
                    validateFile(file, index, errors, warnings);
                });

                // 检查必要的文件类型
                const fileTypes = projectData.files.map(f => f.type);
                const hasComponent = fileTypes.includes(FILE_TYPES.COMPONENT);
                const hasPage = fileTypes.includes(FILE_TYPES.PAGE);
                const hasRouter = fileTypes.includes(FILE_TYPES.ROUTER);

                if (!hasComponent && !hasPage) {
                    warnings.push('建议至少包含一个组件或页面文件');
                }
                if (!hasRouter) {
                    warnings.push('建议包含路由配置文件');
                }
            }
        }

        // 验证依赖
        if (projectData.dependencies && !Array.isArray(projectData.dependencies)) {
            errors.push('依赖列表必须是数组');
        }

        // 验证特性
        if (projectData.features && !Array.isArray(projectData.features)) {
            errors.push('特性列表必须是数组');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };

    } catch (error) {
        errors.push(`验证过程中出现错误: ${error.message}`);
        return { valid: false, errors, warnings };
    }
}

/**
 * 验证单个文件
 * @param {Object} file - 文件对象
 * @param {number} index - 文件索引
 * @param {Array} errors - 错误列表
 * @param {Array} warnings - 警告列表
 */
function validateFile(file, index, errors, warnings) {
    const prefix = `文件[${index}]`;

    if (!file || typeof file !== 'object') {
        errors.push(`${prefix}: 必须是对象`);
        return;
    }

    // 检查必需字段
    if (!file.path) {
        errors.push(`${prefix}: 缺少path字段`);
    } else if (typeof file.path !== 'string') {
        errors.push(`${prefix}: path必须是字符串`);
    } else {
        // 验证文件路径格式
        const validExtensions = ['.vue', '.ts', '.js', '.css', '.scss', '.less', '.json', '.md'];
        const hasValidExtension = validExtensions.some(ext => file.path.endsWith(ext));
        if (!hasValidExtension) {
            warnings.push(`${prefix}: 文件扩展名可能不正确 (${file.path})`);
        }
    }

    if (!file.content) {
        errors.push(`${prefix}: 缺少content字段`);
    } else if (typeof file.content !== 'string') {
        errors.push(`${prefix}: content必须是字符串`);
    } else if (file.content.trim().length === 0) {
        warnings.push(`${prefix}: 文件内容为空`);
    }

    if (!file.type) {
        errors.push(`${prefix}: 缺少type字段`);
    } else if (!Object.values(FILE_TYPES).includes(file.type)) {
        errors.push(`${prefix}: type必须是有效的文件类型 (${Object.values(FILE_TYPES).join(', ')})`);
    }
}

/**
 * 创建Vue项目模板
 * @param {string} projectName - 项目名称
 * @param {string} description - 项目描述
 * @returns {Object} 项目模板
 */
function createVueProjectTemplate(projectName, description) {
    return {
        projectName,
        description,
        files: [
            {
                path: "src/App.vue",
                content: `<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// App组件
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>`,
                type: FILE_TYPES.COMPONENT
            },
            {
                path: "src/main.ts",
                content: `import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')`,
                type: FILE_TYPES.CONFIG
            },
            {
                path: "src/router/index.ts",
                content: `import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router`,
                type: FILE_TYPES.ROUTER
            }
        ],
        dependencies: [
            "vue",
            "vue-router",
            "typescript"
        ],
        features: [
            "Vue 3 Composition API",
            "TypeScript",
            "Vue Router",
            "响应式设计"
        ]
    };
}

/**
 * 生成文件树结构
 * @param {Array} files - 文件列表
 * @returns {string} 文件树字符串
 */
function generateFileTree(files) {
    const tree = {};
    
    files.forEach(file => {
        const parts = file.path.split('/');
        let current = tree;
        
        parts.forEach((part, index) => {
            if (!current[part]) {
                current[part] = index === parts.length - 1 ? file : {};
            }
            current = current[part];
        });
    });
    
    function buildTree(node, prefix = '', isLast = true) {
        let result = '';
        const entries = Object.entries(node);
        
        entries.forEach(([key, value], index) => {
            const isLastEntry = index === entries.length - 1;
            const connector = isLastEntry ? '└── ' : '├── ';
            
            if (value.path) {
                // 这是一个文件
                result += prefix + connector + key + ` (${value.type})\n`;
            } else {
                // 这是一个目录
                result += prefix + connector + key + '/\n';
                const nextPrefix = prefix + (isLastEntry ? '    ' : '│   ');
                result += buildTree(value, nextPrefix, isLastEntry);
            }
        });
        
        return result;
    }
    
    return buildTree(tree);
}

module.exports = {
    FILE_TYPES,
    VUE_PROJECT_SCHEMA,
    validateVueProject,
    createVueProjectTemplate,
    generateFileTree
};
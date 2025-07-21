// HTML 模板库

const basic = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 生成的网页</title>
    <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://unpkg.com/element-plus/dist/index.full.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .{{styleClass}} {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
            margin-bottom: 20px;
        }
        .content {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div id="app">
        <div class="container">
            <div class="{{styleClass}}">
                <h1>🎉 欢迎访问我的网站</h1>
                <p>{{description}}</p>
                <el-button type="primary" size="large">开始体验</el-button>
            </div>
            <div class="content">
                <h2>网站内容</h2>
                <p>这是一个由 AI 自动生成的网页，根据您的描述："{{description}}" 创建。</p>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-card>
                            <h3>功能一</h3>
                            <p>这里是功能描述</p>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card>
                            <h3>功能二</h3>
                            <p>这里是功能描述</p>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card>
                            <h3>功能三</h3>
                            <p>这里是功能描述</p>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
    <script>
        const { createApp } = Vue;
        const app = createApp({
            data() {
                return {
                    message: 'Hello Vue!'
                }
            }
        });
        app.use(ElementPlus);
        app.mount('#app');
    </script>
</body>
</html>`;

const withNavigation = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>带导航的网页</title>
    <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://unpkg.com/element-plus/dist/index.full.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .navbar {
            background: #409eff;
            color: white;
            padding: 0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 80px 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div id="app">
        <el-menu mode="horizontal" class="navbar">
            <el-menu-item index="1">首页</el-menu-item>
            <el-menu-item index="2">产品</el-menu-item>
            <el-menu-item index="3">服务</el-menu-item>
            <el-menu-item index="4">关于我们</el-menu-item>
            <el-menu-item index="5">联系我们</el-menu-item>
        </el-menu>
        
        <div class="hero">
            <h1>{{description}}</h1>
            <p>欢迎访问我们的网站，这里有您需要的一切</p>
            <el-button type="primary" size="large">了解更多</el-button>
        </div>
        
        <div class="container">
            <el-row :gutter="40" style="margin-top: 40px;">
                <el-col :span="8">
                    <el-card>
                        <template #header>
                            <h3>我们的优势</h3>
                        </template>
                        <p>专业团队，优质服务，为您提供最佳解决方案。</p>
                    </el-card>
                </el-col>
                <el-col :span="8">
                    <el-card>
                        <template #header>
                            <h3>核心价值</h3>
                        </template>
                        <p>创新、专业、可靠，始终以客户为中心。</p>
                    </el-card>
                </el-col>
                <el-col :span="8">
                    <el-card>
                        <template #header>
                            <h3>联系我们</h3>
                        </template>
                        <p>随时为您提供支持和帮助。</p>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    </div>
    <script>
        const { createApp } = Vue;
        const app = createApp({
            data() {
                return {
                    activeIndex: '1'
                }
            }
        });
        app.use(ElementPlus);
        app.mount('#app');
    </script>
</body>
</html>`;

const withTable = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>数据展示页面</title>
    <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://unpkg.com/element-plus/dist/index.full.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div id="app">
        <div class="container">
            <div class="header">
                <h1>{{description}}</h1>
                <p>以下是数据展示表格</p>
            </div>
            
            <el-card>
                <template #header>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>数据列表</span>
                        <el-button type="primary">添加数据</el-button>
                    </div>
                </template>
                
                <el-table :data="tableData" style="width: 100%">
                    <el-table-column prop="id" label="ID" width="80"></el-table-column>
                    <el-table-column prop="name" label="姓名" width="120"></el-table-column>
                    <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
                    <el-table-column prop="phone" label="电话" width="150"></el-table-column>
                    <el-table-column prop="status" label="状态" width="100">
                        <template #default="scope">
                            <el-tag :type="scope.row.status === '活跃' ? 'success' : 'info'">
                                {{ scope.row.status }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作">
                        <template #default="scope">
                            <el-button size="small" type="primary">编辑</el-button>
                            <el-button size="small" type="danger">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                
                <div style="margin-top: 20px; text-align: right;">
                    <el-pagination
                        :current-page="1"
                        :page-size="10"
                        :total="100"
                        layout="prev, pager, next, jumper"
                    ></el-pagination>
                </div>
            </el-card>
        </div>
    </div>
    <script>
        const { createApp } = Vue;
        const app = createApp({
            data() {
                return {
                    tableData: [
                        { id: 1, name: '张三', email: 'zhangsan@example.com', phone: '13800138000', status: '活跃' },
                        { id: 2, name: '李四', email: 'lisi@example.com', phone: '13800138001', status: '活跃' },
                        { id: 3, name: '王五', email: 'wangwu@example.com', phone: '13800138002', status: '非活跃' },
                        { id: 4, name: '赵六', email: 'zhaoliu@example.com', phone: '13800138003', status: '活跃' }
                    ]
                }
            }
        });
        app.use(ElementPlus);
        app.mount('#app');
    </script>
</body>
</html>`;

const withForm = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>表单页面</title>
    <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://unpkg.com/element-plus/dist/index.full.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
    </style>
</head>
<body>
    <div id="app">
        <div class="container">
            <div class="header">
                <h1>{{description}}</h1>
                <p>请填写以下表单信息</p>
            </div>
            
            <el-card>
                <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
                    <el-form-item label="姓名" prop="name">
                        <el-input v-model="form.name" placeholder="请输入姓名"></el-input>
                    </el-form-item>
                    
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="form.email" placeholder="请输入邮箱地址"></el-input>
                    </el-form-item>
                    
                    <el-form-item label="电话" prop="phone">
                        <el-input v-model="form.phone" placeholder="请输入电话号码"></el-input>
                    </el-form-item>
                    
                    <el-form-item label="性别" prop="gender">
                        <el-radio-group v-model="form.gender">
                            <el-radio label="male">男</el-radio>
                            <el-radio label="female">女</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    
                    <el-form-item label="城市" prop="city">
                        <el-select v-model="form.city" placeholder="请选择城市">
                            <el-option label="北京" value="beijing"></el-option>
                            <el-option label="上海" value="shanghai"></el-option>
                            <el-option label="广州" value="guangzhou"></el-option>
                            <el-option label="深圳" value="shenzhen"></el-option>
                        </el-select>
                    </el-form-item>
                    
                    <el-form-item label="兴趣爱好">
                        <el-checkbox-group v-model="form.hobbies">
                            <el-checkbox label="reading">阅读</el-checkbox>
                            <el-checkbox label="sports">运动</el-checkbox>
                            <el-checkbox label="music">音乐</el-checkbox>
                            <el-checkbox label="travel">旅游</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    
                    <el-form-item label="备注">
                        <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入备注信息"></el-input>
                    </el-form-item>
                    
                    <el-form-item>
                        <el-button type="primary" @click="submitForm">提交</el-button>
                        <el-button @click="resetForm">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </div>
    </div>
    <script>
        const { createApp } = Vue;
        const app = createApp({
            data() {
                return {
                    form: {
                        name: '',
                        email: '',
                        phone: '',
                        gender: '',
                        city: '',
                        hobbies: [],
                        remark: ''
                    },
                    rules: {
                        name: [
                            { required: true, message: '请输入姓名', trigger: 'blur' }
                        ],
                        email: [
                            { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                            { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
                        ],
                        phone: [
                            { required: true, message: '请输入电话号码', trigger: 'blur' }
                        ]
                    }
                }
            },
            methods: {
                submitForm() {
                    this.$refs.formRef.validate((valid) => {
                        if (valid) {
                            ElMessage.success('提交成功！');
                            console.log('表单数据:', this.form);
                        }
                    });
                },
                resetForm() {
                    this.$refs.formRef.resetFields();
                }
            }
        });
        app.use(ElementPlus);
        app.mount('#app');
    </script>
</body>
</html>`;

const withCards = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>产品展示页面</title>
    <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://unpkg.com/element-plus/dist/index.full.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 40px;
        }
        .product-grid {
            margin-top: 40px;
        }
        .product-card {
            margin-bottom: 20px;
        }
        .product-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(45deg, #f0f2f5, #e6e8eb);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 24px;
        }
    </style>
</head>
<body>
    <div id="app">
        <div class="container">
            <div class="hero">
                <h1>{{description}}</h1>
                <p>精选优质产品，为您提供最佳选择</p>
                <el-button type="primary" size="large">查看更多</el-button>
            </div>
            
            <div class="product-grid">
                <el-row :gutter="20">
                    <el-col :span="6" v-for="product in products" :key="product.id" class="product-card">
                        <el-card :body-style="{ padding: '0px' }">
                            <div class="product-image">{{ product.name }}</div>
                            <div style="padding: 20px;">
                                <h3>{{ product.name }}</h3>
                                <p style="color: #999; margin: 10px 0;">{{ product.description }}</p>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #f56c6c; font-size: 20px; font-weight: bold;">
                                        ¥{{ product.price }}
                                    </span>
                                    <el-button type="primary" size="small">立即购买</el-button>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
            
            <div style="text-align: center; margin-top: 40px;">
                <el-pagination
                    :current-page="1"
                    :page-size="8"
                    :total="32"
                    layout="prev, pager, next"
                ></el-pagination>
            </div>
        </div>
    </div>
    <script>
        const { createApp } = Vue;
        const app = createApp({
            data() {
                return {
                    products: [
                        { id: 1, name: '精品商品 1', description: '高质量产品，值得信赖', price: 299 },
                        { id: 2, name: '精品商品 2', description: '时尚设计，优质材料', price: 399 },
                        { id: 3, name: '精品商品 3', description: '创新科技，卓越性能', price: 599 },
                        { id: 4, name: '精品商品 4', description: '经典款式，永不过时', price: 199 },
                        { id: 5, name: '精品商品 5', description: '限量版本，稀缺珍藏', price: 899 },
                        { id: 6, name: '精品商品 6', description: '新品上市，抢先体验', price: 499 },
                        { id: 7, name: '精品商品 7', description: '畅销产品，用户好评', price: 349 },
                        { id: 8, name: '精品商品 8', description: '特价促销，限时优惠', price: 159 }
                    ]
                }
            }
        });
        app.use(ElementPlus);
        app.mount('#app');
    </script>
</body>
</html>`;

module.exports = {
    basic,
    withNavigation,
    withTable,
    withForm,
    withCards
};

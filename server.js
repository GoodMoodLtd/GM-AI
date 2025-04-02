require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios'); // 新增axios依赖

const app = express();
const PORT = process.env.PORT || 3000;

// 允许特定来源访问
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  // 添加你的前端实际部署域名
];

// 中间件配置
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = '该来源不允许访问此API';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.static(__dirname));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// 路由
app.get('/', (req, res) => {
  console.log('收到根路径请求');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/generate', async (req, res) => {
  console.log('收到请求:', req.body);
  try {
    if (!req.body.prompt) {
      return res.status(400).json({ error: '缺少prompt参数' });
    }

    // 模拟响应
    const mockImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    res.json({ 
      imageUrl: mockImage,
      prompt: req.body.prompt
    });

    /* 实际API调用代码（已注释）
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      { 
        inputs: req.body.prompt,
        options: { 
          wait_for_model: true,
          use_cache: false
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 60000
      }
    );
    const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
    res.json({ 
      imageUrl: `data:image/png;base64,${imageBase64}`,
      mimeType: 'image/png'
    });
    */
  } catch (error) {
    console.error('完整错误详情:', error);
    res.status(500).json({ 
      error: '图片生成失败',
      details: error.response?.data?.error || error.message,
      suggestion: '请检查API密钥是否正确或稍后再试'
    });
  }
});

// 添加测试用的GET方法路由（仅用于调试）
app.get('/api/generate', (req, res) => {
  res.status(405).json({ 
    error: 'Method Not Allowed',
    message: '请使用POST方法访问此端点',
    example: {
      method: 'POST',
      url: '/api/generate',
      body: { prompt: '您的图片描述' }
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
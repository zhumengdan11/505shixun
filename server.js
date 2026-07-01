require('dotenv').config()
const express = require('express')
const axios = require('axios')
const cors = require('cors')
const https = require('https')

const app = express()
// 跨域、静态页面托管
app.use(cors())
app.use(express.static('public'))
app.use(express.json())

// 读取校内接口密钥（只存在环境变量，前端看不到明文key）
const API_KEY = process.env.SCHOOL_API_KEY
const API_URL = process.env.SCHOOL_API_BASE_URL

// 封装校内大模型对话接口，前端调用这个接口，不直接访问校内内网地址
app.post('/api/chat', async (req, res) => {
  try {
    const userText = req.body.text
    // 调用学校qwen3大模型
    const result = await axios.post(`${API_URL}/chat/completions`, {
      model: "qwen3",
      messages: [
        { role: "user", content: [{"type": "text", "text": userText}] }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      // 关闭内网SSL校验，和你python代码逻辑一致
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    })
    res.json({ success: true, data: result.data })
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "接口调用失败！请确认已连接校园网",
      detail: err.message
    })
  }
})

// 启动服务
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`本地服务启动成功，访问地址：http://localhost:${port}`)
})
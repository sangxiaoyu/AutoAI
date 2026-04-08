# 🌐 IP 地址查询工具

> 🔍 快速查询 IP 地址的详细信息，包括归属地、运营商、地理位置等

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web-brightgreen.svg)](./index.html)

---

## ✨ 功能特性

### 🔍 IP 查询
| 功能 | 说明 |
|:---|:---|
| 📡 精准查询 | 支持查询任意 IPv4 / IPv6 地址 |
| 🖥️ 本机 IP | 一键获取本机公网 IP 地址 |
| 📍 地理位置 | 显示国家、地区、城市信息 |
| 🏢 运营商信息 | 显示 ISP / 运营商名称 |
| 🕐 时区显示 | 显示 IP 所属时区 |
| 🗺️ 地图展示 | 集成 Google 地图显示位置 |

### 📜 查询历史
| 功能 | 说明 |
|:---|:---|
| ⏰ 自动记录 | 自动保存最近 10 条查询记录 |
| 🔄 快速回溯 | 点击历史记录快速重新查询 |
| 🗑️ 一键清空 | 支持清空所有历史记录 |

### 🔐 隐私保护
| 功能 | 说明 |
|:---|:---|
| 🔒 本地处理 | 查询在浏览器本地完成 |
| 📤 数据不上传 | 仅向 IP 查询 API 发送 IP 地址 |
| 🍪 无 Cookie | 不使用任何追踪技术 |

---

## 🎯 技术特点

| 特点 | 说明 |
|:---|:---|
| ⚡ 即时响应 | 使用异步请求，体验流畅 |
| 📱 响应式设计 | 完美适配桌面和移动端 |
| 🎨 现代化 UI | 深蓝渐变 + 高级白配色 |
| 🔧 容错处理 | 完善的错误提示和重试机制 |

---

## 🛠 技术栈

| 技术 | 说明 |
|:---|:---|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) | 语义化结构 |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) | 现代化样式 |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | 交互逻辑 |
| ![API](https://img.shields.io/badge/API-ipapi.co-3b82f6?style=flat) | IP 数据接口 |

### 依赖库
- 📚 **Font Awesome 6.4.0** - 矢量图标库
- 🔤 **Google Inter** - 思源字体

---

## 📁 项目结构

```
IP-Lookup/
├── index.html          # 📄 主页面入口
├── css/
│   └── style.css       # 🎨 样式文件
├── js/
│   └── ip-lookup.js    # 🔍 查询逻辑
├── README.md           # 📝 项目文档
└── LICENSE             # 📜 开源协议
```

---

## 📖 使用方法

### 1️⃣ 快速开始
```bash
# 直接在浏览器打开
open index.html
```

### 2️⃣ 查询操作

```
┌─────────────────────────────────────┐
│  🔍 请输入 IP 地址                    │
│  ┌───────────────────┐ ┌──────────┐ │
│  │ 8.8.8.8           │ │   查询   │ │
│  └───────────────────┘ └──────────┘ │
│                                     │
│  ┌──────────────┐ ┌──────────────┐  │
│  │ 🖥️ 本机 IP   │ │ 📜 查询记录   │  │
│  └──────────────┘ └──────────────┘  │
└─────────────────────────────────────┘
```

### 3️⃣ 查询结果

| 字段 | 说明 | 示例 |
|:---|:---|:---|
| IP 地址 | 查询的 IP | 8.8.8.8 |
| 归属地 | 国家/地区 | 美国 |
| 运营商 | ISP 名称 | Google LLC |
| 城市 | 所在城市 | Mountain View |
| 时区 | 所属时区 | America/Los_Angeles |

---

## 🌐 API 说明

本项目使用 [ipapi.co](https://ipapi.co) 免费 API：

| 特性 | 限制 |
|:---|:---|
| ✅ 免费额度 | 每日 1000 次 |
| ✅ 支持 HTTPS | 是 |
| ✅ IPv6 支持 | 是 |
| ✅ 无需注册 | 是 |

> 💡 如需更高配额，可申请 API Key

---

## 🌐 浏览器支持

| 浏览器 | 支持版本 | 状态 |
|:---|:---:|:---:|
| 🟢 Chrome | 80+ | ✅ 已支持 |
| 🟠 Firefox | 75+ | ✅ 已支持 |
| 🔵 Safari | 13+ | ✅ 已支持 |
| 🟣 Edge | 80+ | ✅ 已支持 |

---

## 📜 开源协议

本项目基于 [MIT License](./LICENSE) 开源，你可以：

- ✅ 自由使用和修改
- ✅ 商业用途
- ✅ 私有化部署
- ⚠️ 需要保留署名

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star！**

Made with ❤️

</div>

# 🔐 编码转换工具

> ✨ 一款简洁高效的在线编码转换工具，支持 Base64、URL、HTML 实体的编码解码功能

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web-brightgreen.svg)](./index.html)

---

## 🚀 功能特性

### 📦 Base64 编解码
| 功能 | 说明 |
|:---|:---|
| 🔤 编码 | 将字符串转换为 Base64 格式 |
| 🔓 解码 | 将 Base64 还原为原始字符串 |
| 🌏 中文支持 | 完美支持中文等多字节字符 |

### 🔗 URL 编码解码
| 功能 | 说明 |
|:---|:---|
| 🌐 URL 安全 | 符合 RFC 3986 标准 |
| ⚡ 特殊字符 | 安全处理 URL 中的特殊字符 |
| ✅ 传输保障 | 防止 URL 传输错误 |

### 🛡️ HTML 实体编解码
| 功能 | 说明 |
|:---|:---|
| 🔒 XSS 防护 | 转换 HTML 特殊字符，防止注入 |
| 💻 代码展示 | 安全展示 HTML 代码片段 |
| 🎯 精准转换 | 支持所有 HTML 实体字符 |

---

## 🎯 通用功能

| 功能 | 图标 | 说明 |
|:---|:---:|:---|
| 示例加载 | 📖 | 内置示例数据快速体验 |
| 一键清空 | 🗑 | 快速重置输入输出 |
| 粘贴复制 | 📋 | 便捷的剪贴板操作 |
| 交换内容 | 🔄 | 快速互换原文和结果 |
| 即时反馈 | 💬 | Toast 消息实时提示 |
| 隐私保护 | 🔒 | 纯前端处理，数据不上传 |

---

## 🛠 技术栈

| 技术 | 说明 |
|:---|:---|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) | 语义化结构 |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) | 现代化样式 |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | 交互逻辑 |

### 依赖库
- 📚 **Font Awesome 6.4.0** - 矢量图标库
- 🔤 **Google Inter** - 思源字体

---

## 📁 项目结构

```
En-decode/
├── index.html          # 📄 主页面入口
├── css/
│   └── style.css       # 🎨 样式文件
├── js/
│   ├── main.js         # ⚙️ 主逻辑
│   ├── base64.js       # 📦 Base64 编解码
│   ├── url-encoder.js  # 🔗 URL 编解码
│   └── html-encoder.js # 🛡 HTML 实体编解码
├── README.md           # 📝 项目文档
└── LICENSE             # 📜 开源协议
```

---

## 📖 使用方法

### 1️⃣ 启动方式
```bash
# 直接在浏览器打开
open index.html
```

### 2️⃣ 操作步骤

```
┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │
│   📝 输入原文    │ →  │  ⚙️ 点击编码     │
│                 │    │                 │
└─────────────────┘    └─────────────────┘
                            │
                            ▼
┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │
│  ✅ 复制结果     │ ←  │  📤 输出结果     │
│                 │    │                 │
└─────────────────┘    └─────────────────┘
```

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

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star！**

Made with ❤️ by [Your Name]

</div>

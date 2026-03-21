# 翻译工具

一个简单美观的多语言翻译工具，支持 10+ 种语言互译。

## 功能特性

- 🌐 支持 10+ 种语言互译（中文、英语、日语、韩语、法语、德语、西班牙语、俄语、阿拉伯语、泰语）
- 🔄 自动检测源语言
- ↕️ 一键交换源语言和目标语言
- ⌨️ 支持 Ctrl+Enter 快捷键翻译
- 📱 响应式设计，支持移动端
- 🎨 现代化 UI 设计

## 项目结构

```
.
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── translate.js    # JavaScript 功能
└── README.md           # 项目说明
```

## 使用方法

1. 在浏览器中打开 `translate.html` 文件
2. 选择源语言和目标语言
3. 在输入框中输入要翻译的文本
4. 点击"立即翻译"按钮或按 Ctrl+Enter
5. 查看翻译结果

## API 说明

本项目使用 [MyMemory Translation API](https://mymemory.translated.net/)，该 API 免费且无需密钥：

- 每日免费额度：1000 次
- 支持自动语言检测
- 无需 API 密钥即可使用

## 快捷键

- `Ctrl + Enter`: 立即翻译

## 浏览器兼容性

支持所有现代浏览器：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

MIT License

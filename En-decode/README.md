# 编码转换工具

一款简洁高效的在线编码转换工具，支持 Base64、URL、HTML 实体的编码解码功能。

## 功能特性

### Base64 编解码
- 支持中文等多字节字符
- 即时转换，实时显示结果
- 一键复制结果到剪贴板

### URL 编码解码
- 符合 RFC 3986 标准
- 安全处理 URL 特殊字符
- 防止 URL 传输错误

### HTML 实体编解码
- 转换 HTML 特殊字符
- 防止 XSS 注入攻击
- 适用于前端安全处理

### 通用功能
- **示例加载** - 内置示例数据快速体验
- **一键清空** - 快速重置输入输出
- **粘贴复制** - 便捷的剪贴板操作
- **交换内容** - 快速互换原文和结果
- **即时反馈** - Toast 消息实时提示

## 技术栈

- **前端框架**: 原生 HTML5 + CSS3 + JavaScript
- **图标库**: Font Awesome 6.4.0
- **字体**: Google Inter
- **纯前端处理**: 数据不上传服务器，保护隐私

## 项目结构

```
En-decode/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
└── js/
    ├── main.js         # 主逻辑
    ├── base64.js       # Base64 编解码
    ├── url-encoder.js   # URL 编解码
    └── html-encoder.js # HTML 实体编解码
```

## 使用方法

1. 直接在浏览器中打开 `index.html`
2. 选择要使用的编码类型（Base64 / URL / HTML）
3. 在左侧输入原文，点击「编码」或「解码」按钮
4. 右侧将显示转换结果
5. 使用复制按钮将结果复制到剪贴板

## 浏览器支持

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT License

# 🥇 黄金白银分析看板

> 📊 专业的贵金属行情分析工具，实时监控黄金、白银价格走势

## 功能特性

### 📈 实时行情
- **黄金/美元 (XAUUSD)** - 实时价格、涨跌幅、24小时高低价
- **白银/美元 (XAGUSD)** - 实时价格、涨跌幅、24小时高低价
- **金银比** - 黄金与白银的比值关系

### 🔄 交叉盘分析
支持多种货币对的黄金白银报价：

| 货币对 | 说明 |
|:---|:---|
| XAUGBP | 黄金/英镑 |
| XAUEUR | 黄金/欧元 |
| XAUJPY | 黄金/日元 |
| XAUCNY | 黄金/人民币 |
| XAGEUR | 白银/欧元 |
| XAGJPY | 白银/日元 |
| XAGCNY | 白银/人民币 |

### 📊 技术分析
- **波动率分析** - 实时计算市场波动程度
- **金银联动** - 分析金银价格相关性
- **24小时统计** - 统计每日价格范围和波动

### 🔗 数据来源
- **iTick API** - 专业金融数据接口
- **WebSocket** - 实时数据推送
- **OANDA** - 报价来源

## 技术栈

| 技术 | 说明 |
|:---|:---|
| HTML5 | 语义化结构 |
| CSS3 | 现代化样式，深色主题 |
| JavaScript | 交互逻辑 |
| WebSocket | 实时数据 |
| iTick API | 行情数据 |

## 项目结构

```
WeGold/
├── index.html      # 主页面
├── css/
│   └── style.css   # 样式文件
├── js/
│   └── app.js      # 核心逻辑
└── README.md       # 项目文档
```

## 使用方法

### 方式一：直接打开

```bash
# 从 AIToAI 主页面点击进入
# 或直接打开
open WeGold/index.html
```

### 方式二：本地服务器

```bash
# Python
python -m http.server 8080

# 访问
http://localhost:8080/WeGold/index.html
```

## API 说明

本工具使用 [iTick](https://itick.org) 免费金融 API：

- **REST API**: `https://api.itick.org`
- **WebSocket**: `wss://api.itick.org/crypto`
- **认证方式**: Header Token

### 订阅数据

```javascript
// 订阅报价
ws.send(JSON.stringify({
    ac: 'subscribe',
    params: 'XAUUSD$BA,XAGUSD$BA',
    types: 'quote'
}));
```

### 响应格式

```json
{
    "code": 1,
    "data": {
        "s": "XAUUSD",
        "r": "BA",
        "ld": 2345.67,
        "o": 2340.00,
        "h": 2350.00,
        "l": 2335.00,
        "v": 12345.67,
        "type": "quote"
    }
}
```

## 数据字段说明

| 字段 | 说明 |
|:---|:---|
| `s` | 交易品种代码 |
| `r` | 交易所/区域 |
| `ld` | 最新价 |
| `o` | 开盘价 |
| `h` | 最高价 |
| `l` | 最低价 |
| `v` | 成交量 |
| `tu` | 成交额 |

## 隐私说明

- 🔒 所有数据通过 WebSocket 实时获取
- 📡 仅向 iTick 服务器发送订阅请求
- 💾 不存储任何用户数据
- 🍪 无 Cookie，无追踪

## 注意事项

⚠️ **免责声明**: 本工具提供的数据仅供参考，不构成任何投资建议。贵金属交易存在风险，请谨慎操作。

## 浏览器支持

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

---

<div align="center">

**Made with ❤️ by [小榆](https://github.com/sangxiaoyu)**

</div>

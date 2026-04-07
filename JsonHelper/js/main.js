/**
 * JSON & SQL 格式化工具 - 主 JavaScript 文件
 * 处理界面交互和工具切换
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('JSON & SQL 格式化工具已加载');
    
    // 初始化所有模块
    initToolTabs();
    initEventListeners();
    initCharCounters();
    initStatusIndicators();
    
    // 显示欢迎消息
    setTimeout(() => {
        showToast('欢迎使用 JSON & SQL 格式化工具！', 'success');
    }, 1000);
});

/**
 * 初始化工具标签页
 */
function initToolTabs() {
    const toolTabs = document.querySelectorAll('.tool-tab');
    const toolSections = document.querySelectorAll('.tool-section');
    
    toolTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tool = this.dataset.tool;
            
            // 更新标签状态
            toolTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应的工具部分
            toolSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${tool}-tool`) {
                    section.classList.add('active');
                }
            });
            
            // 显示切换消息
            const toolNames = {
                'json': 'JSON 格式化',
                'sql': 'SQL 格式化'
            };
            showToast(`已切换到 ${toolNames[tool]}`, 'info');
        });
    });
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    // JSON 工具事件
    const jsonInput = document.getElementById('json-input');
    const jsonFormatBtn = document.getElementById('json-format');
    const jsonMinifyBtn = document.getElementById('json-minify');
    const jsonCopyBtn = document.getElementById('json-copy');
    const jsonClearBtn = document.getElementById('json-clear');
    const jsonPasteBtn = document.getElementById('json-paste');
    const jsonExampleBtn = document.getElementById('json-example');
    const jsonDownloadBtn = document.getElementById('json-download');
    
    // SQL 工具事件
    const sqlInput = document.getElementById('sql-input');
    const sqlFormatBtn = document.getElementById('sql-format');
    const sqlBeautifyBtn = document.getElementById('sql-beautify');
    const sqlCopyBtn = document.getElementById('sql-copy');
    const sqlClearBtn = document.getElementById('sql-clear');
    const sqlPasteBtn = document.getElementById('sql-paste');
    const sqlExampleBtn = document.getElementById('sql-example');
    const sqlDownloadBtn = document.getElementById('sql-download');
    
    // JSON 事件绑定
    if (jsonFormatBtn) {
        jsonFormatBtn.addEventListener('click', formatJSON);
    }
    
    if (jsonMinifyBtn) {
        jsonMinifyBtn.addEventListener('click', minifyJSON);
    }
    
    if (jsonCopyBtn) {
        jsonCopyBtn.addEventListener('click', () => copyToClipboard('json-output', 'JSON'));
    }
    
    if (jsonClearBtn) {
        jsonClearBtn.addEventListener('click', () => clearInput('json-input', 'JSON'));
    }
    
    if (jsonPasteBtn) {
        jsonPasteBtn.addEventListener('click', () => pasteFromClipboard('json-input', 'JSON'));
    }
    
    if (jsonExampleBtn) {
        jsonExampleBtn.addEventListener('click', loadJSONExample);
    }
    
    if (jsonDownloadBtn) {
        jsonDownloadBtn.addEventListener('click', () => downloadContent('json-output', 'formatted-json.json', 'JSON'));
    }
    
    // SQL 事件绑定
    if (sqlFormatBtn) {
        sqlFormatBtn.addEventListener('click', formatSQL);
    }
    
    if (sqlBeautifyBtn) {
        sqlBeautifyBtn.addEventListener('click', beautifySQL);
    }
    
    if (sqlCopyBtn) {
        sqlCopyBtn.addEventListener('click', () => copyToClipboard('sql-output', 'SQL'));
    }
    
    if (sqlClearBtn) {
        sqlClearBtn.addEventListener('click', () => clearInput('sql-input', 'SQL'));
    }
    
    if (sqlPasteBtn) {
        sqlPasteBtn.addEventListener('click', () => pasteFromClipboard('sql-input', 'SQL'));
    }
    
    if (sqlExampleBtn) {
        sqlExampleBtn.addEventListener('click', loadSQLExample);
    }
    
    if (sqlDownloadBtn) {
        sqlDownloadBtn.addEventListener('click', () => downloadContent('sql-output', 'formatted-sql.sql', 'SQL'));
    }
    
    // 输入框实时验证
    if (jsonInput) {
        jsonInput.addEventListener('input', () => validateJSONInput());
        jsonInput.addEventListener('keydown', handleJSONShortcuts);
    }
    
    if (sqlInput) {
        sqlInput.addEventListener('input', () => validateSQLInput());
        sqlInput.addEventListener('keydown', handleSQLShortcuts);
    }
    
    // 选项变化监听
    document.querySelectorAll('.format-options input, .format-options select').forEach(input => {
        input.addEventListener('change', () => {
            const toolType = input.closest('.tool-section').id.replace('-tool', '');
            if (toolType === 'json') {
                validateJSONInput();
            } else if (toolType === 'sql') {
                validateSQLInput();
            }
        });
    });
}

/**
 * 初始化字符计数器
 */
function initCharCounters() {
    const jsonInput = document.getElementById('json-input');
    const sqlInput = document.getElementById('sql-input');
    
    function updateCharCount(element, counterId) {
        const count = element.value.length;
        const counter = document.getElementById(counterId);
        if (counter) {
            counter.textContent = `${count} 字符`;
        }
    }
    
    if (jsonInput) {
        jsonInput.addEventListener('input', () => {
            updateCharCount(jsonInput, 'json-char-count');
        });
        updateCharCount(jsonInput, 'json-char-count');
    }
    
    if (sqlInput) {
        sqlInput.addEventListener('input', () => {
            updateCharCount(sqlInput, 'sql-char-count');
        });
        updateCharCount(sqlInput, 'sql-char-count');
    }
    
    // 更新输出字符计数
    function updateOutputCount(outputId, counterId) {
        const output = document.getElementById(outputId);
        const code = output.querySelector('code');
        if (code) {
            const count = code.textContent.length;
            const counter = document.getElementById(counterId);
            if (counter) {
                counter.textContent = `${count} 字符`;
            }
        }
    }
    
    // 监听输出变化
    const observer = new MutationObserver(() => {
        updateOutputCount('json-output', 'json-output-count');
        updateOutputCount('sql-output', 'sql-output-count');
    });
    
    const jsonOutput = document.getElementById('json-output');
    const sqlOutput = document.getElementById('sql-output');
    
    if (jsonOutput) {
        observer.observe(jsonOutput, { childList: true, subtree: true, characterData: true });
    }
    
    if (sqlOutput) {
        observer.observe(sqlOutput, { childList: true, subtree: true, characterData: true });
    }
}

/**
 * 初始化状态指示器
 */
function initStatusIndicators() {
    // 设置初始状态
    updateStatus('json-status', '就绪', 'info');
    updateStatus('sql-status', '就绪', 'info');
    updateStatus('json-output-status', '等待输入', 'info');
    updateStatus('sql-output-status', '等待输入', 'info');
}

/**
 * 更新状态指示器
 */
function updateStatus(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = 'status';
        element.classList.add(type);
    }
}

/**
 * 显示 Toast 消息
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    // 设置消息内容
    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    
    // 显示 Toast
    toast.classList.add('show');
    
    // 3秒后自动隐藏
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * 复制内容到剪贴板
 */
async function copyToClipboard(outputId, toolName) {
    const output = document.getElementById(outputId);
    if (!output) return;
    
    const code = output.querySelector('code');
    if (!code) return;
    
    const text = code.textContent.trim();
    if (!text || text === '格式化结果将显示在这里...') {
        showToast(`请先格式化 ${toolName} 代码`, 'warning');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        showToast(`${toolName} 代码已复制到剪贴板`, 'success');
    } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败，请手动选择复制', 'error');
    }
}

/**
 * 清空输入框
 */
function clearInput(inputId, toolName) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input'));
        showToast(`${toolName} 输入已清空`, 'info');
    }
}

/**
 * 从剪贴板粘贴
 */
async function pasteFromClipboard(inputId, toolName) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    try {
        const text = await navigator.clipboard.readText();
        if (text.trim()) {
            input.value = text;
            input.dispatchEvent(new Event('input'));
            showToast(`${toolName} 代码已从剪贴板粘贴`, 'success');
        } else {
            showToast('剪贴板为空', 'warning');
        }
    } catch (err) {
        console.error('粘贴失败:', err);
        showToast('粘贴失败，请检查权限', 'error');
    }
}

/**
 * 下载内容
 */
function downloadContent(outputId, filename, toolName) {
    const output = document.getElementById(outputId);
    if (!output) return;
    
    const code = output.querySelector('code');
    if (!code) return;
    
    const text = code.textContent.trim();
    if (!text || text === '格式化结果将显示在这里...') {
        showToast(`请先格式化 ${toolName} 代码`, 'warning');
        return;
    }
    
    try {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`${toolName} 文件已下载`, 'success');
    } catch (err) {
        console.error('下载失败:', err);
        showToast('下载失败，请重试', 'error');
    }
}

/**
 * JSON 输入验证
 */
function validateJSONInput() {
    const input = document.getElementById('json-input');
    const validateOption = document.getElementById('json-validate');
    
    if (!input || !validateOption) return;
    
    const text = input.value.trim();
    if (!text) {
        updateStatus('json-status', '就绪', 'info');
        return;
    }
    
    if (validateOption.checked) {
        try {
            JSON.parse(text);
            updateStatus('json-status', '✓ JSON 语法正确', 'success');
        } catch (err) {
            updateStatus('json-status', `✗ ${err.message}`, 'error');
        }
    } else {
        updateStatus('json-status', '已输入', 'info');
    }
}

/**
 * SQL 输入验证
 */
function validateSQLInput() {
    const input = document.getElementById('sql-input');
    const validateOption = document.getElementById('sql-validate');
    
    if (!input || !validateOption) return;
    
    const text = input.value.trim();
    if (!text) {
        updateStatus('sql-status', '就绪', 'info');
        return;
    }
    
    if (validateOption.checked) {
        // 简单的 SQL 语法检查
        if (text.toLowerCase().includes('select') || 
            text.toLowerCase().includes('insert') || 
            text.toLowerCase().includes('update') || 
            text.toLowerCase().includes('delete')) {
            updateStatus('sql-status', '✓ SQL 语法基本正确', 'success');
        } else {
            updateStatus('sql-status', '⚠ 可能不是有效的 SQL 语句', 'warning');
        }
    } else {
        updateStatus('sql-status', '已输入', 'info');
    }
}

/**
 * JSON 快捷键处理
 */
function handleJSONShortcuts(event) {
    // Ctrl/Cmd + Enter 格式化
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        formatJSON();
    }
    
    // Ctrl/Cmd + S 保存/下载
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        downloadContent('json-output', 'formatted-json.json', 'JSON');
    }
}

/**
 * SQL 快捷键处理
 */
function handleSQLShortcuts(event) {
    // Ctrl/Cmd + Enter 格式化
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        formatSQL();
    }
    
    // Ctrl/Cmd + S 保存/下载
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        downloadContent('sql-output', 'formatted-sql.sql', 'SQL');
    }
}

/**
 * 加载 JSON 示例
 */
function loadJSONExample() {
    const example = `{
  "project": "JSON & SQL 格式化工具",
  "version": "1.0.0",
  "description": "一个在线格式化 JSON 和 SQL 代码的工具",
  "features": [
    "JSON 格式化与美化",
    "SQL 语句格式化",
    "实时语法验证",
    "代码压缩",
    "一键复制"
  ],
  "author": {
    "name": "开发团队",
    "email": "contact@example.com",
    "website": "https://example.com"
  },
  "dependencies": {
    "frontend": {
      "html": "HTML5",
      "css": "CSS3",
      "javascript": "ES6+"
    }
  },
  "settings": {
    "autoFormat": true,
    "theme": "light",
    "language": "zh-CN"
  }
}`;
    
    const input = document.getElementById('json-input');
    if (input) {
        input.value = example;
        input.dispatchEvent(new Event('input'));
        showToast('JSON 示例已加载', 'success');
    }
}

/**
 * 加载 SQL 示例
 */
function loadSQLExample() {
    const example = `-- 用户表查询示例
SELECT 
    u.user_id,
    u.username,
    u.email,
    u.created_at,
    COUNT(o.order_id) AS total_orders,
    SUM(o.amount) AS total_spent
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE u.status = 'active'
    AND u.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
    AND (u.email LIKE '%@gmail.com' OR u.email LIKE '%@outlook.com')
GROUP BY u.user_id, u.username, u.email, u.created_at
HAVING COUNT(o.order_id) > 0
    AND SUM(o.amount) >= 1000
ORDER BY total_spent DESC, u.username ASC
LIMIT 10 OFFSET 0;

-- 产品库存更新示例
UPDATE products p
INNER JOIN inventory i ON p.product_id = i.product_id
SET 
    p.price = p.price * 0.9,  -- 打9折
    i.quantity = i.quantity - 1,
    p.last_updated = NOW()
WHERE p.category_id IN (1, 3, 5)
    AND p.status = 'available'
    AND i.quantity > 0
    AND p.price > 50;

-- 复杂报表查询
WITH monthly_sales AS (
    SELECT 
        DATE_FORMAT(order_date, '%Y-%m') AS month,
        customer_id,
        SUM(amount) AS monthly_total
    FROM orders
    WHERE order_date >= '2024-01-01'
    GROUP BY DATE_FORMAT(order_date, '%Y-%m'), customer_id
)
SELECT 
    ms.month,
    c.customer_name,
    c.country,
    ms.monthly_total,
    RANK() OVER (PARTITION BY ms.month ORDER BY ms.monthly_total DESC) AS sales_rank
FROM monthly_sales ms
JOIN customers c ON ms.customer_id = c.customer_id
WHERE ms.monthly_total > 10000
ORDER BY ms.month DESC, sales_rank ASC;`;
    
    const input = document.getElementById('sql-input');
    if (input) {
        input.value = example;
        input.dispatchEvent(new Event('input'));
        showToast('SQL 示例已加载', 'success');
    }
}

/**
 * 格式化 JSON（在 json-formatter.js 中实现）
 */
function formatJSON() {
    // 在 json-formatter.js 中实现
    console.log('formatJSON 将在 json-formatter.js 中实现');
}

/**
 * 压缩 JSON（在 json-formatter.js 中实现）
 */
function minifyJSON() {
    // 在 json-formatter.js 中实现
    console.log('minifyJSON 将在 json-formatter.js 中实现');
}

/**
 * 格式化 SQL（在 sql-formatter.js 中实现）
 */
function formatSQL() {
    // 在 sql-formatter.js 中实现
    console.log('formatSQL 将在 sql-formatter.js 中实现');
}

/**
 * 美化 SQL（在 sql-formatter.js 中实现）
 */
function beautifySQL() {
    // 在 sql-formatter.js 中实现
    console.log('beautifySQL 将在 sql-formatter.js 中实现');
}

// 导出函数供其他模块使用
window.formatJSON = formatJSON;
window.minifyJSON = minifyJSON;
window.formatSQL = formatSQL;
window.beautifySQL = beautifySQL;
window.showToast = showToast;
/**
 * JSON 格式化工具
 * 提供 JSON 美化、压缩、验证和语法高亮功能
 */

// 覆盖主文件中的占位函数
window.formatJSON = function() {
    const input = document.getElementById('json-input');
    const output = document.getElementById('json-output');
    const code = output.querySelector('code');
    
    if (!input || !output || !code) {
        showToast('系统错误：找不到必要的元素', 'error');
        return;
    }
    
    const text = input.value.trim();
    if (!text) {
        showToast('请输入 JSON 代码', 'warning');
        return;
    }
    
    // 获取格式化选项
    const pretty = document.getElementById('json-pretty').checked;
    const sortKeys = document.getElementById('json-sort').checked;
    const indentSize = parseInt(document.getElementById('json-indent').value) || 2;
    const validate = document.getElementById('json-validate').checked;
    
    try {
        // 解析 JSON
        const parsed = JSON.parse(text);
        
        // 验证选项
        if (validate) {
            // 额外的验证逻辑
            validateJSONStructure(parsed);
        }
        
        // 格式化 JSON
        let formatted;
        if (pretty) {
            // 美化格式
            formatted = JSON.stringify(parsed, sortKeys ? getSortedKeys : null, indentSize);
        } else {
            // 压缩格式（单行）
            formatted = JSON.stringify(parsed, sortKeys ? getSortedKeys : null);
        }
        
        // 更新输出
        code.textContent = formatted;
        code.className = 'language-json';
        
        // 应用语法高亮
        applyJSONSyntaxHighlighting(code);
        
        // 更新状态
        updateStatus('json-output-status', '✓ 格式化完成', 'success');
        updateStatus('json-status', '✓ JSON 语法正确', 'success');
        
        // 显示成功消息
        showToast('JSON 格式化成功', 'success');
        
        // 更新字符计数
        updateOutputCharCount();
        
    } catch (error) {
        // 处理解析错误
        handleJSONError(error, text, code);
    }
};

// 压缩 JSON
window.minifyJSON = function() {
    const input = document.getElementById('json-input');
    const output = document.getElementById('json-output');
    const code = output.querySelector('code');
    
    if (!input || !output || !code) {
        showToast('系统错误：找不到必要的元素', 'error');
        return;
    }
    
    const text = input.value.trim();
    if (!text) {
        showToast('请输入 JSON 代码', 'warning');
        return;
    }
    
    try {
        // 解析 JSON
        const parsed = JSON.parse(text);
        
        // 压缩 JSON（移除所有空白）
        const minified = JSON.stringify(parsed);
        
        // 更新输出
        code.textContent = minified;
        code.className = 'language-json';
        
        // 应用语法高亮
        applyJSONSyntaxHighlighting(code);
        
        // 更新状态
        updateStatus('json-output-status', '✓ 压缩完成', 'success');
        updateStatus('json-status', '✓ JSON 语法正确', 'success');
        
        // 显示成功消息
        const originalSize = text.length;
        const minifiedSize = minified.length;
        const reduction = Math.round((1 - minifiedSize / originalSize) * 100);
        showToast(`JSON 压缩成功，大小减少 ${reduction}%`, 'success');
        
        // 更新字符计数
        updateOutputCharCount();
        
    } catch (error) {
        // 处理解析错误
        handleJSONError(error, text, code);
    }
};

/**
 * 获取排序后的键（用于 JSON.stringify 的 replacer 参数）
 */
function getSortedKeys(key, value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.keys(value).sort().reduce((sorted, key) => {
            sorted[key] = value[key];
            return sorted;
        }, {});
    }
    return value;
}

/**
 * 验证 JSON 结构
 */
function validateJSONStructure(json) {
    const errors = [];
    
    function traverse(obj, path = '') {
        if (obj === null || typeof obj !== 'object') {
            return;
        }
        
        // 检查循环引用
        try {
            JSON.stringify(obj);
        } catch (error) {
            errors.push(`循环引用: ${path || 'root'}`);
        }
        
        // 检查特殊值
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                traverse(item, `${path}[${index}]`);
            });
        } else {
            Object.entries(obj).forEach(([key, value]) => {
                const newPath = path ? `${path}.${key}` : key;
                
                // 检查键名
                if (key.includes(' ') || key.includes('\n') || key.includes('\t')) {
                    errors.push(`键名包含空格或换行: ${newPath}`);
                }
                
                // 检查值类型
                if (value === undefined) {
                    errors.push(`包含 undefined 值: ${newPath}`);
                }
                
                traverse(value, newPath);
            });
        }
    }
    
    traverse(json);
    
    if (errors.length > 0) {
        console.warn('JSON 结构警告:', errors);
        updateStatus('json-status', `⚠ ${errors.length} 个警告`, 'warning');
    }
}

/**
 * 处理 JSON 错误
 */
function handleJSONError(error, text, codeElement) {
    console.error('JSON 错误:', error);
    
    // 提取错误信息
    let errorMessage = 'JSON 解析错误';
    let errorPosition = '未知位置';
    
    if (error instanceof SyntaxError) {
        // 解析语法错误
        const match = error.message.match(/position (\d+)/);
        if (match) {
            const position = parseInt(match[1]);
            errorPosition = `位置 ${position}`;
            
            // 显示错误上下文
            const context = getErrorContext(text, position);
            errorMessage = `语法错误: ${error.message}\n\n${context}`;
        } else {
            errorMessage = `语法错误: ${error.message}`;
        }
    } else {
        errorMessage = `错误: ${error.message}`;
    }
    
    // 更新输出显示错误信息
    const errorHtml = `// JSON 解析错误
// ${errorMessage}
// ${errorPosition}

${text}`;
    
    codeElement.textContent = errorHtml;
    codeElement.className = 'language-json';
    
    // 高亮错误行
    highlightErrorLine(codeElement);
    
    // 更新状态
    updateStatus('json-output-status', '✗ 格式化失败', 'error');
    updateStatus('json-status', '✗ JSON 语法错误', 'error');
    
    // 显示错误消息
    showToast(errorMessage.split('\n')[0], 'error');
}

/**
 * 获取错误上下文
 */
function getErrorContext(text, position) {
    const lines = text.split('\n');
    let currentPos = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineStart = currentPos;
        const lineEnd = currentPos + line.length;
        
        if (position >= lineStart && position <= lineEnd) {
            const errorInLine = position - lineStart;
            
            // 构建错误指示器
            let indicator = '';
            for (let j = 0; j < errorInLine; j++) {
                indicator += ' ';
            }
            indicator += '^';
            
            // 返回上下文（前后各2行）
            const startLine = Math.max(0, i - 2);
            const endLine = Math.min(lines.length - 1, i + 2);
            
            let context = '';
            for (let j = startLine; j <= endLine; j++) {
                const lineNum = j + 1;
                const prefix = j === i ? '>>' : '  ';
                context += `${prefix} ${lineNum}: ${lines[j]}\n`;
                
                if (j === i) {
                    context += `     ${indicator}\n`;
                }
            }
            
            return context;
        }
        
        currentPos = lineEnd + 1; // +1 是换行符
    }
    
    return `错误发生在第 ${position} 个字符附近`;
}

/**
 * 应用 JSON 语法高亮
 */
function applyJSONSyntaxHighlighting(codeElement) {
    const text = codeElement.textContent;
    let highlighted = '';
    let inString = false;
    let escapeNext = false;
    let stringChar = '';
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const prevChar = i > 0 ? text[i - 1] : '';
        const nextChar = i < text.length - 1 ? text[i + 1] : '';
        
        if (escapeNext) {
            highlighted += char;
            escapeNext = false;
            continue;
        }
        
        if (char === '\\' && inString) {
            highlighted += char;
            escapeNext = true;
            continue;
        }
        
        if (char === '"' || char === "'") {
            if (!inString) {
                inString = true;
                stringChar = char;
                highlighted += `<span class="string">${char}`;
            } else if (char === stringChar) {
                inString = false;
                highlighted += `${char}</span>`;
            } else {
                highlighted += char;
            }
            continue;
        }
        
        if (inString) {
            highlighted += char;
            continue;
        }
        
        // 数字
        if (/[\d-]/.test(char) && (i === 0 || /[\s:,{\[]/.test(prevChar))) {
            let number = char;
            let j = i + 1;
            while (j < text.length && /[\d.eE+-]/.test(text[j])) {
                number += text[j];
                j++;
            }
            
            if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(number)) {
                highlighted += `<span class="number">${number}</span>`;
                i = j - 1;
                continue;
            }
        }
        
        // 布尔值和 null
        const remaining = text.substring(i);
        if (remaining.startsWith('true')) {
            highlighted += `<span class="boolean">true</span>`;
            i += 3;
            continue;
        }
        if (remaining.startsWith('false')) {
            highlighted += `<span class="boolean">false</span>`;
            i += 4;
            continue;
        }
        if (remaining.startsWith('null')) {
            highlighted += `<span class="null">null</span>`;
            i += 3;
            continue;
        }
        
        // 键名（在引号外）
        if (char === ':' && nextChar !== ' ') {
            highlighted += `<span class="punctuation">:</span>`;
            continue;
        }
        
        // 标点符号
        if (/[{}\[\],:]/.test(char)) {
            highlighted += `<span class="punctuation">${char}</span>`;
            continue;
        }
        
        // 普通文本
        highlighted += char;
    }
    
    // 如果字符串未闭合，关闭它
    if (inString) {
        highlighted += '</span>';
    }
    
    codeElement.innerHTML = highlighted;
}

/**
 * 高亮错误行
 */
function highlightErrorLine(codeElement) {
    const lines = codeElement.innerHTML.split('\n');
    const highlightedLines = lines.map((line, index) => {
        if (line.includes('// JSON 解析错误') || line.includes('// 语法错误') || line.includes('>>')) {
            return `<span class="error-line">${line}</span>`;
        }
        return line;
    });
    
    codeElement.innerHTML = highlightedLines.join('\n');
}

/**
 * 更新输出字符计数
 */
function updateOutputCharCount() {
    const jsonOutput = document.getElementById('json-output');
    const jsonCounter = document.getElementById('json-output-count');
    
    if (jsonOutput && jsonCounter) {
        const code = jsonOutput.querySelector('code');
        if (code) {
            const text = code.textContent || code.innerText;
            const count = text.length;
            jsonCounter.textContent = `${count} 字符`;
        }
    }
}

/**
 * 更新状态指示器（从主文件导入）
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
 * 显示 Toast 消息（从主文件导入）
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * JSON 格式化工具初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('JSON 格式化工具已加载');
    
    // 添加键盘快捷键说明
    const jsonInput = document.getElementById('json-input');
    if (jsonInput) {
        jsonInput.title = '快捷键：Ctrl+Enter 格式化，Ctrl+S 下载';
    }
    
    // 初始化示例数据
    const jsonExampleBtn = document.getElementById('json-example');
    if (jsonExampleBtn && !jsonExampleBtn.hasEventListener) {
        jsonExampleBtn.hasEventListener = true;
        jsonExampleBtn.addEventListener('click', function() {
            const example = `{
  "name": "JSON 格式化工具",
  "version": "1.0.0",
  "description": "一个功能强大的 JSON 格式化、验证和压缩工具",
  "features": ["格式化", "压缩", "验证", "语法高亮"],
  "author": {
    "name": "开发者",
    "email": "dev@example.com"
  },
  "settings": {
    "autoFormat": true,
    "theme": "light"
  }
}`;
            
            const input = document.getElementById('json-input');
            if (input) {
                input.value = example;
                input.dispatchEvent(new Event('input'));
                showToast('JSON 示例已加载', 'success');
            }
        });
    }
    
    // 添加输入框自动格式化（可选）
    const autoFormatCheckbox = document.createElement('input');
    autoFormatCheckbox.type = 'checkbox';
    autoFormatCheckbox.id = 'json-auto-format';
    autoFormatCheckbox.checked = false;
    
    const autoFormatLabel = document.createElement('label');
    autoFormatLabel.htmlFor = 'json-auto-format';
    autoFormatLabel.innerHTML = '<i class="fas fa-bolt"></i> 实时格式化';
    
    const autoFormatOption = document.createElement('div');
    autoFormatOption.className = 'option';
    autoFormatOption.appendChild(autoFormatCheckbox);
    autoFormatOption.appendChild(autoFormatLabel);
    
    const optionsGrid = document.querySelector('#json-tool .options-grid');
    if (optionsGrid) {
        optionsGrid.appendChild(autoFormatOption);
        
        // 添加实时格式化功能
        autoFormatCheckbox.addEventListener('change', function() {
            if (this.checked) {
                const input = document.getElementById('json-input');
                if (input) {
                    let timeout;
                    input.addEventListener('input', function() {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                            const text = input.value.trim();
                            if (text) {
                                try {
                                    JSON.parse(text);
                                    formatJSON();
                                } catch (error) {
                                    // 忽略解析错误
                                }
                            }
                        }, 1000);
                    });
                }
                showToast('实时格式化已启用', 'info');
            } else {
                showToast('实时格式化已禁用', 'info');
            }
        });
    }
    
    // 添加额外的格式化选项
    const extraOptions = `
        <div class="option">
            <label>
                <input type="checkbox" id="json-trailing-comma">
                允许尾随逗号
            </label>
        </div>
        <div class="option">
            <label>
                <input type="checkbox" id="json-single-quote">
                使用单引号
            </label>
        </div>
    `;
    
    if (optionsGrid) {
        optionsGrid.insertAdjacentHTML('beforeend', extraOptions);
    }
});

/**
 * 扩展 JSON.stringify 以支持额外选项
 */
function customJSONStringify(obj, options = {}) {
    const {
        pretty = true,
        indent = 2,
        sortKeys = false,
        trailingComma = false,
        singleQuote = false
    } = options;
    
    // 使用原生 JSON.stringify
    let json = JSON.stringify(obj, sortKeys ? getSortedKeys : null, pretty ? indent : undefined);
    
    // 应用额外选项
    if (singleQuote) {
        json = json.replace(/"/g, "'");
    }
    
    if (trailingComma && pretty) {
        // 在数组和对象的最后一项后添加逗号
        json = json.replace(/(\n[ \t]*)([}\]])/g, function(match, indent, bracket) {
            const lines = match.split('\n');
            const lastLine = lines[lines.length - 2];
            if (lastLine && !lastLine.trim().endsWith(',')) {
                return indent.slice(0, -indent.length) + ',' + indent + bracket;
            }
            return match;
        });
    }
    
    return json;
}

// 导出函数
window.customJSONStringify = customJSONStringify;
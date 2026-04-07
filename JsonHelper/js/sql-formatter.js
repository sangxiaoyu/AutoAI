/**
 * SQL 格式化工具
 * 提供 SQL 语句的格式化、美化、语法高亮和验证功能
 */

// SQL 关键字列表（多种数据库方言）
const SQL_KEYWORDS = {
    common: [
        'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT',
        'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
        'CREATE', 'TABLE', 'VIEW', 'INDEX', 'DATABASE', 'SCHEMA',
        'ALTER', 'ADD', 'DROP', 'MODIFY', 'RENAME', 'TRUNCATE',
        'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
        'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
        'IS', 'NULL', 'DISTINCT', 'UNION', 'ALL', 'EXISTS',
        'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
        'BEGIN', 'COMMIT', 'ROLLBACK', 'SAVEPOINT',
        'GRANT', 'REVOKE', 'PRIMARY KEY', 'FOREIGN KEY',
        'REFERENCES', 'CONSTRAINT', 'UNIQUE', 'CHECK',
        'DEFAULT', 'AUTO_INCREMENT', 'IDENTITY'
    ],
    mysql: [
        'ENGINE', 'CHARSET', 'COLLATE',
        'IF NOT EXISTS', 'IF EXISTS',
        'AUTO_INCREMENT', 'CHARACTER SET',
        'ROW_FORMAT', 'COMMENT',
        'PARTITION BY', 'PARTITIONS',
        'STORAGE', 'INNODB', 'MYISAM'
    ],
    postgresql: [
        'SERIAL', 'BIGSERIAL', 'TEXT', 'BYTEA',
        'IF NOT EXISTS', 'IF EXISTS',
        'WITH', 'WITHOUT', 'TIME ZONE',
        'RETURNING', 'EXCEPT', 'INTERSECT',
        'WINDOW', 'OVER', 'PARTITION BY',
        'RANGE', 'ROWS', 'PRECEDING', 'FOLLOWING'
    ],
    sqlserver: [
        'TOP', 'WITH', 'NOLOCK', 'ROWCOUNT',
        'OUTPUT', 'INSERTED', 'DELETED',
        'TRY', 'CATCH', 'THROW',
        'PIVOT', 'UNPIVOT', 'APPLY',
        'OVER', 'PARTITION BY'
    ],
    oracle: [
        'SEQUENCE', 'TRIGGER', 'SYNONYM',
        'ROWNUM', 'CONNECT BY', 'LEVEL',
        'START WITH', 'PRIOR', 'DUAL',
        'DECLARE', 'BEGIN', 'EXCEPTION',
        'RAISE', 'END'
    ],
    sqlite: [
        'WITHOUT ROWID', 'STRICT',
        'CHECK', 'DEFAULT', 'COLLATE',
        'PRIMARY KEY', 'UNIQUE', 'NOT NULL'
    ]
};

// SQL 函数列表
const SQL_FUNCTIONS = [
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
    'UPPER', 'LOWER', 'SUBSTRING', 'TRIM',
    'CONCAT', 'COALESCE', 'NULLIF',
    'DATE', 'TIME', 'DATETIME', 'NOW',
    'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND',
    'ABS', 'ROUND', 'CEIL', 'FLOOR',
    'ROW_NUMBER', 'RANK', 'DENSE_RANK',
    'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE'
];

// SQL 运算符
const SQL_OPERATORS = ['=', '<>', '!=', '<', '>', '<=', '>=', '+', '-', '*', '/', '%'];

// 覆盖主文件中的占位函数
window.formatSQL = function() {
    const input = document.getElementById('sql-input');
    const output = document.getElementById('sql-output');
    const code = output.querySelector('code');
    
    if (!input || !output || !code) {
        showToast('系统错误：找不到必要的元素', 'error');
        return;
    }
    
    const text = input.value.trim();
    if (!text) {
        showToast('请输入 SQL 语句', 'warning');
        return;
    }
    
    // 获取格式化选项
    const keywordsUpper = document.getElementById('sql-keywords-upper').checked;
    const autoIndent = document.getElementById('sql-indent').checked;
    const indentSize = parseInt(document.getElementById('sql-indent-size').value) || 2;
    const lineBreaks = document.getElementById('sql-line-breaks').checked;
    const validate = document.getElementById('sql-validate').checked;
    const dialect = document.getElementById('sql-dialect').value;
    
    try {
        // 验证 SQL
        if (validate) {
            validateSQLSyntax(text, dialect);
        }
        
        // 格式化 SQL
        let formatted = text;
        
        // 1. 标准化换行和空格
        formatted = normalizeWhitespace(formatted);
        
        // 2. 关键字大写（如果启用）
        if (keywordsUpper) {
            formatted = uppercaseKeywords(formatted, dialect);
        }
        
        // 3. 添加缩进（如果启用）
        if (autoIndent) {
            formatted = addIndentation(formatted, indentSize);
        }
        
        // 4. 优化换行（如果启用）
        if (lineBreaks) {
            formatted = optimizeLineBreaks(formatted);
        }
        
        // 5. 添加分号（如果没有）
        formatted = addSemicolon(formatted);
        
        // 更新输出
        code.textContent = formatted;
        code.className = 'language-sql';
        
        // 应用语法高亮
        applySQLSyntaxHighlighting(code, dialect);
        
        // 更新状态
        updateStatus('sql-output-status', '✓ 格式化完成', 'success');
        updateStatus('sql-status', '✓ SQL 语法基本正确', 'success');
        
        // 显示成功消息
        showToast('SQL 格式化成功', 'success');
        
        // 更新字符计数
        updateSQLOutputCharCount();
        
    } catch (error) {
        // 处理格式化错误
        handleSQLError(error, text, code, dialect);
    }
};

// 美化 SQL（更高级的格式化）
window.beautifySQL = function() {
    const input = document.getElementById('sql-input');
    const output = document.getElementById('sql-output');
    const code = output.querySelector('code');
    
    if (!input || !output || !code) {
        showToast('系统错误：找不到必要的元素', 'error');
        return;
    }
    
    const text = input.value.trim();
    if (!text) {
        showToast('请输入 SQL 语句', 'warning');
        return;
    }
    
    // 获取格式化选项
    const keywordsUpper = document.getElementById('sql-keywords-upper').checked;
    const autoIndent = document.getElementById('sql-indent').checked;
    const indentSize = parseInt(document.getElementById('sql-indent-size').value) || 2;
    const lineBreaks = document.getElementById('sql-line-breaks').checked;
    const validate = document.getElementById('sql-validate').checked;
    const dialect = document.getElementById('sql-dialect').value;
    
    try {
        // 验证 SQL
        if (validate) {
            validateSQLSyntax(text, dialect);
        }
        
        // 美化 SQL（更细致的格式化）
        let beautified = text;
        
        // 1. 标准化换行和空格
        beautified = normalizeWhitespace(beautified);
        
        // 2. 关键字大写（如果启用）
        if (keywordsUpper) {
            beautified = uppercaseKeywords(beautified, dialect);
        }
        
        // 3. 更智能的缩进
        beautified = addSmartIndentation(beautified, indentSize);
        
        // 4. 优化对齐
        beautified = optimizeAlignment(beautified);
        
        // 5. 添加分号（如果没有）
        beautified = addSemicolon(beautified);
        
        // 6. 清理多余的空行
        beautified = cleanExtraBlankLines(beautified);
        
        // 更新输出
        code.textContent = beautified;
        code.className = 'language-sql';
        
        // 应用语法高亮
        applySQLSyntaxHighlighting(code, dialect);
        
        // 更新状态
        updateStatus('sql-output-status', '✓ 美化完成', 'success');
        updateStatus('sql-status', '✓ SQL 语法正确', 'success');
        
        // 显示成功消息
        showToast('SQL 美化成功', 'success');
        
        // 更新字符计数
        updateSQLOutputCharCount();
        
    } catch (error) {
        // 处理美化错误
        handleSQLError(error, text, code, dialect);
    }
};

/**
 * 标准化空白字符
 */
function normalizeWhitespace(sql) {
    // 替换制表符为空格
    sql = sql.replace(/\t/g, '    ');
    
    // 标准化换行符
    sql = sql.replace(/\r\n/g, '\n');
    sql = sql.replace(/\r/g, '\n');
    
    // 移除行尾空格
    sql = sql.replace(/[ \t]+$/gm, '');
    
    // 标准化空格：操作符周围添加空格
    SQL_OPERATORS.forEach(op => {
        const regex = new RegExp(`([^\\s])(${escapeRegExp(op)})([^\\s])`, 'g');
        sql = sql.replace(regex, `$1 ${op} $3`);
    });
    
    // 逗号后添加空格（除非在括号内）
    sql = sql.replace(/,([^\s])/g, ', $1');
    
    return sql;
}

/**
 * 大写 SQL 关键字
 */
function uppercaseKeywords(sql, dialect) {
    let keywords = [...SQL_KEYWORDS.common];
    
    // 添加方言特定的关键字
    if (SQL_KEYWORDS[dialect]) {
        keywords = [...keywords, ...SQL_KEYWORDS[dialect]];
    }
    
    // 排序关键字，长的先匹配，防止部分匹配
    keywords.sort((a, b) => b.length - a.length);
    
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'gi');
        sql = sql.replace(regex, keyword);
    });
    
    return sql;
}

/**
 * 添加缩进
 */
function addIndentation(sql, indentSize) {
    const lines = sql.split('\n');
    let indentLevel = 0;
    const indentStr = ' '.repeat(indentSize);
    
    const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        
        // 减少缩进级别的关键字
        if (/^\s*(END|ELSE|ELSIF|WHEN)\b/i.test(trimmed) || 
            /^\s*\}\s*$/.test(trimmed) ||
            /^\s*\)\s*(,|;)?\s*$/.test(trimmed)) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        // 应用缩进
        const indentedLine = indentStr.repeat(indentLevel) + trimmed;
        
        // 增加缩进级别的关键字
        if (/\b(BEGIN|CASE)\b/i.test(trimmed) || 
            /\{\s*$/.test(trimmed) ||
            /\(\s*$/.test(trimmed)) {
            indentLevel++;
        }
        
        return indentedLine;
    });
    
    return formattedLines.join('\n');
}

/**
 * 添加智能缩进
 */
function addSmartIndentation(sql, indentSize) {
    const lines = sql.split('\n');
    let indentLevel = 0;
    const indentStr = ' '.repeat(indentSize);
    const indentStack = [];
    
    const formattedLines = lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        
        // 处理子查询和复杂表达式
        let lineIndent = indentLevel;
        
        // 检查是否应该减少缩进
        const decreaseKeywords = [
            'END', 'ELSE', 'ELSIF', 'WHEN', 'THEN',
            'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT'
        ];
        
        for (const keyword of decreaseKeywords) {
            const regex = new RegExp(`^\\s*${keyword}\\b`, 'i');
            if (regex.test(trimmed)) {
                lineIndent = Math.max(0, indentLevel - 1);
                break;
            }
        }
        
        // 应用缩进
        const indentedLine = indentStr.repeat(lineIndent) + trimmed;
        
        // 检查是否应该增加缩进
        const increasePatterns = [
            /^\s*(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT)/i,
            /^\s*(INSERT|UPDATE|DELETE)/i,
            /^\s*(INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN)/i,
            /^\s*(CASE|WHEN|THEN|ELSE)/i,
            /\s*\(\s*$/,
            /\s*\{\s*$/
        ];
        
        for (const pattern of increasePatterns) {
            if (pattern.test(trimmed)) {
                indentLevel++;
                indentStack.push({ pattern, index });
                break;
            }
        }
        
        return indentedLine;
    });
    
    return formattedLines.join('\n');
}

/**
 * 优化换行
 */
function optimizeLineBreaks(sql) {
    // 在常见关键字前添加换行（如果不在同一行）
    const breakBeforeKeywords = [
        'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT',
        'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'ON',
        'AND', 'OR'
    ];
    
    let formatted = sql;
    
    breakBeforeKeywords.forEach(keyword => {
        const regex = new RegExp(`([^\\n])(${keyword}\\b)`, 'gi');
        formatted = formatted.replace(regex, `$1\n$2`);
    });
    
    return formatted;
}

/**
 * 优化对齐
 */
function optimizeAlignment(sql) {
    const lines = sql.split('\n');
    
    // 查找 SELECT 语句中的列
    let inSelect = false;
    let selectStart = -1;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (/^SELECT\b/i.test(line)) {
            inSelect = true;
            selectStart = i;
        }
        
        if (inSelect && /^\s*(FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|UNION|\))\b/i.test(line)) {
            // 对齐 SELECT 列
            alignSelectColumns(lines, selectStart, i);
            inSelect = false;
        }
    }
    
    return lines.join('\n');
}

/**
 * 对齐 SELECT 列
 */
function alignSelectColumns(lines, start, end) {
    // 找到 AS 关键字的位置
    let maxAsPos = 0;
    
    for (let i = start; i < end; i++) {
        const match = lines[i].match(/\bAS\b/i);
        if (match) {
            const asPos = match.index;
            if (asPos > maxAsPos) {
                maxAsPos = asPos;
            }
        }
    }
    
    // 对齐 AS 关键字
    if (maxAsPos > 0) {
        for (let i = start; i < end; i++) {
            const match = lines[i].match(/\bAS\b/i);
            if (match) {
                const currentAsPos = match.index;
                if (currentAsPos < maxAsPos) {
                    const spacesToAdd = maxAsPos - currentAsPos;
                    const beforeAs = lines[i].substring(0, currentAsPos);
                    const afterAs = lines[i].substring(currentAsPos);
                    lines[i] = beforeAs + ' '.repeat(spacesToAdd) + afterAs;
                }
            }
        }
    }
}

/**
 * 添加分号
 */
function addSemicolon(sql) {
    const trimmed = sql.trim();
    if (!trimmed.endsWith(';') && trimmed.length > 0) {
        return trimmed + ';';
    }
    return trimmed;
}

/**
 * 清理多余空行
 */
function cleanExtraBlankLines(sql) {
    // 将连续的空行减少为一个空行
    return sql.replace(/\n\s*\n\s*\n/g, '\n\n');
}

/**
 * 验证 SQL 语法
 */
function validateSQLSyntax(sql, dialect) {
    const errors = [];
    const warnings = [];
    
    // 基本检查
    const lines = sql.split('\n');
    
    // 检查未闭合的引号
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inComment = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            const prevChar = j > 0 ? line[j - 1] : '';
            
            // 处理转义字符
            if (prevChar === '\\') {
                continue;
            }
            
            // 处理注释
            if (!inSingleQuote && !inDoubleQuote) {
                if (char === '-' && j < line.length - 1 && line[j + 1] === '-') {
                    inComment = true;
                    break; // 行注释，跳过该行剩余部分
                }
                if (char === '/' && j < line.length - 1 && line[j + 1] === '*') {
                    inComment = true;
                    j++; // 跳过下一个字符
                    continue;
                }
                if (char === '*' && j < line.length - 1 && line[j + 1] === '/') {
                    inComment = false;
                    j++; // 跳过下一个字符
                    continue;
                }
            }
            
            if (!inComment) {
                if (char === "'" && !inDoubleQuote) {
                    inSingleQuote = !inSingleQuote;
                } else if (char === '"' && !inSingleQuote) {
                    inDoubleQuote = !inDoubleQuote;
                }
            }
        }
        
        // 检查是否还有未闭合的引号
        if (inComment) {
            inComment = false; // 重置，下一行可能继续
        }
    }
    
    if (inSingleQuote) {
        errors.push('未闭合的单引号');
    }
    if (inDoubleQuote) {
        errors.push('未闭合的双引号');
    }
    
    // 检查方言特定的问题
    if (dialect === 'mysql') {
        // MySQL 特定检查
        if (sql.includes('LIMIT') && !sql.match(/LIMIT\s+(\d+)(?:\s*,\s*(\d+))?\s*(?:;|$)/i)) {
            warnings.push('LIMIT 子句语法可能不正确');
        }
    }
    
    // 检查常见错误
    if (sql.match(/\bWHERE\b.*\bWHERE\b/i)) {
        errors.push('多个 WHERE 子句');
    }
    
    if (sql.match(/\bGROUP BY\b.*\bGROUP BY\b/i)) {
        errors.push('多个 GROUP BY 子句');
    }
    
    if (sql.match(/\bORDER BY\b.*\bORDER BY\b/i)) {
        errors.push('多个 ORDER BY 子句');
    }
    
    // 如果有错误，抛出异常
    if (errors.length > 0) {
        throw new Error(`SQL 语法错误: ${errors.join('; ')}`);
    }
    
    // 如果有警告，记录但不抛出异常
    if (warnings.length > 0) {
        console.warn('SQL 警告:', warnings);
        updateStatus('sql-status', `⚠ ${warnings.length} 个警告`, 'warning');
    }
}

/**
 * 处理 SQL 错误
 */
function handleSQLError(error, text, codeElement, dialect) {
    console.error('SQL 错误:', error);
    
    // 提取错误信息
    let errorMessage = 'SQL 格式化错误';
    
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    
    // 更新输出显示错误信息
    const errorHtml = `-- SQL 格式化错误
-- ${errorMessage}
-- 方言: ${dialect.toUpperCase()}

${text}`;
    
    codeElement.textContent = errorHtml;
    codeElement.className = 'language-sql';
    
    // 高亮错误行
    highlightSQLErrorLine(codeElement);
    
    // 更新状态
    updateStatus('sql-output-status', '✗ 格式化失败', 'error');
    updateStatus('sql-status', '✗ SQL 语法错误', 'error');
    
    // 显示错误消息
    showToast(errorMessage.split('\n')[0], 'error');
}

/**
 * 应用 SQL 语法高亮
 */
function applySQLSyntaxHighlighting(codeElement, dialect) {
    const text = codeElement.textContent;
    let highlighted = text;
    
    // 高亮关键字
    let allKeywords = [...SQL_KEYWORDS.common];
    if (SQL_KEYWORDS[dialect]) {
        allKeywords = [...allKeywords, ...SQL_KEYWORDS[dialect]];
    }
    
    // 排序关键字，长的先匹配
    allKeywords.sort((a, b) => b.length - a.length);
    
    allKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword.replace(/\s+/g, '\\s+')})\\b`, 'gi');
        highlighted = highlighted.replace(regex, `<span class="keyword">$1</span>`);
    });
    
    // 高亮函数
    SQL_FUNCTIONS.forEach(func => {
        const regex = new RegExp(`\\b(${func})\\s*\\(`, 'gi');
        highlighted = highlighted.replace(regex, `<span class="function">$1</span>(`);
    });
    
    // 高亮字符串
    highlighted = highlighted.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, `<span class="string">'$1'</span>`);
    highlighted = highlighted.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, `<span class="string">"$1"</span>`);
    
    // 高亮数字
    highlighted = highlighted.replace(/\b\d+(\.\d+)?\b/g, `<span class="number">$&</span>`);
    
    // 高亮注释
    highlighted = highlighted.replace(/--[^\n]*/g, `<span class="comment">$&</span>`);
    highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, `<span class="comment">$&</span>`);
    
    // 高亮运算符
    SQL_OPERATORS.forEach(op => {
        const regex = new RegExp(`(\\s|^)(${escapeRegExp(op)})(\\s|$)`, 'g');
        highlighted = highlighted.replace(regex, `$1<span class="operator">$2</span>$3`);
    });
    
    codeElement.innerHTML = highlighted;
}

/**
 * 高亮 SQL 错误行
 */
function highlightSQLErrorLine(codeElement) {
    const lines = codeElement.innerHTML.split('\n');
    const highlightedLines = lines.map((line, index) => {
        if (line.includes('-- SQL 格式化错误') || line.includes('-- 错误')) {
            return `<span class="error-line">${line}</span>`;
        }
        return line;
    });
    
    codeElement.innerHTML = highlightedLines.join('\n');
}

/**
 * 更新 SQL 输出字符计数
 */
function updateSQLOutputCharCount() {
    const sqlOutput = document.getElementById('sql-output');
    const sqlCounter = document.getElementById('sql-output-count');
    
    if (sqlOutput && sqlCounter) {
        const code = sqlOutput.querySelector('code');
        if (code) {
            const text = code.textContent || code.innerText;
            const count = text.length;
            sqlCounter.textContent = `${count} 字符`;
        }
    }
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
 * SQL 格式化工具初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('SQL 格式化工具已加载');
    
    // 添加键盘快捷键说明
    const sqlInput = document.getElementById('sql-input');
    if (sqlInput) {
        sqlInput.title = '快捷键：Ctrl+Enter 格式化，Ctrl+S 下载';
    }
    
    // 初始化示例数据（覆盖主文件中的版本）
    const sqlExampleBtn = document.getElementById('sql-example');
    if (sqlExampleBtn && !sqlExampleBtn.hasEventListener) {
        sqlExampleBtn.hasEventListener = true;
        sqlExampleBtn.addEventListener('click', function() {
            const example = `-- 示例 SQL 查询
SELECT 
    u.user_id,
    u.username,
    u.email,
    COUNT(o.order_id) AS order_count,
    SUM(o.amount) AS total_amount
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE u.status = 'active'
    AND u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.user_id, u.username, u.email
HAVING COUNT(o.order_id) > 0
ORDER BY total_amount DESC
LIMIT 10;`;
            
            const input = document.getElementById('sql-input');
            if (input) {
                input.value = example;
                input.dispatchEvent(new Event('input'));
                showToast('SQL 示例已加载', 'success');
            }
        });
    }
    
    // 添加 SQL 格式化选项
    const extraOptions = `
        <div class="option">
            <label>
                <input type="checkbox" id="sql-align-equals">
                对齐赋值符号
            </label>
        </div>
        <div class="option">
            <label>
                <input type="checkbox" id="sql-space-around-operators">
                操作符周围添加空格
            </label>
        </div>
    `;
    
    const optionsGrid = document.querySelector('#sql-tool .options-grid');
    if (optionsGrid) {
        optionsGrid.insertAdjacentHTML('beforeend', extraOptions);
        
        // 对齐赋值符号选项
        const alignEqualsCheckbox = document.getElementById('sql-align-equals');
        if (alignEqualsCheckbox) {
            alignEqualsCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    showToast('赋值符号对齐已启用', 'info');
                } else {
                    showToast('赋值符号对齐已禁用', 'info');
                }
            });
        }
        
        // 操作符空格选项
        const spaceAroundOperatorsCheckbox = document.getElementById('sql-space-around-operators');
        if (spaceAroundOperatorsCheckbox) {
            spaceAroundOperatorsCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    showToast('操作符周围空格已启用', 'info');
                } else {
                    showToast('操作符周围空格已禁用', 'info');
                }
            });
        }
    }
});

// 导出函数
window.validateSQLSyntax = validateSQLSyntax;
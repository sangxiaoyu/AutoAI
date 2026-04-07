/**
 * SQL 格式化工具 - 简化版
 */

document.addEventListener('DOMContentLoaded', function() {
    initSQLTool();
});

function initSQLTool() {
    initSQLCharCounters();
    bindSQLEvents();
    initSQLStatus();
}

function initSQLCharCounters() {
    const leftInput = document.getElementById('sql-input-left');
    const rightInput = document.getElementById('sql-input-right');

    if (leftInput) {
        leftInput.addEventListener('input', () => {
            updateCharCount('sql-input-left', 'sql-left-count');
        });
        updateCharCount('sql-input-left', 'sql-left-count');
    }

    if (rightInput) {
        rightInput.addEventListener('input', () => {
            updateCharCount('sql-input-right', 'sql-right-count');
        });
        updateCharCount('sql-input-right', 'sql-right-count');
    }
}

function bindSQLEvents() {
    // 主按钮
    document.getElementById('sql-format')?.addEventListener('click', formatSQL);

    // 左侧按钮
    document.getElementById('sql-example-left')?.addEventListener('click', () => loadSQLExample('left'));
    document.getElementById('sql-clear-left')?.addEventListener('click', () => clearSQLInput('left'));
    document.getElementById('sql-paste-left')?.addEventListener('click', () => pasteSQLInput('left'));

    // 右侧按钮
    document.getElementById('sql-example-right')?.addEventListener('click', () => loadSQLExample('right'));
    document.getElementById('sql-clear-right')?.addEventListener('click', () => clearSQLInput('right'));
    document.getElementById('sql-paste-right')?.addEventListener('click', () => pasteSQLInput('right'));
}

function initSQLStatus() {
    ['left', 'right'].forEach(side => {
        const status = document.getElementById(`sql-${side}-status`);
        if (status) {
            status.textContent = '就绪';
            status.className = 'status info';
        }
    });
}

/**
 * 格式化并对比 SQL
 */
window.formatSQL = function() {
    const leftInput = document.getElementById('sql-input-left');
    const rightInput = document.getElementById('sql-input-right');
    if (!leftInput || !rightInput) return;

    const leftText = leftInput.value.trim();
    const rightText = rightInput.value.trim();

    let leftValid = false, rightValid = false;

    // 处理左侧SQL
    if (leftText) {
        try {
            const formatted = formatSQLText(leftText);
            leftInput.value = formatted;
            updateStatus('sql-left-status', '✓ 已格式化', 'success');
            leftValid = true;
        } catch (e) {
            updateStatus('sql-left-status', '✗ SQL 无效', 'error');
            showSQLError('SQL 1 语法错误', e.message);
            return;
        }
    }

    // 处理右侧SQL
    if (rightText) {
        try {
            const formatted = formatSQLText(rightText);
            rightInput.value = formatted;
            updateStatus('sql-right-status', '✓ 已格式化', 'success');
            rightValid = true;
        } catch (e) {
            updateStatus('sql-right-status', '✗ SQL 无效', 'error');
            showSQLError('SQL 2 语法错误', e.message);
            return;
        }
    }

    // 对比两个SQL
    if (leftValid && rightValid) {
        const diffs = findSQLDifferences(leftText, rightText);
        showSQLDiffSummary(diffs);
    } else if (leftValid || rightValid) {
        clearSQLSummary();
    }

    updateCharCount('sql-input-left', 'sql-left-count');
    updateCharCount('sql-input-right', 'sql-right-count');
};

/**
 * 查找 SQL 差异
 */
function findSQLDifferences(left, right) {
    const diffs = [];
    const leftNorm = normalizeSQL(left);
    const rightNorm = normalizeSQL(right);

    if (leftNorm === rightNorm) {
        return diffs;
    }

    // 解析SQL结构
    const leftParsed = parseSQL(left);
    const rightParsed = parseSQL(right);

    // 对比各部分
    compareSQLPart('SELECT', leftParsed, rightParsed, diffs);
    compareSQLPart('FROM', leftParsed, rightParsed, diffs);
    compareSQLPart('WHERE', leftParsed, rightParsed, diffs);
    compareSQLPart('GROUP BY', leftParsed, rightParsed, diffs);
    compareSQLPart('ORDER BY', leftParsed, rightParsed, diffs);

    // 计算相似度
    const similarity = calculateSimilarity(leftNorm, rightNorm);
    diffs.unshift({ type: 'similarity', value: similarity });

    return diffs;
}

function normalizeSQL(sql) {
    return sql.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/['"`]/g, "'")
        .replace(/;$/, '')
        .trim();
}

function parseSQL(sql) {
    const parsed = {
        SELECT: [],
        FROM: [],
        WHERE: [],
        'GROUP BY': [],
        'ORDER BY': [],
        LIMIT: null,
        JOIN: []
    };

    const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM/is);
    if (selectMatch) {
        parsed.SELECT = selectMatch[1].split(',').map(s => s.trim().replace(/^\(.*\)\s+AS\s+/i, ''));
    }

    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    if (fromMatch) {
        parsed.FROM.push(fromMatch[1]);
    }

    const whereMatch = sql.match(/WHERE\s+(.*?)(?:GROUP|ORDER|LIMIT|$)/is);
    if (whereMatch) {
        parsed.WHERE.push(whereMatch[1].trim());
    }

    const groupMatch = sql.match(/GROUP\s+BY\s+(.*?)(?:ORDER|LIMIT|$)/is);
    if (groupMatch) {
        parsed['GROUP BY'] = groupMatch[1].split(',').map(s => s.trim());
    }

    const orderMatch = sql.match(/ORDER\s+BY\s+(.*?)(?:LIMIT|$)/is);
    if (orderMatch) {
        parsed['ORDER BY'] = orderMatch[1].split(',').map(s => s.trim());
    }

    return parsed;
}

function compareSQLPart(part, left, right, diffs) {
    const leftPart = left[part] || [];
    const rightPart = right[part] || [];

    // 找出新增的
    rightPart.forEach(item => {
        if (!leftPart.includes(item)) {
            diffs.push({ type: 'added', part, value: item });
        }
    });

    // 找出删除的
    leftPart.forEach(item => {
        if (!rightPart.includes(item)) {
            diffs.push({ type: 'removed', part, value: item });
        }
    });
}

function calculateSimilarity(left, right) {
    if (left === right) return 100;
    const maxLen = Math.max(left.length, right.length);
    if (maxLen === 0) return 100;

    let matches = 0;
    for (let i = 0; i < Math.min(left.length, right.length); i++) {
        if (left[i] === right[i]) matches++;
    }
    return Math.round((matches / maxLen) * 100);
}

/**
 * 格式化 SQL 文本
 */
function formatSQLText(sql) {
    let formatted = sql;

    // 标准化空白
    formatted = formatted.replace(/\t/g, '    ');
    formatted = formatted.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    formatted = formatted.replace(/[ \t]+$/gm, '');

    // 关键字列表
    const keywords = [
        'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT',
        'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
        'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
        'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'JOIN',
        'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
        'IS NULL', 'IS NOT NULL', 'DISTINCT', 'UNION', 'ALL', 'EXISTS',
        'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
        'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES',
        'CONSTRAINT', 'UNIQUE', 'CHECK', 'DEFAULT'
    ];

    // 排序关键字，长的先匹配
    keywords.sort((a, b) => b.length - a.length);

    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formatted = formatted.replace(regex, keyword);
    });

    // 添加缩进和换行
    formatted = addSQLIndentation(formatted);

    // 添加分号
    const trimmed = formatted.trim();
    if (!trimmed.endsWith(';') && trimmed.length > 0) {
        formatted = trimmed + ';';
    }

    return formatted;
}

/**
 * SQL 缩进
 */
function addSQLIndentation(sql) {
    const lines = sql.split('\n');
    let indentLevel = 0;
    const indentStr = '  ';

    const decreaseKeywords = ['END', 'ELSE', 'WHEN', 'THEN'];
    const increaseKeywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'SET', 'VALUES', 'CASE'];

    const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';

        // 检查是否减少缩进
        for (const kw of decreaseKeywords) {
            if (trimmed.toUpperCase().startsWith(kw)) {
                indentLevel = Math.max(0, indentLevel - 1);
                break;
            }
        }

        const indentedLine = indentStr.repeat(indentLevel) + trimmed;

        // 检查是否增加缩进
        for (const kw of increaseKeywords) {
            if (trimmed.toUpperCase().startsWith(kw)) {
                indentLevel++;
                break;
            }
        }

        return indentedLine;
    });

    return formattedLines.join('\n');
}

/**
 * 显示 SQL 差异汇总
 */
function showSQLDiffSummary(diffs) {
    const panel = document.getElementById('sql-summary');
    const equalCard = document.getElementById('sql-equal-card');
    const errorCard = document.getElementById('sql-error-card');
    const detail = document.getElementById('sql-detail');

    if (!panel) return;

    errorCard.style.display = 'none';

    // 计算统计
    const similarity = diffs.find(d => d.type === 'similarity');
    const added = diffs.filter(d => d.type === 'added');
    const removed = diffs.filter(d => d.type === 'removed');

    if (diffs.length <= 1 && similarity && similarity.value === 100) {
        // 完全相同
        equalCard.innerHTML = '<i class="fas fa-check-circle"></i><span>两SQL完全相同</span>';
        equalCard.style.display = 'flex';
        detail.innerHTML = '';
    } else {
        // 显示相似度和差异
        equalCard.innerHTML = `<i class="fas fa-percentage"></i><span>相似度 <b>${similarity ? similarity.value : 0}%</b></span>`;
        equalCard.style.display = 'flex';

        let html = '<div class="diff-cards">';
        if (added.length > 0) {
            html += `<div class="diff-card diff-added-card"><i class="fas fa-plus-circle"></i><span>新增 <b>${added.length}</b> 项</span></div>`;
        }
        if (removed.length > 0) {
            html += `<div class="diff-card diff-removed-card"><i class="fas fa-minus-circle"></i><span>删除 <b>${removed.length}</b> 项</span></div>`;
        }
        html += '</div>';

        if (added.length > 0 || removed.length > 0) {
            html += '<div class="diff-detail">';
            [...added, ...removed].forEach(diff => {
                const icon = diff.type === 'added' ? 'fa-plus-circle' : 'fa-minus-circle';
                const partName = diff.part || '其他';
                html += `<div class="diff-item-card ${diff.type}">
                    <i class="fas ${icon} diff-icon"></i>
                    <div class="diff-content">
                        <div class="diff-path">${partName}</div>
                        <div class="diff-values">${diff.type === 'added' ? `<span class="new">+ ${diff.value}</span>` : `<span class="old">- ${diff.value}</span>`}</div>
                    </div>
                </div>`;
            });
            html += '</div>';
        }

        detail.innerHTML = html;
    }

    panel.style.display = 'block';
}

function showSQLError(message, details) {
    const panel = document.getElementById('sql-summary');
    const equalCard = document.getElementById('sql-equal-card');
    const errorCard = document.getElementById('sql-error-card');
    const detail = document.getElementById('sql-detail');

    if (!panel) return;

    equalCard.style.display = 'none';
    errorCard.style.display = 'flex';

    detail.innerHTML = `<div class="diff-error-card">
        <i class="fas fa-exclamation-triangle diff-error-icon"></i>
        <div class="diff-error-content">
            <div class="diff-error-title">${message}</div>
            ${details ? `<div class="diff-error-details">${details}</div>` : ''}
        </div>
    </div>`;

    panel.style.display = 'block';
}

function clearSQLSummary() {
    const panel = document.getElementById('sql-summary');
    if (panel) panel.style.display = 'none';
}

function loadSQLExample(side) {
    const examples = {
        left: `SELECT id, name, email FROM users WHERE status = 'active' ORDER BY created_at DESC LIMIT 10`,
        right: `SELECT id, name, email, created_at FROM users WHERE status = 'active' AND age > 18`
    };
    const input = document.getElementById(`sql-input-${side}`);
    if (input) {
        input.value = examples[side];
        input.dispatchEvent(new Event('input'));
        clearSQLSummary();
    }
}

function clearSQLInput(side) {
    const input = document.getElementById(`sql-input-${side}`);
    if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input'));
    }
    clearSQLSummary();
}

async function pasteSQLInput(side) {
    const input = document.getElementById(`sql-input-${side}`);
    if (!input) return;
    try {
        const text = await navigator.clipboard.readText();
        if (text.trim()) {
            input.value = text;
            input.dispatchEvent(new Event('input'));
        }
    } catch (e) {}
}

function updateStatus(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `status ${type}`;
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function updateCharCount(inputId, counterId) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(counterId);
    if (input && counter) counter.textContent = `${input.value.length} 字符`;
}

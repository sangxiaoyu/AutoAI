/**
 * JSON 格式化工具 - 支持左右对比
 */

document.addEventListener('DOMContentLoaded', function() {
    initJSONTool();
});

/**
 * 初始化 JSON 工具
 */
function initJSONTool() {
    initCharCounters();
    bindEvents();
    initStatus();
}

/**
 * 初始化字符计数器
 */
function initCharCounters() {
    const leftInput = document.getElementById('json-input-left');
    const rightInput = document.getElementById('json-input-right');

    if (leftInput) {
        leftInput.addEventListener('input', () => { updateCharCount('json-input-left', 'json-left-count'); validateJSON('left'); });
        updateCharCount('json-input-left', 'json-left-count');
    }

    if (rightInput) {
        rightInput.addEventListener('input', () => { updateCharCount('json-input-right', 'json-right-count'); validateJSON('right'); });
        updateCharCount('json-input-right', 'json-right-count');
    }
}

function validateJSON(side) {
    const input = document.getElementById(`json-input-${side}`);
    const status = document.getElementById(`json-${side}-status`);
    if (!input || !status) return;

    const text = input.value.trim();
    if (!text) { status.textContent = '就绪'; status.className = 'status info'; return; }

    try {
        JSON.parse(text);
        status.textContent = '✓ JSON 有效';
        status.className = 'status success';
    } catch (e) {
        status.textContent = '✗ JSON 无效';
        status.className = 'status error';
    }
}

function initStatus() {
    ['left', 'right'].forEach(side => {
        const status = document.getElementById(`json-${side}-status`);
        if (status) {
            status.textContent = '就绪';
            status.className = 'status info';
        }
    });
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 主按钮
    document.getElementById('json-format')?.addEventListener('click', formatJSON);
    document.getElementById('json-minify')?.addEventListener('click', minifyJSON);

    // 左侧按钮
    document.getElementById('json-example-left')?.addEventListener('click', () => loadExample('left'));
    document.getElementById('json-clear-left')?.addEventListener('click', () => clearInput('left'));
    document.getElementById('json-paste-left')?.addEventListener('click', () => pasteInput('left'));

    // 右侧按钮
    document.getElementById('json-example-right')?.addEventListener('click', () => loadExample('right'));
    document.getElementById('json-clear-right')?.addEventListener('click', () => clearInput('right'));
    document.getElementById('json-paste-right')?.addEventListener('click', () => pasteInput('right'));
}

/**
 * 格式化并对比 JSON
 */
window.formatJSON = function() {
    const leftInput = document.getElementById('json-input-left');
    const rightInput = document.getElementById('json-input-right');
    if (!leftInput || !rightInput) return;

    const leftText = leftInput.value.trim();
    const rightText = rightInput.value.trim();
    const sortKeys = true, indentSize = 2, ignoreOrder = true;

    let leftParsed, rightParsed, leftValid = false, rightValid = false;

    if (leftText) {
        try {
            leftParsed = JSON.parse(leftText);
            leftInput.value = JSON.stringify(leftParsed, getSortedKeys, indentSize);
            leftValid = true;
            updateStatus('json-left-status', '✓ 已格式化', 'success');
        } catch (e) {
            updateStatus('json-left-status', '✗ JSON 无效', 'error');
        }
    }

    if (rightText) {
        try {
            rightParsed = JSON.parse(rightText);
            rightInput.value = JSON.stringify(rightParsed, getSortedKeys, indentSize);
            rightValid = true;
            updateStatus('json-right-status', '✓ 已格式化', 'success');
        } catch (e) {
            updateStatus('json-right-status', '✗ JSON 无效', 'error');
        }
    }

    if (leftValid && rightValid) {
        showDiffResult(findDifferences(leftParsed, rightParsed, '', ignoreOrder));
    } else {
        hideDiffResult();
    }

    // 更新字符计数
    updateCharCount('json-input-left', 'json-left-count');
    updateCharCount('json-input-right', 'json-right-count');
};

/**
 * 压缩 JSON
 */
window.minifyJSON = function() {
    const leftInput = document.getElementById('json-input-left');
    const rightInput = document.getElementById('json-input-right');

    if (leftInput?.value.trim()) {
        try {
            leftInput.value = JSON.stringify(JSON.parse(leftInput.value));
            updateStatus('json-left-status', '✓ 已压缩', 'success');
        } catch (e) {
            updateStatus('json-left-status', '✗ JSON 无效', 'error');
        }
    }

    if (rightInput?.value.trim()) {
        try {
            rightInput.value = JSON.stringify(JSON.parse(rightInput.value));
            updateStatus('json-right-status', '✓ 已压缩', 'success');
        } catch (e) {
            updateStatus('json-right-status', '✗ JSON 无效', 'error');
        }
    }

    updateCharCount('json-input-left', 'json-left-count');
    updateCharCount('json-input-right', 'json-right-count');
};

/**
 * 格式化并对比 JSON
 */
window.formatJSON = function() {
    const leftInput = document.getElementById('json-input-left');
    const rightInput = document.getElementById('json-input-right');
    if (!leftInput || !rightInput) return;

    const leftText = leftInput.value.trim();
    const rightText = rightInput.value.trim();
    const sortKeys = true, indentSize = 2, ignoreOrder = true;

    let leftParsed, rightParsed, leftValid = false, rightValid = false;

    // 处理左侧JSON
    if (leftText) {
        try {
            leftParsed = JSON.parse(leftText);
            leftValid = true;
            leftInput.value = JSON.stringify(leftParsed, getSortedKeys, indentSize);
            updateStatus('json-left-status', '✓ 已格式化', 'success');
        } catch (e) {
            updateStatus('json-left-status', '✗ JSON 无效', 'error');
            showErrorInDiffArea('JSON 1 语法错误', `错误位置：${e.message}`);
            return;
        }
    }

    // 处理右侧JSON
    if (rightText) {
        try {
            rightParsed = JSON.parse(rightText);
            rightValid = true;
            rightInput.value = JSON.stringify(rightParsed, getSortedKeys, indentSize);
            updateStatus('json-right-status', '✓ 已格式化', 'success');
        } catch (e) {
            updateStatus('json-right-status', '✗ JSON 无效', 'error');
            showErrorInDiffArea('JSON 2 语法错误', `错误位置：${e.message}`);
            return;
        }
    }

    // 只有两边都有效时才进行对比
    if (leftValid && rightValid) {
        const diffs = findDifferences(leftParsed, rightParsed, '', ignoreOrder);
        showDiffSummary(diffs);
        showToast(diffs.length > 0 ? `发现 ${diffs.length} 处差异` : '两JSON完全相同', diffs.length > 0 ? 'info' : 'success');
    } else if (leftValid || rightValid) {
        // 只有一边有效时隐藏对比区域
        clearDiffSummary();
    }

    updateCharCount('json-input-left', 'json-left-count');
    updateCharCount('json-input-right', 'json-right-count');
};

/**
 * 查找差异
 */
function findDifferences(left, right, path = '', ignoreOrder = false) {
    const diffs = [];

    if (typeof left !== typeof right) {
        diffs.push({ type: 'modified', path: path || 'root', left: left, right: right });
        return diffs;
    }

    if (left === null && right === null) return diffs;

    if (Array.isArray(left) && Array.isArray(right)) {
        if (ignoreOrder) {
            const normLeft = normalizeArray(left);
            const normRight = normalizeArray(right);
            if (JSON.stringify(normLeft) !== JSON.stringify(normRight)) {
                diffs.push({ type: 'modified', path: path || 'root', left: left, right: right });
            }
        } else {
            const maxLen = Math.max(left.length, right.length);
            for (let i = 0; i < maxLen; i++) {
                const itemPath = `${path}[${i}]`;
                if (i >= left.length) {
                    diffs.push({ type: 'added', path: itemPath, right: right[i] });
                } else if (i >= right.length) {
                    diffs.push({ type: 'removed', path: itemPath, left: left[i] });
                } else {
                    diffs.push(...findDifferences(left[i], right[i], itemPath, ignoreOrder));
                }
            }
        }
        return diffs;
    }

    if (typeof left === 'object' && typeof right === 'object') {
        const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
        allKeys.forEach(key => {
            const keyPath = path ? `${path}.${key}` : key;
            if (!(key in left)) {
                diffs.push({ type: 'added', path: keyPath, right: right[key] });
            } else if (!(key in right)) {
                diffs.push({ type: 'removed', path: keyPath, left: left[key] });
            } else {
                diffs.push(...findDifferences(left[key], right[key], keyPath, ignoreOrder));
            }
        });
        return diffs;
    }

    if (left !== right) {
        diffs.push({ type: 'modified', path: path, left: left, right: right });
    }

    return diffs;
}

/**
 * 规范化数组
 */
function normalizeArray(arr) {
    if (!Array.isArray(arr)) return arr;
    return arr.map(item => {
        if (typeof item === 'object' && item !== null) {
            if (Array.isArray(item)) return normalizeArray(item);
            const sorted = {};
            Object.keys(item).sort().forEach(k => sorted[k] = normalizeArray(item[k]));
            return sorted;
        }
        return item;
    }).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

/**
 * 显示差异汇总
 */
function showDiffSummary(diffs) {
    const panel = document.getElementById('diff-summary');
    const equalCard = document.getElementById('diff-equal-card');
    const addedCard = document.getElementById('diff-added-card');
    const removedCard = document.getElementById('diff-removed-card');
    const modifiedCard = document.getElementById('diff-modified-card');
    const detail = document.getElementById('diff-detail');

    if (!panel) return;

    const stats = {
        added: diffs.filter(d => d.type === 'added').length,
        removed: diffs.filter(d => d.type === 'removed').length,
        modified: diffs.filter(d => d.type === 'modified').length
    };

    document.getElementById('diff-added-count').textContent = stats.added;
    document.getElementById('diff-removed-count').textContent = stats.removed;
    document.getElementById('diff-modified-count').textContent = stats.modified;

    // 显示/隐藏卡片
    equalCard.style.display = diffs.length === 0 ? 'flex' : 'none';
    addedCard.style.display = stats.added > 0 ? 'flex' : 'none';
    removedCard.style.display = stats.removed > 0 ? 'flex' : 'none';
    modifiedCard.style.display = stats.modified > 0 ? 'flex' : 'none';

    // 生成详情
    if (diffs.length > 0) {
        let html = '';
        diffs.forEach(diff => {
            const icon = diff.type === 'added' ? 'fa-plus-circle' :
                        diff.type === 'removed' ? 'fa-minus-circle' : 'fa-pen-circle';
            const pathLabel = diff.path || 'root';

            html += `<div class="diff-item-card ${diff.type}">
                <i class="fas ${icon} diff-icon"></i>
                <div class="diff-content">
                    <div class="diff-path">${pathLabel}</div>
                    <div class="diff-values">
                        ${diff.type !== 'added' ? `<span class="old">- ${JSON.stringify(diff.left)}</span>` : ''}
                        ${diff.type !== 'removed' ? `<span class="new">+ ${JSON.stringify(diff.right)}</span>` : ''}
                    </div>
                </div>
            </div>`;
        });
        detail.innerHTML = html;
    } else {
        detail.innerHTML = '';
    }

    panel.style.display = 'block';
}

function clearDiffSummary() {
    const panel = document.getElementById('diff-summary');
    if (panel) panel.style.display = 'none';
}

function showErrorInDiffArea(message, details = '') {
    const panel = document.getElementById('diff-summary');
    const equalCard = document.getElementById('diff-equal-card');
    const addedCard = document.getElementById('diff-added-card');
    const removedCard = document.getElementById('diff-removed-card');
    const modifiedCard = document.getElementById('diff-modified-card');
    const detail = document.getElementById('diff-detail');

    if (!panel) return;

    // 隐藏统计卡片
    equalCard.style.display = 'none';
    addedCard.style.display = 'none';
    removedCard.style.display = 'none';
    modifiedCard.style.display = 'none';

    // 显示错误信息
    let html = `<div class="diff-error-card">
        <i class="fas fa-exclamation-triangle diff-error-icon"></i>
        <div class="diff-error-content">
            <div class="diff-error-title">${message}</div>
            ${details ? `<div class="diff-error-details">${details}</div>` : ''}
        </div>
    </div>`;
    detail.innerHTML = html;
    panel.style.display = 'block';
}

/**
 * 压缩 JSON
 */
window.minifyJSON = function() {
    const leftInput = document.getElementById('json-input-left');
    const rightInput = document.getElementById('json-input-right');

    if (leftInput?.value.trim()) {
        try {
            leftInput.value = JSON.stringify(JSON.parse(leftInput.value));
            updateStatus('json-left-status', '✓ 已压缩', 'success');
        } catch (e) {
            updateStatus('json-left-status', '✗ JSON 无效', 'error');
        }
    }

    if (rightInput?.value.trim()) {
        try {
            rightInput.value = JSON.stringify(JSON.parse(rightInput.value));
            updateStatus('json-right-status', '✓ 已压缩', 'success');
        } catch (e) {
            updateStatus('json-right-status', '✗ JSON 无效', 'error');
        }
    }

    clearDiffSummary();
    updateCharCount('json-input-left', 'json-left-count');
    updateCharCount('json-input-right', 'json-right-count');
};

function updateStatus(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `status ${type}`;
    }
}

function updateStatus(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    if (element) { element.textContent = message; element.className = `status ${type}`; }
}

function getSortedKeys(key, value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.keys(value).sort().reduce((sorted, k) => { sorted[k] = value[k]; return sorted; }, {});
    }
    return value;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function loadExample(side) {
    const examples = {
        left: { "name": "张三", "age": 28, "city": "北京", "skills": ["JavaScript", "Python", "Go"], "active": true },
        right: { "name": "李四", "age": 28, "city": "上海", "skills": ["Python", "Java", "Go"], "active": false }
    };
    const input = document.getElementById(`json-input-${side}`);
    if (input) { input.value = JSON.stringify(examples[side], null, 2); input.dispatchEvent(new Event('input')); clearDiffSummary(); }
}

function clearInput(side) {
    const input = document.getElementById(`json-input-${side}`);
    if (input) { input.value = ''; input.dispatchEvent(new Event('input')); }
    clearDiffSummary();
}

async function pasteInput(side) {
    const input = document.getElementById(`json-input-${side}`);
    if (!input) return;
    try {
        const text = await navigator.clipboard.readText();
        if (text.trim()) { input.value = text; input.dispatchEvent(new Event('input')); }
    } catch (e) {}
}

function updateCharCount(inputId, counterId) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(counterId);
    if (input && counter) counter.textContent = `${input.value.length} 字符`;
}

window.getSortedKeys = getSortedKeys;

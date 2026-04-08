/**
 * HTML 实体编解码模块
 */

// HTML 特殊字符映射
const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};

const htmlEntitiesReverse = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' '
};

// HTML 编码
function htmlEncode() {
    const input = document.getElementById('html-input');
    const output = document.getElementById('html-output');
    
    if (!input?.value.trim()) {
        showStatus('html-status', 'html-status-card', '请输入要编码的内容', 'warning');
        return;
    }
    
    try {
        let result = input.value;
        for (const [key, value] of Object.entries(htmlEntities)) {
            result = result.replace(new RegExp(key === '&' ? '\\&' : key, 'g'), value);
        }
        output.value = result;
        updateCharCount('html-output', 'html-output-count');
        showStatus('html-status', 'html-status-card', '编码成功', 'success');
    } catch (e) {
        showStatus('html-status', 'html-status-card', '编码失败', 'error');
    }
}

// HTML 解码
function htmlDecode() {
    const input = document.getElementById('html-input');
    const output = document.getElementById('html-output');
    
    if (!input?.value.trim()) {
        showStatus('html-status', 'html-status-card', '请输入要解码的内容', 'warning');
        return;
    }
    
    try {
        let result = input.value;
        for (const [key, value] of Object.entries(htmlEntitiesReverse)) {
            result = result.replace(new RegExp(key.replace(/[&|]/g, '\\$&'), 'g'), value);
        }
        output.value = result;
        updateCharCount('html-output', 'html-output-count');
        showStatus('html-status', 'html-status-card', '解码成功', 'success');
    } catch (e) {
        showStatus('html-status', 'html-status-card', '解码失败', 'error');
    }
}

// 清除 HTML
function clearHtml() {
    document.getElementById('html-input').value = '';
    document.getElementById('html-output').value = '';
    updateCharCount('html-input', 'html-input-count');
    updateCharCount('html-output', 'html-output-count');
    hideStatus('html-status');
}

// 复制 HTML 结果
async function copyHtmlResult() {
    const output = document.getElementById('html-output');
    if (!output?.value) {
        showToast('没有内容可复制', 'warning');
        return;
    }
    try {
        await navigator.clipboard.writeText(output.value);
        showToast('已复制到剪贴板', 'success');
    } catch (e) {
        showToast('复制失败', 'error');
    }
}

// 交换 HTML 内容（交换后自动解码）
function swapHtml() {
    const input = document.getElementById('html-input');
    const output = document.getElementById('html-output');
    const temp = input.value;
    input.value = output.value;
    output.value = '';
    updateCharCount('html-input', 'html-input-count');
    updateCharCount('html-output', 'html-output-count');
    if (temp) htmlDecode();
}

/**
 * Base64 编解码模块
 */

// 示例数据
const base64Examples = {
    input: 'Hello World！你好世界',
    output: 'SGVsbG8gV29ybGQh5L2g5aW95LiW5biC'
};

// Base64 编码
function base64Encode() {
    const input = document.getElementById('base64-input');
    const output = document.getElementById('base64-output');
    
    if (!input?.value.trim()) {
        showStatus('base64-status', 'base64-status-card', '请输入要编码的内容', 'warning');
        return;
    }
    
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(input.value);
        const base64 = btoa(String.fromCharCode(...data));
        output.value = base64;
        updateCharCount('base64-output', 'base64-output-count');
        showStatus('base64-status', 'base64-status-card', '编码成功', 'success');
    } catch (e) {
        showStatus('base64-status', 'base64-status-card', '编码失败：' + e.message, 'error');
    }
}

// Base64 解码
function base64Decode() {
    const input = document.getElementById('base64-input');
    const output = document.getElementById('base64-output');
    
    if (!input?.value.trim()) {
        showStatus('base64-status', 'base64-status-card', '请输入要解码的内容', 'warning');
        return;
    }
    
    try {
        const decoded = atob(input.value.trim());
        output.value = decoded;
        updateCharCount('base64-output', 'base64-output-count');
        showStatus('base64-status', 'base64-status-card', '解码成功', 'success');
    } catch (e) {
        showStatus('base64-status', 'base64-status-card', '解码失败：不是有效的 Base64 字符串', 'error');
    }
}

// 清除 Base64
function clearBase64() {
    document.getElementById('base64-input').value = '';
    document.getElementById('base64-output').value = '';
    updateCharCount('base64-input', 'base64-input-count');
    updateCharCount('base64-output', 'base64-output-count');
    hideStatus('base64-status');
}

// 复制 Base64 结果
async function copyBase64Result() {
    const output = document.getElementById('base64-output');
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

// 交换 Base64 内容（交换后自动解码）
function swapBase64() {
    const input = document.getElementById('base64-input');
    const output = document.getElementById('base64-output');
    const temp = input.value;
    input.value = output.value;
    output.value = '';
    updateCharCount('base64-input', 'base64-input-count');
    updateCharCount('base64-output', 'base64-output-count');
    if (temp) base64Decode();
}

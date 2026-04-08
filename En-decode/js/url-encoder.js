/**
 * URL 编解码模块
 */

// URL 编码
function urlEncode() {
    const input = document.getElementById('url-input');
    const output = document.getElementById('url-output');
    
    if (!input?.value.trim()) {
        showStatus('url-status', 'url-status-card', '请输入要编码的 URL', 'warning');
        return;
    }
    
    try {
        output.value = encodeURIComponent(input.value);
        updateCharCount('url-output', 'url-output-count');
        showStatus('url-status', 'url-status-card', '编码成功', 'success');
    } catch (e) {
        showStatus('url-status', 'url-status-card', '编码失败', 'error');
    }
}

// URL 解码
function urlDecode() {
    const input = document.getElementById('url-input');
    const output = document.getElementById('url-output');
    
    if (!input?.value.trim()) {
        showStatus('url-status', 'url-status-card', '请输入要解码的内容', 'warning');
        return;
    }
    
    try {
        output.value = decodeURIComponent(input.value);
        updateCharCount('url-output', 'url-output-count');
        showStatus('url-status', 'url-status-card', '解码成功', 'success');
    } catch (e) {
        showStatus('url-status', 'url-status-card', '解码失败：无效的 URL 编码', 'error');
    }
}

// 清除 URL
function clearUrl() {
    document.getElementById('url-input').value = '';
    document.getElementById('url-output').value = '';
    updateCharCount('url-input', 'url-input-count');
    updateCharCount('url-output', 'url-output-count');
    hideStatus('url-status');
}

// 复制 URL 结果
async function copyUrlResult() {
    const output = document.getElementById('url-output');
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

// 交换 URL 内容（交换后自动解码）
function swapUrl() {
    const input = document.getElementById('url-input');
    const output = document.getElementById('url-output');
    const temp = input.value;
    input.value = output.value;
    output.value = '';
    updateCharCount('url-input', 'url-input-count');
    updateCharCount('url-output', 'url-output-count');
    if (temp) urlDecode();
}

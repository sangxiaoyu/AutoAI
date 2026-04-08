/**
 * 主逻辑模块
 */

document.addEventListener('DOMContentLoaded', function() {
    initToolTabs();
    initCharCounters();
    bindEvents();
});

function initToolTabs() {
    const tabs = document.querySelectorAll('.tool-tab');
    const sections = document.querySelectorAll('.tool-section');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tool = this.dataset.tool;
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(`${tool}-tool`)?.classList.add('active');
        });
    });
}

function initCharCounters() {
    ['base64', 'url', 'html'].forEach(tool => {
        const input = document.getElementById(`${tool}-input`);
        const output = document.getElementById(`${tool}-output`);
        if (input) {
            input.addEventListener('input', () => updateCharCount(`${tool}-input`, `${tool}-input-count`));
            updateCharCount(`${tool}-input`, `${tool}-input-count`);
        }
        if (output) {
            output.addEventListener('input', () => updateCharCount(`${tool}-output`, `${tool}-output-count`));
            updateCharCount(`${tool}-output`, `${tool}-output-count`);
        }
    });
}

function updateCharCount(inputId, counterId) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(counterId);
    if (input && counter) counter.textContent = `${input.value.length} 字符`;
}

function bindEvents() {
    // Base64
    document.getElementById('base64-encode')?.addEventListener('click', base64Encode);
    document.getElementById('base64-decode')?.addEventListener('click', base64Decode);
    document.getElementById('base64-clear')?.addEventListener('click', clearBase64);
    document.getElementById('base64-copy')?.addEventListener('click', copyBase64Result);
    document.getElementById('base64-swap')?.addEventListener('click', swapBase64);
    document.getElementById('base64-example')?.addEventListener('click', () => {
        document.getElementById('base64-input').value = 'Hello World！你好世界';
        updateCharCount('base64-input', 'base64-input-count');
        showStatus('base64-status', 'base64-status-card', '示例已加载', 'success');
    });
    document.getElementById('base64-paste')?.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('base64-input').value = text;
            updateCharCount('base64-input', 'base64-input-count');
            showToast('已从剪贴板粘贴', 'success');
        } catch (e) {
            showToast('粘贴失败', 'error');
        }
    });

    // URL
    document.getElementById('url-encode')?.addEventListener('click', urlEncode);
    document.getElementById('url-decode')?.addEventListener('click', urlDecode);
    document.getElementById('url-clear')?.addEventListener('click', clearUrl);
    document.getElementById('url-copy')?.addEventListener('click', copyUrlResult);
    document.getElementById('url-swap')?.addEventListener('click', swapUrl);
    document.getElementById('url-example')?.addEventListener('click', () => {
        document.getElementById('url-input').value = 'https://example.com?name=张三&city=北京';
        updateCharCount('url-input', 'url-input-count');
        showStatus('url-status', 'url-status-card', '示例已加载', 'success');
    });
    document.getElementById('url-paste')?.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('url-input').value = text;
            updateCharCount('url-input', 'url-input-count');
            showToast('已从剪贴板粘贴', 'success');
        } catch (e) {
            showToast('粘贴失败', 'error');
        }
    });

    // HTML
    document.getElementById('html-encode')?.addEventListener('click', htmlEncode);
    document.getElementById('html-decode')?.addEventListener('click', htmlDecode);
    document.getElementById('html-clear')?.addEventListener('click', clearHtml);
    document.getElementById('html-copy')?.addEventListener('click', copyHtmlResult);
    document.getElementById('html-swap')?.addEventListener('click', swapHtml);
    document.getElementById('html-example')?.addEventListener('click', () => {
        document.getElementById('html-input').value = '<script>alert("XSS")</script> & "双引号"';
        updateCharCount('html-input', 'html-input-count');
        showStatus('html-status', 'html-status-card', '示例已加载', 'success');
    });
    document.getElementById('html-paste')?.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('html-input').value = text;
            updateCharCount('html-input', 'html-input-count');
            showToast('已从剪贴板粘贴', 'success');
        } catch (e) {
            showToast('粘贴失败', 'error');
        }
    });
}

function showStatus(panelId, cardId, message, type) {
    const panel = document.getElementById(panelId);
    const card = document.getElementById(cardId);
    if (!panel || !card) return;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle' };
    card.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i><span>${message}</span>`;
    card.className = `status-card ${type}`;
    panel.style.display = 'block';
}

function hideStatus(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) panel.style.display = 'none';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const icons = { success: 'fa-check', error: 'fa-times', warning: 'fa-exclamation', info: 'fa-info' };
    toast.innerHTML = `<i class="fas ${icons[type] || 'fa-info'}"></i>${message}`;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

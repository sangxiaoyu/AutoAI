/**
 * 翻译功能 JavaScript
 * 使用 MyMemory Translation API
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM 元素
    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');
    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    const translateBtn = document.getElementById('translateBtn');
    const swapBtn = document.getElementById('swapLang');
    const clearBtn = document.getElementById('clearBtn');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    
    /**
     * 翻译函数
     * 调用 MyMemory Translation API 进行翻译
     */
    async function translate() {
        const text = sourceText.value.trim();
        
        if (!text) {
            showError('请输入要翻译的文本');
            return;
        }
        
        const fromLang = sourceLang.value;
        const toLang = targetLang.value;
        
        // 如果源语言和目标语言相同
        if (fromLang === toLang && fromLang !== 'auto') {
            showError('源语言和目标语言不能相同');
            return;
        }
        
        // 显示加载状态
        loading.classList.add('active');
        errorMessage.classList.remove('active');
        targetText.value = '';
        
        try {
            // 使用 MyMemory API (免费，无需API密钥)
            const langPair = fromLang === 'auto' ? `${toLang}` : `${fromLang}|${toLang}`;
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.responseStatus === 200 && data.responseData) {
                targetText.value = data.responseData.translatedText;
                
                // 如果有匹配度信息，可以在控制台查看
                console.log('匹配度:', data.responseData.match);
            } else {
                throw new Error('翻译失败，请稍后重试');
            }
        } catch (error) {
            console.error('翻译错误:', error);
            showError('翻译失败，请检查网络后重试');
        } finally {
            loading.classList.remove('active');
        }
    }
    
    /**
     * 显示错误信息
     * @param {string} message - 错误消息内容
     */
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('active');
    }
    
    /**
     * 交换源语言和目标语言
     */
    function swapLanguages() {
        const sourceVal = sourceLang.value;
        const targetVal = targetLang.value;
        
        // 如果源语言是自动检测，不能交换
        if (sourceVal === 'auto') {
            showError('自动检测语言不能作为目标语言');
            return;
        }
        
        sourceLang.value = targetVal;
        targetLang.value = sourceVal;
        
        // 交换文本框内容
        const sourceTextValue = sourceText.value;
        const targetTextValue = targetText.value;
        
        if (sourceTextValue || targetTextValue) {
            sourceText.value = targetTextValue;
            targetText.value = '';
            
            if (targetTextValue) {
                // 如果有译文，自动翻译回来
                setTimeout(() => translate(), 100);
            }
        }
    }
    
    /**
     * 清空所有内容
     */
    function clearAll() {
        sourceText.value = '';
        targetText.value = '';
        errorMessage.classList.remove('active');
    }
    
    // 事件监听
    translateBtn.addEventListener('click', translate);
    swapBtn.addEventListener('click', swapLanguages);
    clearBtn.addEventListener('click', clearAll);
    
    // 快捷键：Ctrl + Enter 翻译
    sourceText.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            translate();
        }
    });
    
    // 输入时清除错误提示并更新字符计数
    sourceText.addEventListener('input', function() {
        errorMessage.classList.remove('active');
        updateCharCount();
    });
    
    // 语言选择变化时清除错误提示
    sourceLang.addEventListener('change', function() {
        errorMessage.classList.remove('active');
    });
    
    targetLang.addEventListener('change', function() {
        errorMessage.classList.remove('active');
    });
    
    // 初始化字符计数
    updateCharCount();
    
    // 示例：默认显示一些示例文本
    sourceText.value = 'Hello, how are you?';
    setTimeout(() => translate(), 500);
});

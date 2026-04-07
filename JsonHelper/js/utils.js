/**
 * 工具函数库
 * 提供各种辅助功能
 */

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 深拷贝对象
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 深拷贝后的对象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.reduce((arr, item, i) => {
            arr[i] = deepClone(item);
            return arr;
        }, []);
    }
    
    if (typeof obj === 'object') {
        return Object.keys(obj).reduce((newObj, key) => {
            newObj[key] = deepClone(obj[key]);
            return newObj;
        }, {});
    }
}

/**
 * 生成随机ID
 * @param {number} length - ID长度
 * @returns {string} 随机ID
 */
function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取URL参数
 * @param {string} name - 参数名
 * @returns {string|null} 参数值
 */
function getUrlParameter(name) {
    name = name.replace(/[[]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * 设置URL参数
 * @param {string} key - 参数键
 * @param {string} value - 参数值
 */
function setUrlParameter(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
}

/**
 * 移除URL参数
 * @param {string} key - 参数键
 */
function removeUrlParameter(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.replaceState({}, '', url);
}

/**
 * 检测设备类型
 * @returns {Object} 设备信息
 */
function detectDevice() {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)|Tablet|Silk/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;
    
    return {
        isMobile,
        isTablet,
        isDesktop,
        userAgent
    };
}

/**
 * 检测浏览器类型
 * @returns {Object} 浏览器信息
 */
function detectBrowser() {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let version = '';
    
    if (userAgent.indexOf('Firefox') > -1) {
        browser = 'Firefox';
        version = userAgent.match(/Firefox\/(\d+)/)?.[1] || '';
    } else if (userAgent.indexOf('Chrome') > -1) {
        browser = 'Chrome';
        version = userAgent.match(/Chrome\/(\d+)/)?.[1] || '';
    } else if (userAgent.indexOf('Safari') > -1) {
        browser = 'Safari';
        version = userAgent.match(/Version\/(\d+)/)?.[1] || '';
    } else if (userAgent.indexOf('Edge') > -1) {
        browser = 'Edge';
        version = userAgent.match(/Edge\/(\d+)/)?.[1] || '';
    } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
        browser = 'IE';
        version = userAgent.match(/(MSIE |rv:)(\d+)/)?.[2] || '';
    }
    
    return { browser, version };
}

/**
 * 检测操作系统
 * @returns {string} 操作系统名称
 */
function detectOS() {
    const userAgent = navigator.userAgent;
    
    if (userAgent.indexOf('Win') !== -1) return 'Windows';
    if (userAgent.indexOf('Mac') !== -1) return 'MacOS';
    if (userAgent.indexOf('Linux') !== -1) return 'Linux';
    if (userAgent.indexOf('Android') !== -1) return 'Android';
    if (userAgent.indexOf('iOS') !== -1 || userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) return 'iOS';
    
    return 'Unknown';
}

/**
 * 检测暗色模式
 * @returns {boolean} 是否启用暗色模式
 */
function isDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * 检测网络连接状态
 * @returns {Promise<boolean>} 是否在线
 */
async function checkNetworkStatus() {
    if (!navigator.onLine) {
        return false;
    }
    
    try {
        const response = await fetch('https://httpbin.org/status/200', {
            method: 'HEAD',
            cache: 'no-cache',
            timeout: 5000
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * 获取网络信息
 * @returns {Object} 网络信息
 */
function getNetworkInfo() {
    if ('connection' in navigator) {
        const connection = navigator.connection;
        return {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData,
            type: connection.type
        };
    }
    return null;
}

/**
 * 保存到本地存储
 * @param {string} key - 存储键
 * @param {*} value - 存储值
 */
function saveToLocalStorage(key, value) {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error('保存到本地存储失败:', error);
        return false;
    }
}

/**
 * 从本地存储加载
 * @param {string} key - 存储键
 * @param {*} defaultValue - 默认值
 * @returns {*} 存储的值或默认值
 */
function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const serialized = localStorage.getItem(key);
        if (serialized === null) {
            return defaultValue;
        }
        return JSON.parse(serialized);
    } catch (error) {
        console.error('从本地存储加载失败:', error);
        return defaultValue;
    }
}

/**
 * 移除本地存储项
 * @param {string} key - 存储键
 */
function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('移除本地存储失败:', error);
        return false;
    }
}

/**
 * 清除所有本地存储
 */
function clearLocalStorage() {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('清除本地存储失败:', error);
        return false;
    }
}

/**
 * 保存到会话存储
 * @param {string} key - 存储键
 * @param {*} value - 存储值
 */
function saveToSessionStorage(key, value) {
    try {
        const serialized = JSON.stringify(value);
        sessionStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error('保存到会话存储失败:', error);
        return false;
    }
}

/**
 * 从会话存储加载
 * @param {string} key - 存储键
 * @param {*} defaultValue - 默认值
 * @returns {*} 存储的值或默认值
 */
function loadFromSessionStorage(key, defaultValue = null) {
    try {
        const serialized = sessionStorage.getItem(key);
        if (serialized === null) {
            return defaultValue;
        }
        return JSON.parse(serialized);
    } catch (error) {
        console.error('从会话存储加载失败:', error);
        return defaultValue;
    }
}

/**
 * 下载文件
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 * @param {string} type - MIME类型
 */
function downloadFile(content, filename, type = 'text/plain') {
    try {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('下载文件失败:', error);
        return false;
    }
}

/**
 * 读取文件
 * @param {File} file - 文件对象
 * @returns {Promise<string>} 文件内容
 */
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 是否成功
 */
async function copyTextToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-999999px';
            textarea.style.top = '-999999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);
            return successful;
        }
    } catch (error) {
        console.error('复制到剪贴板失败:', error);
        return false;
    }
}

/**
 * 从剪贴板读取文本
 * @returns {Promise<string>} 剪贴板内容
 */
async function readTextFromClipboard() {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            return await navigator.clipboard.readText();
        } else {
            throw new Error('Clipboard API not available');
        }
    } catch (error) {
        console.error('读取剪贴板失败:', error);
        throw error;
    }
}

/**
 * 显示确认对话框
 * @param {string} message - 消息内容
 * @param {string} title - 对话框标题
 * @returns {Promise<boolean>} 用户是否确认
 */
async function showConfirmDialog(message, title = '确认') {
    return new Promise((resolve) => {
        // 创建对话框
        const dialog = document.createElement('div');
        dialog.className = 'custom-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay"></div>
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>${title}</h3>
                    <button class="dialog-close">&times;</button>
                </div>
                <div class="dialog-body">
                    <p>${message}</p>
                </div>
                <div class="dialog-footer">
                    <button class="btn btn-secondary dialog-cancel">取消</button>
                    <button class="btn btn-primary dialog-confirm">确认</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 显示对话框
        setTimeout(() => dialog.classList.add('show'), 10);
        
        // 处理事件
        const closeDialog = (result) => {
            dialog.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(dialog);
                resolve(result);
            }, 300);
        };
        
        dialog.querySelector('.dialog-close').addEventListener('click', () => closeDialog(false));
        dialog.querySelector('.dialog-cancel').addEventListener('click', () => closeDialog(false));
        dialog.querySelector('.dialog-confirm').addEventListener('click', () => closeDialog(true));
        dialog.querySelector('.dialog-overlay').addEventListener('click', () => closeDialog(false));
        
        // ESC键关闭
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                closeDialog(false);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    });
}

/**
 * 显示通知
 * @param {string} title - 通知标题
 * @param {Object} options - 通知选项
 */
function showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, options);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, options);
            }
        });
    }
}

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式字符串
 * @returns {string} 格式化后的日期
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = date instanceof Date ? date : new Date(date);
    
    const pad = (n) => n.toString().padStart(2, '0');
    
    const replacements = {
        YYYY: d.getFullYear(),
        MM: pad(d.getMonth() + 1),
        DD: pad(d.getDate()),
        HH: pad(d.getHours()),
        mm: pad(d.getMinutes()),
        ss: pad(d.getSeconds()),
        SSS: pad(d.getMilliseconds(), 3)
    };
    
    return format.replace(/YYYY|MM|DD|HH|mm|ss|SSS/g, match => replacements[match]);
}

/**
 * 格式化数字
 * @param {number} number - 数字
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的数字
 */
function formatNumber(number, decimals = 2) {
    return Number(number).toLocaleString('zh-CN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * 生成UUID
 * @returns {string} UUID
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * 验证URL格式
 * @param {string} url - URL地址
 * @returns {boolean} 是否有效
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * 验证手机号格式（中国）
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
function isValidChinesePhone(phone) {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
}

// 导出所有函数
window.utils = {
    debounce,
    throttle,
    deepClone,
    generateId,
    formatFileSize,
    getUrlParameter,
    setUrlParameter,
    removeUrlParameter,
    detectDevice,
    detectBrowser,
    detectOS,
    isDarkMode,
    checkNetworkStatus,
    getNetworkInfo,
    saveToLocalStorage,
    loadFromLocalStorage,
    removeFromLocalStorage,
    clearLocalStorage,
    saveToSessionStorage,
    loadFromSessionStorage,
    downloadFile,
    readFile,
    copyTextToClipboard,
    readTextFromClipboard,
    showConfirmDialog,
    showNotification,
    formatDate,
    formatNumber,
    generateUUID,
    isValidEmail,
    isValidUrl,
    isValidChinesePhone
};

console.log('工具函数库已加载');
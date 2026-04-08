/**
 * IP 地址查询模块
 */

// API 地址列表（支持 CORS）
const API_URLS = [
    'https://ipapi.co/json/',              // 主 API（支持 CORS）
    'https://api.ip.sb/geoip/',            // 备用 API 1
    'https://ipinfo.io/json'               // 备用 API 2
];

// 当前使用的 API 索引
let currentApiIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // 绑定事件
    document.getElementById('search-btn').addEventListener('click', searchIP);
    document.getElementById('my-ip-btn').addEventListener('click', getMyIP);
    document.getElementById('history-btn').addEventListener('click', showHistoryModal);
    document.getElementById('close-history').addEventListener('click', closeHistoryModal);
    document.getElementById('clear-history').addEventListener('click', clearHistory);
    document.getElementById('copy-result').addEventListener('click', copyResult);
    document.getElementById('new-search').addEventListener('click', resetSearch);
    document.getElementById('retry-btn').addEventListener('click', resetSearch);

    // 回车查询
    document.getElementById('ip-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchIP();
    });

    // 点击弹窗背景关闭
    document.getElementById('history-modal').addEventListener('click', function(e) {
        if (e.target === this) closeHistoryModal();
    });
}

// IP 地址验证
function isValidIP(ip) {
    if (!ip) return false;
    // IPv4
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(ip)) {
        const parts = ip.split('.');
        return parts.every(part => parseInt(part) <= 255);
    }
    // IPv6 (简化验证)
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    return ipv6Regex.test(ip);
}

// 查询 IP
async function searchIP() {
    const input = document.getElementById('ip-input');
    const ip = input.value.trim();

    if (ip && !isValidIP(ip)) {
        showError('请输入有效的 IP 地址');
        return;
    }

    showLoading();

    // 尝试多个 API
    for (let i = 0; i < API_URLS.length; i++) {
        try {
            const baseUrl = API_URLS[i];
            const url = ip ? `${baseUrl}${ip}` : baseUrl;
            const response = await fetch(url);

            if (!response.ok) throw new Error('查询失败');

            const data = await response.json();

            // 检查 API 返回的错误
            if (data.status === 'fail') {
                throw new Error(data.message || 'IP 地址查询失败');
            }
            if (data.error) {
                throw new Error(data.reason || 'IP 地址查询失败');
            }

            // 统一数据格式
            const normalizedData = normalizeApiResponse(data, i);
            showResult(normalizedData, ip || normalizedData.ip);
            addToHistory(normalizedData, ip || normalizedData.ip);
            return; // 成功则返回
        } catch (error) {
            if (i === API_URLS.length - 1) {
                showError(error.message || '网络错误，请检查网络连接');
            }
        }
    }
}

// 获取本机 IP
async function getMyIP() {
    document.getElementById('ip-input').value = '';
    showLoading();

    // 尝试多个 API
    for (let i = 0; i < API_URLS.length; i++) {
        try {
            const response = await fetch(API_URLS[i]);

            if (!response.ok) throw new Error('获取失败');

            const data = await response.json();

            if (data.status === 'fail') {
                throw new Error(data.message || '获取本机 IP 失败');
            }
            if (data.error) {
                throw new Error(data.reason || '获取本机 IP 失败');
            }

            // 统一数据格式
            const normalizedData = normalizeApiResponse(data, i);
            showResult(normalizedData, normalizedData.ip);
            addToHistory(normalizedData, normalizedData.ip);
            return; // 成功则返回
        } catch (error) {
            if (i === API_URLS.length - 1) {
                showError('无法获取本机 IP，请稍后重试');
            }
        }
    }
}

// 统一不同 API 的返回格式
function normalizeApiResponse(data, apiIndex) {
    // ipapi.co 格式
    if (apiIndex === 0) {
        return {
            ip: data.ip,
            country: data.country_name || data.country,
            country_name: data.country_name || data.country,
            region: data.region || '-',
            city: data.city || '-',
            isp: data.org || data.isp || '-',
            org: data.org || data.isp || '-',
            latitude: data.latitude,
            longitude: data.longitude,
            timezone: data.timezone || '-'
        };
    }
    // ip.sb 格式
    else if (apiIndex === 1) {
        return {
            ip: data.ip,
            country: data.country || '-',
            country_name: data.country || '-',
            region: data.region || '-',
            city: data.city || '-',
            isp: data.isp || data.organization || '-',
            org: data.organization || data.isp || '-',
            latitude: data.latitude,
            longitude: data.longitude,
            timezone: data.timezone || '-'
        };
    }
    // ipinfo.io 格式
    else {
        const [lat, lon] = (data.loc || ',').split(',');
        return {
            ip: data.ip,
            country: data.country || '-',
            country_name: data.country || '-',
            region: data.region || '-',
            city: data.city || '-',
            isp: data.org || '-',
            org: data.org || '-',
            latitude: parseFloat(lat) || 0,
            longitude: parseFloat(lon) || 0,
            timezone: data.timezone || '-'
        };
    }
}

// 显示结果
function showResult(data, ip) {
    hideAll();

    // 填充数据
    document.getElementById('display-ip').textContent = ip;
    document.getElementById('country').textContent = data.country_name || data.country || '-';
    document.getElementById('isp').textContent = data.org || data.isp || '-';
    document.getElementById('org').textContent = ip.includes(':') ? 'IPv6' : 'IPv4';
    document.getElementById('region').textContent = data.region || '-';
    document.getElementById('city').textContent = data.city || '-';
    document.getElementById('timezone').textContent = data.timezone || '-';

    // 更新状态
    const status = document.getElementById('result-status');
    status.className = 'result-status success';
    status.innerHTML = '<i class="fas fa-check-circle"></i><span>查询成功</span>';

    // 显示地图
    if (data.latitude && data.longitude) {
        showMap(data.latitude, data.longitude, data.city || '');
    }

    document.getElementById('result-section').style.display = 'block';
}

// 显示地图
function showMap(lat, lon, city) {
    const placeholder = document.getElementById('map-placeholder');
    const mapContent = document.getElementById('map-content');
    const coords = document.getElementById('map-coords');
    const container = document.getElementById('amap-container');
    
    placeholder.style.display = 'none';
    mapContent.style.display = 'block';
    coords.textContent = `坐标: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    
    // 使用高德地图 JS API
    container.innerHTML = '';
    const map = new AMap.Map('amap-container', {
        zoom: 13,
        center: [lon, lat],
        viewMode: '2D'
    });
    
    // 添加自定义标记图标
    const marker = new AMap.Marker({
        position: [lon, lat],
        title: city || '位置',
        content: '<div style="background:#667eea;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.3);"><div style="transform:rotate(45deg);color:#fff;text-align:center;line-height:26px;font-size:14px;">📍</div></div>'
    });
    map.add(marker);
    
    // 添加信息窗体
    const infoWindow = new AMap.InfoWindow({
        content: `<div style="padding:8px 12px;font-size:13px;">
            <strong>📍 位置信息</strong><br/>
            城市: ${city || '-'}<br/>
            坐标: ${lat.toFixed(4)}, ${lon.toFixed(4)}
        </div>`,
        offset: new AMap.Pixel(0, -40)
    });
    infoWindow.open(map, [lon, lat]);
}

// 显示加载
function showLoading() {
    hideAll();
    document.getElementById('loading').style.display = 'flex';
}

// 显示错误
function showError(message) {
    hideAll();
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-section').style.display = 'flex';
}

// 重置搜索
function resetSearch() {
    document.getElementById('ip-input').value = '';
    hideAll();
}

// 隐藏所有区域
function hideAll() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('error-section').style.display = 'none';
}

// 复制结果
function copyResult() {
    const ip = document.getElementById('display-ip').textContent;
    const country = document.getElementById('country').textContent;
    const isp = document.getElementById('isp').textContent;
    const city = document.getElementById('city').textContent;
    const region = document.getElementById('region').textContent;

    const text = `IP: ${ip}\n国家: ${country}\n地区: ${region}\n城市: ${city}\n运营商: ${isp}`;

    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制到剪贴板', 'success');
    }).catch(() => {
        showToast('复制失败', 'error');
    });
}

// 历史记录
function getHistory() {
    const history = localStorage.getItem('ip_history');
    return history ? JSON.parse(history) : [];
}

function saveHistory(history) {
    localStorage.setItem('ip_history', JSON.stringify(history));
}

function addToHistory(data, ip) {
    const history = getHistory();
    
    // 去重
    const filtered = history.filter(item => item.ip !== ip);
    
    // 添加新记录到最前面
    filtered.unshift({
        ip: ip,
        country: data.country_name || data.country,
        city: data.city,
        isp: data.org || data.isp,
        time: new Date().toLocaleString('zh-CN')
    });

    // 只保留最近 10 条
    saveHistory(filtered.slice(0, 10));
}

function loadHistory() {
    const history = getHistory();
    const list = document.getElementById('history-list');

    if (history.length === 0) {
        list.innerHTML = '<div class="history-empty"><i class="fas fa-inbox"></i><p>暂无查询记录</p></div>';
        return;
    }

    list.innerHTML = history.map(item => `
        <div class="history-item" data-ip="${item.ip}">
            <div class="history-info">
                <div class="history-ip">${item.ip}</div>
                <div class="history-detail">${item.country || ''} ${item.city || ''} · ${item.isp || ''}</div>
            </div>
            <div class="history-actions">
                <span class="history-time">${item.time}</span>
                <button class="btn-icon" onclick="queryFromHistory('${item.ip}')" title="查询">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function showHistoryModal() {
    loadHistory();
    document.getElementById('history-modal').style.display = 'flex';
}

function closeHistoryModal() {
    document.getElementById('history-modal').style.display = 'none';
}

function clearHistory() {
    localStorage.removeItem('ip_history');
    loadHistory();
    showToast('历史记录已清空', 'success');
}

// 点击历史记录查询
window.queryFromHistory = function(ip) {
    closeHistoryModal();
    document.getElementById('ip-input').value = ip;
    searchIP();
};

// Toast 提示
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icons = { success: 'fa-check', error: 'fa-times', info: 'fa-info' };
    toast.innerHTML = `<i class="fas ${icons[type] || 'fa-info'}"></i>${message}`;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

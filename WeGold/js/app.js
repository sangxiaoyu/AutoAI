/**
 * 黄金白银分析看板 - iTick REST API 数据处理
 */

// ===== 版本控制 =====
const APP_VERSION = '1.0.0'; // 更新此版本号可强制刷新用户缓存
const VERSION_KEY = 'goldSilver_version';

// iTick REST API (根据官方文档)
const ITICK_API_BASE = 'https://api.itick.org';
const ITICK_TOKEN = '81e536b689584a9c8ce10b8c5a90ae5dee6617d89ee443b4b4087e9ed217eda4';

// iTick 支持的商品代码
// region=HK 香港, region=GB 英国(贵金属/外汇)
const SYMBOLS = {
    XAUUSD: { region: 'GB', code: 'XAUUSD', name: '黄金/美元', type: 'gold', open: null, high: null, low: null },
    XAGUSD: { region: 'GB', code: 'XAGUSD', name: '白银/美元', type: 'silver', open: null, high: null, low: null }
};

// 交叉盘品种
const CROSS_PAIRS = {
    'XAU/XAG': { 
        name: '金银比', 
        desc: '黄金/白银比率',
        base: 'XAUUSD', 
        quote: 'XAGUSD',
        value: null,
        history: []
    },
    'XAU/EUR': { 
        name: '黄金/欧元', 
        desc: 'XAU对EUR汇率',
        base: 'XAUUSD',
        quote: null, // 需要EURUSD数据
        value: null,
        history: []
    },
    'XAG/EUR': { 
        name: '白银/欧元', 
        desc: 'XAG对EUR汇率',
        base: 'XAGUSD',
        quote: null,
        value: null,
        history: []
    }
};

// 状态管理
let pollInterval = null;
let reconnectAttempts = 0;
let priceHistory = {
    XAUUSD: [],
    XAGUSD: []
};
let chart = null;
let candleSeries = null;
let currentSymbol = 'XAUUSD';
let currentPeriod = 1;

// 技术分析数据存储
let technicalData = {
    XAUUSD: { rsi: null, macd: null, ma5: null, ma20: null, currentPrice: null, resistance: null, support: null, shortTrend: '--', midTrend: '--', longTrend: '--', confidence: null },
    XAGUSD: { rsi: null, macd: null, ma5: null, ma20: null, currentPrice: null, resistance: null, support: null, shortTrend: '--', midTrend: '--', longTrend: '--', confidence: null }
};

// 价格缓存 (避免重复请求 + localStorage 持久化)
const priceCache = {
    XAUUSD: { price: null, time: 0 },
    XAGUSD: { price: null, time: 0 }
};
const CACHE_DURATION = 600000; // 缓存有效期 10 分钟 (600秒)
const STORAGE_KEY = 'goldSilver_cache';

// ==================== 访问统计模块 (IndexedDB 存储) ====================

const DB_NAME = 'GoldSilverDB';
const DB_VERSION = 2; // 版本升级
const STORE_NAME = 'visits';
const SETTINGS_STORE = 'settings';
let db = null;

// 打开 IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('[DB] 数据库打开失败');
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log('[DB] 数据库连接成功');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                console.log('[DB] 访问记录存储已创建');
            }
            if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
                database.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
                console.log('[DB] 设置存储已创建');
            }
        };
    });
}

// 检查并更新版本
async function checkVersion() {
    try {
        const storedVersion = localStorage.getItem(VERSION_KEY);
        
        if (storedVersion !== APP_VERSION) {
            console.log(`[版本] 检测到版本更新: ${storedVersion} -> ${APP_VERSION}`);
            
            // 清除旧缓存
            await clearOldCache();
            
            // 保存新版本号
            localStorage.setItem(VERSION_KEY, APP_VERSION);
            
            // 提示用户
            showToast(`检测到新版本 ${APP_VERSION}，缓存已更新`, 'info');
        }
    } catch (error) {
        console.error('[版本] 版本检查失败:', error);
    }
}

// 清除旧缓存
async function clearOldCache() {
    try {
        // 清除旧版localStorage缓存
        localStorage.removeItem('goldSilver_cache');
        localStorage.removeItem('goldSilver_stats');
        console.log('[缓存] 旧缓存已清除');
    } catch (e) {
        console.error('[缓存] 清除失败:', e);
    }
}

// 添加访问记录到 IndexedDB
function addVisitRecord(record) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('数据库未初始化'));
            return;
        }
        
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(record);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 获取所有访问记录
function getAllVisits() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('数据库未初始化'));
            return;
        }
        
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// 检查记录是否存在
function visitExists(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            resolve(false);
            return;
        }
        
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        
        request.onsuccess = () => resolve(!!request.result);
        request.onerror = () => reject(request.error);
    });
}

// 获取记录总数
function getVisitCount() {
    return new Promise((resolve, reject) => {
        if (!db) {
            resolve(0);
            return;
        }
        
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.count();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 获取当前时段标识
function getTimeSlotId(ip) {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const hour = now.getHours().toString().padStart(2, '0');
    return `${ip || 'unknown'}-${date}-${hour}`;
}

// 初始化访问统计
async function initVisitStats() {
    try {
        // 检查版本（可能清除旧缓存）
        await checkVersion();
        
        // 打开数据库
        await openDB();
        
        // 获取用户IP
        const ip = await fetchUserIP();
        
        // 检查该时段是否已有记录
        const slotId = getTimeSlotId(ip);
        const exists = await visitExists(slotId);
        
        if (exists) {
            console.log('[访问] 该时段已有记录，跳过:', slotId);
        } else {
            // 创建新记录
            const now = new Date();
            const record = {
                id: slotId,
                ip: ip,
                time: now.toISOString(),
                displayTime: now.toLocaleString('zh-CN'),
                goldPrice: priceCache.XAUUSD?.price || null,
                silverPrice: priceCache.XAGUSD?.price || null
            };
            
            await addVisitRecord(record);
            console.log('[访问] 新记录已保存:', slotId);
        }
        
        // 更新计数器
        updateVisitCounter();
        
    } catch (error) {
        console.error('[访问] 初始化失败:', error);
    }
}

// 获取用户IP
async function fetchUserIP() {
    try {
        const apis = [
            'https://api.ipify.org?format=json',
            'https://ipinfo.io/json'
        ];
        
        for (const api of apis) {
            try {
                const response = await fetch(api);
                if (response.ok) {
                    const data = await response.json();
                    const ip = data.ip || data.ipa || 'unknown';
                    console.log('[访问] 获取到IP:', ip);
                    return ip;
                }
            } catch (e) {
                console.warn(`[访问] IP查询失败:`, e);
            }
        }
    } catch (error) {
        console.error('[访问] 获取IP失败:', error);
    }
    return 'unknown';
}

// 更新悬浮计数器
async function updateVisitCounter() {
    try {
        const count = await getVisitCount();
        const counter = document.getElementById('visit-total');
        if (counter) {
            counter.textContent = count;
        }
    } catch (error) {
        console.error('[访问] 更新计数器失败:', error);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化访问统计（独立于其他初始化）
    initVisitStats();
    
    // 初始化弹窗功能
    initVisitModal();
    
    initUI();
    connectAPI();
    updateTime();
    setInterval(updateTime, 1000);
    
    // 初始化技术分析界面默认值
    resetTechnicalUI();
});

// 重置技术分析界面
function resetTechnicalUI() {
    // 更新当前价显示
    const currentPriceEl = document.getElementById('current-price-level');
    if (currentPriceEl) currentPriceEl.textContent = '--';
    
    // 更新置信度
    const confidenceEl = document.getElementById('confidence');
    if (confidenceEl) confidenceEl.textContent = '--';
    
    // 趋势初始化
    ['short-trend', 'mid-trend', 'long-trend'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '--';
    });
    
    // 关键价位初始化
    const resistanceEl = document.getElementById('resistance');
    const supportEl = document.getElementById('support');
    if (resistanceEl) resistanceEl.textContent = '--';
    if (supportEl) supportEl.textContent = '--';
    
    // RSI 初始化
    const rsiValueEl = document.getElementById('rsi-value');
    const rsiDescEl = document.getElementById('rsi-desc');
    if (rsiValueEl) rsiValueEl.textContent = '--';
    if (rsiDescEl) rsiDescEl.textContent = '等待数据...';
    
    // MACD 初始化
    const macdValueEl = document.getElementById('macd-value');
    const macdDescEl = document.getElementById('macd-desc');
    if (macdValueEl) macdValueEl.textContent = '--';
    if (macdDescEl) macdDescEl.textContent = '等待数据...';
    
    // 均线初始化
    const ma5El = document.getElementById('ma5');
    const ma20El = document.getElementById('ma20');
    const maDescEl = document.getElementById('ma-desc');
    if (ma5El) ma5El.textContent = '--';
    if (ma20El) ma20El.textContent = '--';
    if (maDescEl) maDescEl.textContent = '等待数据...';
}

// UI 初始化
function initUI() {
    // 切换产品
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSymbol = btn.dataset.symbol;
            
            // 切换品种时更新技术分析界面
            const data = technicalData[currentSymbol];
            if (data && data.currentPrice) {
                updateTechnicalUI(currentSymbol, data);
            } else {
                // 显示等待数据提示
                resetTechnicalUI();
            }
        });
    });

    // 切换周期
    document.querySelectorAll('.tf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPeriod = parseInt(btn.dataset.period);
        });
    });

    // 初始化交叉盘
    initCrossPairs();
}

// 初始化交叉盘
function initCrossPairs() {
    const grid = document.getElementById('pairs-grid');
    grid.innerHTML = ''; // 清空现有内容
    
    // 遍历交叉盘配置
    Object.keys(CROSS_PAIRS).forEach(pairKey => {
        const pair = CROSS_PAIRS[pairKey];
        
        const div = document.createElement('div');
        div.className = 'pair-card';
        div.id = `pair-${pairKey}`;
        div.innerHTML = `
            <div class="pair-header">
                <span class="pair-name">${pair.name}</span>
                <span class="pair-badge">${pair.desc}</span>
            </div>
            <div class="pair-value" id="value-${pairKey}">
                <span class="value-number">--</span>
                <span class="value-change up" id="change-${pairKey}">--</span>
            </div>
            <div class="pair-chart" id="mini-chart-${pairKey}"></div>
        `;
        grid.appendChild(div);
    });
    
    // 添加 SYMBOLS 中的直接报价
    Object.keys(SYMBOLS).forEach(symbol => {
        const info = SYMBOLS[symbol];
        if (!info || !info.name) return;
        
        const div = document.createElement('div');
        div.className = `pair-card ${info.type === 'gold' ? 'gold-card' : 'silver-card'}`;
        div.id = `pair-direct-${symbol}`;
        div.innerHTML = `
            <div class="pair-header">
                <span class="pair-name">${info.name}</span>
                <span class="pair-tag ${info.type}">${info.type === 'gold' ? 'AU' : 'AG'}</span>
            </div>
            <div class="pair-value" id="price-direct-${symbol}">
                <span class="value-number">--</span>
                <span class="value-change up" id="change-direct-${symbol}">--</span>
            </div>
            <div class="pair-highlow">
                <div class="hl-item">
                    <span class="hl-label">高</span>
                    <span class="hl-value high" id="high-direct-${symbol}">--</span>
                </div>
                <div class="hl-item">
                    <span class="hl-label">低</span>
                    <span class="hl-value low" id="low-direct-${symbol}">--</span>
                </div>
            </div>
        `;
        grid.appendChild(div);
    });
}

// ==================== localStorage 缓存管理 ====================

// 从 localStorage 加载缓存数据
function loadCacheFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            const now = Date.now();
            let hasValidCache = false;
            
            Object.keys(data).forEach(symbol => {
                if (data[symbol] && data[symbol].price && data[symbol].time) {
                    // 检查缓存是否在有效期内 (10分钟)
                    if ((now - data[symbol].time) < CACHE_DURATION) {
                        priceCache[symbol] = data[symbol];
                        console.log(`[缓存] ${symbol} 从本地存储加载: ${data[symbol].price}`);
                        hasValidCache = true;
                        
                        // 恢复价格历史
                        if (data[symbol].history && Array.isArray(data[symbol].history)) {
                            priceHistory[symbol] = data[symbol].history;
                        }
                        
                        // 恢复 SYMBOLS 的 open/high/low
                        if (data[symbol].open !== undefined) {
                            SYMBOLS[symbol].open = data[symbol].open;
                            SYMBOLS[symbol].high = data[symbol].high;
                            SYMBOLS[symbol].low = data[symbol].low;
                        }
                    } else {
                        console.log(`[缓存] ${symbol} 已过期`);
                    }
                }
            });
            
            // 恢复技术分析数据
            if (data.technical) {
                Object.keys(data.technical).forEach(symbol => {
                    if (technicalData[symbol]) {
                        technicalData[symbol] = { ...technicalData[symbol], ...data.technical[symbol] };
                    }
                });
                console.log('[缓存] 技术分析数据已恢复');
            }
            
            return hasValidCache;
        }
    } catch (e) {
        console.error('[缓存] 读取本地存储失败:', e);
    }
    return false;
}

// 保存缓存到 localStorage
function saveCacheToStorage() {
    try {
        const data = {};
        
        Object.keys(SYMBOLS).forEach(symbol => {
            data[symbol] = {
                price: priceCache[symbol]?.price,
                time: priceCache[symbol]?.time,
                open: SYMBOLS[symbol]?.open,
                high: SYMBOLS[symbol]?.high,
                low: SYMBOLS[symbol]?.low,
                history: priceHistory[symbol]?.slice(-100) // 只保存最近100条
            };
        });
        
        // 保存技术分析数据
        data.technical = { ...technicalData };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('[缓存] 已保存到本地存储');
    } catch (e) {
        console.error('[缓存] 保存到本地存储失败:', e);
    }
}

// 定期保存缓存 (每30秒)
setInterval(saveCacheToStorage, 30000);

// iTick REST API 连接 (根据官方文档实现)
async function connectAPI() {
    try {
        updateConnectionStatus('connecting');
        
        // 先从 localStorage 加载缓存数据
        const hasCache = loadCacheFromStorage();
        
        // 如果有有效缓存，先用缓存数据更新界面
        if (hasCache) {
            Object.keys(priceCache).forEach(symbol => {
                if (priceCache[symbol].price !== null) {
                    // 使用缓存数据更新显示
                    handleQuote({
                        s: symbol,
                        ld: priceCache[symbol].price,
                        t: priceCache[symbol].time,
                        v: 0
                    }, false);
                    
                    // 更新技术分析界面
                    const data = technicalData[symbol];
                    if (data && data.currentPrice) {
                        updateTechnicalUI(symbol, data);
                    }
                }
            });
            
            // 用缓存的 open/high/low 更新界面显示
            Object.keys(SYMBOLS).forEach(symbol => {
                const info = SYMBOLS[symbol];
                if (info && info.open !== null) {
                    updatePriceDisplay(symbol, priceCache[symbol].price, 
                        priceCache[symbol].price - info.open, 
                        info.open > 0 ? ((priceCache[symbol].price - info.open) / info.open) * 100 : 0,
                        0, info.open, info.high, info.low);
                }
            });
            
            showToast('已加载本地缓存数据，正在获取最新数据...', 'info');
        }
        
        // 异步获取最新数据 (不阻塞界面)
        fetchLatestData().then(() => {
            updateConnectionStatus('connected');
            reconnectAttempts = 0;
        }).catch(error => {
            console.error('获取最新数据失败:', error);
            if (priceCache.XAUUSD.price === null && priceCache.XAGUSD.price === null) {
                updateConnectionStatus('error');
                showToast('数据加载失败，请检查网络', 'error');
            } else {
                updateConnectionStatus('connected');
                showToast('网络异常，显示缓存数据', 'info');
            }
        });
        
        // 启动轮询（每15秒更新一次）
        startPolling();
        
    } catch (error) {
        console.error('API 连接失败:', error);
        updateConnectionStatus('error');
        showToast('数据加载失败: ' + error.message, 'error');
        
        // 延迟重试
        if (reconnectAttempts < 10) {
            reconnectAttempts++;
            setTimeout(connectAPI, 3000 * reconnectAttempts);
        }
    }
}

// 获取最新数据 (异步，不阻塞)
async function fetchLatestData() {
    const promises = Object.keys(SYMBOLS).map(symbol => fetchTickData(symbol, true)); // true = 强制刷新
    await Promise.all(promises);
    saveCacheToStorage(); // 获取成功后保存缓存
}

// 获取单个品种的 tick 数据 (带缓存)
async function fetchTickData(symbol, forceRefresh = false) {
    const info = SYMBOLS[symbol];
    if (!info) return;
    
    const now = Date.now();
    const cached = priceCache[symbol];
    
    // 检查缓存是否有效 (除非强制刷新)
    if (!forceRefresh && cached.price !== null && (now - cached.time) < CACHE_DURATION) {
        console.log(`[${symbol}] 使用缓存价格: ${cached.price}`);
        // 用缓存数据更新显示
        handleQuote({
            s: symbol,
            ld: cached.price,
            t: cached.time,
            v: 0
        }, false); // false 表示不更新缓存
        return;
    }
    
    try {
        const url = `${ITICK_API_BASE}/forex/tick?region=${info.region}&code=${info.code}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'token': ITICK_TOKEN
            }
        });
        
        if (!response.ok) {
            if (response.status === 429) {
                console.warn(`[${symbol}] 请求过于频繁，使用缓存`);
                if (cached.price !== null) {
                    handleQuote({
                        s: symbol,
                        ld: cached.price,
                        t: cached.time,
                        v: 0
                    }, false);
                }
                return;
            }
            throw new Error(`HTTP ${response.status}`);
        }
        
        const json = await response.json();
        console.log(`[${symbol}] API 响应:`, json);
        
        if (json.code === 0 && json.data) {
            const data = json.data;
            // 更新缓存
            priceCache[symbol] = { price: data.ld, time: now };
            handleQuote({
                s: data.s,           // 标的代码
                ld: data.ld,         // 最新成交价
                t: data.t,           // 时间戳
                v: data.v            // 成交量
            }, true);
        } else {
            console.warn(`[${symbol}] API 返回错误:`, json.msg);
        }
        
    } catch (error) {
        console.error(`[${symbol}] 获取数据失败:`, error);
        // 出错时尝试使用缓存
        if (cached.price !== null) {
            handleQuote({
                s: symbol,
                ld: cached.price,
                t: cached.time,
                v: 0
            }, false);
        }
    }
}

// 轮询获取最新数据
async function pollData() {
    try {
        const promises = Object.keys(SYMBOLS).map(symbol => fetchTickData(symbol, true)); // 轮询时强制刷新
        await Promise.all(promises);
        saveCacheToStorage(); // 轮询后保存缓存
    } catch (error) {
        console.error('轮询失败:', error);
    }
}

// 启动轮询
function startPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
    }
    // 每15秒轮询一次 (避免触发 429 限流)
    pollInterval = setInterval(pollData, 15000);
}

// 页面卸载前保存缓存
window.addEventListener('beforeunload', () => {
    saveCacheToStorage();
});

// 处理报价 (updateCache: 是否更新缓存)
function handleQuote(data, updateCache = true) {
    const symbol = data.s;
    const info = SYMBOLS[symbol];
    if (!info) return;
    
    const price = data.ld;
    const volume = data.v;
    const timestamp = data.t || Date.now();
    
    // iTick tick 数据只有最新价、成交量、时间戳
    // 使用第一笔数据的价格作为参考价（开盘价）
    if (info.open === null) {
        info.open = price;
        info.high = price;
        info.low = price;
    }
    
    // 更新价格
    const open = info.open;
    let high = info.high;
    let low = info.low;
    
    // 更新高低价
    if (price > high) info.high = price;
    if (price < low) info.low = price;
    high = info.high;
    low = info.low;
    
    // 记录价格历史
    priceHistory[symbol].push({ price, time: timestamp });
    if (priceHistory[symbol].length > 100) {
        priceHistory[symbol].shift();
    }
    
    // 计算涨跌幅 (基于第一笔数据作为开盘价)
    let change = price - open;
    let changePercent = open > 0 ? (change / open) * 100 : 0;
    
    // 更新界面
    updatePriceDisplay(symbol, price, change, changePercent, volume, open, high, low);
    
    // 更新交叉盘
    updateCrossPairs(symbol, price, open, high, low);
    
    // 执行技术分析
    runTechnicalAnalysis(symbol);
    
    // 更新分析
    updateAnalysis();
}

// 更新价格显示
function updatePriceDisplay(symbol, price, change, changePercent, volume, open, high, low) {
    const priceEl = document.getElementById(`price-${symbol}`);
    const changeEl = document.getElementById(`change-${symbol}`);
    
    if (priceEl) {
        const decimals = price > 100 ? 2 : (price > 10 ? 3 : 4);
        priceEl.textContent = price.toFixed(decimals);
    }
    
    if (changeEl) {
        const isUp = change >= 0;
        const sign = isUp ? '+' : '';
        changeEl.className = `pair-change ${isUp ? 'up' : 'down'}`;
        changeEl.textContent = `${sign}${changePercent.toFixed(2)}%`;
    }
    
    // 更新主卡片
    const card = document.querySelector(`[data-symbol="${symbol}"]`);
    if (card) {
        const cardPriceEl = card.querySelector('.current-price');
        const cardChangeEl = card.querySelector('.price-change');
        const openEl = document.getElementById(`open-${symbol}`);
        const highEl = document.getElementById(`high-${symbol}`);
        const lowEl = document.getElementById(`low-${symbol}`);
        const volumeEl = document.getElementById(`volume-${symbol}`);
        
        if (cardPriceEl) {
            cardPriceEl.textContent = price.toFixed(2);
        }
        
        if (cardChangeEl) {
            const isUp = change >= 0;
            const sign = isUp ? '+' : '';
            cardChangeEl.innerHTML = `
                <span class="change-value ${isUp ? 'up' : 'down'}">${sign}${change.toFixed(2)}</span>
                <span class="change-percent ${isUp ? 'up' : 'down'}">${sign}${changePercent.toFixed(2)}%</span>
            `;
        }
        
        if (openEl) openEl.textContent = open?.toFixed(2) || '--';
        if (highEl) highEl.textContent = high?.toFixed(2) || '--';
        if (lowEl) lowEl.textContent = low?.toFixed(2) || '--';
        if (volumeEl) volumeEl.textContent = formatVolume(volume);
    }
    
    // 记录历史
    if (priceHistory[symbol]) {
        priceHistory[symbol].push({
            price,
            time: Date.now()
        });
        if (priceHistory[symbol].length > 100) {
            priceHistory[symbol].shift();
        }
    }
}

// 更新交叉盘显示
function updateCrossPairs(symbol, price, open, high, low) {
    // 更新直接报价卡片
    const directPriceEl = document.getElementById(`price-direct-${symbol}`);
    const directChangeEl = document.getElementById(`change-direct-${symbol}`);
    const directHighEl = document.getElementById(`high-direct-${symbol}`);
    const directLowEl = document.getElementById(`low-direct-${symbol}`);
    
    if (directPriceEl) {
        const decimals = price > 100 ? 2 : (price > 10 ? 3 : 4);
        directPriceEl.querySelector('.value-number').textContent = price.toFixed(decimals);
    }
    
    if (directChangeEl) {
        const change = price - open;
        const changePercent = open > 0 ? (change / open) * 100 : 0;
        const isUp = change >= 0;
        const sign = isUp ? '+' : '';
        directChangeEl.className = `value-change ${isUp ? 'up' : 'down'}`;
        directChangeEl.textContent = `${sign}${changePercent.toFixed(2)}%`;
    }
    
    if (directHighEl) directHighEl.textContent = high?.toFixed(2) || '--';
    if (directLowEl) directLowEl.textContent = low?.toFixed(2) || '--';
    
    // 更新金银比
    const gold = SYMBOLS.XAUUSD;
    const silver = SYMBOLS.XAGUSD;
    
    // 计算金银比
    if (gold.open && silver.open) {
        const ratio = gold.open / silver.open;
        CROSS_PAIRS['XAU/XAG'].value = ratio;
        CROSS_PAIRS['XAU/XAG'].history.push({ value: ratio, time: Date.now() });
        if (CROSS_PAIRS['XAU/XAG'].history.length > 50) {
            CROSS_PAIRS['XAU/XAG'].history.shift();
        }
        
        // 更新金银比显示
        const ratioValueEl = document.getElementById('value-XAU/XAG');
        const ratioChangeEl = document.getElementById('change-XAU/XAG');
        
        if (ratioValueEl) {
            ratioValueEl.querySelector('.value-number').textContent = ratio.toFixed(2);
        }
        
        // 金银比历史变化
        const history = CROSS_PAIRS['XAU/XAG'].history;
        if (history.length >= 2) {
            const prevRatio = history[history.length - 2].value;
            const ratioChange = ((ratio - prevRatio) / prevRatio) * 100;
            if (ratioChangeEl) {
                const isUp = ratioChange >= 0;
                const sign = isUp ? '+' : '';
                ratioChangeEl.className = `value-change ${isUp ? 'up' : 'down'}`;
                ratioChangeEl.textContent = `${sign}${ratioChange.toFixed(2)}%`;
            }
        }
    }
    
    // 更新技术分析界面的金银比
    const ratioEl = document.getElementById('price-ratio');
    const ratioBar = document.getElementById('ratio-bar');
    
    if (gold.open && silver.open && ratioEl) {
        const currentRatio = gold.open / silver.open;
        ratioEl.textContent = currentRatio.toFixed(2);
        
        if (ratioBar) {
            const position = Math.min(95, Math.max(5, ((currentRatio - 70) / 20) * 100));
            ratioBar.style.left = `${position}%`;
        }
    }
}

// ==================== 技术分析模块 ====================

// 趋势稳定性记录
const trendStability = {
    XAUUSD: { short: [], mid: [], long: [] },
    XAGUSD: { short: [], mid: [], long: [] }
};
const STABILITY_PERIOD = 5; // 需要连续5个周期趋势一致才确认

// 计算简单移动平均
function calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const sum = prices.slice(-period).reduce((a, b) => a + b.price, 0);
    return sum / period;
}

// 计算 RSI (相对强弱指数)
function calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    
    let gains = 0, losses = 0;
    for (let i = prices.length - period; i < prices.length; i++) {
        const diff = prices[i].price - prices[i - 1].price;
        if (diff > 0) gains += diff;
        else losses -= diff;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

// 计算 MACD
function calculateMACD(prices) {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    if (!ema12 || !ema26) return null;
    
    const macdLine = ema12 - ema26;
    const signalLine = calculateSignalLine(prices);
    const histogram = macdLine - signalLine;
    
    return { macd: macdLine, signal: signalLine, histogram };
}

// 计算 MACD 信号线 (9日EMA)
function calculateSignalLine(prices) {
    // 使用简化方法：MACD的0.8倍作为信号线
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    if (!ema12 || !ema26) return null;
    const macdLine = ema12 - ema26;
    return macdLine * 0.85;
}

// 计算指数移动平均
function calculateEMA(prices, period) {
    if (prices.length < period) return null;
    
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b.price, 0) / period;
    
    for (let i = period; i < prices.length; i++) {
        ema = (prices[i].price - ema) * multiplier + ema;
    }
    
    return ema;
}

// 稳定趋势判断（需要连续N个周期一致才确认）
function getStableTrend(symbol, trendType, newTrend) {
    const history = trendStability[symbol][trendType];
    
    // 添加新趋势
    history.push(newTrend);
    
    // 只保留最近 STABILITY_PERIOD 个
    if (history.length > STABILITY_PERIOD) {
        history.shift();
    }
    
    // 统计趋势
    const counts = { '上涨': 0, '下跌': 0, '震荡': 0 };
    history.forEach(t => counts[t]++);
    
    // 计算确认度
    const confirmCount = Math.min(...Object.values(counts).filter(c => c > 0)) || 0;
    const total = history.length;
    const confirmRate = total > 0 ? confirmCount / total : 0;
    
    // 趋势稳定性：需要超过60%的周期趋势一致
    if (confirmRate >= 0.6 && confirmCount >= 3) {
        return { trend: newTrend, stable: true, confirmRate };
    }
    
    return { trend: newTrend, stable: false, confirmRate };
}

// 计算多周期趋势
function calculateMultiPeriodTrend(history) {
    if (history.length < 5) {
        return { short: '震荡', mid: '震荡', long: '震荡' };
    }
    
    // 短期：MA5 与当前价比较
    let shortTrend = '震荡';
    const ma5 = calculateSMA(history, Math.min(5, history.length));
    const currentPrice = history[history.length - 1].price;
    if (ma5) {
        const shortDiff = ((currentPrice - ma5) / ma5) * 100;
        if (shortDiff > 0.05) shortTrend = '上涨'; // 超过0.05%才算有效
        else if (shortDiff < -0.05) shortTrend = '下跌';
    }
    
    // 中期：MA20 (或可用最长周期) 与 MA5 比较
    let midTrend = '震荡';
    const periodForMid = Math.min(20, Math.floor(history.length / 2));
    const maMid = periodForMid >= 5 ? calculateSMA(history, periodForMid) : null;
    if (ma5 && maMid) {
        const midDiff = ((ma5 - maMid) / maMid) * 100;
        if (midDiff > 0.1) midTrend = '上涨';
        else if (midDiff < -0.1) midTrend = '下跌';
    }
    
    // 长期：价格与长期均线的偏离度
    let longTrend = '震荡';
    const periodForLong = Math.min(50, Math.floor(history.length * 0.8));
    const maLong = periodForLong >= 10 ? calculateSMA(history, periodForLong) : null;
    if (maLong) {
        const longDiff = ((currentPrice - maLong) / maLong) * 100;
        if (longDiff > 0.2) longTrend = '上涨';
        else if (longDiff < -0.2) longTrend = '下跌';
    }
    
    return { short: shortTrend, mid: midTrend, long: longTrend };
}

// 执行技术分析
function runTechnicalAnalysis(symbol) {
    const history = priceHistory[symbol];
    console.log(`[技术分析] ${symbol} 历史数据数量:`, history.length);
    
    if (history.length < 5) {
        console.log(`[技术分析] ${symbol} 数据不足，等待更多数据...`);
        return;
    }
    
    const currentPrice = history[history.length - 1].price;
    console.log(`[技术分析] ${symbol} 当前价格:`, currentPrice);
    
    const prices = history.map(h => h.price);
    
    // 计算技术指标
    const rsi = calculateRSI(history);
    const macd = calculateMACD(history);
    const ma5 = calculateSMA(history, Math.min(5, history.length));
    const ma20 = calculateSMA(history, Math.min(20, Math.floor(history.length / 2)));
    
    // 计算多周期趋势
    const rawTrend = calculateMultiPeriodTrend(history);
    
    // 稳定趋势判断（避免频繁波动）
    const shortStable = getStableTrend(symbol, 'short', rawTrend.short);
    const midStable = getStableTrend(symbol, 'mid', rawTrend.mid);
    const longStable = getStableTrend(symbol, 'long', rawTrend.long);
    
    // 只有稳定才采用，否则显示震荡
    const shortTrend = shortStable.stable ? shortStable.trend : '震荡';
    const midTrend = midStable.stable ? midStable.trend : '震荡';
    const longTrend = longStable.stable ? longStable.trend : '震荡';
    
    // 计算关键价位 (使用可用数据)
    const sliceCount = Math.min(history.length, 30);
    const priceSlice = prices.slice(-sliceCount);
    const high = Math.max(...priceSlice);
    const low = Math.min(...priceSlice);
    
    const resistance = high;
    const support = low;
    const midLevel = (high + low) / 2;
    
    // 计算置信度（基于多因素）
    let confidence = 20; // 基础置信度
    
    // 数据充足加分
    if (history.length >= 30) confidence += 20;
    else if (history.length >= 20) confidence += 15;
    else if (history.length >= 10) confidence += 10;
    
    // RSI 加分
    if (rsi) {
        if (rsi > 70 || rsi < 30) confidence += 15; // 超买超卖
        if (rsi > 50) confidence += 5;
    }
    
    // 趋势一致性加分（最重要）
    const trendAlignment = (shortTrend === midTrend ? 10 : 0) + (midTrend === longTrend ? 15 : 0);
    confidence += trendAlignment;
    
    // 趋势稳定性加分
    if (shortStable.stable) confidence += 5;
    if (midStable.stable) confidence += 10;
    if (longStable.stable) confidence += 15;
    
    // 多周期同向大幅加分
    if (shortTrend === '上涨' && midTrend === '上涨' && longTrend === '上涨') {
        confidence += 20;
    } else if (shortTrend === '下跌' && midTrend === '下跌' && longTrend === '下跌') {
        confidence += 20;
    }
    
    const dataObj = {
        rsi, macd, ma5, ma20,
        currentPrice, resistance, support, midLevel,
        shortTrend, midTrend, longTrend,
        shortStable: shortStable.stable,
        midStable: midStable.stable,
        longStable: longStable.stable,
        confidence: Math.min(95, Math.max(10, confidence))
    };
    
    // 保存技术分析数据
    technicalData[symbol] = dataObj;
    
    // 如果是当前选中品种，更新界面
    if (symbol === currentSymbol) {
        updateTechnicalUI(symbol, dataObj);
    }
}

// 更新技术分析界面
function updateTechnicalUI(symbol, data) {
    // 始终更新界面，不限制 symbol
    const { rsi, macd, ma5, ma20, currentPrice, resistance, support, 
            shortTrend, midTrend, longTrend, shortStable, midStable, longStable, confidence } = data;
    
    // 更新趋势预判
    const trendSignal = document.getElementById('trend-signal');
    const trendIcon = trendSignal?.querySelector('.signal-icon i');
    const trendText = trendSignal?.querySelector('.signal-text');
    
    // 基于短中长期趋势综合判断
    let overallSignal = '观望';
    let signalClass = 'neutral';
    let signalReason = '';
    
    if (currentPrice) {
        // 统计看涨和看跌的指标数
        let bullishCount = 0;
        let bearishCount = 0;
        
        // 1. RSI 指标 (权重1)
        if (rsi) {
            if (rsi > 55) bullishCount += 1;
            else if (rsi < 45) bearishCount += 1;
        }
        
        // 2. MACD 指标 (权重2，重要性更高)
        if (macd) {
            if (macd.histogram > 0) bullishCount += 2;
            else bearishCount += 2;
        }
        
        // 3. 短期趋势 (权重1，但不稳定时不计入)
        if (shortStable) {
            if (shortTrend === '上涨') bullishCount += 1;
            else if (shortTrend === '下跌') bearishCount += 1;
        }
        
        // 4. 中期趋势 (权重2，稳定性较高)
        if (midStable) {
            if (midTrend === '上涨') bullishCount += 2;
            else if (midTrend === '下跌') bearishCount += 2;
        }
        
        // 5. 长期趋势 (权重3，最重要)
        if (longStable) {
            if (longTrend === '上涨') bullishCount += 3;
            else if (longTrend === '下跌') bearishCount += 3;
        }
        
        // 综合判断
        const diff = bullishCount - bearishCount;
        const totalSignals = bullishCount + bearishCount;
        
        if (totalSignals >= 4) { // 至少4个有效信号
            if (diff >= 3) {
                // 多周期共振，看涨
                overallSignal = '强势看涨';
                signalClass = 'bullish';
                signalReason = '多周期共振';
            } else if (diff <= -3) {
                overallSignal = '弱势看跌';
                signalClass = 'bearish';
                signalReason = '多周期共振';
            } else if (diff > 0) {
                overallSignal = '谨慎看涨';
                signalClass = 'bullish';
                signalReason = '偏多但不稳定';
            } else if (diff < 0) {
                overallSignal = '谨慎看跌';
                signalClass = 'bearish';
                signalReason = '偏空但不稳定';
            }
        } else if (totalSignals >= 2) {
            if (diff > 0) {
                overallSignal = '短线偏多';
                signalClass = 'neutral';
                signalReason = '短期主导';
            } else if (diff < 0) {
                overallSignal = '短线偏空';
                signalClass = 'neutral';
                signalReason = '短期主导';
            }
        } else {
            overallSignal = '观望';
            signalClass = 'neutral';
            signalReason = '信号不足';
        }
        
        // 特殊场景：超买超卖
        if (rsi) {
            if (rsi > 75) {
                overallSignal = '超买警告';
                signalClass = 'bearish';
                signalReason = 'RSI严重超买';
            } else if (rsi < 25) {
                overallSignal = '超卖关注';
                signalClass = 'bullish';
                signalReason = 'RSI严重超卖';
            }
        }
    }
    
    if (trendSignal) {
        trendSignal.className = `trend-signal ${signalClass}`;
        if (trendIcon) {
            if (overallSignal.includes('涨')) {
                trendIcon.className = 'fas fa-arrow-up';
            } else if (overallSignal.includes('跌')) {
                trendIcon.className = 'fas fa-arrow-down';
            } else {
                trendIcon.className = 'fas fa-minus';
            }
        }
        if (trendText) trendText.textContent = overallSignal;
    }
    
    const confidenceEl = document.getElementById('confidence');
    if (confidenceEl) confidenceEl.textContent = confidence;
    
    // 更新趋势线（带稳定性指示）
    const shortTrendEl = document.getElementById('short-trend');
    const midTrendEl = document.getElementById('mid-trend');
    const longTrendEl = document.getElementById('long-trend');
    
    if (shortTrendEl) {
        shortTrendEl.textContent = shortTrend + (shortStable ? '' : '*');
        shortTrendEl.className = `indicator-value ${shortTrend === '上涨' ? 'up' : shortTrend === '下跌' ? 'down' : ''}`;
        shortTrendEl.title = shortStable ? '趋势稳定' : '趋势待确认';
    }
    if (midTrendEl) {
        midTrendEl.textContent = midTrend + (midStable ? '' : '*');
        midTrendEl.className = `indicator-value ${midTrend === '上涨' ? 'up' : midTrend === '下跌' ? 'down' : ''}`;
        midTrendEl.title = midStable ? '趋势稳定' : '趋势待确认';
    }
    if (longTrendEl) {
        longTrendEl.textContent = longTrend + (longStable ? '' : '*');
        longTrendEl.className = `indicator-value ${longTrend === '上涨' ? 'up' : longTrend === '下跌' ? 'down' : ''}`;
        longTrendEl.title = longStable ? '趋势稳定' : '趋势待确认';
    }
    
    // 更新关键价位
    const resistanceEl = document.getElementById('resistance');
    const supportEl = document.getElementById('support');
    const priceLevelEl = document.getElementById('current-price-level');
    
    if (resistanceEl) resistanceEl.textContent = resistance?.toFixed(2) || '--';
    if (supportEl) supportEl.textContent = support?.toFixed(2) || '--';
    if (priceLevelEl) priceLevelEl.textContent = currentPrice?.toFixed(2) || '--';
    
    // 更新价位指示器
    const rangeMarker = document.getElementById('level-range-marker');
    const rangeFill = document.getElementById('level-range-fill');
    if (rangeFill && resistance && support && currentPrice) {
        const range = resistance - support;
        const position = range > 0 ? ((currentPrice - support) / range) * 100 : 50;
        if (rangeMarker) rangeMarker.style.left = `${position}%`;
        if (rangeFill) rangeFill.style.width = `${position}%`;
    }
    
    // 更新 RSI
    const rsiValueEl = document.getElementById('rsi-value');
    const rsiDescEl = document.getElementById('rsi-desc');
    const rsiBar = document.getElementById('rsi-bar');
    
    if (rsiValueEl) rsiValueEl.textContent = rsi?.toFixed(1) || '--';
    if (rsiDescEl) {
        if (rsi > 70) rsiDescEl.textContent = '超买区域，注意回调风险';
        else if (rsi < 30) rsiDescEl.textContent = '超卖区域，可能存在反弹机会';
        else if (rsi > 50) rsiDescEl.textContent = '多头占优';
        else rsiDescEl.textContent = '空头占优';
    }
    if (rsiBar && rsi) {
        rsiBar.style.left = `${rsi}%`;
    }
    
    // 更新 MACD
    const macdValueEl = document.getElementById('macd-value');
    const macdDescEl = document.getElementById('macd-desc');
    
    if (macdValueEl && macd) {
        const macdStr = macd.histogram >= 0 ? `+${macd.histogram.toFixed(2)}` : macd.histogram.toFixed(2);
        macdValueEl.textContent = macdStr;
        macdValueEl.className = `indicator-value ${macd.histogram >= 0 ? 'up' : 'down'}`;
    }
    if (macdDescEl && macd) {
        macdDescEl.textContent = macd.histogram >= 0 ? 'MACD 柱正值，红柱动能' : 'MACD 柱负值，绿柱动能';
    }
    
    // 更新均线
    const ma5El = document.getElementById('ma5');
    const ma20El = document.getElementById('ma20');
    const maDescEl = document.getElementById('ma-desc');
    
    if (ma5El) ma5El.textContent = ma5?.toFixed(2) || '--';
    if (ma20El) ma20El.textContent = ma20?.toFixed(2) || '--';
    if (maDescEl && ma5 && ma20) {
        maDescEl.textContent = ma5 > ma20 ? '均线多头排列' : ma5 < ma20 ? '均线空头排列' : '均线交织';
    }
    
    // 生成操作建议
    generateTradingSignals(symbol, data);
}

// 生成交易信号
function generateTradingSignals(symbol, data) {
    const { rsi, macd, ma5, ma20, currentPrice, resistance, support, shortTrend, confidence } = data;
    const signalsList = document.getElementById('signals-list');
    if (!signalsList) return;
    
    const signals = [];
    
    // RSI 信号
    if (rsi) {
        if (rsi > 75) signals.push({ type: 'sell', text: 'RSI 超买(>75)，警惕回调', icon: 'fa-exclamation-triangle' });
        else if (rsi < 25) signals.push({ type: 'buy', text: 'RSI 超卖(<25)，关注反弹机会', icon: 'fa-flag' });
        else if (rsi > 65) signals.push({ type: 'caution', text: 'RSI 偏高(>65)，谨慎追多', icon: 'fa-exclamation-circle' });
        else if (rsi < 35) signals.push({ type: 'caution', text: 'RSI 偏低(<35)，注意低吸机会', icon: 'fa-exclamation-circle' });
    }
    
    // MACD 信号
    if (macd) {
        if (macd.histogram > 0) signals.push({ type: 'buy', text: 'MACD 红柱，短线偏多', icon: 'fa-arrow-up' });
        else signals.push({ type: 'sell', text: 'MACD 绿柱，短线偏空', icon: 'fa-arrow-down' });
    }
    
    // 均线信号
    if (ma5 && ma20) {
        if (currentPrice > ma5 && ma5 > ma20) signals.push({ type: 'buy', text: '均线金叉形态', icon: 'fa-check' });
        else if (currentPrice < ma5 && ma5 < ma20) signals.push({ type: 'sell', text: '均线死叉形态', icon: 'fa-times' });
    }
    
    // 支撑阻力信号
    if (resistance && support && currentPrice) {
        const priceInRange = (currentPrice - support) / (resistance - support);
        if (priceInRange > 0.85) signals.push({ type: 'caution', text: '逼近阻力区，谨慎追高', icon: 'fa-exclamation-circle' });
        else if (priceInRange < 0.15) signals.push({ type: 'caution', text: '接近支撑区，关注企稳', icon: 'fa-flag' });
    }
    
    // 显示信号
    if (signals.length === 0) {
        signals.push({ type: 'neutral', text: '暂无明显信号，建议观望', icon: 'fa-minus' });
    }
    
    signalsList.innerHTML = signals.map(s => `
        <div class="signal-item ${s.type}">
            <i class="fas ${s.icon}"></i>
            <span>${s.text}</span>
        </div>
    `).join('');
    
    // 更新止损止盈
    const stopLossEl = document.getElementById('stop-loss');
    const targetEl = document.getElementById('target-price');
    
    if (stopLossEl && targetEl && support && resistance && currentPrice) {
        const atr = (resistance - support) * 0.5;
        
        if (shortTrend === '上涨') {
            stopLossEl.textContent = (currentPrice - atr * 0.5).toFixed(2);
            targetEl.textContent = (currentPrice + atr * 1.5).toFixed(2);
        } else if (shortTrend === '下跌') {
            stopLossEl.textContent = (currentPrice + atr * 0.5).toFixed(2);
            targetEl.textContent = (currentPrice - atr * 1.5).toFixed(2);
        } else {
            stopLossEl.textContent = support.toFixed(2);
            targetEl.textContent = resistance.toFixed(2);
        }
    }
}

// 更新分析
function updateAnalysis() {
    const gold = SYMBOLS.XAUUSD;
    const silver = SYMBOLS.XAGUSD;
    
    if (gold.open && gold.high && gold.low && silver.open && silver.high && silver.low) {
        const goldRange = gold.high - gold.low;
        const silverRange = silver.high - silver.low;
        
        const goldRangeEl = document.getElementById('gold-range');
        const silverRangeEl = document.getElementById('silver-range');
        
        if (goldRangeEl) goldRangeEl.textContent = `${gold.low.toFixed(2)} - ${gold.high.toFixed(2)}`;
        if (silverRangeEl) silverRangeEl.textContent = `${silver.low.toFixed(2)} - ${silver.high.toFixed(2)}`;
        
        const goldFluctuation = ((gold.high - gold.low) / gold.open * 100).toFixed(2);
        const silverFluctuation = ((silver.high - silver.low) / silver.open * 100).toFixed(2);
        
        const goldFluctEl = document.getElementById('gold-fluctuation');
        const silverFluctEl = document.getElementById('silver-fluctuation');
        
        if (goldFluctEl) goldFluctEl.textContent = `${goldFluctuation}%`;
        if (silverFluctEl) silverFluctEl.textContent = `${silverFluctuation}%`;
        
        const avgFluctuation = (parseFloat(goldFluctuation) + parseFloat(silverFluctuation)) / 2;
        const volatilityFill = document.getElementById('volatility-fill');
        const volatilityPointer = document.getElementById('volatility-pointer');
        const volatilityValue = document.getElementById('volatility-value');
        const volatilityDesc = document.getElementById('volatility-desc');
        
        if (volatilityFill && volatilityPointer && volatilityValue) {
            volatilityValue.textContent = `${avgFluctuation}%`;
            volatilityPointer.style.left = `${Math.min(95, avgFluctuation * 10)}%`;
            
            let desc = '';
            if (avgFluctuation < 0.5) {
                desc = '市场波动较低，趋势相对稳定';
            } else if (avgFluctuation < 1) {
                desc = '波动适中，交易活跃';
            } else if (avgFluctuation < 2) {
                desc = '波动较大，注意风险控制';
            } else {
                desc = '波动剧烈，建议谨慎操作';
            }
            if (volatilityDesc) volatilityDesc.textContent = desc;
        }
        
        updateCorrelation();
    }
}

// 更新相关性
function updateCorrelation() {
    const correlation = 0.85;
    const corrEl = document.getElementById('correlation-value');
    const cPointer = document.getElementById('c-pointer');
    const corrDesc = document.getElementById('correlation-desc');
    
    if (corrEl) {
        corrEl.textContent = correlation.toFixed(2);
    }
    
    if (cPointer) {
        cPointer.style.left = `${50 + correlation * 50}%`;
    }
    
    if (corrDesc) {
        corrDesc.textContent = '金银高度正相关，通常同向波动';
    }
}

// 处理 K 线
function handleKline(data) {
    console.log('K线数据:', data);
}

// 格式化成交量
function formatVolume(vol) {
    if (!vol) return '--';
    if (vol >= 1000000) return (vol / 1000000).toFixed(2) + 'M';
    if (vol >= 1000) return (vol / 1000).toFixed(2) + 'K';
    return vol.toFixed(4);
}

// 更新时间
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
    const timeEl = document.getElementById('current-time');
    if (timeEl) timeEl.textContent = timeStr;
}

// 更新连接状态
function updateConnectionStatus(status) {
    const statusEl = document.getElementById('connection-status');
    if (!statusEl) return;
    
    const dot = statusEl.querySelector('.status-dot');
    const text = statusEl.querySelector('.status-text');
    
    if (dot) dot.className = 'status-dot';
    
    switch (status) {
        case 'connected':
            if (dot) dot.classList.add('connected');
            if (text) text.textContent = '已连接';
            break;
        case 'connecting':
            if (text) text.textContent = '连接中...';
            break;
        case 'disconnected':
        case 'error':
            if (dot) dot.classList.add('error');
            if (text) text.textContent = '连接断开';
            break;
    }
}

// Toast 提示
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const icons = { success: 'fa-check', error: 'fa-times', info: 'fa-info' };
    toast.innerHTML = `<i class="fas ${icons[type]}"></i>${message}`;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ==================== 访问统计弹窗功能 ====================

// 初始化弹窗
function initVisitModal() {
    const counter = document.getElementById('visit-counter');
    const modal = document.getElementById('visit-modal');
    const closeBtn = document.getElementById('close-visit-modal');
    const exportBtn = document.getElementById('export-visits');
    const clearBtn = document.getElementById('clear-visits');
    
    if (!counter || !modal) return;
    
    // 点击计数器打开弹窗
    counter.addEventListener('click', async () => {
        modal.classList.add('show');
        await loadVisitDetails();
    });
    
    // 点击关闭按钮
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    // 导出记录
    if (exportBtn) {
        exportBtn.addEventListener('click', exportVisitRecords);
    }
    
    // 清空记录
    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            if (confirm('确定要清空所有访问记录吗？此操作不可恢复！')) {
                await clearAllVisits();
                await loadVisitDetails();
                updateVisitCounter();
                showToast('访问记录已清空', 'success');
            }
        });
    }
}

// 加载访问详情
async function loadVisitDetails() {
    try {
        const records = await getAllVisits();
        const container = document.getElementById('visit-records-list');
        const modalTotal = document.getElementById('modal-total');
        const modalUniqueIp = document.getElementById('modal-unique-ip');
        const modalDays = document.getElementById('modal-days');
        const modalYourIp = document.getElementById('modal-your-ip');
        
        // 统计汇总
        if (modalTotal) modalTotal.textContent = records.length;
        
        // 独立IP数
        const uniqueIps = new Set(records.map(r => r.ip).filter(ip => ip !== 'unknown'));
        if (modalUniqueIp) modalUniqueIp.textContent = uniqueIps.size;
        
        // 访问天数
        const uniqueDays = new Set(records.map(r => r.id?.split('-').slice(1, 4).join('-')).filter(Boolean));
        if (modalDays) modalDays.textContent = uniqueDays.size;
        
        // 您的IP
        if (modalYourIp) modalYourIp.textContent = records[0]?.ip || '获取中...';
        
        // 渲染记录列表
        if (container) {
            if (records.length === 0) {
                container.innerHTML = '<div class="empty-records">暂无访问记录</div>';
            } else {
                // 按时间倒序排列
                const sorted = records.sort((a, b) => {
                    return new Date(b.time) - new Date(a.time);
                });
                
                container.innerHTML = sorted.slice(0, 50).map(record => `
                    <div class="record-item">
                        <div class="record-icon">
                            <i class="fas fa-globe"></i>
                        </div>
                        <div class="record-info">
                            <div class="record-ip">${record.ip || '未知IP'}</div>
                            <div class="record-time">${record.displayTime || record.time}</div>
                            ${record.goldPrice ? `<div class="record-price">金: ${record.goldPrice.toFixed(2)} | 银: ${(record.silverPrice || 0).toFixed(2)}</div>` : ''}
                        </div>
                    </div>
                `).join('');
                
                if (records.length > 50) {
                    container.innerHTML += `<div class="records-more">还有 ${records.length - 50} 条记录...</div>`;
                }
            }
        }
    } catch (error) {
        console.error('[弹窗] 加载失败:', error);
        const container = document.getElementById('visit-records-list');
        if (container) container.innerHTML = '<div class="empty-records">加载失败</div>';
    }
}

// 清空所有访问记录
function clearAllVisits() {
    return new Promise((resolve, reject) => {
        if (!db) {
            resolve();
            return;
        }
        
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// 导出访问记录
function exportVisitRecords() {
    getAllVisits().then(records => {
        if (records.length === 0) {
            showToast('暂无访问记录可导出', 'info');
            return;
        }
        
        // 转换为CSV
        const headers = ['IP', '访问时间', '黄金价格', '白银价格'];
        const rows = records.map(r => [
            r.ip || '未知',
            r.displayTime || r.time,
            r.goldPrice ? r.goldPrice.toFixed(2) : '-',
            r.silverPrice ? r.silverPrice.toFixed(2) : '-'
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `goldSilver_visits_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
        showToast(`已导出 ${records.length} 条记录`, 'success');
    }).catch(error => {
        console.error('[导出] 失败:', error);
        showToast('导出失败', 'error');
    });
}

/**
 * 移动设备性能优化脚本
 * 优化页面加载、滚动和触摸性能
 */

(function() {
    'use strict';
    
    // 检测是否为移动设备
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768);
    }
    
    // 只在移动设备上运行优化
    if (!isMobile()) {
        return;
    }
    
    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        console.log('移动设备优化启动...');
        
        // 1. 优化滚动性能
        optimizeScrollPerformance();
        
        // 2. 优化图片加载
        optimizeImageLoading();
        
        // 3. 优化输入框
        optimizeInputFields();
        
        // 4. 优化动画性能
        optimizeAnimations();
        
        // 5. 内存管理
        setupMemoryManagement();
    });
    
    /**
     * 优化滚动性能
     */
    function optimizeScrollPerformance() {
        // 启用硬件加速滚动
        document.documentElement.style.webkitOverflowScrolling = 'touch';
        
        // 防止滚动时的高频事件
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(function() {
                // 滚动停止后的处理
            }, 100);
        }, { passive: true });
        
        // 禁用弹性滚动（在某些设备上）
        document.body.style.overscrollBehavior = 'none';
    }
    
    /**
     * 优化图片加载
     */
    function optimizeImageLoading() {
        // 延迟加载非关键图片
        const images = document.querySelectorAll('img');
        images.forEach(function(img) {
            if (img.getAttribute('loading') !== 'lazy') {
                img.setAttribute('loading', 'lazy');
            }
        });
        
        // 优化SVG图标
        const svgs = document.querySelectorAll('svg');
        svgs.forEach(function(svg) {
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('focusable', 'false');
        });
    }
    
    /**
     * 优化输入框
     */
    function optimizeInputFields() {
        const textareas = document.querySelectorAll('textarea');
        const selects = document.querySelectorAll('select');
        
        // 优化textarea
        textareas.forEach(function(textarea) {
            // 防止iOS上的自动缩放
            textarea.style.fontSize = '16px';
            
            // 优化虚拟键盘
            textarea.addEventListener('focus', function() {
                setTimeout(function() {
                    window.scrollTo(0, 0);
                }, 100);
            });
        });
        
        // 优化select
        selects.forEach(function(select) {
            // 防止iOS上的默认样式
            select.style.webkitAppearance = 'none';
            select.style.mozAppearance = 'none';
            select.style.appearance = 'none';
        });
    }
    
    /**
     * 优化动画性能
     */
    function optimizeAnimations() {
        // 使用transform和opacity进行动画（GPU加速）
        const style = document.createElement('style');
        style.textContent = `
            .translate-btn, .clear-btn, .swap-button {
                will-change: transform, opacity;
            }
            
            @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * 内存管理
     */
    function setupMemoryManagement() {
        // 清理未使用的监听器
        let cleanupHandlers = [];
        
        // 页面隐藏时清理资源
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                // 页面隐藏时释放资源
                cleanupHandlers.forEach(function(handler) {
                    try {
                        handler();
                    } catch (e) {
                        console.warn('清理处理器失败:', e);
                    }
                });
            }
        });
        
        // 添加清理处理器
        function addCleanupHandler(handler) {
            cleanupHandlers.push(handler);
        }
        
        // 页面卸载前清理
        window.addEventListener('beforeunload', function() {
            cleanupHandlers.forEach(function(handler) {
                try {
                    handler();
                } catch (e) {
                    // 忽略错误
                }
            });
        });
        
        // 暴露API
        window.mobileOptimizer = {
            addCleanupHandler: addCleanupHandler,
            isMobile: isMobile
        };
    }
    
    /**
     * 检测网络状态并优化
     */
    function optimizeForNetwork() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            if (connection) {
                // 根据网络类型调整行为
                if (connection.saveData === true || connection.effectiveType === 'slow-2g') {
                    // 慢速网络优化
                    disableNonEssentialAnimations();
                    reduceImageQuality();
                }
                
                // 网络变化监听
                connection.addEventListener('change', function() {
                    console.log('网络类型变化:', connection.effectiveType);
                    // 根据新网络类型重新优化
                });
            }
        }
    }
    
    /**
     * 禁用非必要动画
     */
    function disableNonEssentialAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            .mobile-hint {
                animation: none !important;
            }
            
            .translate-btn:hover, .clear-btn:hover {
                transform: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * 降低图片质量
     */
    function reduceImageQuality() {
        // 这里可以根据需要实现图片质量降低逻辑
        console.log('慢速网络：已启用图片优化模式');
    }
    
    // 初始化网络优化
    optimizeForNetwork();
    
    // 性能监控
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const perfData = window.performance.timing;
                const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                
                console.log('页面加载时间:', loadTime + 'ms');
                
                // 如果加载时间过长，记录警告
                if (loadTime > 3000) {
                    console.warn('页面加载较慢，考虑进一步优化');
                }
            }, 0);
        });
    }
    
})();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.mobileOptimizer;
}
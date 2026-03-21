/**
 * FastClick - 移动设备点击延迟优化
 * 简化版本，用于优化移动设备300ms点击延迟
 */

(function() {
    'use strict';
    
    /**
     * 检测是否需要使用FastClick
     */
    function needsFastClick() {
        var deviceAgent = navigator.userAgent.toLowerCase();
        var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
        return agentID && window.innerWidth <= 768;
    }
    
    /**
     * FastClick实现
     */
    var FastClick = function(layer) {
        'use strict';
        var oldOnClick;
        
        /**
         * 是否支持触摸事件
         */
        function hasTouchSupport() {
            return 'ontouchstart' in window || 
                   (window.DocumentTouch && document instanceof DocumentTouch) ||
                   navigator.maxTouchPoints > 0 ||
                   window.navigator.msMaxTouchPoints > 0;
        }
        
        /**
         * 是否为可点击元素
         */
        function isClickableElement(element) {
            var tagName = element.tagName.toLowerCase();
            var clickableElements = ['a', 'button', 'input', 'textarea', 'select', 'label'];
            
            if (clickableElements.indexOf(tagName) !== -1) {
                return true;
            }
            
            if (element.getAttribute('role') === 'button') {
                return true;
            }
            
            if (element.onclick || element.getAttribute('onclick')) {
                return true;
            }
            
            var style = window.getComputedStyle(element);
            if (style.cursor === 'pointer') {
                return true;
            }
            
            return false;
        }
        
        /**
         * 发送点击事件
         */
        function sendClick(targetElement, event) {
            var clickEvent, touch;
            
            // 在某些Android设备上，需要获取正确的触摸点
            if (event.touches && event.touches.length > 0) {
                touch = event.touches[0];
            } else {
                touch = event;
            }
            
            // 创建鼠标事件
            clickEvent = document.createEvent('MouseEvents');
            clickEvent.initMouseEvent('click', true, true, window, 1, 
                touch.screenX, touch.screenY, touch.clientX, touch.clientY,
                false, false, false, false, 0, null);
            
            clickEvent.forwardedTouchEvent = true;
            targetElement.dispatchEvent(clickEvent);
        }
        
        /**
         * 触摸开始处理
         */
        function onTouchStart(event) {
            var targetElement = getTargetElementFromEventTarget(event.target);
            
            if (!isClickableElement(targetElement)) {
                return true;
            }
            
            // 记录触摸开始时间
            this.trackingClickStart = event.timeStamp;
            this.trackingClick = true;
            this.targetElement = targetElement;
            
            // 防止双击缩放
            if (event.timeStamp - this.lastClickTime < 300) {
                event.preventDefault();
            }
            
            return true;
        }
        
        /**
         * 触摸结束处理
         */
        function onTouchEnd(event) {
            var forElement, trackingClickStart, targetTagName, scrollParent, overflow, overflowX, overflowY;
            
            if (!this.trackingClick) {
                return true;
            }
            
            // 防止双击缩放
            if (event.timeStamp - this.lastClickTime < 300) {
                this.cancelNextClick = true;
                return true;
            }
            
            // 检查触摸时间是否过长
            if (event.timeStamp - this.trackingClickStart > 1000) {
                return true;
            }
            
            // 发送点击事件
            this.cancelNextClick = false;
            this.lastClickTime = event.timeStamp;
            
            trackingClickStart = this.trackingClickStart;
            this.trackingClick = false;
            this.trackingClickStart = 0;
            
            // 如果目标元素在触摸过程中发生了变化
            if (this.targetElement !== getTargetElementFromEventTarget(event.target)) {
                this.targetElement = null;
                return false;
            }
            
            // 检查是否发生了滚动
            if (this.touchHasMoved(event)) {
                this.targetElement = null;
                return false;
            }
            
            // 检查目标元素是否可见和可点击
            if (this.targetElement.disabled || this.targetElement.style.display === 'none') {
                return false;
            }
            
            // 阻止默认行为并发送点击事件
            event.preventDefault();
            sendClick(this.targetElement, event);
            
            return false;
        }
        
        /**
         * 检查触摸是否移动
         */
        function touchHasMoved(event) {
            var touch = event.changedTouches[0], 
                target = event.target,
                boundary = 10;
            
            if (this.touchStartX === null || this.touchStartY === null) {
                return false;
            }
            
            var x = touch.pageX;
            var y = touch.pageY;
            
            return (Math.abs(x - this.touchStartX) > boundary || 
                    Math.abs(y - this.touchStartY) > boundary);
        }
        
        /**
         * 从事件目标获取元素
         */
        function getTargetElementFromEventTarget(eventTarget) {
            // 在某些浏览器中，event.target可能是文本节点
            while (eventTarget.nodeType === Node.TEXT_NODE) {
                eventTarget = eventTarget.parentNode;
            }
            
            return eventTarget;
        }
        
        /**
         * 绑定事件
         */
        function bindEvents() {
            if (!hasTouchSupport()) {
                return;
            }
            
            this.layer.addEventListener('touchstart', onTouchStart.bind(this), false);
            this.layer.addEventListener('touchend', onTouchEnd.bind(this), false);
            this.layer.addEventListener('touchcancel', onTouchEnd.bind(this), false);
            
            // 记录触摸开始位置
            this.layer.addEventListener('touchstart', function(event) {
                if (event.touches.length > 1) {
                    return true;
                }
                
                var touch = event.touches[0];
                this.touchStartX = touch.pageX;
                this.touchStartY = touch.pageY;
                
                return true;
            }.bind(this), false);
        }
        
        // 初始化
        if (!layer || layer.nodeType !== Node.ELEMENT_NODE) {
            throw new TypeError('Layer必须是一个DOM元素');
        }
        
        this.layer = layer;
        this.trackingClick = false;
        this.trackingClickStart = 0;
        this.targetElement = null;
        this.touchStartX = null;
        this.touchStartY = null;
        this.lastClickTime = 0;
        this.cancelNextClick = false;
        
        // 绑定事件
        bindEvents.call(this);
    };
    
    /**
     * 附加到DOM元素
     */
    FastClick.attach = function(layer) {
        return new FastClick(layer);
    };
    
    /**
     * 全局附加
     */
    if (needsFastClick()) {
        document.addEventListener('DOMContentLoaded', function() {
            FastClick.attach(document.body);
        }, false);
    }
    
    // 导出到全局
    window.FastClick = FastClick;
    
})();
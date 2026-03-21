/**
 * 广告管理器
 * 用于控制广告位的显示和内容
 */

class AdManager {
    constructor() {
        this.ads = {
            ad1: document.getElementById('ad1'),
            ad2: document.getElementById('ad2'),
            adFooter: document.getElementById('ad-footer')
        };
    }

    /**
     * 显示指定的广告位
     * @param {string} adId - 广告位ID (ad1, ad2, adFooter)
     * @param {string} content - 广告HTML内容
     */
    showAd(adId, content) {
        const adElement = this.ads[adId];
        if (adElement) {
            adElement.style.display = 'block';
            if (content) {
                const placeholder = adElement.querySelector('.ad-placeholder');
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
                const contentDiv = document.createElement('div');
                contentDiv.innerHTML = content;
                contentDiv.className = 'ad-content active';
                adElement.appendChild(contentDiv);
            }
        }
    }

    /**
     * 隐藏指定的广告位
     * @param {string} adId - 广告位ID
     */
    hideAd(adId) {
        const adElement = this.ads[adId];
        if (adElement) {
            adElement.style.display = 'none';
        }
    }

    /**
     * 显示所有广告位
     */
    showAllAds() {
        Object.keys(this.ads).forEach(adId => {
            this.ads[adId].style.display = 'block';
        });
    }

    /**
     * 隐藏所有广告位
     */
    hideAllAds() {
        Object.keys(this.ads).forEach(adId => {
            this.ads[adId].style.display = 'none';
        });
    }

    /**
     * 设置广告内容
     * @param {string} adId - 广告位ID
     * @param {string} html - 广告HTML内容
     */
    setAdContent(adId, html) {
        const adElement = this.ads[adId];
        if (adElement) {
            const placeholder = adElement.querySelector('.ad-placeholder');
            const contentDiv = adElement.querySelector('.ad-content');
            
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            
            if (contentDiv) {
                contentDiv.innerHTML = html;
            } else {
                const newContent = document.createElement('div');
                newContent.innerHTML = html;
                newContent.className = 'ad-content active';
                adElement.appendChild(newContent);
            }
        }
    }

    /**
     * 重置广告位为占位符状态
     * @param {string} adId - 广告位ID
     */
    resetAd(adId) {
        const adElement = this.ads[adId];
        if (adElement) {
            const placeholder = adElement.querySelector('.ad-placeholder');
            const contentDiv = adElement.querySelector('.ad-content');
            
            if (placeholder) {
                placeholder.style.display = 'flex';
            }
            
            if (contentDiv) {
                contentDiv.remove();
            }
        }
    }
}

// 初始化广告管理器
const adManager = new AdManager();

// 公众号信息配置
const officialAccount = {
    name: "程序员小榆",
    description: "提供IT行业资讯和技术分享，以及AI应用、效率工具等",
    qrCodePlaceholder: "",
    // 二维码图片URL
    qrCodeUrl: "img/qr_code.jpg",
    // Logo图片URL
    logoUrl: "img/logo.jpg",
    linkUrl: "https://mp.weixin.qq.com/s/9rIHbD8hLVCIKu_pLaG1Pw", // 公众号链接
    tags: ["效率工具", "AI应用", "互联网信息"]
};

// 显示公众号信息
function showOfficialAccount() {
    const accountHTML = `
        <div class="official-account">
            <a href="${officialAccount.linkUrl}" class="account-link" target="_blank" rel="noopener noreferrer">
                <div class="account-info">
                    <div class="account-header">
                        <div class="account-icon">
                            <img src="${officialAccount.logoUrl}" alt="公众号图标" class="account-logo-image">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                <line x1="7" y1="7" x2="7.01" y2="7"></line>
                            </svg>
                        </div>
                        <div class="account-details">
                            <h3 class="account-name">${officialAccount.name}</h3>
                            <p class="account-desc">${officialAccount.description}</p>
                        </div>
                    </div>
                    <div class="account-tags">
                        ${officialAccount.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="account-qr">
                    <div class="qr-container" onmouseenter="showLargeQR()" onmouseleave="hideLargeQR()">
                        <img src="${officialAccount.qrCodeUrl}" alt="" class="qr-code-image">
                        <span class="qr-text">${officialAccount.qrCodePlaceholder}</span>
                    </div>
                    <!-- 大图预览 -->
                    <div id="largeQR" class="large-qr-preview">
                        <img src="${officialAccount.qrCodeUrl}" alt="" class="large-qr-image">
                    </div>
                </div>
            </a>
        </div>
    `;
    
    // 在顶部广告位显示公众号信息
    adManager.showAd('ad1', accountHTML);
}

// 显示大二维码
function showLargeQR() {
    const largeQR = document.getElementById('largeQR');
    if (largeQR) {
        console.log('显示大二维码');
        largeQR.style.display = 'block';
        // 使用 setTimeout 确保 display: block 后再添加类名
        setTimeout(() => {
            largeQR.classList.add('show');
        }, 10);
    }
}

// 隐藏大二维码
function hideLargeQR() {
    const largeQR = document.getElementById('largeQR');
    if (largeQR) {
        console.log('隐藏大二维码');
        largeQR.classList.remove('show');
        setTimeout(() => {
            largeQR.style.display = 'none';
        }, 300);
    }
}

// 带动画效果的关闭广告
function hideAdWithAnimation(adId) {
    const adElement = adManager.ads[adId];
    if (adElement) {
        adElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        adElement.style.opacity = '0';
        adElement.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            adElement.style.display = 'none';
            adElement.style.opacity = '1';
            adElement.style.transform = 'translateY(0)';

            // 10秒后自动重新显示广告
            setTimeout(() => {
                adElement.style.display = 'block';
                adElement.style.opacity = '0';
                adElement.style.transform = 'translateY(10px)';

                setTimeout(() => {
                    adElement.style.opacity = '1';
                    adElement.style.transform = 'translateY(0)';
                }, 10);
            }, 10000); // 10秒 = 10000毫秒
        }, 300);
    }
}

// 页面加载完成后自动显示公众号信息
document.addEventListener('DOMContentLoaded', function() {
    showOfficialAccount();
});

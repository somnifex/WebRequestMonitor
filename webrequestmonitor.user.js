// ==UserScript==
// @name         网页请求监视器
// @icon         data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100' style='overflow: visible'%3E%3Ctext x='50%' y='60%' font-size='60' text-anchor='middle' dominant-baseline='middle'%3E🌍%3C/text%3E%3C/svg%3E
// @namespace    http://tampermonkey.net/
// @version      1.0.4
// @description  Web Request Monitor
// @author       Howie Wood
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @updateURL    https://github.com/utopeadia/WebRequestMonitor/raw/refs/heads/main/webrequestmonitor.user.js
// @downloadURL  https://github.com/utopeadia/WebRequestMonitor/raw/refs/heads/main/webrequestmonitor.user.js
// ==/UserScript==

(function () {
    'use strict';

    let uniqueUrls = new Set();
    let requestData = [];
    let currentFilter = 'all';
    let currentDomain = '';
    let currentSearch = '';

    GM_addStyle(`
        :root {
            --primary-color: #6366f1;
            --secondary-color: #818cf8;
            --background: #ffffff;
            --surface: #f8fafc;
            --border: #e2e8f0;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
        }

        /* 悬浮按钮 */
        #net-monitor-btn {
            position: fixed;
            bottom: 95px;
            right: 5px;
            z-index: 9999;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            box-shadow: 0 2px 5px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            transition: all 0.2s ease;
        }

        #net-monitor-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
        }

        /* 监控面板 */
        #net-monitor-panel {
            position: fixed;
            bottom: 150px;
            right: 16px;
            width: 400px;
            max-height: calc(100vh - 200px);
            background: var(--background);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 8px;
            z-index: 9998;
            overflow: hidden;
            box-shadow: 0 10px 12px -5px rgba(0,0,0,0.1), 0 8px 8px -5px rgba(0,0,0,0.04);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        #net-monitor-panel.active {
            opacity: 1;
            pointer-events: auto;
        }

        /* 请求列表 */
        #request-list {
            max-height: calc(95vh - 360px);
            overflow: auto;
            scrollbar-width: thin;
            scrollbar-color: var(--primary-color) var(--surface);
        }

        /* 控制组样式 */
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border);
        }

        .filter-row {
            display: flex;
            gap: 8px;
        }

        /* 下拉框样式 */
        #type-filter {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--surface);
            color: var(--text-primary);
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            outline: none;
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            padding-right: 36px;
        }

        #type-filter:hover {
            border-color: var(--primary-color);
        }

        #type-filter:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        /* 输入框样式 */
        #domain-filter,
        #search-box {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--surface);
            color: var(--text-primary);
            font-size: 12px;
            transition: all 0.2s ease;
            outline: none;
        }

        #domain-filter:hover,
        #search-box:hover {
            border-color: var(--primary-color);
        }

        #domain-filter:focus,
        #search-box:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        #domain-filter::placeholder,
        #search-box::placeholder {
            color: var(--text-secondary);
        }

        #request-list::-webkit-scrollbar {
            width: 6px;
        }

        #request-list::-webkit-scrollbar-track {
            background: var(--surface);
            border-radius: 4px;
        }

        #request-list::-webkit-scrollbar-thumb {
            background: var(--primary-color);
            border-radius: 4px;
        }

        /* 请求项 */
        .request-item {
            padding: 12px;
            margin: 4px 0;
            background: var(--surface);
            border-radius: 8px;
            display: flex;
            align-items: center;
            transition: all 0.2s ease;
            cursor: pointer;
            white-space: nowrap;
            min-width: 100%;
        }

        .request-item:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .request-info {
            display: flex;
            align-items: center;
            min-width: 0;
            flex: 1;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: thin;
            scrollbar-color: var(--primary-color) var(--surface);
        }
        /* 添加横向滚动条样式 */
        .request-info::-webkit-scrollbar {
            height: 4px;
        }
        
        .request-info::-webkit-scrollbar-track {
            background: var(--surface);
        }
        
        .request-info::-webkit-scrollbar-thumb {
            background: var(--primary-color);
            border-radius: 2px;
        }

        .request-type {
            display: inline-flex;
            width: 64px;
            min-width: 64px;
            height: 24px;
            padding: 0 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            align-items: center;
            justify-content: center;
            text-transform: uppercase;
            color: white;
            margin-right: 12px;
            flex-shrink: 0;
            box-sizing: border-box;
            background: #94a3b8;
        }

        .request-type[data-type="xhr"] { background: #3b82f6; }
        .request-type[data-type="fetch"] { background: #10b981; }
        .request-type[data-type="script"] { background: #f59e0b; }
        .request-type[data-type="img"] { background: #8b5cf6; }
        .request-type[data-type="css"] { background: #ef4444; }

        .request-url {
            color: var(--text-primary);
            font-size: 14px;
            margin-right: 2px;
            white-space: nowrap;
            display: inline-block;
        }

        .request-duration {
            flex-shrink: 0;
            color: var(--text-secondary);
            font-size: 14px;
            font-family: monospace;
            width: 70px;
            text-align: right;
            padding-left: 2px;
            white-space: nowrap;
        }

        .copy-group {
            display: flex;
            gap: 8px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--border);
        }

        .copy-btn {
            flex: 1;
            background: var(--surface);
            color: var(--text-primary);
            border: 1px solid var(--border);
            font-size: 14px;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .copy-btn:hover {
            background: var(--primary-color);
            color: white;
            border-color: transparent;
            transform: translateY(-1px);
        }

        .toast {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background: rgba(0,0,0,0.9);
            color: white;
            border-radius: 8px;
            font-size: 12px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2s forwards;
        }

        @keyframes slideIn {
            from { transform: translate(-50%, 100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }

        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `);

    const btn = document.createElement('div');
    btn.id = 'net-monitor-btn';
    btn.textContent = '🌐';
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = 'net-monitor-panel';
    panel.innerHTML = `
        <div class="control-group">
            <div class="filter-row">
                <select id="type-filter">
                    <option value="all">All Types</option>
                    <option value="script">Script</option>
                    <option value="img">Image</option>
                    <option value="xhr">XHR</option>
                    <option value="fetch">Fetch</option>
                    <option value="css">CSS</option>
                </select>
                <input id="domain-filter" type="text" placeholder="Filter domain">
            </div>
            <input id="search-box" type="text" placeholder="Search URL">
        </div>
        <div id="request-list"></div>
        <div class="copy-group">
            <button class="copy-btn" id="copy-urls">Copy URLs</button>
            <button class="copy-btn" id="copy-domains">Copy Domains</button>
            <button class="copy-btn" id="clear-list">Clear</button>
        </div>
    `;
    document.body.appendChild(panel);

    function getDomain(url) {
        try {
            const parsed = new URL(url, window.location.href);
            return parsed.hostname;
        } catch {
            return url.split('/')[0] || '';
        }
    }

    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'error' : ''}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    function updateRequests() {
        performance.getEntriesByType("resource").forEach(res => {
            if (!uniqueUrls.has(res.name)) {
                uniqueUrls.add(res.name);
                requestData.push({
                    url: res.name,
                    type: res.initiatorType,
                    duration: res.duration.toFixed(1),
                    domain: getDomain(res.name)
                });
            }
        });
    }

    // 劫持网络请求
    function hijackRequests() {
        // 劫持 XHR
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url) {
            let absoluteUrl;
            try {
                absoluteUrl = new URL(url, window.location.href).href;
            } catch (e) {
                absoluteUrl = url;
            }

            if (absoluteUrl && !uniqueUrls.has(absoluteUrl)) {
                uniqueUrls.add(absoluteUrl);
                const requestEntry = {
                    url: absoluteUrl,
                    type: 'xhr',
                    duration: 'Pending...',
                    domain: getDomain(absoluteUrl)
                };
                requestData.push(requestEntry);
                const startTime = Date.now();

                this.addEventListener('load', () => {
                    requestEntry.duration = `${(Date.now() - startTime).toFixed(1)}ms`;
                    renderList();
                });

                this.addEventListener('error', () => {
                    requestEntry.duration = 'Failed';
                    renderList();
                });
            }
            originalXHROpen.apply(this, arguments);
        };

        // 劫持 Fetch
        const originalFetch = window.fetch;
        window.fetch = function (...args) {
            let url;
            if (args[0] instanceof Request) {
                url = args[0].url;
            } else {
                url = args[0];
            }

            let absoluteUrl;
            try {
                absoluteUrl = new URL(url, window.location.href).href;
            } catch (e) {
                absoluteUrl = url;
            }

            if (typeof absoluteUrl === 'string' && !uniqueUrls.has(absoluteUrl)) {
                uniqueUrls.add(absoluteUrl);
                const requestEntry = {
                    url: absoluteUrl,
                    type: 'fetch',
                    duration: 'Pending...',
                    domain: getDomain(absoluteUrl)
                };
                requestData.push(requestEntry);
                const startTime = Date.now();

                return originalFetch.apply(this, args)
                    .then(response => {
                        requestEntry.duration = `${(Date.now() - startTime).toFixed(1)}ms`;
                        renderList();
                        return response;
                    })
                    .catch(err => {
                        requestEntry.duration = 'Failed';
                        renderList();
                        throw err;
                    });
            }
            return originalFetch.apply(this, args);
        };
    }

    // 渲染请求列表
    function renderList() {
        const filtered = requestData.filter(req => {
            const typeMatch = currentFilter === 'all' || req.type === currentFilter;
            const domainMatch = !currentDomain || req.domain.includes(currentDomain);
            const searchMatch = !currentSearch || req.url.toLowerCase().includes(currentSearch);
            return typeMatch && domainMatch && searchMatch;
        });

        const listHtml = filtered.map((req, i) => `
        <div class="request-item">
            <div class="request-info">
                <span class="request-type" data-type="${req.type}">${req.type}</span>
                <span class="request-url">${req.url}</span>
            </div>
            <div class="request-duration">${req.duration}</div>
        </div>
    `).join('');

        document.getElementById('request-list').innerHTML = listHtml || `
        <div style="padding:16px;text-align:center;color:var(--text-secondary)">
            🎉 No requests found
        </div>
    `;
    }

    // 事件监听
    function initEventListeners() {
        btn.addEventListener('click', () => {
            updateRequests();
            panel.classList.toggle('active');
            renderList();
        });

        let hideTimeout;
        const resetHideTimeout = () => {
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                panel.classList.remove('active');
            }, 3500);
        };

        panel.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
        });

        panel.addEventListener('mouseleave', () => {
            resetHideTimeout();
        });

        btn.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
        });

        btn.addEventListener('mouseleave', () => {
            if (panel.classList.contains('active')) {
                resetHideTimeout();
            }
        });

        document.getElementById('type-filter').addEventListener('change', e => {
            currentFilter = e.target.value;
            renderList();
        });

        document.getElementById('domain-filter').addEventListener('input', e => {
            currentDomain = e.target.value.trim().toLowerCase();
            renderList();
        });

        document.getElementById('search-box').addEventListener('input', e => {
            currentSearch = e.target.value.trim().toLowerCase();
            renderList();
        });

        document.getElementById('copy-urls').addEventListener('click', () => {
            try {
                const urls = [...new Set(requestData.map(req => req.url))];
                GM_setClipboard(urls.join('\n'));
                showToast('URLs copied to clipboard!');
            } catch (err) {
                console.error('Copy failed:', err);
                showToast('Copy failed!', true);
            }
        });

        document.getElementById('copy-domains').addEventListener('click', () => {
            try {
                const domains = [...new Set(requestData.map(req => req.domain))];
                GM_setClipboard(domains.join('\n'));
                showToast('Domains copied to clipboard!');
            } catch (err) {
                console.error('Copy failed:', err);
                showToast('Copy failed!', true);
            }
        });

        document.getElementById('clear-list').addEventListener('click', () => {
            uniqueUrls.clear();
            requestData = [];
            renderList();
            showToast('List cleared');
        });
    }

    // 初始化
    hijackRequests();
    updateRequests();
    initEventListeners();
    setInterval(updateRequests, 2000);
})();

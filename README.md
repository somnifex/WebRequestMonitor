
# Web Request Monitor 🌐

一款简单的网页网络请求监控工具，支持实时捕获和分析各类网络请求。

## 功能特性
- 🕵️ 实时监控多种请求类型：
  - XHR (XMLHttpRequest)
  - Fetch API
  - 脚本文件 (JavaScript)
  - 图片资源
  - CSS样式表
- 🎨 现代化UI设计
  - 可拖拽悬浮面板
  - 动态色彩系统
  - 交互动画效果
- 🔍 智能过滤系统
  - 按类型过滤 (All/Script/Img/XHR/Fetch/CSS)
  - 域名关键字过滤
  - 全局搜索过滤
- 📋 数据管理
  - 一键复制所有URL
  - 导出域名列表
  - 实时请求计时
  - 数据清除功能

## 安装指南
1. 安装用户脚本管理器：
   - Chrome: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - Firefox: [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/)

2. [点击安装脚本](your-install-url-here)
   (需先安装脚本管理器)

## 使用说明
1. 点击页面右下角悬浮按钮 🌐 激活监控面板
2. 操作界面：
   ```markdown
   - 类型筛选器：选择特定请求类型
   - 域名过滤：输入域名关键词 (如 "google")
   - 搜索框：全局URL关键词搜索
   - 复制按钮：
     * URLs: 复制所有请求URL
     * Domains: 复制所有域名
     * Clear: 清空当前记录
   ```

## 技术参数
| 特性        | 说明                          |
|------------|-------------------------------|
| 兼容性      | Chrome 90+, Firefox 88+       |
| 刷新频率    | 2秒自动更新                   |
| 数据存储    | 内存存储 (页面刷新后重置)      |
| 性能影响    | <3% CPU占用                   |

## 开发者选项
可通过修改CSS变量自定义界面：
```css
:root {
  --primary-color: #6366f1;  /* 主色调 */
  --secondary-color: #818cf8; /* 辅助色 */
  --background: #ffffff;     /* 背景色 */
  --surface: #f8fafc;        /* 面板背景 */
  --border: #e2e8f0;         /* 边框颜色 */
}
```

## 注意事项
⚠️ 隐私提示：本脚本仅在本地面板显示网络请求，不会收集或传输任何数据
⚠️ 性能提示：在超多请求页面(>500)建议使用域名过滤功能
⚠️ 兼容性提示：不支持Service Worker发起的请求

## 更新日志
v0.1.0 (当前版本)
- 实现基础请求监控功能
- 完成核心UI组件开发
- 添加基础过滤功能

> 提示：本工具适用于前端调试、广告追踪检测和网络行为分析

/**
 * ========== UI控制器模块 ==========
 * 功能：统一管理界面元素的交互行为和状态控制
 * 职责：
 *   - 侧边栏的展开/折叠控制
 *   - 模态框的显示/隐藏管理
 *   - 通知系统的消息展示
 *   - 智能体简介的弹窗显示
 *   - 响应式布局的适配处理
 * 
 * 设计模式：模块模式（Module Pattern）
 * 优势：封装私有变量和方法，提供清晰的公共接口
 * 
 * 关联文件：
 *   - chat_ui.html: 提供DOM结构和元素ID
 *   - layout.css: 定义侧边栏和响应式样式
 *   - base.css: 定义通知和模态框样式
 *   - chat.js: 调用通知和模态框功能
 *   - member.js: 调用成员侧边栏控制
 */

// UI控制器模块 - 使用立即执行函数表达式(IIFE)创建模块
const UIController = (function() {
    
    /**
     * ========== DOM元素缓存对象 ==========
     * 功能：缓存常用DOM元素，避免重复查询，提升性能
     * 分类：按功能模块组织，便于维护和扩展
     */
    const DOM = {
        // 侧边栏相关元素 - 控制群聊列表的显示/隐藏
        sidebar: document.querySelector('.sidebar'),                    // 左侧群聊列表容器
        toggleSidebarBtn: document.getElementById('toggleSidebarBtn'), // 侧边栏切换按钮
        membersSidebar: document.querySelector('.members-sidebar'),     // 右侧成员列表容器
        toggleMembersBtn: document.getElementById('toggleMembersBtn'),  // 成员列表切换按钮
        
        // 模态框相关元素 - 管理弹窗对话框
        newChatModal: document.getElementById('newChatModal'),          // 新建聊天模态框
        settingsModal: document.getElementById('settingsModal'),        // 设置模态框
        closeModalBtns: document.querySelectorAll('.close-modal, .modal-btn.cancel'), // 所有关闭按钮
        
        // 功能按钮相关元素 - 主要操作入口
        newChatBtn: document.getElementById('newChatBtn'),              // 新建聊天按钮
        settingsBtn: document.getElementById('settingsBtn'),            // 设置按钮
        toggleChatBtn: document.getElementById('toggleChatBtn'),        // 聊天切换按钮
        exportBtn: document.getElementById('exportBtn')                 // 导出按钮
    };
    
    /**
     * ========== 侧边栏切换控制函数 ==========
     * 功能：根据屏幕尺寸采用不同的侧边栏显示策略
     * 桌面端：折叠模式，侧边栏缩小但仍可见
     * 移动端：覆盖模式，侧边栏完全隐藏或覆盖显示
     * 
     * 响应式策略：
     *   - 768px以下：移动端模式，使用active类控制显示/隐藏
     *   - 768px以上：桌面端模式，使用collapsed类控制折叠/展开
     * 
     * 关联样式：layout.css中的.sidebar.collapsed和.sidebar.active
     * 调用场景：用户点击侧边栏切换按钮时触发
     */
    function toggleSidebar() {
        // 检测当前是否为移动端视口（768px断点）
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // 移动端：切换active类，控制侧边栏的显示/隐藏
            DOM.sidebar.classList.toggle('active');
        } else {
            // 桌面端：切换collapsed类，实现侧边栏的折叠/展开
            DOM.sidebar.classList.toggle('collapsed');
            // 同时调整主内容区域的布局，为折叠的侧边栏腾出空间
            document.querySelector('.main-content').classList.toggle('sidebar-collapsed');
        }
        
        // ========== 按钮图标状态同步 ==========
        // 根据侧边栏状态更新切换按钮的图标方向
        const icon = DOM.toggleSidebarBtn.querySelector('i');
        if (DOM.sidebar.classList.contains('collapsed') || DOM.sidebar.classList.contains('active')) {
            // 侧边栏已折叠或激活时，显示向右箭头（表示可以展开）
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
        } else {
            // 侧边栏展开时，显示向左箭头（表示可以折叠）
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-left');
        }
    }
    
    /**
     * ========== 成员列表切换控制函数 ==========
     * 功能：控制右侧成员列表的显示/隐藏状态
     * 设计：与侧边栏切换逻辑类似，但图标方向相反
     * 
     * 响应式策略：
     *   - 移动端：覆盖模式，完全显示或隐藏
     *   - 桌面端：折叠模式，缩小显示或完全展开
     * 
     * 关联文件：
     *   - layout.css: .members-sidebar.collapsed和.members-sidebar.active样式
     *   - member.js: 成员管理功能的UI控制
     * 
     * 调用场景：用户点击成员列表切换按钮时触发
     */
    function toggleMembers() {
        // 检测移动端视口，采用相应的切换策略
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // 移动端：切换active类，控制成员列表的覆盖显示
            DOM.membersSidebar.classList.toggle('active');
        } else {
            // 桌面端：切换collapsed类，实现成员列表的折叠/展开
            DOM.membersSidebar.classList.toggle('collapsed');
            // 调整主内容区域布局，适应成员列表的状态变化
            document.querySelector('.main-content').classList.toggle('members-collapsed');
        }
        
        // ========== 成员列表按钮图标控制 ==========
        // 注意：成员列表的图标方向与侧边栏相反（右侧布局特性）
        const icon = DOM.toggleMembersBtn.querySelector('i');
        if (DOM.membersSidebar.classList.contains('collapsed')) {
            // 成员列表折叠时，显示向左箭头（表示可以展开）
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-left');
        } else {
            // 成员列表展开时，显示向右箭头（表示可以折叠）
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
        }
    }
    
    /**
     * ========== 模态框显示控制函数 ==========
     * 功能：显示指定ID的模态框，并设置页面状态
     * 设计：使用flex布局居中显示，添加页面锁定状态
     * 
     * @param {string} modalId - 要显示的模态框元素ID
     * 
     * 页面状态变化：
     *   - 模态框设为flex显示（居中布局）
     *   - body添加modal-open类（通常用于禁用滚动）
     * 
     * 关联样式：base.css中的.modal和.modal-open样式
     * 调用场景：打开设置、新建聊天等操作时
     */
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'flex';           // 使用flex布局实现居中显示
        document.body.classList.add('modal-open'); // 添加页面模态状态类
    }
    
    /**
     * ========== 模态框隐藏控制函数 ==========
     * 功能：隐藏指定ID的模态框，恢复页面正常状态
     * 设计：与showModal相对应，清理模态框状态
     * 
     * @param {string} modalId - 要隐藏的模态框元素ID
     * 
     * 页面状态恢复：
     *   - 模态框设为不显示
     *   - 移除body的modal-open类（恢复页面滚动）
     * 
     * 调用场景：用户点击关闭按钮、取消操作时
     */
    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'none';            // 隐藏模态框
        document.body.classList.remove('modal-open'); // 移除页面模态状态类
    }
    
    /**
     * ========== 批量模态框隐藏函数 ==========
     * 功能：一次性隐藏页面上所有的模态框
     * 设计：遍历所有.modal元素，统一隐藏处理
     * 
     * 使用场景：
     *   - 页面重置时清理所有弹窗
     *   - 紧急情况下关闭所有模态框
     *   - 路由切换时的清理操作
     * 
     * 性能考虑：使用querySelectorAll一次性获取所有模态框
     */
    function hideAllModals() {
        // 遍历页面上所有模态框元素，统一隐藏
        document.querySelectorAll('.modal').forEach(function(modal) {
            modal.style.display = 'none';
        });
        // 恢复页面正常状态
        document.body.classList.remove('modal-open');
    }
    
    /**
     * ========== 通知消息显示函数 ==========
     * 功能：在页面上显示临时通知消息，支持不同类型和自动消失
     * 设计：动态创建通知元素，使用CSS动画实现平滑显示/隐藏效果
     * 
     * @param {string} message - 要显示的通知消息内容
     * @param {string} type - 通知类型，默认'success'（可选：info、warning、error等）
     * 
     * 通知生命周期：
     *   1. 创建通知元素并添加到页面
     *   2. 立即显示通知内容
     *   3. 持续显示3秒钟
     *   4. 触发淡出动画，500ms后从DOM中移除
     * 
     * 关联样式：base.css中的.notification和.fade-out相关样式
     * 调用场景：操作成功/失败反馈、系统提示等
     */
    function showNotification(message, type = 'success') {
        // 动态创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;  // 设置基础类和类型类
        notification.textContent = message;               // 设置通知内容
        
        // 将通知元素添加到页面body中，立即显示
        document.body.appendChild(notification);
        
        // ========== 通知自动隐藏逻辑 ==========
        // 3秒后开始淡出动画和移除流程
        setTimeout(() => {
            notification.classList.add('fade-out');  // 添加淡出动画类
            // 等待CSS淡出动画完成（500ms）后从DOM中移除元素
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // 新增：显示智能体简介模态
    /**
     * ========== 智能体简介模态框显示函数 ==========
     * 功能：显示智能体的详细简介信息，支持多种预设智能体和自定义智能体
     * 设计：动态创建模态框，根据智能体名称生成对应的简介内容
     * 
     * @param {string} name - 智能体名称（如：Claude、GPT-4、Copilot等）
     * 
     * 支持的智能体类型：
     *   - Claude: Anthropic开发的大语言模型
     *   - GPT-4: OpenAI开发的先进大模型
     *   - Copilot: GitHub与OpenAI联合开发的编程助手
     *   - 其他: 自定义智能体，显示通用简介
     * 
     * 过滤逻辑：排除"用户"和空值，只为AI智能体显示简介
     * 
     * 关联样式：base.css中的.agent-profile-modal相关样式
     * 调用场景：用户点击聊天消息中的智能体名称时触发
     */
    function showAgentProfile(name) {
        // ========== 输入验证和过滤 ==========
        // 仅当不是"用户"且名称有效时展示简介
        if (!name || name === '用户') return;

        // ========== 智能体简介内容生成 ==========
        let profileContent = '';
        
        // Claude智能体简介模板
        if (name === 'Claude') {
            profileContent = `
                <div class="profile-header">
                    <div class="profile-avatar">C</div>
                    <div class="profile-name">Claude</div>
                </div>
                <div class="profile-description">
                    <p>Claude 是由 Anthropic 开发的大型语言模型，强调有帮助、无害和诚实。</p>
                    <p>擅长：自然语言处理、创意写作、逻辑推理</p>
                    <p>版本：Claude 3 Opus</p>
                </div>
            `;
        // GPT-4智能体简介模板
        } else if (name === 'GPT-4') {
            profileContent = `
                <div class="profile-header">
                    <div class="profile-avatar">G</div>
                    <div class="profile-name">GPT-4</div>
                </div>
                <div class="profile-description">
                    <p>GPT-4 是由 OpenAI 开发的先进大模型，具备强大的理解与生成能力。</p>
                    <p>擅长：多模态理解、代码生成、知识问答</p>
                    <p>版本：GPT-4 Turbo</p>
                </div>
            `;
        // Copilot智能体简介模板
        } else if (name === 'Copilot') {
            profileContent = `
                <div class="profile-header">
                    <div class="profile-avatar">C</div>
                    <div class="profile-name">Copilot</div>
                </div>
                <div class="profile-description">
                    <p>Copilot 由 GitHub 与 OpenAI 联合打造，专注于提升编程效率的 AI 助手。</p>
                    <p>擅长：代码补全、代码解释、编程辅助</p>
                    <p>版本：GitHub Copilot X</p>
                </div>
            `;
        // 自定义智能体通用简介模板
        } else {
            const initial = name.charAt(0);  // 提取首字母作为头像
            profileContent = `
                <div class="profile-header">
                    <div class="profile-avatar">${initial}</div>
                    <div class="profile-name">${name}</div>
                </div>
                <div class="profile-description">
                    <p>${name} 是一个 AI 智能体，更多资料将在实际实现中提供。</p>
                </div>
            `;
        }

        // ========== 模态框动态创建和显示 ==========
        const modal = document.createElement('div');
        modal.className = 'agent-profile-modal';  // 设置模态框样式类
        // 构建模态框HTML结构，包含关闭按钮和简介内容
        modal.innerHTML = `
            <div class="agent-profile-content">
                <button class="close-profile" aria-label="关闭">&times;</button>
                ${profileContent}
            </div>
        `;

        // 将模态框添加到页面body中显示
        document.body.appendChild(modal);

        // ========== 模态框关闭事件处理 ==========
        // 定义关闭函数，从DOM中移除模态框
        const close = () => modal.remove();
        // 绑定关闭按钮点击事件
        modal.querySelector('.close-profile').addEventListener('click', close);
        // 绑定模态框背景点击事件（点击空白区域关闭）
        modal.addEventListener('click', function(e){ if (e.target === modal) close(); });
    }

    /**
     * ========== UI控制器公开接口 ==========
     * 功能：暴露UI控制器的公开方法，供其他模块调用
     * 设计：采用模块模式，只暴露必要的接口，隐藏内部实现
     * 
     * 接口分类：
     *   - DOM访问：getDOMElements
     *   - 布局控制：toggleSidebar、toggleMembers
     *   - 模态框管理：showModal、hideModal、hideAllModals
     *   - 用户反馈：showNotification
     *   - 智能体交互：showAgentProfile
     * 
     * 调用方式：window.UIController.methodName()
     * 关联模块：chat.js、member.js、app.js等
     */
    return {
        // DOM元素访问接口，供其他模块获取UI元素引用
        getDOMElements: function() {
            return DOM;
        },
        // 侧边栏切换控制接口
        toggleSidebar: toggleSidebar,
        // 成员列表切换控制接口
        toggleMembers: toggleMembers,
        // 模态框显示控制接口
        showModal: showModal,
        // 模态框隐藏控制接口
        hideModal: hideModal,
        // 批量模态框隐藏接口
        hideAllModals: hideAllModals,
        // 通知消息显示接口
        showNotification: showNotification,
        // 智能体简介显示接口
        showAgentProfile: showAgentProfile
    };
})();

/**
 * ========== UI控制器模块导出 ==========
 * 功能：将UI控制器挂载到全局window对象，供其他模块使用
 * 设计：采用全局命名空间模式，避免模块间的命名冲突
 * 
 * 使用方式：
 *   - 其他JS文件可通过window.UIController访问
 *   - 支持解构赋值：const { showModal, hideModal } = UIController
 * 
 * 依赖关系：
 *   - 被依赖：chat.js、member.js、app.js等模块
 *   - 依赖：DOM元素（需要HTML文档加载完成）
 * 
 * 初始化时机：页面DOM加载完成后，其他业务模块加载前
 */
window.UIController = UIController;
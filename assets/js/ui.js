/**
 * UI相关功能模块
 * 负责处理界面元素的显示、隐藏、切换等操作
 */

// UI控制器模块
const UIController = (function() {
    // 私有变量和方法
    const DOM = {
        // 侧边栏相关
        sidebar: document.querySelector('.sidebar'),
        toggleSidebarBtn: document.getElementById('toggleSidebarBtn'),
        membersSidebar: document.querySelector('.members-sidebar'),
        toggleMembersBtn: document.getElementById('toggleMembersBtn'),
        
        // 模态框相关
        newChatModal: document.getElementById('newChatModal'),
        settingsModal: document.getElementById('settingsModal'),
        closeModalBtns: document.querySelectorAll('.close-modal, .modal-btn.cancel'),
        
        // 按钮相关
        newChatBtn: document.getElementById('newChatBtn'),
        settingsBtn: document.getElementById('settingsBtn'),
        toggleChatBtn: document.getElementById('toggleChatBtn'),
        exportBtn: document.getElementById('exportBtn')
    };
    
    // 切换侧边栏显示/隐藏
    function toggleSidebar() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            DOM.sidebar.classList.toggle('active');
        } else {
            DOM.sidebar.classList.toggle('collapsed');
            document.querySelector('.main-content').classList.toggle('sidebar-collapsed');
        }
        
        // 切换按钮图标
        const icon = DOM.toggleSidebarBtn.querySelector('i');
        if (DOM.sidebar.classList.contains('collapsed') || DOM.sidebar.classList.contains('active')) {
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
        } else {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-left');
        }
    }
    
    // 切换成员列表显示/隐藏
    function toggleMembers() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            DOM.membersSidebar.classList.toggle('active');
        } else {
            DOM.membersSidebar.classList.toggle('collapsed');
            document.querySelector('.main-content').classList.toggle('members-collapsed');
        }
        
        // 切换按钮图标
        const icon = DOM.toggleMembersBtn.querySelector('i');
        if (DOM.membersSidebar.classList.contains('collapsed')) {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-left');
        } else {
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
        }
    }
    
    // 显示模态框
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
    
    // 隐藏模态框
    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
    
    // 隐藏所有模态框
    function hideAllModals() {
        document.querySelectorAll('.modal').forEach(function(modal) {
            modal.style.display = 'none';
        });
        document.body.classList.remove('modal-open');
    }
    
    // 显示通知
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 3秒后移除通知
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // 新增：显示智能体简介模态
    function showAgentProfile(name) {
        // 仅当不是“用户”时展示简介
        if (!name || name === '用户') return;

        let profileContent = '';
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
        } else {
            const initial = name.charAt(0);
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

        const modal = document.createElement('div');
        modal.className = 'agent-profile-modal';
        modal.innerHTML = `
            <div class="agent-profile-content">
                <button class="close-profile" aria-label="关闭">&times;</button>
                ${profileContent}
            </div>
        `;

        document.body.appendChild(modal);

        // 关闭事件
        const close = () => modal.remove();
        modal.querySelector('.close-profile').addEventListener('click', close);
        modal.addEventListener('click', function(e){ if (e.target === modal) close(); });
    }

    // 公开的方法
    return {
        getDOMElements: function() {
            return DOM;
        },
        toggleSidebar: toggleSidebar,
        toggleMembers: toggleMembers,
        showModal: showModal,
        hideModal: hideModal,
        hideAllModals: hideAllModals,
        showNotification: showNotification,
        showAgentProfile: showAgentProfile
    };
})();

// 导出模块
window.UIController = UIController;
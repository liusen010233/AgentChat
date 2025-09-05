/**
 * 主应用入口文件
 * 负责初始化和连接各个模块
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化UI事件监听
    initUIEvents();
    
    // 初始化表单事件监听
    initFormEvents();
    
    // 初始化文件上传事件监听
    initFileUploadEvents();
    
    // 初始化聊天事件监听
    initChatEvents();
    
    // 初始化成员管理事件监听
    initMemberEvents();
    
    // 初始化响应式布局事件
    initResponsiveEvents();
    
    console.log('应用初始化完成');
});

// 初始化响应式布局事件
function initResponsiveEvents() {
    window.addEventListener('resize', function() {
        // 根据窗口大小调整布局
        const isMobile = window.innerWidth <= 768;
        const sidebar = document.querySelector('.sidebar');
        const membersSidebar = document.querySelector('.members-sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (isMobile) {
            // 移动设备布局
            sidebar.classList.remove('collapsed');
            membersSidebar.classList.remove('collapsed');
            mainContent.classList.remove('sidebar-collapsed');
            mainContent.classList.remove('members-collapsed');
        }
    });
}

// 初始化UI事件监听
function initUIEvents() {
    const UI = UIController.getDOMElements();
    
    // 侧边栏切换
    UI.toggleSidebarBtn.addEventListener('click', UIController.toggleSidebar);
    UI.toggleMembersBtn.addEventListener('click', UIController.toggleMembers);
    
    // 模态框显示
    UI.newChatBtn.addEventListener('click', function() {
        UIController.showModal('newChatModal');
        // 打开时根据当前选择同步注释
        const sel = document.querySelector('#newChatModal .chat-mode-select');
        const desc = document.getElementById('newChatModeDesc');
        if (sel && desc) {
            desc.textContent = sel.value === 'host' ? '由主持人指定群成员发言' : '每个群成员可以自由发言';
        }
    });
    
    UI.settingsBtn.addEventListener('click', function() {
        UIController.showModal('settingsModal');
        
        // 同步当前群聊模式到设置模态框（保留原逻辑）
        const createModeIde = document.querySelector('input[name="chatMode"][value="ide"]');
        const settingsModeIde = document.querySelector('input[name="settingsChatMode"][value="ide"]');
        
        if (createModeIde && createModeIde.checked) {
            settingsModeIde.checked = true;
        } else {
            document.querySelector('input[name="settingsChatMode"][value="non-ide"]').checked = true;
        }
        
        // 打开时根据当前选择同步注释
        const sel2 = document.querySelector('#settingsModal .chat-mode-select');
        const desc2 = document.getElementById('chatModeDesc');
        if (sel2 && desc2) {
            desc2.textContent = sel2.value === 'host' ? '由主持人指定群成员发言' : '每个群成员可以自由发言';
        }
    });
    
    // 关闭模态框按钮
    document.querySelectorAll('.close-modal').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const modalId = this.closest('.modal').id;
            UIController.hideModal(modalId);
        });
    });
    
    // 禁用点击模态框外部区域关闭
    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                // 点击遮罩不关闭模态框
                e.stopPropagation();
            }
        });
    });
    // 关闭模态框
    UI.closeModalBtns.forEach(function(element) {
        element.addEventListener('click', function() {
            // 如果是从设置模态框关闭，同步模式选择回创建群聊模态框
            if (this.closest('#settingsModal')) {
                const settingsModeIde = document.querySelector('input[name="settingsChatMode"][value="ide"]');
                const createModeIde = document.querySelector('input[name="chatMode"][value="ide"]');
                
                if (settingsModeIde && settingsModeIde.checked) {
                    createModeIde.checked = true;
                } else {
                    document.querySelector('input[name="chatMode"][value="non-ide"]').checked = true;
                }
            }
            
            UIController.hideAllModals();
        });
    });
    
    // 已移除：点击模态框外部区域不再触发关闭或验证逻辑（统一由捕获阶段监听阻止）
    // 参见文件末尾的捕获阶段 window 点击监听
    
    // 聊天开关切换
    UI.toggleChatBtn.addEventListener('click', ChatController.toggleChatActive);
    
    // 导出聊天记录
    UI.exportBtn.addEventListener('click', ChatController.exportChatHistory);
    
    // 新增：历史记录删除按钮事件
    document.querySelectorAll('.delete-chat-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止冒泡到chat-item点击事件
            
            const chatItem = this.closest('.chat-item');
            const chatId = this.dataset.chatId;
            
            // 添加删除中状态
            chatItem.classList.add('deleting');
            
            // 延迟删除，显示动画效果
            setTimeout(() => {
                chatItem.remove();
                console.log('删除聊天记录:', chatId);
                UIController.showNotification('聊天记录已删除');
            }, 300);
        });
    });
    
    // 新增：历史记录卡片点击切换事件
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他活跃状态
            document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
            
            // 激活当前项
            this.classList.add('active');
            
            // 获取聊天记录信息
            const chatName = this.querySelector('.chat-name').textContent;
            const chatDesc = this.querySelector('.chat-preview, .chat-desc')?.textContent || '';
            
            // 更新聊天头部信息
            document.querySelector('.chat-room-name').textContent = chatName;
            document.querySelector('.chat-room-description').textContent = chatDesc;
            
            console.log('切换到聊天记录:', chatName);
            UIController.showNotification(`已切换到 ${chatName}`);
        });
    });
}

// 初始化表单事件监听
function initFormEvents() {
    // 字符数限制显示
    const groupNameInput = document.getElementById('groupNameInput');
    const groupDescInput = document.getElementById('groupDescInput');
    const nameCharLimit = document.getElementById('nameCharLimit');
    const descCharLimit = document.getElementById('descCharLimit');
    
    groupNameInput.addEventListener('input', function() {
        nameCharLimit.textContent = `${this.value.length}/30`;
    });
    
    groupDescInput.addEventListener('input', function() {
        descCharLimit.textContent = `${this.value.length}/30`;
    });
    
    const settingsNameInput = document.getElementById('settingsNameInput');
    const settingsDescInput = document.getElementById('settingsDescInput');
    const settingsNameCharLimit = document.getElementById('settingsNameCharLimit');
    const settingsDescCharLimit = document.getElementById('settingsDescCharLimit');
    
    settingsNameInput.addEventListener('input', function() {
        settingsNameCharLimit.textContent = `${this.value.length}/30`;
    });
    
    settingsDescInput.addEventListener('input', function() {
        settingsDescCharLimit.textContent = `${this.value.length}/30`;
    });
    
    // 创建群聊按钮点击事件
    document.querySelector('.modal-btn.create').addEventListener('click', function(event) {
        // 阻止默认行为，防止表单自动提交
        event.preventDefault();
        
        // 表单验证
        const groupNameInput = document.getElementById('groupNameInput');
        const groupDescInput = document.getElementById('groupDescInput');
        const validation = FormValidator.validateCreateChatForm(groupNameInput, groupDescInput);
        
        if (!validation.isValid) {
            UIController.showNotification(validation.message, 'error');
            return false; // 验证失败，阻止后续操作
        }
        
        // 获取选中的群聊模式
        const selectedMode = document.querySelector('input[name="chatMode"]:checked').value;
        console.log('创建群聊，选择的模式：', selectedMode);
        
        // 这里可以添加创建群聊的逻辑，包括将选中的模式发送到后端
        
        // 关闭模态框
        UIController.hideModal('newChatModal');
        
        // 显示创建成功提示
        UIController.showNotification('群聊创建成功！');
        
        return true;
    });
    
    // 保存群聊设置按钮点击事件
    document.querySelector('#settingsModal .modal-footer .modal-btn:not(.cancel)').addEventListener('click', function(event) {
        // 阻止默认行为，防止表单自动提交
        event.preventDefault();
        
        // 表单验证
        const settingsNameInput = document.getElementById('settingsNameInput');
        const settingsDescInput = document.getElementById('settingsDescInput');
        const validation = FormValidator.validateSettingsForm(settingsNameInput, settingsDescInput);
        
        if (!validation.isValid) {
            UIController.showNotification(validation.message, 'error');
            return false; // 验证失败，阻止后续操作
        }
        
        // 获取选中的群聊模式
        const selectedMode = document.querySelector('input[name="settingsChatMode"]:checked').value;
        console.log('保存群聊设置，选择的模式：', selectedMode);
        
        // 这里可以添加保存群聊设置的逻辑，包括将选中的模式发送到后端
        
        // 关闭模态框
        UIController.hideModal('settingsModal');
        
        // 显示保存成功提示
        UIController.showNotification('群聊设置已保存！');
        
        return true;
    });
    
    // 新增：群聊模式选择change事件，实现注释文案的动态切换
    // 创建群聊模态框的群聊模式选择
    const newChatModeSelect = document.querySelector('#newChatModal .chat-mode-select');
    const newChatModeDesc = document.getElementById('newChatModeDesc');
    
    if (newChatModeSelect && newChatModeDesc) {
        newChatModeSelect.addEventListener('change', function() {
            if (this.value === 'default') {
                newChatModeDesc.textContent = '每个群成员可以自由发言';
            } else if (this.value === 'host') {
                newChatModeDesc.textContent = '由主持人指定群成员发言';
            }
        });
    }
    
    // 群聊设置模态框的群聊模式选择
    const chatModeSelect = document.querySelector('#settingsModal .chat-mode-select');
    const chatModeDesc = document.getElementById('chatModeDesc');
    
    if (chatModeSelect && chatModeDesc) {
        chatModeSelect.addEventListener('change', function() {
            if (this.value === 'default') {
                chatModeDesc.textContent = '每个群成员可以自由发言';
            } else if (this.value === 'host') {
                chatModeDesc.textContent = '由主持人指定群成员发言';
            }
        });
    }
}

// 初始化文件上传事件监听
function initFileUploadEvents() {
    // 文件上传按钮点击事件
    const uploadBtn = document.querySelector('.input-action-btn[title="上传文件"]');
    uploadBtn.addEventListener('click', function() {
        // 创建一个隐藏的文件输入框
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        // 触发文件选择对话框
        fileInput.click();
        
        // 监听文件选择事件
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                const file = this.files[0];
                
                // 处理文件上传
                FileHandler.handleFileUpload(file);
                
                // 移除临时文件输入框
                this.remove();
            }
        });
    });
    
    // 监听粘贴事件
    document.addEventListener('paste', function(e) {
        // 检查是否有图片数据
        if (e.clipboardData && e.clipboardData.items) {
            const items = e.clipboardData.items;
            
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    // 获取粘贴的图片
                    const blob = items[i].getAsFile();
                    
                    // 处理粘贴图片
                    FileHandler.handlePastedImage(blob);
                    
                    // 阻止默认粘贴行为
                    e.preventDefault();
                    break;
                }
            }
        }
    });
}

// 初始化聊天事件监听
function initChatEvents() {
    const chatMessages = document.querySelector('.messages-container');
    const messageInput = document.querySelector('.message-input');
    const sendBtn = document.querySelector('.send-btn');
    
    if (!sendBtn || !messageInput) {
        console.warn('未找到发送按钮或输入框元素，跳过发送消息事件初始化');
    } else {
        // 已有：发送消息、@成员 等
        sendBtn.addEventListener('click', function() {
            const text = messageInput.value.trim();
            const attachments = [];
            ChatController.sendMessage(text, attachments);
        });
        // 监听输入框回车键
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendBtn.click();
            }
        });
    }
    
    // @成员功能（仅UI演示）
    const atMemberBtn = document.querySelector('.input-action-btn[title="@成员"]');
    if (atMemberBtn) {
        atMemberBtn.addEventListener('click', function() {
            alert('在实际实现中，这里会显示成员列表供选择');
        });
    }
    
    // 事件委托处理消息中头像点击，展示智能体简介
    if (chatMessages) {
        chatMessages.addEventListener('click', function (e) {
            const avatarEl = e.target.closest('.message-avatar');
            if (avatarEl) {
                const messageEl = avatarEl.closest('.message');
                let senderName = '';
                // 从消息头部或数据属性获取发送者名称（兼容不同结构）
                const headerName = messageEl?.querySelector('.message-header .sender-name, .message-sender');
                if (headerName) {
                    senderName = headerName.textContent.trim();
                } else if (messageEl?.dataset?.sender) {
                    senderName = messageEl.dataset.sender;
                } else {
                    // 兼容旧结构：根据头像字母推断
                    const letter = avatarEl.textContent.trim();
                    if (letter === 'C') senderName = 'Claude';
                    else if (letter === 'G') senderName = 'GPT-4';
                    else if (letter === 'U') senderName = '用户';
                    else if (letter === 'C') senderName = 'Copilot';
                }
                if (typeof UIController?.showAgentProfile === 'function') {
                    UIController.showAgentProfile(senderName);
                }
            }
        });
    }
}

// 初始化成员管理事件监听
function initMemberEvents() {
    // 删除成员按钮点击事件 - 使用事件委托处理动态添加的按钮
    const membersList = document.querySelector('.members-list');
    if (membersList) {
        membersList.addEventListener('click', function(e) {
            // 检查是否点击了删除按钮
            const deleteBtn = e.target.closest('.delete-member-btn');
            if (deleteBtn) {
                e.stopPropagation(); // 阻止事件冒泡
                e.preventDefault(); // 阻止默认行为
                const memberId = deleteBtn.dataset.memberId;
                MemberController.removeMember(memberId);
                return; // 提前返回，不执行后续的成员项点击逻辑
            }
            
            // 处理成员项点击展示简介
            const memberItem = e.target.closest('.member-item');
            if (memberItem) {
                const name = memberItem.dataset.name || memberItem.querySelector('.member-name')?.textContent?.trim();
                if (name && name !== '用户' && typeof UIController?.showAgentProfile === 'function') {
                    UIController.showAgentProfile(name);
                }
            }
        });
    }
}

// 已禁用：点击模态框外部区域不再关闭（捕获阶段统一阻断）
window.addEventListener('click', function(e) {
    if (e.target && e.target.classList && e.target.classList.contains('modal')) {
        e.stopImmediatePropagation?.();
        e.stopPropagation();
        e.preventDefault();
    }
}, true);
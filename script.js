// DOM元素引用
const newChatBtn = document.getElementById('newChatBtn');
const settingsBtn = document.getElementById('settingsBtn');
const toggleChatBtn = document.getElementById('toggleChatBtn');
const exportBtn = document.getElementById('exportBtn');
const newChatModal = document.getElementById('newChatModal');
const settingsModal = document.getElementById('settingsModal');
const closeModalBtns = document.querySelectorAll('.close-modal, .modal-btn.cancel');
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const toggleMembersBtn = document.getElementById('toggleMembersBtn');
const sidebar = document.querySelector('.sidebar');
const membersSidebar = document.querySelector('.members-sidebar');
const groupNameInput = document.getElementById('groupNameInput');
const groupDescInput = document.getElementById('groupDescInput');
const nameCharLimit = document.getElementById('nameCharLimit');
const descCharLimit = document.getElementById('descCharLimit');
const settingsNameInput = document.getElementById('settingsNameInput');
const settingsDescInput = document.getElementById('settingsDescInput');
const settingsNameCharLimit = document.getElementById('settingsNameCharLimit');
const settingsDescCharLimit = document.getElementById('settingsDescCharLimit');

// 模态框显示/隐藏功能
newChatBtn.addEventListener('click', function() {
    newChatModal.style.display = 'flex';
});

settingsBtn.addEventListener('click', function() {
    settingsModal.style.display = 'flex';
    
    // 同步当前群聊模式到设置模态框
    const createModeIde = document.querySelector('input[name="chatMode"][value="ide"]');
    const settingsModeIde = document.querySelector('input[name="settingsChatMode"][value="ide"]');
    
    if (createModeIde && createModeIde.checked) {
        settingsModeIde.checked = true;
    } else {
        document.querySelector('input[name="settingsChatMode"][value="non-ide"]').checked = true;
    }
});

// 关闭模态框
closeModalBtns.forEach(function(element) {
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
        
        document.querySelectorAll('.modal').forEach(function(modal) {
            modal.style.display = 'none';
        });
    });
});

// 点击模态框外部区域关闭
window.addEventListener('click', function(e) {
    // 只处理点击模态框背景的情况
    if (e.target.classList.contains('modal')) {
        // 判断是哪个模态框
        if (e.target.id === 'newChatModal') {
            // 创建群聊模态框验证
            let isValid = validateCreateChatForm();
            if (!isValid) return; // 验证失败不关闭
        } else if (e.target.id === 'settingsModal') {
            // 群聊设置模态框验证
            let isValid = validateSettingsForm();
            if (!isValid) return; // 验证失败不关闭
        }
        
        // 验证通过，关闭模态框
        e.target.style.display = 'none';
    }
});

// 创建群聊表单验证函数
function validateCreateChatForm() {
    let isValid = true;
    let errorMessage = '';
    
    // 验证群名称（必须是英文）
    const groupName = groupNameInput.value.trim();
    if (!groupName) {
        isValid = false;
        errorMessage = '请输入群聊名称';
    } else if (!/^[a-zA-Z0-9_]+$/.test(groupName)) {
        isValid = false;
        errorMessage = '群聊名称必须是英文字母、数字或下划线';
    }
    
    // 验证群描述（长度限制）
    const groupDesc = groupDescInput.value.trim();
    if (groupDesc.length > 0) {
        const chineseCount = (groupDesc.match(/[\u4e00-\u9fa5]/g) || []).length;
        const otherCount = groupDesc.length - chineseCount;
        if (chineseCount > 10 || otherCount > 30) {
            isValid = false;
            errorMessage = '群聊描述不能超过10个中文字或30个英文字符';
        }
    }
    
    if (!isValid) {
        showNotification(errorMessage, 'error');
    }
    
    return isValid;
}

// 群聊设置表单验证函数
function validateSettingsForm() {
    let isValid = true;
    let errorMessage = '';
    
    // 验证群名称（必须是英文）
    const groupName = settingsNameInput.value.trim();
    if (!groupName) {
        isValid = false;
        errorMessage = '请输入群聊名称';
    } else if (!/^[a-zA-Z0-9_]+$/.test(groupName)) {
        isValid = false;
        errorMessage = '群聊名称必须是英文字母、数字或下划线';
    }
    
    // 验证群描述（长度限制）
    const groupDesc = settingsDescInput.value.trim();
    if (groupDesc.length > 0) {
        const chineseCount = (groupDesc.match(/[\u4e00-\u9fa5]/g) || []).length;
        const otherCount = groupDesc.length - chineseCount;
        if (chineseCount > 10 || otherCount > 30) {
            isValid = false;
            errorMessage = '群聊描述不能超过10个中文字或30个英文字符';
        }
    }
    
    if (!isValid) {
        showNotification(errorMessage, 'error');
    }
    
    return isValid;
}

// 创建群聊按钮点击事件
document.querySelector('.modal-btn.create').addEventListener('click', function(event) {
    // 阻止默认行为，防止表单自动提交
    event.preventDefault();
    
    // 表单验证
    if (!validateCreateChatForm()) {
        return false; // 验证失败，阻止后续操作
    }
    
    // 获取选中的群聊模式
    const selectedMode = document.querySelector('input[name="chatMode"]:checked').value;
    console.log('创建群聊，选择的模式：', selectedMode);
    
    // 这里可以添加创建群聊的逻辑，包括将选中的模式发送到后端
    
    // 关闭模态框
    newChatModal.style.display = 'none';
    
    // 显示创建成功提示
    showNotification('群聊创建成功！');
    
    return true;
});

// 保存群聊设置按钮点击事件
document.querySelector('#settingsModal .modal-footer .modal-btn:not(.cancel)').addEventListener('click', function(event) {
    // 阻止默认行为，防止表单自动提交
    event.preventDefault();
    
    // 表单验证
    if (!validateSettingsForm()) {
        return false; // 验证失败，阻止后续操作
    }
    
    // 获取选中的群聊模式
    const selectedMode = document.querySelector('input[name="settingsChatMode"]:checked').value;
    console.log('保存群聊设置，选择的模式：', selectedMode);
    
    // 这里可以添加保存群聊设置的逻辑，包括将选中的模式发送到后端
    
    // 关闭模态框
    settingsModal.style.display = 'none';
    
    // 显示保存成功提示
    showNotification('群聊设置已保存！');
    
    return true;
});

// 群聊开关切换
let chatActive = true;
toggleChatBtn.addEventListener('click', function() {
    chatActive = !chatActive;
    this.textContent = chatActive ? '暂停群聊' : '继续群聊';
    // 这里可以添加实际的群聊状态切换逻辑
});

// 群聊模式选择变化事件 - 群聊设置
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

// 群聊模式选择变化事件 - 创建群聊
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

// 导出聊天记录功能（仅UI演示）
exportBtn.addEventListener('click', function() {
    alert('导出功能将在实际实现中支持Markdown和PDF格式');
});

// 消息输入框自动调整高度
const messageInput = document.querySelector('.message-input');
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if (this.scrollHeight > 150) {
        this.style.height = '150px';
    }
});

// 处理粘贴截图到输入框
messageInput.addEventListener('paste', function(e) {
    // 检查剪贴板中是否有图片
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    let hasImage = false;
    
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            hasImage = true;
            
            // 获取图片文件
            const blob = items[i].getAsFile();
            
            // 创建一个临时的文件名
            const fileName = `screenshot_${new Date().getTime()}.png`;
            
            // 在实际实现中，这里会将文件上传到服务器
            // 这里仅做UI演示
            
            // 创建一个简化的文件预览元素
            const filePreview = document.createElement('div');
            filePreview.style.backgroundColor = '#2a2a2a';
            filePreview.style.borderRadius = '4px';
            filePreview.style.padding = '8px 12px';
            filePreview.style.margin = '5px 0';
            filePreview.style.display = 'flex';
            filePreview.style.alignItems = 'center';
            filePreview.style.justifyContent = 'space-between';
            filePreview.style.maxWidth = '250px';
            
            // 创建左侧的图标和文件名容器
            const leftContainer = document.createElement('div');
            leftContainer.style.display = 'flex';
            leftContainer.style.alignItems = 'center';
            
            // 创建图标元素
            const iconSpan = document.createElement('span');
            iconSpan.textContent = '🖼️';
            iconSpan.style.fontSize = '1.5rem';
            iconSpan.style.marginRight = '8px';
            leftContainer.appendChild(iconSpan);
            
            // 创建文件名元素
            const nameSpan = document.createElement('span');
            nameSpan.textContent = fileName;
            nameSpan.style.color = '#fff';
            nameSpan.style.fontSize = '0.9rem';
            nameSpan.style.whiteSpace = 'nowrap';
            nameSpan.style.overflow = 'hidden';
            nameSpan.style.textOverflow = 'ellipsis';
            nameSpan.style.maxWidth = '160px';
            leftContainer.appendChild(nameSpan);
            
            // 创建删除按钮
            const removeButton = document.createElement('button');
            removeButton.textContent = '×';
            removeButton.style.background = 'none';
            removeButton.style.border = 'none';
            removeButton.style.color = '#888';
            removeButton.style.fontSize = '1.2rem';
            removeButton.style.cursor = 'pointer';
            
            // 添加元素到预览容器
            filePreview.appendChild(leftContainer);
            filePreview.appendChild(removeButton);
            
            // 将文件预览添加到消息输入框上方
            const messageInputContainer = document.querySelector('.input-wrapper');
            const inputContainer = document.querySelector('.input-container');
            inputContainer.insertBefore(filePreview, messageInputContainer);
            
            // 添加删除文件预览的事件
            removeButton.addEventListener('click', function() {
                inputContainer.removeChild(filePreview);
            });
            
            // 阻止默认粘贴行为，避免图片内容被粘贴到输入框中
            e.preventDefault();
            break;
        }
    }
});

// 发送消息按钮（仅UI演示）
const sendBtn = document.querySelector('.send-btn');
sendBtn.addEventListener('click', function() {
    const messageText = messageInput.value.trim();
    if (messageText) {
        // 在实际实现中，这里会调用发送消息的API
        alert('消息发送功能将在实际实现中连接到后端');
        messageInput.value = '';
        messageInput.style.height = '45px';
    }
});

// 聊天项点击事件
const chatItems = document.querySelectorAll('.chat-item');
chatItems.forEach(function(item) {
    item.addEventListener('click', function() {
        // 移除所有活跃状态
        chatItems.forEach(function(chat) {
            chat.classList.remove('active');
        });
        // 添加活跃状态到当前点击项
        this.classList.add('active');
        // 在实际实现中，这里会加载对应的聊天记录
    });
});

// 删除聊天记录功能
document.querySelectorAll('.delete-chat-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation(); // 阻止事件冒泡，防止触发聊天项点击事件
        
        const chatId = this.getAttribute('data-chat-id');
        const chatItem = this.closest('.chat-item');
        const chatName = chatItem.querySelector('.chat-name').textContent;
        
        // 先显示确认对话框，用户确认后才执行删除操作
        const confirmDelete = confirm(`确定要删除聊天记录 ${chatName} 吗？删除后该聊天的所有记录将被永久删除。`);
        
        if (confirmDelete) {
            // 这里添加删除聊天记录的后台逻辑
            // 模拟API调用
            console.log(`删除聊天记录: ${chatName}, ID: ${chatId}`);
            
            // 添加删除动画
            chatItem.classList.add('deleting');
            
            // 模拟删除成功后从DOM中移除
            setTimeout(() => {
                chatItem.remove();
                // 显示删除成功提示
                const notification = document.createElement('div');
                notification.className = 'notification';
                notification.textContent = `聊天记录 ${chatName} 已成功删除`;
                document.body.appendChild(notification);
                
                // 3秒后移除提示
                setTimeout(() => {
                    notification.classList.add('fade-out');
                    setTimeout(() => notification.remove(), 500);
                }, 3000);
            }, 500);
        }
    });
});

// 成员项点击事件已移至app.js中的initMemberEvents函数

// 消息中智能体头像点击事件（显示智能体简介）
document.querySelectorAll('.message-avatar').forEach(function(avatar) {
    avatar.addEventListener('click', function() {
        // 获取消息发送者名称
        const senderName = this.closest('.message').querySelector('.message-sender').textContent;
        
        // 显示智能体简介（这里使用模态框或弹出框显示）
        if (senderName !== '用户') {
            // 创建模态框显示智能体简介
            const modal = document.createElement('div');
            modal.className = 'agent-profile-modal';
            
            // 根据不同的智能体名称显示不同的简介
            let profileContent = '';
            
            if (senderName === 'Claude') {
                profileContent = `
                    <div class="profile-header">
                        <div class="profile-avatar">C</div>
                        <div class="profile-name">Claude</div>
                    </div>
                    <div class="profile-description">
                        <p>Claude是由Anthropic开发的大型语言模型，专注于有帮助、无害和诚实的AI助手。</p>
                        <p>擅长：自然语言处理、创意写作、逻辑推理</p>
                        <p>版本：Claude 3 Opus</p>
                    </div>
                `;
            } else if (senderName === 'GPT-4') {
                profileContent = `
                    <div class="profile-header">
                        <div class="profile-avatar">G</div>
                        <div class="profile-name">GPT-4</div>
                    </div>
                    <div class="profile-description">
                        <p>GPT-4是由OpenAI开发的最先进的大型语言模型，具有强大的理解和生成能力。</p>
                        <p>擅长：多模态理解、代码生成、知识问答</p>
                        <p>版本：GPT-4 Turbo</p>
                    </div>
                `;
            } else if (senderName === 'Copilot') {
                profileContent = `
                    <div class="profile-header">
                        <div class="profile-avatar">C</div>
                        <div class="profile-name">Copilot</div>
                    </div>
                    <div class="profile-description">
                        <p>Copilot是由GitHub和OpenAI合作开发的AI编程助手，专注于代码生成和辅助开发。</p>
                        <p>擅长：代码补全、代码解释、编程辅助</p>
                        <p>版本：GitHub Copilot X</p>
                    </div>
                `;
            } else {
                profileContent = `
                    <div class="profile-header">
                        <div class="profile-avatar">${senderName.charAt(0)}</div>
                        <div class="profile-name">${senderName}</div>
                    </div>
                    <div class="profile-description">
                        <p>${senderName}是一个AI智能体，具体信息将在实际实现中显示。</p>
                    </div>
                `;
            }
            
            modal.innerHTML = `
                <div class="agent-profile-content">
                    <button class="close-profile">&times;</button>
                    ${profileContent}
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // 添加关闭事件
            modal.querySelector('.close-profile').addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            // 点击模态框外部区域关闭
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        }
    });
});


// 删除成员功能已移至app.js中的initMemberEvents函数

// @成员功能（仅UI演示）
const atMemberBtn = document.querySelector('.input-action-btn[title="@成员"]');
atMemberBtn.addEventListener('click', function() {
    alert('在实际实现中，这里会显示成员列表供选择');
});

// 文件上传功能
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
            
            // 在实际实现中，这里会将文件上传到服务器
            // 这里仅做UI演示
            
            // 创建一个简化的文件预览元素
            const filePreview = document.createElement('div');
            filePreview.style.backgroundColor = '#2a2a2a';
            filePreview.style.borderRadius = '4px';
            filePreview.style.padding = '8px 12px';
            filePreview.style.margin = '5px 0';
            filePreview.style.display = 'flex';
            filePreview.style.alignItems = 'center';
            filePreview.style.justifyContent = 'space-between';
            filePreview.style.maxWidth = '250px';
            
            // 根据文件类型选择图标
            let fileIcon = '📄';
            if (file.type.startsWith('image/')) {
                fileIcon = '🖼️';
            } else if (file.name.endsWith('.pdf')) {
                fileIcon = '📕';
            } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
                fileIcon = '📘';
            } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
                fileIcon = '📗';
            } else if (file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
                fileIcon = '📙';
            }
            
            // 创建左侧的图标和文件名容器
            const leftContainer = document.createElement('div');
            leftContainer.style.display = 'flex';
            leftContainer.style.alignItems = 'center';
            
            // 创建图标元素
            const iconSpan = document.createElement('span');
            iconSpan.textContent = fileIcon;
            iconSpan.style.fontSize = '1.5rem';
            iconSpan.style.marginRight = '8px';
            leftContainer.appendChild(iconSpan);
            
            // 创建文件名元素
            const nameSpan = document.createElement('span');
            nameSpan.textContent = file.name;
            nameSpan.style.color = '#fff';
            nameSpan.style.fontSize = '0.9rem';
            nameSpan.style.whiteSpace = 'nowrap';
            nameSpan.style.overflow = 'hidden';
            nameSpan.style.textOverflow = 'ellipsis';
            nameSpan.style.maxWidth = '160px';
            leftContainer.appendChild(nameSpan);
            
            // 创建删除按钮
            const removeButton = document.createElement('button');
            removeButton.textContent = '×';
            removeButton.style.background = 'none';
            removeButton.style.border = 'none';
            removeButton.style.color = '#888';
            removeButton.style.fontSize = '1.2rem';
            removeButton.style.cursor = 'pointer';
            
            // 添加元素到预览容器
            filePreview.appendChild(leftContainer);
            filePreview.appendChild(removeButton);

            
            // 将文件预览添加到消息输入框上方
            const messageInputContainer = document.querySelector('.input-wrapper');
            const inputContainer = document.querySelector('.input-container');
            inputContainer.insertBefore(filePreview, messageInputContainer);
            
            // 添加删除文件预览的事件
            filePreview.querySelector('.file-preview-remove').addEventListener('click', function() {
                inputContainer.removeChild(filePreview);
            });
        }
        
        // 移除临时文件输入框
        document.body.removeChild(fileInput);
    });
});

// 侧边栏收起展开功能
toggleSidebarBtn.addEventListener('click', function() {
    sidebar.classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('sidebar-collapsed');
    this.querySelector('i').classList.toggle('fa-chevron-right');
    this.querySelector('i').classList.toggle('fa-chevron-left');
});

// 成员列表侧边栏收起展开功能
toggleMembersBtn.addEventListener('click', function() {
    membersSidebar.classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('members-collapsed');
    this.querySelector('i').classList.toggle('fa-chevron-right');
    this.querySelector('i').classList.toggle('fa-chevron-left');
});

// 群聊名称字符限制检测
if (groupNameInput) {
    groupNameInput.addEventListener('input', function() {
        const value = this.value;
        const isEnglish = /^[a-zA-Z0-9_]+$/.test(value);
        nameCharLimit.textContent = `${value.length}/30`;
        
        if (!isEnglish && value.length > 0) {
            this.setCustomValidity('群聊名称只能包含英文字母、数字和下划线');
            nameCharLimit.classList.add('error');
        } else {
            this.setCustomValidity('');
            nameCharLimit.classList.remove('error');
        }
    });
}

// 群聊描述字符限制检测
if (groupDescInput) {
    groupDescInput.addEventListener('input', function() {
        const value = this.value;
        const chineseChars = (value.match(/[\u4e00-\u9fa5]/g) || []).length;
        const otherChars = value.length - chineseChars;
        const totalLength = chineseChars * 3 + otherChars; // 一个中文字符算3个字符
        
        descCharLimit.textContent = `${value.length}/30`;
        
        if (chineseChars > 10) {
            this.setCustomValidity('群聊描述不能超过10个中文字');
            descCharLimit.classList.add('error');
        } else if (totalLength > 30) {
            this.setCustomValidity('群聊描述不能超过30个英文字符');
            descCharLimit.classList.add('error');
        } else {
            this.setCustomValidity('');
            descCharLimit.classList.remove('error');
        }
    });
}

// 群设置中的名称字符限制检测

// 显示通知函数
function showNotification(message, type = 'success') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
if (settingsNameInput) {
    settingsNameInput.addEventListener('input', function() {
        const value = this.value;
        const isEnglish = /^[a-zA-Z0-9_]+$/.test(value);
        settingsNameCharLimit.textContent = `${value.length}/30`;
        
        if (!isEnglish && value.length > 0) {
            this.setCustomValidity('群聊名称只能包含英文字母、数字和下划线');
            settingsNameCharLimit.classList.add('error');
        } else {
            this.setCustomValidity('');
            settingsNameCharLimit.classList.remove('error');
        }
    });
}

// 群设置中的描述字符限制检测
if (settingsDescInput) {
    settingsDescInput.addEventListener('input', function() {
        const value = this.value;
        const chineseChars = (value.match(/[\u4e00-\u9fa5]/g) || []).length;
        const otherChars = value.length - chineseChars;
        const totalLength = chineseChars * 3 + otherChars; // 一个中文字符算3个字符
        
        settingsDescCharLimit.textContent = `${value.length}/30`;
        
        if (chineseChars > 10) {
            this.setCustomValidity('群聊描述不能超过10个中文字');
            settingsDescCharLimit.classList.add('error');
        } else if (totalLength > 30) {
            this.setCustomValidity('群聊描述不能超过30个英文字符');
            settingsDescCharLimit.classList.add('error');
        } else {
            this.setCustomValidity('');
            settingsDescCharLimit.classList.remove('error');
        }
    });
}

// 注意：创建群聊和保存群聊设置的按钮点击事件已在上方定义
/**
 * ========== 主应用入口控制器 ==========
 * 功能：作为整个聊天应用的启动入口和模块协调中心
 * 设计：采用事件驱动架构，统一管理各模块的初始化和交互
 * 
 * 核心职责：
 *   1. 应用启动：DOM加载完成后的统一初始化流程
 *   2. 模块协调：连接UI、聊天、成员、文件等功能模块
 *   3. 事件管理：统一注册和管理全局事件监听器
 *   4. 响应式适配：处理不同设备尺寸的布局调整
 *   5. 用户交互：处理模态框、表单、文件上传等交互逻辑
 * 
 * 模块依赖关系：
 *   - UIController: 界面控制和通知显示
 *   - ChatController: 聊天消息处理
 *   - MemberController: 成员管理功能
 *   - FormValidator: 表单验证逻辑
 *   - FileHandler: 文件上传处理
 * 
 * 初始化流程：
 *   1. DOM就绪检测 → 2. UI事件绑定 → 3. 表单验证设置
 *   4. 文件上传配置 → 5. 聊天功能激活 → 6. 成员管理启用
 *   7. 响应式布局适配 → 8. 应用启动完成
 * 
 * 设计模式：
 *   - 模块模式：各功能模块独立封装
 *   - 观察者模式：事件驱动的模块间通信
 *   - 工厂模式：统一的初始化函数管理
 */

/**
 * ========== 应用主启动函数 ==========
 * 功能：DOM加载完成后的应用初始化入口点
 * 设计：按模块顺序依次初始化，确保依赖关系正确
 * 
 * 初始化顺序说明：
 *   1. UI事件：基础界面交互，为其他模块提供UI支持
 *   2. 表单事件：用户输入验证，依赖UI通知功能
 *   3. 文件上传：文件处理功能，依赖UI反馈
 *   4. 聊天事件：核心聊天功能，依赖UI和文件模块
 *   5. 成员管理：群组功能，依赖UI和聊天模块
 *   6. 响应式布局：设备适配，依赖所有UI元素就绪
 * 
 * 错误处理：各初始化函数内部处理异常，不影响整体启动
 * 性能考虑：使用DOMContentLoaded确保DOM就绪但不等待资源加载
 */
document.addEventListener('DOMContentLoaded', function() {
    // ========== 模块初始化序列 ==========
    // 按依赖关系顺序初始化各功能模块
    
    // 1. 基础UI交互事件（侧边栏、模态框、按钮等）
    initUIEvents();
    
    // 2. 表单验证和提交事件（创建群聊、设置等）
    initFormEvents();
    
    // 3. 文件上传和粘贴事件（附件处理）
    initFileUploadEvents();
    
    // 4. 聊天核心功能事件（消息发送、接收等）
    initChatEvents();
    
    // 5. 成员管理功能事件（添加、删除、查看等）
    initMemberEvents();
    
    // 6. 响应式布局适配事件（设备尺寸变化）
    initResponsiveEvents();
    
    // ========== 启动完成标记 ==========
    console.log('应用初始化完成');
});

/**
 * ========== 响应式布局初始化函数 ==========
 * 功能：处理窗口尺寸变化时的布局自适应
 * 设计：基于断点的响应式设计，优化移动设备体验
 * 
 * 响应式策略：
 *   - 桌面端（>768px）：保持用户的侧边栏折叠状态
 *   - 移动端（≤768px）：强制展开侧边栏，优化触控操作
 * 
 * 布局影响元素：
 *   - .sidebar: 左侧功能导航栏
 *   - .members-sidebar: 右侧成员列表栏
 *   - .main-content: 中央聊天内容区域
 * 
 * 性能优化：
 *   - 使用防抖处理resize事件（如需要）
 *   - 只在必要时修改DOM类名
 *   - 缓存DOM查询结果（如需要）
 */
function initResponsiveEvents() {
    // ========== 窗口尺寸变化监听 ==========
    window.addEventListener('resize', function() {
        // ========== 设备类型判断 ==========
        // 基于768px断点判断是否为移动设备
        const isMobile = window.innerWidth <= 768;
        
        // ========== 关键布局元素获取 ==========
        const sidebar = document.querySelector('.sidebar');
        const membersSidebar = document.querySelector('.members-sidebar');
        const mainContent = document.querySelector('.main-content');
        
        // ========== 移动端布局优化 ==========
        if (isMobile) {
            // 移动设备：强制展开所有侧边栏，提供更好的触控体验
            sidebar.classList.remove('collapsed');
            membersSidebar.classList.remove('collapsed');
            mainContent.classList.remove('sidebar-collapsed');
            mainContent.classList.remove('members-collapsed');
        }
        // 桌面端保持用户设置的折叠状态，不做强制调整
    });
}

/**
 * ========== UI事件监听初始化函数 ==========
 * 功能：注册所有用户界面交互事件的监听器
 * 设计：集中管理UI事件，提供统一的交互体验
 * 
 * 事件类型覆盖：
 *   1. 侧边栏控制：左右侧边栏的展开/折叠
 *   2. 模态框管理：各种弹窗的显示/隐藏
 *   3. 按钮交互：功能按钮的点击处理
 *   4. 历史记录：聊天记录的切换和删除
 *   5. 聊天控制：聊天开关和记录导出
 * 
 * 依赖模块：
 *   - UIController: 提供DOM元素引用和UI操作方法
 *   - ChatController: 聊天功能的控制接口
 * 
 * 事件委托：部分动态元素使用事件委托处理
 * 错误处理：对缺失的DOM元素进行容错处理
 */
function initUIEvents() {
    // ========== DOM元素引用获取 ==========
    // 从UIController获取预定义的DOM元素引用
    const UI = UIController.getDOMElements();
    
    // ========== 侧边栏控制事件 ==========
    // 左侧功能导航栏的展开/折叠切换
    UI.toggleSidebarBtn.addEventListener('click', UIController.toggleSidebar);
    // 右侧成员列表栏的展开/折叠切换
    UI.toggleMembersBtn.addEventListener('click', UIController.toggleMembers);
    
    // ========== 模态框显示事件 ==========
    // 创建新群聊按钮：显示群聊创建模态框
    UI.newChatBtn.addEventListener('click', function() {
        // 显示创建群聊的模态框
        UIController.showModal('newChatModal');
        
        // ========== 模态框内容同步 ==========
        // 打开时根据当前选择同步群聊模式描述文案
        const sel = document.querySelector('#newChatModal .chat-mode-select');
        const desc = document.getElementById('newChatModeDesc');
        if (sel && desc) {
            // 根据选中的模式更新描述文案
            desc.textContent = sel.value === 'host' ? '由主持人指定群成员发言' : '每个群成员可以自由发言';
        }
    });
    
    // 群聊设置按钮：显示设置模态框
    UI.settingsBtn.addEventListener('click', function() {
        // 显示群聊设置的模态框
        UIController.showModal('settingsModal');
        
        // ========== 设置数据同步 ==========
        // 将创建群聊模态框的当前模式同步到设置模态框（保留原逻辑）
        const createModeIde = document.querySelector('input[name="chatMode"][value="ide"]');
        const settingsModeIde = document.querySelector('input[name="settingsChatMode"][value="ide"]');
        
        // 同步IDE模式选择状态
        if (createModeIde && createModeIde.checked) {
            settingsModeIde.checked = true;
        } else {
            document.querySelector('input[name="settingsChatMode"][value="non-ide"]').checked = true;
        }
        
        // ========== 设置模态框内容同步 ==========
        // 打开时根据当前选择同步群聊模式描述文案
        const sel2 = document.querySelector('#settingsModal .chat-mode-select');
        const desc2 = document.getElementById('chatModeDesc');
        if (sel2 && desc2) {
            // 根据选中的模式更新描述文案
            desc2.textContent = sel2.value === 'host' ? '由主持人指定群成员发言' : '每个群成员可以自由发言';
        }
    });
    
    // ========== 模态框关闭事件 ==========
    // 模态框内的关闭按钮（X按钮）
    document.querySelectorAll('.close-modal').forEach(function(btn) {
        btn.addEventListener('click', function() {
            // 获取当前模态框的ID并关闭
            const modalId = this.closest('.modal').id;
            UIController.hideModal(modalId);
        });
    });
    
    // ========== 模态框外部点击处理 ==========
    // 禁用点击模态框外部区域关闭功能
    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                // 点击遮罩层不关闭模态框，阻止事件传播
                e.stopPropagation();
            }
        });
    });
    
    // 模态框底部的关闭/取消按钮
    UI.closeModalBtns.forEach(function(element) {
        element.addEventListener('click', function() {
            // ========== 设置模态框数据回传 ==========
            // 如果是从设置模态框关闭，需要同步模式选择回创建群聊模态框
            if (this.closest('#settingsModal')) {
                const settingsModeIde = document.querySelector('input[name="settingsChatMode"][value="ide"]');
                const createModeIde = document.querySelector('input[name="chatMode"][value="ide"]');
                
                // 将设置模态框的选择同步回创建模态框
                if (settingsModeIde && settingsModeIde.checked) {
                    createModeIde.checked = true;
                } else {
                    document.querySelector('input[name="chatMode"][value="non-ide"]').checked = true;
                }
            }
            
            // 关闭所有打开的模态框
            UIController.hideAllModals();
        });
    });
    
    // ========== 外部点击关闭已禁用 ==========
    // 已移除：点击模态框外部区域不再触发关闭或验证逻辑
    // 统一由文件末尾的捕获阶段window点击监听阻止
    
    // ========== 聊天功能控制事件 ==========
    // 聊天开关切换按钮
    UI.toggleChatBtn.addEventListener('click', ChatController.toggleChatActive);
    
    // 聊天记录导出按钮
    UI.exportBtn.addEventListener('click', ChatController.exportChatHistory);
    
    // ========== 历史记录管理事件 ==========
    // 历史记录删除按钮事件（使用事件委托处理动态元素）
    document.querySelectorAll('.delete-chat-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // 阻止事件冒泡，防止触发聊天项的点击事件
            e.stopPropagation();
            
            // ========== 删除操作处理 ==========
            // 获取要删除的聊天项和ID
            const chatItem = this.closest('.chat-item');
            const chatId = this.dataset.chatId;
            
            // 添加删除中的视觉状态
            chatItem.classList.add('deleting');
            
            // ========== 删除动画和清理 ==========
            // 延迟删除，显示平滑的删除动画效果
            setTimeout(() => {
                chatItem.remove();  // 从DOM中移除元素
                console.log('删除聊天记录:', chatId);
                UIController.showNotification('聊天记录已删除');
            }, 300);  // 300ms动画时间
        });
    });
    
    // ========== 历史记录切换事件 ==========
    // 历史记录卡片点击切换事件（加载不同的聊天记录）
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', function() {
            // ========== 活跃状态管理 ==========
            // 移除所有聊天项的活跃状态
            document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
            
            // 激活当前点击的聊天项
            this.classList.add('active');
            
            // ========== 聊天信息提取 ==========
            // 从聊天项中提取名称和描述信息
            const chatName = this.querySelector('.chat-name').textContent;
            const chatDesc = this.querySelector('.chat-preview, .chat-desc')?.textContent || '';
            
            // ========== 界面信息更新 ==========
            // 更新聊天区域头部显示的群聊信息
            document.querySelector('.chat-room-name').textContent = chatName;
            document.querySelector('.chat-room-description').textContent = chatDesc;
            
            // ========== 用户反馈 ==========
            console.log('切换到聊天记录:', chatName);
            UIController.showNotification(`已切换到 ${chatName}`);
        });
    });
}

/**
 * ========== 表单事件监听初始化函数 ==========
 * 功能：管理所有表单元素的交互行为和验证逻辑
 * 设计：采用统一的表单处理模式，包含输入验证、用户反馈和数据处理
 * 
 * 覆盖范围：
 *   1. 文本输入字符数限制和实时提示
 *   2. 群聊创建表单的验证和提交
 *   3. 设置表单的数据收集和保存
 *   4. 群聊模式选择的动态描述更新
 * 
 * 依赖模块：
 *   - UIController: 通知显示和模态框管理
 *   - FormValidator: 表单验证逻辑
 * 
 * 表单类型：
 *   - 创建群聊表单：群聊名称、描述、模式选择
 *   - 设置表单：群聊设置修改和保存
 */
function initFormEvents() {
    // ========== 字符数限制显示功能 ==========
    // 为创建群聊模态框的输入框添加字符计数功能
    
    // 创建群聊表单的字符计数器
    const groupNameInput = document.getElementById('groupNameInput');
    const groupDescInput = document.getElementById('groupDescInput');
    const nameCharLimit = document.getElementById('nameCharLimit');
    const descCharLimit = document.getElementById('descCharLimit');
    
    // ========== 群聊名称字符计数 ==========
    // 实时显示群聊名称输入的字符数（最大30字符）
    groupNameInput.addEventListener('input', function() {
        nameCharLimit.textContent = `${this.value.length}/30`;
    });
    
    // ========== 群聊描述字符计数 ==========
    // 实时显示群聊描述输入的字符数（最大30字符）
    groupDescInput.addEventListener('input', function() {
        descCharLimit.textContent = `${this.value.length}/30`;
    });
    
    // ========== 设置表单字符计数器 ==========
    // 为设置模态框的输入框添加字符计数功能
    
    const settingsNameInput = document.getElementById('settingsNameInput');
    const settingsDescInput = document.getElementById('settingsDescInput');
    const settingsNameCharLimit = document.getElementById('settingsNameCharLimit');
    const settingsDescCharLimit = document.getElementById('settingsDescCharLimit');
    
    // ========== 设置名称字符计数 ==========
    // 实时显示设置中群聊名称的字符数（最大30字符）
    settingsNameInput.addEventListener('input', function() {
        settingsNameCharLimit.textContent = `${this.value.length}/30`;
    });
    
    // ========== 设置描述字符计数 ==========
    // 实时显示设置中群聊描述的字符数（最大30字符）
    settingsDescInput.addEventListener('input', function() {
        settingsDescCharLimit.textContent = `${this.value.length}/30`;
    });
    
    // ========== 创建群聊表单处理 ==========
    // 创建群聊按钮点击事件监听
    document.querySelector('.modal-btn.create').addEventListener('click', function(event) {
        // ========== 事件处理初始化 ==========
        // 阻止默认行为，防止表单自动提交
        event.preventDefault();
        
        // ========== 表单验证处理 ==========
        // 获取表单输入元素并进行验证
        const groupNameInput = document.getElementById('groupNameInput');
        const groupDescInput = document.getElementById('groupDescInput');
        const validation = FormValidator.validateCreateChatForm(groupNameInput, groupDescInput);
        
        // ========== 验证结果处理 ==========
        // 如果验证失败，显示错误信息并阻止提交
        if (!validation.isValid) {
            UIController.showNotification(validation.message, 'error');
            return false; // 验证失败，阻止后续操作
        }
        
        // ========== 表单数据收集 ==========
        // 获取用户选中的群聊模式配置
        const selectedMode = document.querySelector('input[name="chatMode"]:checked').value;
        console.log('创建群聊，选择的模式：', selectedMode);
        
        // ========== 群聊创建逻辑 ==========
        // 这里可以添加实际的群聊创建API调用，包括将选中的模式发送到后端
        
        // ========== 界面重置 ==========
        // 关闭创建群聊模态框
        UIController.hideModal('newChatModal');
        
        // ========== 用户反馈 ==========
        // 显示创建成功的通知消息
        UIController.showNotification('群聊创建成功！');
        
        return true;
    });
    
    // ========== 设置保存表单处理 ==========
    // 保存群聊设置按钮点击事件监听
    document.querySelector('#settingsModal .modal-footer .modal-btn:not(.cancel)').addEventListener('click', function(event) {
        // ========== 事件处理初始化 ==========
        // 阻止默认行为，防止表单自动提交
        event.preventDefault();
        
        // ========== 表单验证处理 ==========
        // 获取设置表单输入元素并进行验证
        const settingsNameInput = document.getElementById('settingsNameInput');
        const settingsDescInput = document.getElementById('settingsDescInput');
        const validation = FormValidator.validateSettingsForm(settingsNameInput, settingsDescInput);
        
        // ========== 验证结果处理 ==========
        // 如果验证失败，显示错误信息并阻止保存
        if (!validation.isValid) {
            UIController.showNotification(validation.message, 'error');
            return false; // 验证失败，阻止后续操作
        }
        
        // ========== 设置数据收集 ==========
        // 获取用户选中的群聊模式配置
        const selectedMode = document.querySelector('input[name="settingsChatMode"]:checked').value;
        console.log('保存群聊设置，选择的模式：', selectedMode);
        
        // ========== 设置保存逻辑 ==========
        // 这里可以添加实际的设置保存API调用，包括将选中的模式发送到后端
        
        // ========== 界面重置 ==========
        // 关闭设置模态框
        UIController.hideModal('settingsModal');
        
        // ========== 用户反馈 ==========
        // 显示设置保存成功的通知消息
        UIController.showNotification('群聊设置已保存！');
        
        return true;
    });
    
    // ========== 群聊模式选择事件 ==========
    // 创建群聊模态框的群聊模式选择事件监听
    const newChatModeSelect = document.querySelector('#newChatModal .chat-mode-select');
    const newChatModeDesc = document.getElementById('newChatModeDesc');
    
    if (newChatModeSelect && newChatModeDesc) {
        newChatModeSelect.addEventListener('change', function() {
            // ========== 模式描述动态更新 ==========
            // 根据选中的群聊模式实时更新描述文案
            if (this.value === 'default') {
                // 默认模式：自由发言模式
                newChatModeDesc.textContent = '每个群成员可以自由发言';
            } else if (this.value === 'host') {
                // 主持人模式：受控发言模式
                newChatModeDesc.textContent = '由主持人指定群成员发言';
            }
        });
    }
    
    // ========== 设置模态框群聊模式选择事件 ==========
    // 群聊设置模态框的群聊模式选择事件监听
    const chatModeSelect = document.querySelector('#settingsModal .chat-mode-select');
    const chatModeDesc = document.getElementById('chatModeDesc');
    
    if (chatModeSelect && chatModeDesc) {
        chatModeSelect.addEventListener('change', function() {
            // ========== 设置模式描述动态更新 ==========
            // 根据选中的群聊模式实时更新设置页面的描述文案
            if (this.value === 'default') {
                // 默认模式：自由发言模式
                chatModeDesc.textContent = '每个群成员可以自由发言';
            } else if (this.value === 'host') {
                // 主持人模式：受控发言模式
                chatModeDesc.textContent = '由主持人指定群成员发言';
            }
        });
    }
}

/**
 * ========== 文件上传事件监听初始化函数 ==========
 * 功能：管理文件上传的多种交互方式和文件处理流程
 * 设计：支持点击上传和粘贴上传两种方式，提供完整的文件处理体验
 * 
 * 上传方式覆盖：
 *   1. 点击上传：通过文件选择按钮触发系统文件选择器
 *   2. 粘贴上传：支持从剪贴板直接粘贴图片文件
 * 
 * 文件类型支持：
 *   - 图片文件：image/* (jpg, png, gif, webp等)
 *   - 文档文件：pdf, doc, docx, xls, xlsx, ppt, pptx, txt
 * 
 * 依赖模块：
 *   - FileHandler: 文件上传和处理逻辑
 * 
 * 用户体验：
 *   - 动态创建文件输入框，避免界面污染
 *   - 自动清理临时DOM元素
 *   - 支持多种文件格式的统一处理
 */
function initFileUploadEvents() {
    // ========== 点击上传功能 ==========
    // 文件上传按钮点击事件（触发文件选择器）
    const uploadBtn = document.querySelector('.input-action-btn[title="上传文件"]');
    uploadBtn.addEventListener('click', function() {
        // ========== 动态文件输入框创建 ==========
        // 创建一个隐藏的文件输入框，避免在HTML中预定义
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        // 设置支持的文件类型，包括图片和常见文档格式
        fileInput.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
        fileInput.style.display = 'none';  // 隐藏输入框，只用于触发文件选择
        document.body.appendChild(fileInput);  // 临时添加到DOM中
        
        // ========== 文件选择器触发 ==========
        // 程序化触发文件选择对话框
        fileInput.click();
        
        // ========== 文件选择处理 ==========
        // 监听用户文件选择完成事件
        fileInput.addEventListener('change', function() {
            // ========== 文件数据验证 ==========
            // 检查是否有选择文件
            if (this.files && this.files.length > 0) {
                const file = this.files[0];  // 获取第一个选择的文件
                
                // ========== 文件上传处理 ==========
                // 调用文件处理器处理上传逻辑
                FileHandler.handleFileUpload(file);
                
                // ========== 临时元素清理 ==========
                // 移除临时创建的文件输入框，保持DOM整洁
                this.remove();
            }
        });
    });
    
    // ========== 粘贴上传功能 ==========
    // 监听全局粘贴事件，支持图片粘贴上传
    document.addEventListener('paste', function(e) {
        // ========== 剪贴板数据检查 ==========
        // 检查剪贴板是否包含可处理的数据
        if (e.clipboardData && e.clipboardData.items) {
            const items = e.clipboardData.items;  // 获取剪贴板数据项列表
            
            // ========== 图片文件筛选 ==========
            // 遍历剪贴板项，查找图片类型的数据
            for (let i = 0; i < items.length; i++) {
                // 检查数据项是否为图片类型
                if (items[i].type.indexOf('image') !== -1) {
                    // ========== 图片数据提取 ==========
                    // 获取粘贴的图片文件对象
                    const blob = items[i].getAsFile();
                    
                    // ========== 粘贴图片处理 ==========
                    // 调用专门的粘贴图片处理方法
                    FileHandler.handlePastedImage(blob);
                    
                    // ========== 默认行为阻止 ==========
                    // 阻止浏览器默认的粘贴行为，避免重复处理
                    e.preventDefault();
                    break;  // 找到第一个图片后停止遍历
                }
            }
        }
    });
}

/**
 * ========== 聊天事件监听初始化函数 ==========
 * 功能：管理聊天界面的所有交互行为和消息处理逻辑
 * 设计：采用事件驱动模式，支持多种消息发送方式和成员交互
 * 
 * 交互类型覆盖：
 *   1. 消息发送：按钮点击和键盘快捷键
 *   2. 成员交互：@提及功能和成员资料查看
 *   3. 输入辅助：自动完成和格式化
 *   4. 头像交互：智能体简介展示
 * 
 * 依赖模块：
 *   - ChatController: 消息发送和处理逻辑
 *   - UIController: 界面交互和通知显示
 *   - MemberController: 成员管理功能（如需要）
 * 
 * 错误处理：对缺失的DOM元素进行容错处理
 * 兼容性：支持多种消息结构和头像格式
 */
function initChatEvents() {
    // ========== DOM元素获取 ==========
    // 获取聊天相关的核心DOM元素
    const chatMessages = document.querySelector('.messages-container');
    const messageInput = document.querySelector('.message-input');
    const sendBtn = document.querySelector('.send-btn');
    
    // ========== 核心元素验证 ==========
    // 检查必要的DOM元素是否存在，进行容错处理
    if (!sendBtn || !messageInput) {
        console.warn('未找到发送按钮或输入框元素，跳过发送消息事件初始化');
    } else {
        // ========== 消息发送功能 ==========
        // 发送按钮点击事件监听
        sendBtn.addEventListener('click', function() {
            // ========== 消息内容获取 ==========
            // 获取用户输入的消息文本并去除首尾空格
            const text = messageInput.value.trim();
            const attachments = [];  // 附件列表（当前为空，可扩展）
            
            // ========== 消息发送处理 ==========
            // 调用聊天控制器发送消息
            ChatController.sendMessage(text, attachments);
        });
        
        // ========== 键盘快捷键发送 ==========
        // 监听输入框回车键事件（支持Shift+Enter换行）
        messageInput.addEventListener('keypress', function(e) {
            // ========== 快捷键检测 ==========
            // 检查是否为回车键且未按住Shift键
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();  // 阻止默认换行行为
                sendBtn.click();     // 触发发送按钮点击事件
            }
            // 注意：Shift+Enter组合键会正常换行，不触发发送
        });
    }
    
    // ========== @成员功能按钮 ==========
    // @成员功能按钮点击事件（UI演示功能）
    const atMemberBtn = document.querySelector('.input-action-btn[title="@成员"]');
    if (atMemberBtn) {
        atMemberBtn.addEventListener('click', function() {
            // ========== @成员功能演示 ==========
            // 当前为演示功能，实际实现中会显示成员选择列表
            alert('在实际实现中，这里会显示成员列表供选择');
            
            // TODO: 实际实现时的逻辑
            // 1. 获取当前群聊的成员列表
            // 2. 显示成员选择下拉框或模态框
            // 3. 用户选择成员后插入@标记到输入框
            // 4. 设置光标位置到@标记后
        });
    }
    
    // ========== 消息头像交互功能 ==========
    // 事件委托处理消息中头像点击，展示智能体简介
    if (chatMessages) {
        chatMessages.addEventListener('click', function (e) {
            // ========== 头像元素检测 ==========
            // 检查点击的元素是否为消息头像
            const avatarEl = e.target.closest('.message-avatar');
            if (avatarEl) {
                // ========== 消息元素获取 ==========
                // 获取头像所属的消息容器元素
                const messageEl = avatarEl.closest('.message');
                let senderName = '';
                
                // ========== 发送者名称提取 ==========
                // 从消息头部或数据属性获取发送者名称（兼容不同结构）
                const headerName = messageEl?.querySelector('.message-header .sender-name, .message-sender');
                if (headerName) {
                    // 方式1：从消息头部文本获取发送者名称
                    senderName = headerName.textContent.trim();
                } else if (messageEl?.dataset?.sender) {
                    // 方式2：从消息元素的数据属性获取发送者名称
                    senderName = messageEl.dataset.sender;
                } else {
                    // ========== 兼容性处理 ==========
                    // 兼容旧结构：根据头像字母推断发送者身份
                    const letter = avatarEl.textContent.trim();
                    if (letter === 'C') senderName = 'Claude';
                    else if (letter === 'G') senderName = 'GPT-4';
                    else if (letter === 'U') senderName = '用户';
                    else if (letter === 'C') senderName = 'Copilot';
                }
                
                // ========== 智能体简介显示 ==========
                // 如果获取到发送者名称且UI控制器支持，显示智能体简介
                if (typeof UIController?.showAgentProfile === 'function') {
                    UIController.showAgentProfile(senderName);
                }
            }
        });
    }
}

/**
 * ========== 成员管理事件监听初始化函数 ==========
 * 功能：管理群聊成员的各种交互操作和信息展示
 * 设计：使用事件委托模式处理动态生成的成员元素
 * 
 * 操作类型覆盖：
 *   1. 成员删除：管理员删除群聊成员的操作
 *   2. 成员信息：查看成员详细资料和智能体简介
 *   3. 交互控制：防止事件冒泡和重复触发
 * 
 * 依赖模块：
 *   - UIController: 界面交互和智能体简介显示
 *   - MemberController: 成员数据管理和删除操作
 * 
 * 事件委托优势：
 *   - 支持动态添加的成员元素
 *   - 减少内存占用和事件监听器数量
 *   - 统一的事件处理逻辑和错误处理
 * 
 * 安全考虑：
 *   - 事件冒泡控制，防止误触发
 *   - 权限验证（实际实现中需要）
 *   - 数据验证和容错处理
 */
function initMemberEvents() {
    // ========== 成员列表容器获取 ==========
    // 获取成员列表容器，作为事件委托的根元素
    const membersList = document.querySelector('.members-list');
    
    // ========== 容器存在性验证 ==========
    // 检查成员列表容器是否存在，进行容错处理
    if (membersList) {
        // ========== 统一事件委托监听 ==========
        // 在成员列表容器上设置统一的点击事件监听
        membersList.addEventListener('click', function(e) {
            // ========== 成员删除功能处理 ==========
            // 检查是否点击了删除成员按钮
            const deleteBtn = e.target.closest('.delete-member-btn');
            if (deleteBtn) {
                // ========== 事件传播控制 ==========
                // 阻止事件冒泡，防止触发成员项的点击事件
                e.stopPropagation();
                // 阻止默认行为，防止页面跳转或表单提交
                e.preventDefault();
                
                // ========== 成员ID获取 ==========
                // 从删除按钮的数据属性获取成员ID
                const memberId = deleteBtn.dataset.memberId;
                
                // ========== 成员删除操作 ==========
                // 调用成员控制器执行删除操作
                MemberController.removeMember(memberId);
                
                // ========== 早期返回 ==========
                // 提前返回，不执行后续的成员项点击逻辑
                return;
            }
            
            // ========== 成员信息展示功能处理 ==========
            // 处理成员项点击展示智能体简介
            const memberItem = e.target.closest('.member-item');
            if (memberItem) {
                // ========== 成员名称提取 ==========
                // 从数据属性或DOM元素中获取成员名称（多种方式兼容）
                const name = memberItem.dataset.name || memberItem.querySelector('.member-name')?.textContent?.trim();
                
                // ========== 智能体简介显示条件 ==========
                // 检查名称有效性和UI控制器功能可用性
                if (name && name !== '用户' && typeof UIController?.showAgentProfile === 'function') {
                    // ========== 智能体简介展示 ==========
                    // 调用UI控制器显示智能体的详细简介
                    UIController.showAgentProfile(name);
                }
            }
        });
    }
}

/**
 * ========== 模态框外部点击关闭功能禁用 ==========
 * 功能：阻止点击模态框外部区域关闭模态框的默认行为
 * 设计：使用捕获阶段事件监听，统一拦截模态框外部点击
 * 
 * 禁用原因：
 *   1. 防止用户误操作：避免意外点击导致表单数据丢失
 *   2. 提升用户体验：确保用户通过明确的按钮操作关闭模态框
 *   3. 数据安全性：保护用户正在填写的表单内容
 *   4. 交互一致性：统一的模态框关闭方式
 * 
 * 技术实现：
 *   - 使用捕获阶段监听（第三个参数为true）
 *   - 优先级高于冒泡阶段的其他事件处理
 *   - 阻止事件传播和默认行为
 * 
 * 兼容性处理：
 *   - stopImmediatePropagation可选调用（?. 操作符）
 *   - 多重事件阻止确保完全拦截
 * 
 * 如需启用外部点击关闭功能，请移除此监听器并在initUIEvents中添加相应逻辑
 */
window.addEventListener('click', function(e) {
    // ========== 模态框元素检测 ==========
    // 检查点击目标是否为模态框遮罩层
    if (e.target && e.target.classList && e.target.classList.contains('modal')) {
        // ========== 事件传播阻止 ==========
        // 立即停止事件传播，防止触发其他监听器
        e.stopImmediatePropagation?.();
        // 阻止事件冒泡到父元素
        e.stopPropagation();
        // 阻止浏览器默认行为
        e.preventDefault();
    }
}, true);  // 使用捕获阶段，确保优先处理
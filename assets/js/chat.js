/**
 * ========== 聊天功能控制器模块 ==========
 * 功能概述：负责聊天室的核心消息处理功能，包括消息发送、接收、显示和管理
 * 
 * 核心职责：
 *   1. 消息处理：创建、发送、接收和显示聊天消息
 *   2. 消息格式：支持文本、Markdown、附件等多种消息类型
 *   3. 用户体验：提供流畅的消息交互和视觉反馈
 *   4. 状态管理：控制聊天开关状态和消息流控制
 *   5. 数据导出：支持聊天记录的导出功能
 * 
 * 设计模式：
 *   - 模块模式：使用IIFE封装私有变量和方法
 *   - 工厂模式：createMessageElement函数创建消息DOM元素
 *   - 观察者模式：与UIController协作处理用户交互
 * 
 * 关联文件：
 *   - chat.css: 消息样式和布局定义
 *   - ui.js: UI交互和通知显示
 *   - member.js: 成员状态和消息关联
 *   - app.js: 应用初始化和模块协调
 * 
 * 数据流向：
 *   用户输入 → sendMessage → createMessageElement → DOM渲染
 *   服务器消息 → receiveMessage → createMessageElement → DOM渲染
 */

const ChatController = (function() {
    /**
     * ========== 聊天控制器私有作用域 ==========
     * 功能：封装聊天功能的私有变量和方法，提供模块化的消息处理能力
     * 设计：使用闭包模式保护内部状态，只暴露必要的公开接口
     */
    
    /**
     * ========== 聊天状态管理变量 ==========
     * chatActive: 控制聊天功能的开关状态
     *   - true: 聊天功能开启，可以发送和接收消息
     *   - false: 聊天功能关闭，阻止消息发送和显示
     * 
     * 用途：
     *   - 消息发送控制：sendMessage函数检查此状态
     *   - 消息接收控制：receiveMessage函数检查此状态
     *   - UI状态同步：与聊天开关按钮状态保持一致
     */
    let chatActive = true;
    
    /**
     * ========== 消息DOM元素创建工厂函数 ==========
     * 功能：根据消息数据创建对应的DOM元素，支持多种消息类型和格式
     * 设计：工厂模式，根据消息类型（用户/智能体）创建不同的DOM结构
     * 
     * @param {Object} message - 消息数据对象
     * @param {string} message.sender - 发送者名称
     * @param {string} message.text - 消息文本内容
     * @param {string} message.time - 消息发送时间
     * @param {boolean} message.isAgent - 是否为智能体消息
     * @param {boolean} [message.markdown] - 是否为Markdown格式
     * @param {string} [message.status] - 智能体状态（thinking等）
     * @param {Object} [message.attachment] - 附件信息
     * 
     * @returns {HTMLElement} 完整的消息DOM元素
     * 
     * DOM结构差异：
     *   - 智能体消息：message-header + message-text + message-time
     *   - 用户消息：message-info + message-bubble结构
     * 
     * 支持功能：
     *   - 文本消息：普通文本和Markdown格式
     *   - 附件消息：图片预览和文件下载
     *   - 状态显示：智能体思考状态等
     * 
     * 关联样式：chat.css中的消息相关样式类
     */
    function createMessageElement(message) {
        // ========== 消息容器元素创建 ==========
        // 创建消息的根容器，根据发送者类型设置不同的CSS类
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.isAgent ? 'agent-message' : 'user-message'}`;
        
        // ========== 消息头像元素创建 ==========
        // 创建发送者头像，显示发送者姓名的首字母
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.textContent = message.sender.charAt(0);  // 提取首字母作为头像
        messageDiv.appendChild(avatarDiv);
        
        // ========== 消息内容容器创建 ==========
        // 创建消息内容的主容器，包含所有消息相关信息
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (message.isAgent) {
            // ========== 智能体消息结构处理 ==========
            // 智能体消息采用header + text + time的垂直布局结构
            
            // ========== 消息头部区域创建 ==========
            // 包含发送者名称和状态信息的头部容器
            const headerDiv = document.createElement('div');
            headerDiv.className = 'message-header';
            
            // ========== 发送者名称显示 ==========
            // 显示智能体的名称（如Claude、GPT-4等）
            const senderDiv = document.createElement('div');
            senderDiv.className = 'message-sender';
            senderDiv.textContent = message.sender;
            headerDiv.appendChild(senderDiv);
            
            // ========== 智能体状态指示器 ==========
            // 仅在智能体处于特定状态时显示状态徽标
            if (message.status === 'thinking') {
                const statusDiv = document.createElement('div');
                statusDiv.className = 'agent-status thinking';  // 思考状态样式
                statusDiv.textContent = '思考中..';  // 状态文本提示
                headerDiv.appendChild(statusDiv);
            }
            
            contentDiv.appendChild(headerDiv);
            
            // ========== 消息文本内容处理 ==========
            // 根据消息格式类型创建相应的文本显示元素
            const textDiv = document.createElement('div');
            textDiv.className = message.markdown ? 'message-text markdown-content' : 'message-text';
            
            // ========== 文本格式渲染 ==========
            if (message.markdown) {
                // Markdown格式：支持富文本显示（粗体、斜体、链接等）
                textDiv.innerHTML = message.text;
            } else {
                // 普通文本：防止XSS攻击，使用textContent安全渲染
                textDiv.textContent = message.text;
            }
            
            contentDiv.appendChild(textDiv);
            
            // ========== 附件内容处理 ==========
            // 如果消息包含附件，创建附件显示区域
            if (message.attachment) {
                // ========== 附件容器创建 ==========
                const attachmentDiv = document.createElement('div');
                attachmentDiv.className = 'message-attachment';
                
                // ========== 图片附件预览 ==========
                // 如果是图片类型附件，创建图片预览元素
                if (message.attachment.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = message.attachment.url;  // 图片URL
                    img.alt = message.attachment.name;  // 无障碍访问描述
                    img.className = 'attachment-image';  // 图片样式类
                    attachmentDiv.appendChild(img);
                }
                
                // ========== 附件信息区域 ==========
                // 显示附件名称和下载链接
                const infoDiv = document.createElement('div');
                infoDiv.className = 'attachment-info';
                
                // ========== 附件名称显示 ==========
                const nameSpan = document.createElement('span');
                nameSpan.className = 'attachment-name';
                nameSpan.textContent = message.attachment.name;  // 文件名
                infoDiv.appendChild(nameSpan);
                
                // ========== 附件下载链接 ==========
                const downloadLink = document.createElement('a');
                downloadLink.href = message.attachment.url;  // 下载URL
                downloadLink.download = message.attachment.name;  // 下载文件名
                downloadLink.className = 'attachment-download';
                downloadLink.textContent = '下载';  // 下载按钮文本
                infoDiv.appendChild(downloadLink);
                
                attachmentDiv.appendChild(infoDiv);
                textDiv.appendChild(attachmentDiv);  // 附件添加到文本区域
            }
            
            // ========== 消息时间戳显示 ==========
            // 在消息底部显示发送时间
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.textContent = message.time;  // 格式化的时间字符串
            contentDiv.appendChild(timeDiv);
        } else {
            // ========== 用户消息结构处理 ==========
            // 用户消息采用info + bubble的水平布局结构，更符合聊天应用习惯
            
            // ========== 消息信息区域创建 ==========
            // 包含发送者名称和时间的信息容器（水平排列）
            const infoDiv = document.createElement('div');
            infoDiv.className = 'message-info';
            
            // ========== 发送者名称显示 ==========
            // 显示用户的名称或昵称
            const senderDiv = document.createElement('div');
            senderDiv.className = 'message-sender';
            senderDiv.textContent = message.sender;
            infoDiv.appendChild(senderDiv);
            
            // ========== 消息时间显示 ==========
            // 在用户消息中，时间与发送者名称并排显示
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.textContent = message.time;
            infoDiv.appendChild(timeDiv);
            
            contentDiv.appendChild(infoDiv);
            
            // ========== 消息气泡容器创建 ==========
            // 用户消息的主要内容区域，采用气泡样式设计
            const bubbleDiv = document.createElement('div');
            bubbleDiv.className = 'message-bubble';
            
            // ========== 用户消息文本内容处理 ==========
            // 在气泡内创建文本显示区域
            const textDiv = document.createElement('div');
            textDiv.className = message.markdown ? 'message-text markdown-content' : 'message-text';
            
            // ========== 用户消息文本格式渲染 ==========
            if (message.markdown) {
                // Markdown格式：支持富文本显示
                textDiv.innerHTML = message.text;
            } else {
                // 普通文本：安全渲染，防止XSS攻击
                textDiv.textContent = message.text;
            }
            
            bubbleDiv.appendChild(textDiv);
            
            // ========== 用户消息附件处理 ==========
            // 用户消息的附件同样支持图片预览和文件下载
            if (message.attachment) {
                // ========== 用户附件容器创建 ==========
                const attachmentDiv = document.createElement('div');
                attachmentDiv.className = 'message-attachment';
                
                // ========== 用户图片附件预览 ==========
                if (message.attachment.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = message.attachment.url;  // 图片URL
                    img.alt = message.attachment.name;  // 无障碍访问
                    img.className = 'attachment-image';  // 图片样式
                    attachmentDiv.appendChild(img);
                }
                
                // ========== 用户附件信息区域 ==========
                const infoDiv = document.createElement('div');
                infoDiv.className = 'attachment-info';
                
                // ========== 用户附件名称显示 ==========
                const nameSpan = document.createElement('span');
                nameSpan.className = 'attachment-name';
                nameSpan.textContent = message.attachment.name;  // 文件名
                infoDiv.appendChild(nameSpan);
                
                // ========== 用户附件下载链接 ==========
                const downloadLink = document.createElement('a');
                downloadLink.href = message.attachment.url;  // 下载URL
                downloadLink.download = message.attachment.name;  // 下载文件名
                downloadLink.className = 'attachment-download';
                downloadLink.textContent = '下载';  // 下载按钮
                infoDiv.appendChild(downloadLink);
                
                attachmentDiv.appendChild(infoDiv);
                textDiv.appendChild(attachmentDiv);  // 附件添加到文本区域
            }
            
            contentDiv.appendChild(bubbleDiv);  // 气泡添加到内容容器
        }
        
        // ========== 消息元素组装完成 ==========
        // 将内容容器添加到消息根元素，完成DOM结构构建
        messageDiv.appendChild(contentDiv);
        
        return messageDiv;  // 返回完整的消息DOM元素
    }
    
    /**
     * ========== 消息发送功能函数 ==========
     * 功能：处理用户消息的发送，包括验证、创建、显示和服务器通信
     * 设计：完整的消息发送流程，从输入验证到UI更新
     * 
     * @param {string} text - 消息文本内容
     * @param {Array} [attachments=[]] - 附件文件数组
     * 
     * @returns {boolean} 消息发送是否成功
     *   - true: 消息发送成功
     *   - false: 消息发送失败（聊天关闭或内容为空）
     * 
     * 处理流程：
     *   1. 状态验证：检查聊天功能是否开启
     *   2. 内容验证：检查消息内容是否为空
     *   3. 消息创建：构建消息数据对象
     *   4. 附件处理：处理文件附件（如果有）
     *   5. DOM渲染：创建并显示消息元素
     *   6. UI更新：清空输入框，滚动到最新消息
     *   7. 服务器通信：发送消息到服务器（实际项目中）
     * 
     * 错误处理：
     *   - 聊天关闭：显示错误通知并返回false
     *   - 内容为空：显示错误通知并返回false
     * 
     * 关联模块：
     *   - UIController: 显示通知和UI反馈
     *   - createMessageElement: 创建消息DOM元素
     */
    function sendMessage(text, attachments = []) {
        // ========== 聊天状态验证 ==========
        // 检查聊天功能是否开启，关闭状态下禁止发送消息
        if (!chatActive) {
            UIController.showNotification('聊天已关闭，无法发送消息', 'error');
            return false;
        }
        
        // ========== 消息内容验证 ==========
        // 检查消息文本和附件，至少需要有一项不为空
        if (!text.trim() && attachments.length === 0) {
            UIController.showNotification('消息不能为空', 'error');
            return false;
        }
        
        // ========== 消息数据对象创建 ==========
        // 构建标准的消息数据结构
        const message = {
            sender: '用户',  // 发送者标识
            text: text,  // 消息文本内容
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),  // 格式化时间
            isAgent: false  // 标记为用户消息
        };
        
        // ========== 附件数据处理 ==========
        // 如果用户选择了附件文件，处理第一个附件
        if (attachments.length > 0) {
            // 在实际实现中，这里会上传附件到服务器并获取URL
            // 当前仅做UI演示，使用本地对象URL
            message.attachment = {
                name: attachments[0].name,  // 文件名
                type: attachments[0].type,  // MIME类型
                url: URL.createObjectURL(attachments[0])  // 本地预览URL
            };
        }
        
        // ========== 消息DOM元素创建和渲染 ==========
        // 使用工厂函数创建消息DOM元素
        const messageElement = createMessageElement(message);
        // 将消息元素添加到聊天消息容器
        document.querySelector('.chat-messages').appendChild(messageElement);
        
        // ========== 用户体验优化 ==========
        // 平滑滚动到最新消息，确保用户能看到刚发送的消息
        messageElement.scrollIntoView({ behavior: 'smooth' });
        
        // ========== 输入界面重置 ==========
        // 清空消息输入框，准备下一次输入
        document.querySelector('.message-input').value = '';
        
        // 清空附件预览区域，移除已处理的附件显示
        document.querySelectorAll('.file-preview').forEach(preview => preview.remove());
        
        // ========== 服务器通信（模拟） ==========
        // 在实际实现中，这里会将消息发送到服务器
        console.log('发送消息:', message);
        
        // ========== 智能体回复模拟 ==========
        // 模拟智能体的自动回复，实际项目中会从服务器接收真实回复
        setTimeout(() => {
            receiveMessage({
                sender: 'Claude',  // 智能体名称
                text: '这是一条自动回复消息，实际实现中会从服务器接收真实回复。',
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                isAgent: true,  // 标记为智能体消息
                status: 'online'  // 智能体在线状态
            });
        }, 1000);  // 1秒延迟模拟网络请求时间
        
        return true;  // 消息发送成功
    }
    
    /**
     * ========== 消息接收功能函数 ==========
     * 功能：处理从服务器接收到的消息，包括智能体回复和其他用户消息
     * 设计：专门处理入站消息的显示和用户体验
     * 
     * @param {Object} message - 接收到的消息数据对象
     * @param {string} message.sender - 发送者名称
     * @param {string} message.text - 消息文本内容
     * @param {string} message.time - 消息时间
     * @param {boolean} message.isAgent - 是否为智能体消息
     * @param {string} [message.status] - 智能体状态
     * 
     * @returns {boolean} 消息接收是否成功
     *   - true: 消息接收并显示成功
     *   - false: 聊天关闭，消息未显示
     * 
     * 处理流程：
     *   1. 状态检查：验证聊天功能是否开启
     *   2. DOM渲染：创建并显示消息元素
     *   3. 用户体验：滚动到最新消息
     *   4. 通知反馈：播放提示音（实际项目中）
     * 
     * 应用场景：
     *   - 智能体回复：AI助手的回复消息
     *   - 系统消息：服务器推送的系统通知
     *   - 其他用户：多人聊天中其他用户的消息
     * 
     * 关联模块：createMessageElement创建消息DOM
     */
    function receiveMessage(message) {
        // ========== 聊天状态检查 ==========
        // 如果聊天功能关闭，不显示接收到的消息
        if (!chatActive) {
            console.log('聊天已关闭，消息将不会显示');
            return false;
        }
        
        // ========== 接收消息DOM渲染 ==========
        // 创建消息DOM元素并添加到聊天区域
        const messageElement = createMessageElement(message);
        document.querySelector('.chat-messages').appendChild(messageElement);
        
        // ========== 用户体验优化 ==========
        // 自动滚动到最新消息，确保用户看到新消息
        messageElement.scrollIntoView({ behavior: 'smooth' });
        
        // ========== 消息通知（预留） ==========
        // 播放通知声音，提醒用户有新消息（实际实现中）
        // playNotificationSound();
        
        return true;  // 消息接收并显示成功
    }
    
    /**
     * ========== 聊天开关切换功能函数 ==========
     * 功能：切换聊天功能的开启/关闭状态，控制消息收发
     * 设计：提供聊天功能的总开关，影响消息发送和接收
     * 
     * @returns {boolean} 切换后的聊天状态
     *   - true: 聊天功能已开启
     *   - false: 聊天功能已关闭
     * 
     * 操作流程：
     *   1. 状态切换：反转当前聊天开关状态
     *   2. UI更新：更新切换按钮的文本和样式
     *   3. 用户反馈：显示状态变更通知
     * 
     * 影响范围：
     *   - 消息发送：关闭时阻止用户发送消息
     *   - 消息接收：关闭时不显示接收到的消息
     *   - 界面状态：按钮样式和文本的动态更新
     * 
     * 关联模块：UIController.showNotification显示通知
     */
    function toggleChatActive() {
        // ========== 聊天状态切换 ==========
        // 反转当前聊天开关状态
        chatActive = !chatActive;
        
        // ========== 切换按钮UI更新 ==========
        // 获取聊天切换按钮并更新其显示状态
        const toggleChatBtn = document.getElementById('toggleChatBtn');
        
        if (chatActive) {
            // 聊天开启状态：显示关闭选项，更新图标和提示
            toggleChatBtn.innerHTML = '<i class="fas fa-comment-slash"></i>';
            toggleChatBtn.title = '关闭聊天';
            UIController.showNotification('聊天已开启');
        } else {
            // 聊天关闭状态：显示开启选项，更新图标和提示
            toggleChatBtn.innerHTML = '<i class="fas fa-comment"></i>';
            toggleChatBtn.title = '开启聊天';
            UIController.showNotification('聊天已关闭', 'warning');
        }
        
        return chatActive;  // 返回切换后的聊天状态
    }
    
    /**
     * ========== 聊天记录导出功能函数 ==========
     * 功能：将当前聊天记录导出为Markdown格式文件
     * 设计：提供聊天记录的本地保存功能，便于用户备份和分享
     * 
     * @returns {boolean} 导出操作是否成功
     *   - true: 导出成功
     *   - false: 导出失败（实际实现中可能的错误情况）
     * 
     * 处理流程：
     *   1. 数据收集：遍历所有聊天消息DOM元素
     *   2. 格式转换：将消息内容转换为Markdown格式
     *   3. 文件生成：创建Blob对象和下载链接
     *   4. 自动下载：触发浏览器下载行为
     *   5. 资源清理：释放临时URL对象
     *   6. 用户反馈：显示导出成功通知
     * 
     * 导出格式：
     *   - 文件类型：Markdown (.md)
     *   - 文件命名：聊天记录_YYYY-MM-DD.md
     *   - 内容结构：标题 + 发送者 + 时间 + 消息内容
     * 
     * 应用场景：
     *   - 聊天备份：保存重要对话内容
     *   - 内容分享：导出对话用于分享或报告
     *   - 数据迁移：在不同平台间转移聊天记录
     *   - 离线查看：本地保存聊天记录供离线查看
     * 
     * 关联模块：UIController.showNotification显示通知
     */
    function exportChatHistory() {
        // ========== 聊天消息数据收集 ==========
        // 获取页面中所有聊天消息DOM元素
        const messages = document.querySelectorAll('.message');
        // 初始化Markdown格式的聊天记录字符串，包含标题
        let exportContent = '# 聊天记录导出\n\n';
        
        // ========== 消息内容格式化 ==========
        // 遍历每条消息，提取关键信息并格式化为Markdown
        messages.forEach(message => {
            // 提取发送者名称
            const sender = message.querySelector('.message-sender').textContent;
            // 提取消息文本内容
            const text = message.querySelector('.message-text').textContent;
            // 提取消息时间戳
            const time = message.querySelector('.message-time').textContent;
            
            // 按Markdown格式组装单条消息，使用二级标题格式
            exportContent += `## ${sender} (${time})\n${text}\n\n`;
        });
        
        // ========== 文件下载处理 ==========
        // 创建Markdown文件的Blob对象
        const blob = new Blob([exportContent], { type: 'text/markdown' });
        // 生成临时下载URL
        const url = URL.createObjectURL(blob);
        // 创建隐藏的下载链接元素
        const a = document.createElement('a');
        a.href = url;
        // 设置下载文件名，包含当前日期
        a.download = `聊天记录_${new Date().toISOString().slice(0, 10)}.md`;
        
        // ========== 自动下载触发 ==========
        // 触发点击下载，浏览器会自动处理文件保存
        a.click();
        
        // ========== 资源清理 ==========
        // 延迟释放URL对象，确保下载完成后清理内存
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        // ========== 用户反馈 ==========
        // 显示导出成功的通知消息
        UIController.showNotification('聊天记录已导出');
        
        return true;  // 返回导出成功状态
    }
    
    /**
     * ========== 模块公开接口定义 ==========
     * 功能：定义ChatController模块对外暴露的公共方法
     * 设计：采用模块模式，只暴露必要的接口，隐藏内部实现细节
     * 
     * 接口说明：
     *   - sendMessage: 发送消息的主要接口
     *   - receiveMessage: 接收消息的处理接口
     *   - toggleChatActive: 聊天开关控制接口
     *   - exportChatHistory: 聊天记录导出接口
     *   - isChatActive: 聊天状态查询接口（只读）
     * 
     * 使用方式：
     *   - ChatController.sendMessage(text, attachments)
     *   - ChatController.receiveMessage(messageData)
     *   - ChatController.toggleChatActive()
     *   - ChatController.exportChatHistory()
     *   - ChatController.isChatActive()
     * 
     * 封装优势：
     *   - 数据保护：私有变量chatActive不可直接访问
     *   - 接口稳定：内部实现变更不影响外部调用
     *   - 功能聚合：相关功能统一管理和调用
     */
    return {
        sendMessage: sendMessage,        // 消息发送接口
        receiveMessage: receiveMessage,  // 消息接收接口
        toggleChatActive: toggleChatActive,  // 聊天开关接口
        exportChatHistory: exportChatHistory,  // 记录导出接口
        isChatActive: function() { return chatActive; }   // 状态查询接口（只读访问器）
    };
})();

/**
 * ========== 模块全局注册 ==========
 * 功能：将ChatController模块注册到全局window对象
 * 设计：使模块可以被其他脚本文件访问和调用
 * 
 * 全局访问：
 *   - 其他模块可通过window.ChatController访问
 *   - 支持跨文件的模块间通信
 *   - 便于在HTML中直接调用聊天功能
 * 
 * 依赖关系：
 *   - 依赖：UIController（通知功能）
 *   - 被依赖：app.js（应用初始化）、ui.js（界面交互）
 */
window.ChatController = ChatController;
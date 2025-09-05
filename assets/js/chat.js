/**
 * 聊天功能模块
 * 负责处理消息发送、接收和显示等功能
 */

const ChatController = (function() {
    // 私有变量和方法
    let chatActive = true; // 聊天开关状态
    
    // 创建消息元素
    function createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.isAgent ? 'agent-message' : 'user-message'}`;
        
        // 创建头像
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.textContent = message.sender.charAt(0);
        messageDiv.appendChild(avatarDiv);
        
        // 创建消息内容容器
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (message.isAgent) {
            // 智能体消息：使用原有结构
            // 创建消息头部（发送者和状态）
            const headerDiv = document.createElement('div');
            headerDiv.className = 'message-header';
            
            const senderDiv = document.createElement('div');
            senderDiv.className = 'message-sender';
            senderDiv.textContent = message.sender;
            headerDiv.appendChild(senderDiv);
            
            // 仅在智能体且处于"思考中"时展示状态徽标
            if (message.status === 'thinking') {
                const statusDiv = document.createElement('div');
                statusDiv.className = 'agent-status thinking';
                statusDiv.textContent = '思考中..';
                headerDiv.appendChild(statusDiv);
            }
            
            contentDiv.appendChild(headerDiv);
            
            // 创建消息文本
            const textDiv = document.createElement('div');
            textDiv.className = message.markdown ? 'message-text markdown-content' : 'message-text';
            
            if (message.markdown) {
                // 如果是Markdown内容，使用innerHTML
                textDiv.innerHTML = message.text;
            } else {
                // 普通文本，使用textContent
                textDiv.textContent = message.text;
            }
            
            contentDiv.appendChild(textDiv);
            
            // 添加附件（如果有）
            if (message.attachment) {
                const attachmentDiv = document.createElement('div');
                attachmentDiv.className = 'message-attachment';
                
                if (message.attachment.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = message.attachment.url;
                    img.alt = message.attachment.name;
                    img.className = 'attachment-image';
                    attachmentDiv.appendChild(img);
                }
                
                const infoDiv = document.createElement('div');
                infoDiv.className = 'attachment-info';
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'attachment-name';
                nameSpan.textContent = message.attachment.name;
                infoDiv.appendChild(nameSpan);
                
                const downloadLink = document.createElement('a');
                downloadLink.href = message.attachment.url;
                downloadLink.download = message.attachment.name;
                downloadLink.className = 'attachment-download';
                downloadLink.textContent = '下载';
                infoDiv.appendChild(downloadLink);
                
                attachmentDiv.appendChild(infoDiv);
                textDiv.appendChild(attachmentDiv);
            }
            
            // 添加时间戳
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.textContent = message.time;
            contentDiv.appendChild(timeDiv);
        } else {
            // 用户消息：使用新的结构（message-info + message-bubble）
            // 创建消息信息容器（发送者和时间）
            const infoDiv = document.createElement('div');
            infoDiv.className = 'message-info';
            
            const senderDiv = document.createElement('div');
            senderDiv.className = 'message-sender';
            senderDiv.textContent = message.sender;
            infoDiv.appendChild(senderDiv);
            
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.textContent = message.time;
            infoDiv.appendChild(timeDiv);
            
            contentDiv.appendChild(infoDiv);
            
            // 创建消息气泡容器
            const bubbleDiv = document.createElement('div');
            bubbleDiv.className = 'message-bubble';
            
            // 创建消息文本
            const textDiv = document.createElement('div');
            textDiv.className = message.markdown ? 'message-text markdown-content' : 'message-text';
            
            if (message.markdown) {
                // 如果是Markdown内容，使用innerHTML
                textDiv.innerHTML = message.text;
            } else {
                // 普通文本，使用textContent
                textDiv.textContent = message.text;
            }
            
            bubbleDiv.appendChild(textDiv);
            
            // 添加附件（如果有）
            if (message.attachment) {
                const attachmentDiv = document.createElement('div');
                attachmentDiv.className = 'message-attachment';
                
                if (message.attachment.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = message.attachment.url;
                    img.alt = message.attachment.name;
                    img.className = 'attachment-image';
                    attachmentDiv.appendChild(img);
                }
                
                const infoDiv = document.createElement('div');
                infoDiv.className = 'attachment-info';
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'attachment-name';
                nameSpan.textContent = message.attachment.name;
                infoDiv.appendChild(nameSpan);
                
                const downloadLink = document.createElement('a');
                downloadLink.href = message.attachment.url;
                downloadLink.download = message.attachment.name;
                downloadLink.className = 'attachment-download';
                downloadLink.textContent = '下载';
                infoDiv.appendChild(downloadLink);
                
                attachmentDiv.appendChild(infoDiv);
                textDiv.appendChild(attachmentDiv);
            }
            
            contentDiv.appendChild(bubbleDiv);
        }
        
        messageDiv.appendChild(contentDiv);
        
        return messageDiv;
    }
    
    // 发送消息
    function sendMessage(text, attachments = []) {
        if (!chatActive) {
            UIController.showNotification('聊天已关闭，无法发送消息', 'error');
            return false;
        }
        
        if (!text.trim() && attachments.length === 0) {
            UIController.showNotification('消息不能为空', 'error');
            return false;
        }
        
        // 创建消息对象
        const message = {
            sender: '用户',
            text: text,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            isAgent: false
        };
        
        // 添加附件（如果有）
        if (attachments.length > 0) {
            // 在实际实现中，这里会上传附件到服务器并获取URL
            // 这里仅做UI演示
            message.attachment = {
                name: attachments[0].name,
                type: attachments[0].type,
                url: URL.createObjectURL(attachments[0])
            };
        }
        
        // 创建消息元素并添加到聊天区域
        const messageElement = createMessageElement(message);
        document.querySelector('.chat-messages').appendChild(messageElement);
        
        // 滚动到最新消息
        messageElement.scrollIntoView({ behavior: 'smooth' });
        
        // 清空输入框
        document.querySelector('.message-input').value = '';
        
        // 清空附件预览
        document.querySelectorAll('.file-preview').forEach(preview => preview.remove());
        
        // 在实际实现中，这里会将消息发送到服务器
        console.log('发送消息:', message);
        
        // 模拟接收回复
        setTimeout(() => {
            receiveMessage({
                sender: 'Claude',
                text: '这是一条自动回复消息，实际实现中会从服务器接收真实回复。',
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                isAgent: true,
                status: 'online'
            });
        }, 1000);
        
        return true;
    }
    
    // 接收消息
    function receiveMessage(message) {
        if (!chatActive) {
            console.log('聊天已关闭，消息将不会显示');
            return false;
        }
        
        // 创建消息元素并添加到聊天区域
        const messageElement = createMessageElement(message);
        document.querySelector('.chat-messages').appendChild(messageElement);
        
        // 滚动到最新消息
        messageElement.scrollIntoView({ behavior: 'smooth' });
        
        // 播放通知声音（实际实现中）
        // playNotificationSound();
        
        return true;
    }
    
    // 切换聊天开关
    function toggleChatActive() {
        chatActive = !chatActive;
        const toggleChatBtn = document.getElementById('toggleChatBtn');
        
        if (chatActive) {
            toggleChatBtn.innerHTML = '<i class="fas fa-comment-slash"></i>';
            toggleChatBtn.title = '关闭聊天';
            UIController.showNotification('聊天已开启');
        } else {
            toggleChatBtn.innerHTML = '<i class="fas fa-comment"></i>';
            toggleChatBtn.title = '开启聊天';
            UIController.showNotification('聊天已关闭', 'warning');
        }
        
        return chatActive;
    }
    
    // 导出聊天记录
    function exportChatHistory() {
        // 获取所有消息
        const messages = document.querySelectorAll('.message');
        let exportContent = '# 聊天记录导出\n\n';
        
        messages.forEach(message => {
            const sender = message.querySelector('.message-sender').textContent;
            const text = message.querySelector('.message-text').textContent;
            const time = message.querySelector('.message-time').textContent;
            
            exportContent += `## ${sender} (${time})\n${text}\n\n`;
        });
        
        // 创建下载链接
        const blob = new Blob([exportContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `聊天记录_${new Date().toISOString().slice(0, 10)}.md`;
        a.click();
        
        // 释放URL对象
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        UIController.showNotification('聊天记录已导出');
        return true;
    }
    
    // 公开的方法
    return {
        sendMessage: sendMessage,
        receiveMessage: receiveMessage,
        toggleChatActive: toggleChatActive,
        exportChatHistory: exportChatHistory,
        isChatActive: function() { return chatActive; }
    };
})();

// 导出模块
window.ChatController = ChatController;
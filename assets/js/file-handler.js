/**
 * 文件处理模块
 * 负责处理文件上传、预览和删除等功能
 */

const FileHandler = (function() {
    // 私有变量和方法
    
    // 根据文件类型获取对应的图标
    function getFileIcon(file) {
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
        return fileIcon;
    }
    
    // 创建文件预览元素
    function createFilePreview(file) {
        // 创建文件预览容器
        const filePreview = document.createElement('div');
        filePreview.style.backgroundColor = '#2a2a2a';
        filePreview.style.borderRadius = '4px';
        filePreview.style.padding = '8px 12px';
        filePreview.style.margin = '5px 0';
        filePreview.style.display = 'flex';
        filePreview.style.alignItems = 'center';
        filePreview.style.justifyContent = 'space-between';
        filePreview.style.maxWidth = '250px';
        
        // 获取文件图标
        const fileIcon = getFileIcon(file);
        
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
        nameSpan.style.maxWidth = '150px';
        nameSpan.style.overflow = 'hidden';
        nameSpan.style.textOverflow = 'ellipsis';
        nameSpan.style.whiteSpace = 'nowrap';
        leftContainer.appendChild(nameSpan);
        
        // 创建删除按钮
        const removeButton = document.createElement('button');
        removeButton.innerHTML = '&times;';
        removeButton.style.background = 'none';
        removeButton.style.border = 'none';
        removeButton.style.color = '#888';
        removeButton.style.fontSize = '1.2rem';
        removeButton.style.cursor = 'pointer';
        removeButton.style.marginLeft = '8px';
        removeButton.title = '删除文件';
        
        // 添加删除事件
        removeButton.addEventListener('click', function() {
            filePreview.remove();
            // 在实际实现中，这里会取消文件上传或从已上传列表中删除
            console.log(`文件 ${file.name} 已删除`);
        });
        
        // 组装预览元素
        filePreview.appendChild(leftContainer);
        filePreview.appendChild(removeButton);
        
        return filePreview;
    }
    
    // 处理文件上传
    function handleFileUpload(file, container) {
        // 在实际实现中，这里会将文件上传到服务器
        // 这里仅做UI演示
        console.log(`准备上传文件: ${file.name}, 大小: ${file.size} 字节, 类型: ${file.type}`);
        
        // 创建文件预览
        const filePreview = createFilePreview(file);
        
        // 添加到指定容器
        if (container) {
            container.appendChild(filePreview);
        } else {
            // 如果没有指定容器，默认添加到消息输入框上方
            const inputWrapper = document.querySelector('.input-wrapper');
            inputWrapper.parentNode.insertBefore(filePreview, inputWrapper);
        }
        
        return filePreview;
    }
    
    // 处理粘贴图片
    function handlePastedImage(imageBlob, container) {
        // 创建文件对象
        const file = new File([imageBlob], `粘贴图片_${new Date().getTime()}.png`, { type: 'image/png' });
        
        // 处理文件上传
        return handleFileUpload(file, container);
    }
    
    // 公开的方法
    return {
        handleFileUpload: handleFileUpload,
        handlePastedImage: handlePastedImage,
        createFilePreview: createFilePreview
    };
})();

// 导出模块
window.FileHandler = FileHandler;
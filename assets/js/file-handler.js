/**
 * 文件处理模块 (FileHandler)
 * 
 * 功能概述：
 * - 提供完整的文件处理解决方案，支持多种文件类型的上传和预览
 * - 实现文件的可视化预览界面，包含图标、名称和删除功能
 * - 支持拖拽上传、点击上传和粘贴图片等多种上传方式
 * - 提供文件类型识别和相应的图标显示
 * 
 * 设计模式：
 * - 使用IIFE（立即执行函数表达式）创建模块，确保私有方法的封装性
 * - 采用工厂模式创建文件预览元素，便于复用和维护
 * - 提供统一的公共API接口，隐藏内部实现细节
 * 
 * 依赖关系：
 * - 被 app.js 的文件上传事件处理器调用
 * - 与 chat.js 协作处理消息中的文件附件
 * - 依赖DOM操作，需要在页面加载完成后使用
 * 
 * 支持的文件类型：
 * - 图片文件：PNG, JPG, GIF等（显示🖼️图标）
 * - PDF文档：显示📕图标
 * - Word文档：DOC, DOCX（显示📘图标）
 * - Excel表格：XLS, XLSX（显示📗图标）
 * - PowerPoint演示：PPT, PPTX（显示📙图标）
 * - 其他文件：显示📄通用文档图标
 */

const FileHandler = (function() {
    // ========== 私有变量和方法 ==========
    
    /**
     * 根据文件类型获取对应的图标
     * 
     * 功能：为不同类型的文件分配相应的emoji图标
     * 设计：基于文件MIME类型和扩展名进行判断
     * 扩展：可以轻松添加新的文件类型支持
     * 
     * @param {File} file - 文件对象，包含name和type属性
     * @returns {string} 对应的emoji图标字符
     */
    function getFileIcon(file) {
        let fileIcon = '📄';  // 默认通用文档图标
        
        // 图片文件：基于MIME类型判断
        if (file.type.startsWith('image/')) {
            fileIcon = '🖼️';  // 图片图标
        } 
        // PDF文档：基于文件扩展名判断
        else if (file.name.endsWith('.pdf')) {
            fileIcon = '📕';  // 红色书本图标代表PDF
        } 
        // Word文档：支持新旧格式
        else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
            fileIcon = '📘';  // 蓝色书本图标代表Word
        } 
        // Excel表格：支持新旧格式
        else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
            fileIcon = '📗';  // 绿色书本图标代表Excel
        } 
        // PowerPoint演示：支持新旧格式
        else if (file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
            fileIcon = '📙';  // 橙色书本图标代表PowerPoint
        }
        
        return fileIcon;
    }
    
    /**
     * 创建文件预览元素
     * 
     * 功能：为上传的文件创建可视化的预览卡片
     * 设计：包含文件图标、名称和删除按钮的紧凑布局
     * 交互：支持删除操作，提供用户友好的文件管理界面
     * 样式：深色主题，与聊天界面风格保持一致
     * 
     * 布局结构：
     * [图标] [文件名...] [×删除]
     * 
     * @param {File} file - 要预览的文件对象
     * @returns {HTMLElement} 完整的文件预览DOM元素
     */
    function createFilePreview(file) {
        // ========== 创建文件预览容器 ==========
        const filePreview = document.createElement('div');
        filePreview.style.backgroundColor = '#2a2a2a';  // 深色背景与聊天界面一致
        filePreview.style.borderRadius = '4px';         // 圆角边框
        filePreview.style.padding = '8px 12px';         // 内边距提供舒适间距
        filePreview.style.margin = '5px 0';             // 上下外边距
        filePreview.style.display = 'flex';             // 弹性布局
        filePreview.style.alignItems = 'center';        // 垂直居中对齐
        filePreview.style.justifyContent = 'space-between'; // 两端对齐
        filePreview.style.maxWidth = '250px';           // 最大宽度限制
        
        // ========== 获取文件类型对应的图标 ==========
        const fileIcon = getFileIcon(file);
        
        // ========== 创建左侧内容容器（图标+文件名） ==========
        const leftContainer = document.createElement('div');
        leftContainer.style.display = 'flex';           // 弹性布局水平排列
        leftContainer.style.alignItems = 'center';      // 垂直居中对齐
        
        // ========== 创建文件类型图标元素 ==========
        const iconSpan = document.createElement('span');
        iconSpan.textContent = fileIcon;                // 设置图标内容
        iconSpan.style.fontSize = '1.5rem';             // 较大的图标尺寸
        iconSpan.style.marginRight = '8px';             // 与文件名的间距
        leftContainer.appendChild(iconSpan);
        
        // ========== 创建文件名显示元素 ==========
        const nameSpan = document.createElement('span');
        nameSpan.textContent = file.name;               // 显示完整文件名
        nameSpan.style.color = '#fff';                  // 白色文字
        nameSpan.style.maxWidth = '150px';              // 最大宽度限制
        nameSpan.style.overflow = 'hidden';             // 隐藏溢出内容
        nameSpan.style.textOverflow = 'ellipsis';       // 用省略号表示截断
        nameSpan.style.whiteSpace = 'nowrap';           // 不换行
        leftContainer.appendChild(nameSpan);
        
        // ========== 创建删除按钮 ==========
        const removeButton = document.createElement('button');
        removeButton.innerHTML = '&times;';             // ×符号
        removeButton.style.background = 'none';         // 无背景
        removeButton.style.border = 'none';             // 无边框
        removeButton.style.color = '#888';              // 灰色文字
        removeButton.style.fontSize = '1.2rem';         // 较大字体便于点击
        removeButton.style.cursor = 'pointer';          // 指针样式
        removeButton.style.marginLeft = '8px';          // 左侧间距
        removeButton.title = '删除文件';                 // 悬停提示
        
        // ========== 添加删除事件处理器 ==========
        removeButton.addEventListener('click', function() {
            filePreview.remove();                        // 从DOM中移除预览元素
            // 在实际实现中，这里会取消文件上传或从已上传列表中删除
            console.log(`文件 ${file.name} 已删除`);
        });
        
        // ========== 组装完整的预览元素 ==========
        filePreview.appendChild(leftContainer);         // 添加左侧内容（图标+文件名）
        filePreview.appendChild(removeButton);          // 添加删除按钮
        
        return filePreview;
    }
    
    /**
     * 处理文件上传逻辑
     * 
     * 功能：处理单个文件的上传，创建预览并添加到指定容器
     * 设计：支持灵活的容器指定，提供默认容器回退机制
     * 预览：为文件创建可视化预览卡片并正确定位
     * 扩展：预留实际上传接口，便于后续集成服务端
     * 
     * 处理流程：
     * 1. 记录文件基本信息用于调试
     * 2. 创建文件预览卡片
     * 3. 根据容器参数决定添加位置
     * 4. 返回预览元素供后续操作
     * 
     * @param {File} file - 要处理的文件对象
     * @param {HTMLElement} container - 文件预览容器DOM元素（可选）
     * @returns {HTMLElement} 创建的文件预览元素
     */
    function handleFileUpload(file, container) {
        // ========== 记录文件信息用于调试和监控 ==========
        // 在实际实现中，这里会将文件上传到服务器
        // 这里仅做UI演示
        console.log(`准备上传文件: ${file.name}, 大小: ${file.size} 字节, 类型: ${file.type}`);
        
        // ========== 创建文件预览卡片 ==========
        const filePreview = createFilePreview(file);
        
        // ========== 智能容器定位和添加 ==========
        if (container) {
            // 如果指定了容器，直接添加到该容器
            container.appendChild(filePreview);
        } else {
            // 如果没有指定容器，默认添加到消息输入框上方
            const inputWrapper = document.querySelector('.input-wrapper');
            inputWrapper.parentNode.insertBefore(filePreview, inputWrapper);
        }
        
        // ========== 返回预览元素供后续操作 ==========
        return filePreview;
    }
    
    /**
     * 处理粘贴的图片文件
     * 
     * 功能：将粘贴的图片数据转换为文件对象并创建预览
     * 转换：将图片Blob数据包装为标准File对象
     * 命名：自动生成带时间戳的文件名，避免重名冲突
     * 集成：复用现有的文件上传处理流程
     * 
     * 应用场景：
     * - 用户截图后直接粘贴到聊天框
     * - 从其他应用复制图片后粘贴
     * - 处理剪贴板中的图片数据
     * 
     * 处理流程：
     * 1. 接收图片Blob数据
     * 2. 创建带时间戳的File对象
     * 3. 调用统一的文件上传处理器
     * 4. 返回创建的预览元素
     * 
     * @param {Blob} imageBlob - 图片的二进制数据对象
     * @param {HTMLElement} container - 文件预览容器DOM元素（可选）
     * @returns {HTMLElement} 创建的文件预览元素
     */
    function handlePastedImage(imageBlob, container) {
        // ========== 创建标准File对象 ==========
        // 使用时间戳生成唯一文件名，避免重名冲突
        const file = new File([imageBlob], `粘贴图片_${new Date().getTime()}.png`, { type: 'image/png' });
        
        // ========== 复用文件上传处理流程 ==========
        // 调用统一的文件处理器，保持处理逻辑一致性
        return handleFileUpload(file, container);
    }
    
    // ========================================
    // 公开API接口 - FileHandler模块对外暴露的方法
    // ========================================
    
    /**
     * FileHandler模块的公开接口
     * 
     * 设计原则：
     * - 提供简洁明了的API命名
     * - 封装内部实现细节
     * - 支持链式调用和灵活参数
     * - 保持向后兼容性
     */
    return {
        /**
         * 处理文件上传
         * @method handleFileUpload
         * @param {File} file - 要上传的文件对象
         * @param {HTMLElement} container - 预览容器（可选）
         * @returns {HTMLElement} 文件预览元素
         */
        handleFileUpload: handleFileUpload,
        
        /**
         * 处理粘贴的图片数据
         * @method handlePastedImage
         * @param {Blob} imageBlob - 图片二进制数据
         * @param {HTMLElement} container - 预览容器（可选）
         * @returns {HTMLElement} 图片预览元素
         */
        handlePastedImage: handlePastedImage,
        
        /**
         * 创建文件预览卡片
         * @method createFilePreview
         * @param {File} file - 文件对象
         * @returns {HTMLElement} 文件预览DOM元素
         */
        createFilePreview: createFilePreview
    };
})();

// ========================================
// 模块导出配置 - 支持多种模块系统
// ========================================

/**
 * 浏览器全局对象导出
 * 
 * 功能：将FileHandler模块挂载到window对象上
 * 兼容：支持传统的浏览器脚本引入方式
 * 访问：可通过window.FileHandler或直接FileHandler访问
 */
window.FileHandler = FileHandler;

/**
 * Node.js CommonJS模块导出
 * 
 * 检测：判断是否在Node.js环境中运行
 * 导出：使用CommonJS规范导出FileHandler模块
 * 兼容：支持服务端JavaScript和构建工具
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileHandler;
}

/**
 * AMD (Asynchronous Module Definition) 模块导出
 * 
 * 检测：判断是否支持AMD模块系统（如RequireJS）
 * 导出：使用AMD规范异步定义模块
 * 兼容：支持现代前端模块加载器
 */
if (typeof define === 'function' && define.amd) {
    define([], function() {
        return FileHandler;
    });
}
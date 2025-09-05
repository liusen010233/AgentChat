/**
 * 表单验证模块 (FormValidator)
 * 
 * 功能概述：
 * - 提供统一的表单验证逻辑和规则
 * - 支持群聊创建和设置表单的验证
 * - 实现中英文混合内容的长度验证
 * - 提供标准化的验证结果格式
 * 
 * 设计模式：
 * - 使用IIFE模块模式封装私有方法
 * - 采用工厂模式提供验证器实例
 * - 统一的验证结果接口设计
 * 
 * 验证规则：
 * - 群聊名称：仅允许英文字母、数字、下划线
 * - 群聊描述：支持中英文混合，智能计算长度
 * - 返回格式：{isValid: boolean, message?: string}
 * 
 * 依赖关系：
 * - 无外部依赖，纯JavaScript实现
 * - 可被chat.js、ui.js等模块调用
 * 
 * @author AI Chat System
 * @version 1.0.0
 */

const FormValidator = (function() {
    
    // ========================================
    // 私有验证方法 - 内部使用的验证逻辑
    // ========================================
    
    /**
     * 验证群聊名称格式和内容
     * 
     * 功能：检查群聊名称是否符合命名规范
     * 规则：仅允许英文字母、数字、下划线组合
     * 限制：不允许空值，不允许特殊字符和中文
     * 应用：群聊创建和设置功能中的名称验证
     * 
     * 验证流程：
     * 1. 检查是否为空值
     * 2. 使用正则表达式验证字符类型
     * 3. 返回标准化验证结果
     * 
     * @param {string} name - 待验证的群聊名称
     * @returns {Object} 验证结果 {isValid: boolean, message?: string}
     */
    function validateGroupName(name) {
        // ========== 空值检查 ==========
        if (!name) {
            return {
                isValid: false,
                message: '请输入群聊名称'  // 提示用户输入必填项
            };
        } 
        // ========== 字符格式验证 ==========
        else if (!/^[a-zA-Z0-9_]+$/.test(name)) {
            return {
                isValid: false,
                message: '群聊名称必须是英文字母、数字或下划线'  // 格式要求说明
            };
        }
        // ========== 验证通过 ==========
        return { isValid: true };  // 无需错误消息
    }
    
    /**
     * 验证群聊描述长度和内容
     * 
     * 功能：智能验证中英文混合内容的长度限制
     * 算法：分别计算中文字符和其他字符的数量
     * 规则：中文字符最多10个，英文字符最多30个
     * 特性：支持空描述，提供灵活的长度控制
     * 
     * 技术实现：
     * - 使用Unicode范围[\u4e00-\u9fa5]识别中文字符
     * - 分别统计中文和非中文字符数量
     * - 独立验证两种字符类型的长度限制
     * 
     * 验证逻辑：
     * 1. 允许空描述（可选字段）
     * 2. 提取所有中文字符并计数
     * 3. 计算非中文字符数量
     * 4. 分别检查两种字符的数量限制
     * 
     * @param {string} desc - 待验证的群聊描述
     * @returns {Object} 验证结果 {isValid: boolean, message?: string}
     */
    function validateGroupDesc(desc) {
        // ========== 非空描述才进行长度验证 ==========
        if (desc.length > 0) {
            // ========== 智能识别和统计中文字符 ==========
            // 使用正则表达式匹配所有中文字符（Unicode范围：\u4e00-\u9fa5）
            const chineseCount = (desc.match(/[\u4e00-\u9fa5]/g) || []).length;
            
            // ========== 计算非中文字符数量 ==========
            // 总长度减去中文字符数量，得到英文、数字、符号等字符数量
            const otherCount = desc.length - chineseCount;
            
            // ========== 分别验证两种字符类型的长度限制 ==========
            if (chineseCount > 10 || otherCount > 30) {
                return {
                    isValid: false,
                    message: '群聊描述不能超过10个中文字或30个英文字符'  // 明确的长度限制说明
                };
            }
        }
        // ========== 验证通过（包括空描述） ==========
        return { isValid: true };  // 描述字段为可选，空值也是有效的
    }
    
    // ========================================
    // 公开API接口 - FormValidator模块对外暴露的方法
    // ========================================
    
    /**
     * FormValidator模块的公开接口
     * 
     * 设计原则：
     * - 提供语义化的方法命名
     * - 统一的参数接口和返回格式
     * - 支持不同场景的表单验证需求
     * - 早期返回机制提高验证效率
     */
    return {
        /**
         * 创建群聊表单验证器
         * 
         * 功能：验证群聊创建表单的所有必填字段
         * 应用：在创建新群聊时调用，确保数据有效性
         * 流程：依次验证群聊名称和描述，遇到错误立即返回
         * 优化：采用早期返回策略，提高验证效率
         * 
         * 验证顺序：
         * 1. 群聊名称（必填，格式验证）
         * 2. 群聊描述（可选，长度验证）
         * 
         * @param {HTMLInputElement} groupNameInput - 群聊名称输入框元素
         * @param {HTMLInputElement} groupDescInput - 群聊描述输入框元素
         * @returns {Object} 验证结果 {isValid: boolean, message?: string}
         */
        validateCreateChatForm: function(groupNameInput, groupDescInput) {
            // ========== 验证群聊名称（必填字段） ==========
            const groupName = groupNameInput.value.trim();  // 去除首尾空格
            const nameValidation = validateGroupName(groupName);
            if (!nameValidation.isValid) {
                return nameValidation;  // 早期返回，避免不必要的后续验证
            }
            
            // ========== 验证群聊描述（可选字段） ==========
            const groupDesc = groupDescInput.value.trim();  // 去除首尾空格
            const descValidation = validateGroupDesc(groupDesc);
            if (!descValidation.isValid) {
                return descValidation;  // 早期返回，立即反馈验证错误
            }
            
            // ========== 所有验证通过 ==========
            return { isValid: true };  // 表单数据完全有效
        },
        
        /**
         * 群聊设置表单验证器
         * 
         * 功能：验证群聊设置修改表单的所有字段
         * 应用：在修改群聊设置时调用，确保更新数据有效性
         * 复用：使用相同的验证逻辑，保持一致性
         * 扩展：可根据设置场景添加额外的验证规则
         * 
         * 验证逻辑：
         * - 与创建表单使用相同的验证规则
         * - 支持设置页面的字段命名约定
         * - 保持验证行为的一致性
         * 
         * @param {HTMLInputElement} settingsNameInput - 设置页面群聊名称输入框
         * @param {HTMLInputElement} settingsDescInput - 设置页面群聊描述输入框
         * @returns {Object} 验证结果 {isValid: boolean, message?: string}
         */
        validateSettingsForm: function(settingsNameInput, settingsDescInput) {
            // ========== 验证群聊名称（设置页面） ==========
            const groupName = settingsNameInput.value.trim();  // 去除首尾空格
            const nameValidation = validateGroupName(groupName);
            if (!nameValidation.isValid) {
                return nameValidation;  // 早期返回验证错误
            }
            
            // ========== 验证群聊描述（设置页面） ==========
            const groupDesc = settingsDescInput.value.trim();  // 去除首尾空格
            const descValidation = validateGroupDesc(groupDesc);
            if (!descValidation.isValid) {
                return descValidation;  // 早期返回验证错误
            }
            
            // ========== 设置表单验证通过 ==========
            return { isValid: true };  // 设置数据完全有效
        }
    };
})();

// ========================================
// 模块导出配置 - 支持多种模块系统
// ========================================

/**
 * 浏览器全局对象导出
 * 
 * 功能：将FormValidator模块挂载到window对象上
 * 兼容：支持传统的浏览器脚本引入方式
 * 访问：可通过window.FormValidator或直接FormValidator访问
 * 应用：在chat.js、ui.js等模块中直接调用验证方法
 */
window.FormValidator = FormValidator;

/**
 * Node.js CommonJS模块导出
 * 
 * 检测：判断是否在Node.js环境中运行
 * 导出：使用CommonJS规范导出FormValidator模块
 * 兼容：支持服务端JavaScript和构建工具
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
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
        return FormValidator;
    });
}
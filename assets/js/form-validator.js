/**
 * 表单验证模块
 * 负责处理各种表单的验证逻辑
 */

const FormValidator = (function() {
    // 私有方法
    
    // 验证群聊名称（必须是英文字母、数字或下划线）
    function validateGroupName(name) {
        if (!name) {
            return {
                isValid: false,
                message: '请输入群聊名称'
            };
        } else if (!/^[a-zA-Z0-9_]+$/.test(name)) {
            return {
                isValid: false,
                message: '群聊名称必须是英文字母、数字或下划线'
            };
        }
        return { isValid: true };
    }
    
    // 验证群聊描述（长度限制：10个中文字或30个英文字符）
    function validateGroupDesc(desc) {
        if (desc.length > 0) {
            const chineseCount = (desc.match(/[\u4e00-\u9fa5]/g) || []).length;
            const otherCount = desc.length - chineseCount;
            if (chineseCount > 10 || otherCount > 30) {
                return {
                    isValid: false,
                    message: '群聊描述不能超过10个中文字或30个英文字符'
                };
            }
        }
        return { isValid: true };
    }
    
    // 公开的方法
    return {
        // 创建群聊表单验证
        validateCreateChatForm: function(groupNameInput, groupDescInput) {
            // 验证群名称
            const groupName = groupNameInput.value.trim();
            const nameValidation = validateGroupName(groupName);
            if (!nameValidation.isValid) {
                return nameValidation;
            }
            
            // 验证群描述
            const groupDesc = groupDescInput.value.trim();
            const descValidation = validateGroupDesc(groupDesc);
            if (!descValidation.isValid) {
                return descValidation;
            }
            
            return { isValid: true };
        },
        
        // 群聊设置表单验证
        validateSettingsForm: function(settingsNameInput, settingsDescInput) {
            // 验证群名称
            const groupName = settingsNameInput.value.trim();
            const nameValidation = validateGroupName(groupName);
            if (!nameValidation.isValid) {
                return nameValidation;
            }
            
            // 验证群描述
            const groupDesc = settingsDescInput.value.trim();
            const descValidation = validateGroupDesc(groupDesc);
            if (!descValidation.isValid) {
                return descValidation;
            }
            
            return { isValid: true };
        }
    };
})();

// 导出模块
window.FormValidator = FormValidator;
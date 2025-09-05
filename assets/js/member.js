/**
 * ========== 成员管理控制器模块 ==========
 * 
 * 功能概述：
 *   - 管理聊天室成员的增删改查操作
 *   - 处理成员状态更新和显示
 *   - 提供成员UI元素的动态创建和管理
 *   - 支持用户和智能体的区分显示
 * 
 * 核心职责：
 *   1. 成员元素创建：动态生成成员列表项的DOM结构
 *   2. 成员操作：添加、删除、状态更新等业务逻辑
 *   3. UI交互：删除按钮事件、状态指示器更新
 *   4. 数据验证：成员重复检查、存在性验证
 * 
 * 设计模式：
 *   - 模块模式：使用IIFE创建私有作用域
 *   - 工厂模式：createMemberElement函数负责创建成员元素
 *   - 观察者模式：通过UIController显示操作反馈
 * 
 * 关联文件：
 *   - chat_ui.html: .members-list容器和成员相关DOM结构
 *   - layout.css: .member-item、.member-avatar等成员样式
 *   - ui.js: UIController.showNotification通知显示
 *   - chat.js: 成员数据来源和聊天消息关联
 * 
 * 数据流向：
 *   输入：成员数据对象 → 处理：DOM操作和状态管理 → 输出：UI更新和用户反馈
 */

const MemberController = (function() {
    /**
     * ========== 成员管理模块私有作用域 ==========
     * 使用IIFE模式创建私有作用域，封装内部实现细节
     * 只暴露必要的公开接口，提高代码安全性和可维护性
     */
    
    /**
     * ========== 成员元素创建工厂函数 ==========
     * 功能：根据成员数据动态创建完整的成员列表项DOM元素
     * 设计：工厂模式，统一成员元素的创建逻辑和结构
     * 
     * @param {Object} member - 成员数据对象
     * @param {string} member.id - 成员唯一标识符
     * @param {string} member.name - 成员显示名称
     * @param {string} member.role - 成员角色（如：用户、智能体等）
     * @param {string} member.status - 成员状态（如：online、offline、busy等）
     * 
     * @returns {HTMLElement} 完整的成员列表项DOM元素
     * 
     * DOM结构：
     *   .member-item
     *     ├── .member-avatar (头像，显示名称首字母)
     *     ├── .member-info
     *     │   ├── .member-name (成员名称)
     *     │   └── .member-role (成员角色)
     *     ├── .member-status (状态指示器)
     *     └── .delete-member-btn (删除按钮)
     * 
     * 样式分类：
     *   - .agent类：智能体成员，特殊头像颜色
     *   - .user类：普通用户成员，默认头像颜色
     * 
     * 关联样式：layout.css中的成员相关样式类
     */
    function createMemberElement(member) {
        // ========== 成员容器元素创建 ==========
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';                    // 基础样式类
        memberItem.dataset.memberId = member.id;                 // 成员ID数据属性，用于查找和操作
        memberItem.dataset.name = member.name;                   // 成员名称数据属性，用于快速访问
        
        // ========== 成员类型分类和样式控制 ==========
        // 根据角色添加对应类名，控制头像底色和其他样式差异
        if (member.role && /智能体/.test(member.role)) {
            memberItem.classList.add('agent');                   // 智能体成员样式
        } else {
            memberItem.classList.add('user');                    // 普通用户成员样式
        }
        
        // ========== 成员头像元素创建 ==========
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'member-avatar';
        avatarDiv.textContent = member.name.charAt(0);           // 使用名称首字母作为头像内容
        memberItem.appendChild(avatarDiv);
        
        // ========== 成员信息区域创建 ==========
        const infoDiv = document.createElement('div');
        infoDiv.className = 'member-info';
        
        // 成员名称元素
        const nameDiv = document.createElement('div');
        nameDiv.className = 'member-name';
        nameDiv.textContent = member.name;
        infoDiv.appendChild(nameDiv);
        
        // 成员角色元素
        const roleDiv = document.createElement('div');
        roleDiv.className = 'member-role';
        roleDiv.textContent = member.role;
        infoDiv.appendChild(roleDiv);
        
        memberItem.appendChild(infoDiv);
        
        // ========== 成员状态指示器创建 ==========
        const statusDiv = document.createElement('div');
        statusDiv.className = `member-status status-${member.status}`;  // 动态状态类名
        memberItem.appendChild(statusDiv);
        
        // ========== 删除按钮创建 ==========
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-member-btn';
        deleteBtn.title = '删除成员';                            // 无障碍提示文本
        deleteBtn.dataset.memberId = member.id;                 // 绑定成员ID，用于删除操作
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';   // FontAwesome关闭图标
        memberItem.appendChild(deleteBtn);
        
        return memberItem;
    }
    
    /**
     * ========== 成员添加功能函数 ==========
     * 功能：向聊天室添加新成员，包含重复检查和UI更新
     * 设计：先验证后操作，确保数据一致性和用户体验
     * 
     * @param {Object} member - 要添加的成员数据对象
     * @param {string} member.id - 成员唯一标识符
     * @param {string} member.name - 成员显示名称
     * @param {string} member.role - 成员角色
     * @param {string} member.status - 成员状态
     * 
     * @returns {boolean} 添加操作是否成功
     *   - true: 成员添加成功
     *   - false: 成员已存在，添加失败
     * 
     * 操作流程：
     *   1. 重复性检查：防止添加已存在的成员
     *   2. 元素创建：调用工厂函数创建DOM元素
     *   3. DOM插入：将新成员添加到成员列表容器
     *   4. 服务器同步：发送添加请求（实际项目中）
     *   5. 用户反馈：显示操作结果通知
     * 
     * 错误处理：成员重复时显示警告通知并返回false
     * 关联模块：UIController.showNotification用于用户反馈
     */
    function addMember(member) {
        // ========== 成员重复性检查 ==========
        // 使用CSS选择器查找是否已存在相同ID的成员
        const existingMember = document.querySelector(`.member-item[data-member-id="${member.id}"]`);
        if (existingMember) {
            // 成员已存在，显示警告通知并终止操作
            UIController.showNotification(`成员 ${member.name} 已存在`, 'warning');
            return false;
        }
        
        // ========== 成员元素创建和添加 ==========
        // 调用工厂函数创建完整的成员DOM元素
        const memberElement = createMemberElement(member);
        
        // 将新成员元素添加到成员列表容器中
        document.querySelector('.members-list').appendChild(memberElement);
        
        // ========== 服务器数据同步 ==========
        // 在实际实现中，这里会将成员信息发送到服务器进行持久化
        console.log('添加成员:', member);
        
        // ========== 用户操作反馈 ==========
        // 显示成功通知，告知用户操作完成
        UIController.showNotification(`成员 ${member.name} 已添加`);
        return true;
    }
    
    /**
     * ========== 成员删除功能函数 ==========
     * 功能：从聊天室删除指定成员，包含动画效果和用户反馈
     * 设计：先验证后删除，提供平滑的删除动画体验
     * 
     * @param {string} memberId - 要删除的成员唯一标识符
     * 
     * @returns {boolean} 删除操作是否成功
     *   - true: 成员删除成功
     *   - false: 成员不存在，删除失败
     * 
     * 操作流程：
     *   1. 成员查找：根据ID查找对应的DOM元素
     *   2. 存在性验证：检查成员是否存在
     *   3. 信息提取：获取成员名称用于反馈
     *   4. 动画处理：添加删除动画类
     *   5. 延迟移除：等待动画完成后从DOM中移除
     *   6. 服务器同步：发送删除请求（实际项目中）
     *   7. 用户反馈：显示删除结果通知
     * 
     * 动画设计：300ms删除动画，提供平滑的视觉过渡
     * 错误处理：成员不存在时显示错误通知并返回false
     * 关联样式：layout.css中的.deleting动画类
     */
    function removeMember(memberId) {
        // ========== 成员元素查找和验证 ==========
        // 使用CSS选择器根据成员ID查找对应的DOM元素
        const memberItem = document.querySelector(`.member-item[data-member-id="${memberId}"]`);
        if (!memberItem) {
            // 成员不存在，显示错误通知并终止操作
            UIController.showNotification('找不到指定成员', 'error');
            return false;
        }
        
        // ========== 成员信息提取 ==========
        // 获取成员名称，用于删除确认和用户反馈
        const memberName = memberItem.querySelector('.member-name').textContent;
        
        // ========== 服务器数据同步 ==========
        // 在实际实现中，这里会将删除请求发送到服务器
        console.log(`删除成员: ${memberName}, ID: ${memberId}`);
        
        // ========== 删除动画处理 ==========
        // 添加删除动画类，触发CSS过渡效果
        memberItem.classList.add('deleting');
        
        // ========== 延迟DOM移除和用户反馈 ==========
        // 等待删除动画完成（300ms）后执行最终移除
        setTimeout(() => {
            memberItem.remove();                                    // 从DOM中完全移除元素
            UIController.showNotification(`成员 ${memberName} 已删除`); // 显示删除成功通知
        }, 300);
        
        return true;
    }
    
    /**
     * ========== 成员状态更新功能函数 ==========
     * 功能：更新指定成员的在线状态，实时反映成员活动情况
     * 设计：直接操作DOM元素的CSS类，提供即时的视觉反馈
     * 
     * @param {string} memberId - 要更新状态的成员唯一标识符
     * @param {string} status - 新的成员状态
     *   - 'online': 在线状态（绿色指示器）
     *   - 'offline': 离线状态（灰色指示器）
     *   - 'busy': 忙碌状态（红色指示器）
     *   - 'away': 离开状态（黄色指示器）
     * 
     * @returns {boolean} 状态更新是否成功
     *   - true: 状态更新成功
     *   - false: 成员不存在，更新失败
     * 
     * 操作流程：
     *   1. 成员查找：根据ID查找对应的DOM元素
     *   2. 存在性验证：检查成员是否存在
     *   3. 状态更新：修改状态指示器的CSS类名
     *   4. 服务器同步：发送状态更新请求（实际项目中）
     * 
     * 状态映射：通过CSS类名控制状态指示器的颜色和样式
     * 错误处理：成员不存在时记录错误日志并返回false
     * 关联样式：layout.css中的.status-*系列样式类
     */
    function updateMemberStatus(memberId, status) {
        // ========== 成员元素查找和验证 ==========
        // 使用CSS选择器根据成员ID查找对应的DOM元素
        const memberItem = document.querySelector(`.member-item[data-member-id="${memberId}"]`);
        if (!memberItem) {
            // 成员不存在，记录错误并终止操作
            console.error('找不到指定成员:', memberId);
            return false;
        }
        
        // ========== 状态指示器更新 ==========
        // 获取状态指示器元素并更新其CSS类名
        const statusDiv = memberItem.querySelector('.member-status');
        statusDiv.className = `member-status status-${status}`;  // 动态设置状态类名
        
        // ========== 服务器数据同步 ==========
        // 在实际实现中，这里会将状态更新发送到服务器进行同步
        console.log(`更新成员状态: ${memberId}, 新状态: ${status}`);
        
        return true;
    }
    
    /**
     * ========== 成员管理控制器公开接口 ==========
     * 功能：暴露成员管理的核心功能，供其他模块调用
     * 设计：采用模块模式，只暴露必要的操作接口
     * 
     * 接口功能：
     *   - addMember: 添加新成员到聊天室
     *   - removeMember: 从聊天室删除成员
     *   - updateMemberStatus: 更新成员在线状态
     * 
     * 调用方式：window.MemberController.methodName()
     * 关联模块：
     *   - chat.js: 聊天消息与成员关联
     *   - app.js: 应用初始化时的成员数据加载
     *   - ui.js: 成员相关的UI交互事件
     */
    return {
        // 成员添加接口
        addMember: addMember,
        // 成员删除接口
        removeMember: removeMember,
        // 成员状态更新接口
        updateMemberStatus: updateMemberStatus
    };
})();

/**
 * ========== 成员管理模块全局导出 ==========
 * 功能：将成员管理控制器导出到全局作用域，供其他模块使用
 * 设计：采用IIFE模式封装私有逻辑，只暴露公开接口
 * 
 * 使用方式：
 *   - 直接调用：window.MemberController.addMember(memberData)
 *   - 简化调用：MemberController.removeMember(memberId)
 * 
 * 依赖关系：
 *   - 依赖DOM：需要页面中存在.members-list容器元素
 *   - 依赖样式：需要layout.css中的成员相关样式类
 *   - 被依赖：chat.js、app.js、ui.js等模块会调用此接口
 * 
 * 初始化时机：页面加载完成后，DOM元素准备就绪时
 */
window.MemberController = MemberController;
/**
 * 成员管理模块
 * 负责处理成员列表、添加和删除成员等功能
 */

const MemberController = (function() {
    // 私有变量和方法
    
    // 创建成员元素
    function createMemberElement(member) {
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        memberItem.dataset.memberId = member.id;
        memberItem.dataset.name = member.name; // 添加data-name属性
        // 根据角色添加类名以控制头像底色
        if (member.role && /智能体/.test(member.role)) {
            memberItem.classList.add('agent');
        } else {
            memberItem.classList.add('user');
        }
        
        // 创建头像
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'member-avatar';
        avatarDiv.textContent = member.name.charAt(0);
        memberItem.appendChild(avatarDiv);
        
        // 创建成员信息
        const infoDiv = document.createElement('div');
        infoDiv.className = 'member-info';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'member-name';
        nameDiv.textContent = member.name;
        infoDiv.appendChild(nameDiv);
        
        const roleDiv = document.createElement('div');
        roleDiv.className = 'member-role';
        roleDiv.textContent = member.role;
        infoDiv.appendChild(roleDiv);
        
        memberItem.appendChild(infoDiv);
        
        // 创建状态指示器
        const statusDiv = document.createElement('div');
        statusDiv.className = `member-status status-${member.status}`;
        memberItem.appendChild(statusDiv);
        
        // 创建删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-member-btn';
        deleteBtn.title = '删除成员';
        deleteBtn.dataset.memberId = member.id;
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        memberItem.appendChild(deleteBtn);
        
        return memberItem;
    }
    
    // 添加成员
    function addMember(member) {
        // 检查成员是否已存在
        const existingMember = document.querySelector(`.member-item[data-member-id="${member.id}"]`);
        if (existingMember) {
            UIController.showNotification(`成员 ${member.name} 已存在`, 'warning');
            return false;
        }
        
        // 创建成员元素
        const memberElement = createMemberElement(member);
        
        // 添加到成员列表
        document.querySelector('.members-list').appendChild(memberElement);
        
        // 在实际实现中，这里会将成员信息发送到服务器
        console.log('添加成员:', member);
        
        UIController.showNotification(`成员 ${member.name} 已添加`);
        return true;
    }
    
    // 删除成员
    function removeMember(memberId) {
        // 查找成员元素
        const memberItem = document.querySelector(`.member-item[data-member-id="${memberId}"]`);
        if (!memberItem) {
            UIController.showNotification('找不到指定成员', 'error');
            return false;
        }
        
        const memberName = memberItem.querySelector('.member-name').textContent;
        
        // 直接删除，无需确认弹窗
        // 在实际实现中，这里会将删除请求发送到服务器
        console.log(`删除成员: ${memberName}, ID: ${memberId}`);
        
        // 添加删除动画
        memberItem.classList.add('deleting');
        
        // 从DOM中移除
        setTimeout(() => {
            memberItem.remove();
            UIController.showNotification(`成员 ${memberName} 已删除`);
        }, 300);
        
        return true;
    }
    
    // 更新成员状态
    function updateMemberStatus(memberId, status) {
        // 查找成员元素
        const memberItem = document.querySelector(`.member-item[data-member-id="${memberId}"]`);
        if (!memberItem) {
            console.error('找不到指定成员:', memberId);
            return false;
        }
        
        // 更新状态指示器
        const statusDiv = memberItem.querySelector('.member-status');
        statusDiv.className = `member-status status-${status}`;
        
        // 在实际实现中，这里会将状态更新发送到服务器
        console.log(`更新成员状态: ${memberId}, 新状态: ${status}`);
        
        return true;
    }
    
    // 公开的方法
    return {
        addMember: addMember,
        removeMember: removeMember,
        updateMemberStatus: updateMemberStatus
    };
})();

// 导出模块
window.MemberController = MemberController;
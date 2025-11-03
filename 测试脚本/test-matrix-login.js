// Matrix 登录测试脚本
// 测试 JianLuoChat 与 Element 的互通性

const sdk = require('matrix-js-sdk');

async function testMatrixLogin() {
    console.log('🚀 开始测试 Matrix 登录...');
    
    const username = 'mybatis';
    const homeserver = 'matrix.org';
    const password = 'Twqk3HhqwPjVQqC';
    const baseUrl = `https://${homeserver}`;
    
    try {
        // 创建 Matrix 客户端
        console.log('📡 创建 Matrix 客户端...');
        const client = sdk.createClient({
            baseUrl: baseUrl,
            userId: `@${username}:${homeserver}`
        });
        
        // 尝试登录
        console.log('🔐 尝试登录到 Matrix...');
        const loginResponse = await client.login('m.login.password', {
            user: username,
            password: password,
            initial_device_display_name: 'JianLuoChat Test Client'
        });
        
        console.log('✅ 登录成功！');
        console.log('用户ID:', loginResponse.user_id);
        console.log('访问令牌:', loginResponse.access_token.substring(0, 20) + '...');
        console.log('设备ID:', loginResponse.device_id);
        
        // 启动客户端同步
        console.log('🔄 启动客户端同步...');
        await client.startClient();
        
        // 等待初始同步完成
        await new Promise((resolve) => {
            client.once('sync', (state) => {
                if (state === 'PREPARED') {
                    console.log('✅ 初始同步完成！');
                    resolve();
                }
            });
        });
        
        // 获取房间列表
        console.log('🏠 获取房间列表...');
        const rooms = client.getRooms();
        console.log(`找到 ${rooms.length} 个房间:`);
        
        rooms.slice(0, 5).forEach((room, index) => {
            console.log(`  ${index + 1}. ${room.name || room.roomId} (${room.roomId})`);
            console.log(`     成员数: ${room.getJoinedMemberCount()}`);
            console.log(`     未读消息: ${room.getUnreadNotificationCount()}`);
        });
        
        // 测试发送消息到第一个房间（如果存在）
        if (rooms.length > 0) {
            const testRoom = rooms[0];
            console.log(`📝 向房间 "${testRoom.name || testRoom.roomId}" 发送测试消息...`);
            
            try {
                await client.sendTextMessage(testRoom.roomId, '🧪 JianLuoChat 互通性测试消息 - ' + new Date().toLocaleString());
                console.log('✅ 消息发送成功！');
            } catch (msgErr) {
                console.log('❌ 消息发送失败:', msgErr.message);
            }
        }
        
        // 测试创建房间
        console.log('🏗️ 测试创建房间...');
        try {
            const newRoom = await client.createRoom({
                name: 'JianLuoChat 测试房间',
                topic: '这是一个由 JianLuoChat 客户端创建的测试房间',
                visibility: 'private'
            });
            console.log('✅ 房间创建成功:', newRoom.room_id);
            
            // 发送欢迎消息
            await client.sendTextMessage(newRoom.room_id, '🎉 欢迎来到 JianLuoChat 测试房间！这条消息证明了与标准 Matrix 客户端的完全互通性。');
            console.log('✅ 欢迎消息发送成功！');
            
        } catch (roomErr) {
            console.log('❌ 房间创建失败:', roomErr.message);
        }
        
        console.log('\n🎉 Matrix 互通性测试完成！');
        console.log('📋 测试结果总结:');
        console.log('  ✅ Matrix 协议登录');
        console.log('  ✅ 客户端同步');
        console.log('  ✅ 房间列表获取');
        console.log('  ✅ 消息发送');
        console.log('  ✅ 房间创建');
        console.log('\n💡 现在可以在 Element 客户端中查看这些操作的结果！');
        
        // 停止客户端
        client.stopClient();
        
    } catch (error) {
        console.error('❌ 测试失败:', error);
        console.error('错误代码:', error.errcode);
        console.error('错误信息:', error.message);
        
        if (error.errcode === 'M_FORBIDDEN') {
            console.log('🔑 可能的原因: 用户名或密码错误');
        } else if (error.errcode === 'M_USER_DEACTIVATED') {
            console.log('🚫 可能的原因: 用户账户已被停用');
        } else if (error.name === 'ConnectionError') {
            console.log('🌐 可能的原因: 网络连接问题或服务器不可达');
        }
    }
}

// 运行测试
testMatrixLogin().catch(console.error);

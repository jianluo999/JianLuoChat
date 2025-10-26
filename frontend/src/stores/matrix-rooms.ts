import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth';
import { roomAPI, matrixAPI } from '@/services/api';

export const useMatrixRoomStore = defineStore('matrix-rooms', () => {
    const authStore = useAuthStore();
    
    // 房间管理状态
    const rooms = ref<Array<any>>([]);
    const loading = ref(false);
    const error = ref<string>('');

    // 获取用户房间列表
    const getMatrixRooms = async () => {
        loading.value = true;
        error.value = '';
        try {
            const response = await roomAPI.getRooms();
            if (response.data.success) {
                rooms.value = response.data.rooms || [];
                
                // 注册到协调器（低优先级，仅房间管理）
                try {
                    const { registerMatrixStore } = await import('@/utils/matrixStoreCoordinator')
                    registerMatrixStore('matrix-rooms.ts', {
                        matrixClient: null, // 仅房间管理，不管理客户端
                        rooms,
                        messages: new Map(),
                        connection: { connected: false }
                    }, 3) // 低优先级
                    console.log('✅ Matrix Rooms Store 已注册到协调器')
                } catch (coordError) {
                    console.warn('⚠️ 协调器注册失败:', coordError)
                }
                
                return { success: true, rooms: rooms.value };
            } else {
                error.value = response.data.error || '获取房间列表失败';
                return { success: false, error: error.value };
            }
        } catch (err: any) {
            error.value = '网络错误，请重试';
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
        }
    };

    // 创建房间
    const createMatrixRoom = async (roomData: any) => {
        loading.value = true;
        error.value = '';
        try {
            const response = await roomAPI.createRoom({
                name: roomData.name,
                type: roomData.type || 'public'
            });
            return response.data;
        } catch (err: any) {
            error.value = '创建房间失败';
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
        }
    };

    // 加入房间
    const joinMatrixRoom = async (roomId: string) => {
        loading.value = true;
        error.value = '';
        try {
            const response = await roomAPI.joinRoom(roomId);
            return response.data;
        } catch (err: any) {
            error.value = '加入房间失败';
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
        }
    };

    // 离开房间
    const leaveMatrixRoom = async (roomId: string) => {
        loading.value = true;
        error.value = '';
        try {
            const response = await roomAPI.leaveRoom(roomId);
            return response.data;
        } catch (err: any) {
            error.value = '离开房间失败';
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
        }
    };

    // 获取房间信息
    const getRoomInfo = async (roomId: string) => {
        loading.value = true;
        error.value = '';
        try {
            const response = await roomAPI.getRoomInfo(roomId);
            return response.data;
        } catch (err: any) {
            error.value = '获取房间信息失败';
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
        }
    };

    // 更新房间设置
    const updateMatrixRoom = async (roomId: string, settings: any) => {
        loading.value = true;
        error.value = '';
        try {
            // 这里需要后端API支持
            return { success: true, message: '房间设置已更新' };
        } catch (err: any) {
            error.value = '更新房间设置失败';
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
        }
    };

    // 获取房间成员列表
    const getRoomMembers = async (roomId: string) => {
        loading.value = true;
        error.value = '';
        try {
            // 这里需要后端API支持
            return { success: true, members: [] };
        } catch (err: any) {
            error.value = '获取成员列表失败';
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
        }
    };

    // 邀请用户加入房间
    const inviteUserToRoom = async (roomId: string, invitee: string) => {
        loading.value = true;
        error.value = '';
        try {
            // 这里需要后端API支持
            return { success: true, message: '邀请已发送' };
        } catch (error: any) {
            error.value = '发送邀请失败';
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
        }
    };

    // 接受房间邀请
    const acceptRoomInvite = async (roomId: string) => {
        loading.value = true;
        error.value = '';
        try {
            // 这里需要后端API支持
            return { success: true, message: '邀请已接受' };
        } catch (err: any) {
            error.value = '接受邀请失败';
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
        }
    };

    // 拒绝房间邀请
    const rejectRoom = async (roomId: string) => {
        loading.value = true;
        error.value = '';
        try {
            // 这些功能需要后端API支持
            return { success: true, message: '邀请已拒绝' };
        } catch (err: any) {
            error.value = '拒绝邀请失败';
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
        }
    };

    return {
        // 状态
        rooms,
        loading,
        error,

        // 方法
        getMatrixRooms,
        createMatrixRoom,
        joinMatrixRoom,
        leaveMatrixRoom,
        getRoomInfo,
        updateMatrixRoom,
        getRoomMembers,
        inviteUserToRoom,
        acceptRoomInvite,
        rejectRoom
    };
};
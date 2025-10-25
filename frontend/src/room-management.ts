// 房间管理功能
import { ref } from 'vue'
import { roomAPI } from '@/services/api'

// 获取用户房间列表
export const getMatrixRooms = async () => {
  try {
    const response = await roomAPI.getRooms()
    return response.data
  } catch (error) {
    console.error('获取房间列表失败:', error)
    return { success: false, error: '获取房间列表失败' }
  }
}

// 创建房间
export const createMatrixRoom = async (roomData: { name: string; type?: string; description?: string }) => {
  try {
    const response = await roomAPI.createRoom(roomData)
    return response.data
  } catch (error) {
    console.error('创建房间失败:', error)
    return { success: false, error: '创建房间失败' }
  }
}

// 加入房间
export const joinRoom = async (roomId: string) => {
  try {
    const response = await roomAPI.joinRoom(roomId)
    return response.data
  } catch (error) {
    console.error('加入房间失败:', error)
    return { success: false, error: '加入房间失败' }
  }
}

// 离开房间
export const leaveRoom = async (roomId: string) => {
  try {
    const response = await roomAPI.leaveRoom(roomId)
    return response.data
  } catch (error) {
    console.error('离开房间失败:', error)
    return { success: false, error: '离开房间失败' }
  }
}

// 获取房间信息
export const getRoom = async (roomId: string) => {
  try {
    const response = await roomAPI.getRoom(roomId)
    return response.data
  } catch (error) {
    console.error('获取房间信息失败:', error)
    return { success: false, error: '获取房间信息失败' }
  }
}

// 更新房间设置
export const updateRoom = async (roomId: string, settings: any) => {
  try {
    const response = await roomAPI.updateRoom(roomId, settings)
    return response.data
  } catch (error) {
    console.error('更新房间设置失败:', error)
    return { success: false, error: '更新房间设置失败' }
  }
}

// 获取房间成员列表
export const getRoomMembers = async (roomId: string) => {
  try {
    const response = await roomAPI.getRoomMembers(roomId)
    return response.data
  } catch (error) {
    console.error('获取成员列表失败:', error)
    return { success: false, error: '获取成员列表失败' }
  }
}

// 邀请用户
export const inviteUser = async (roomId: string, invitee: string) => {
  try {
    const response = await roomAPI.inviteUser(roomId, invitee)
    return response.data
  } catch (error) {
    console.error('邀请用户失败:', error)
    return { success: false, error: '邀请用户失败' }
  }
}

// 接受邀请
export const acceptInvitation = async (roomId: string) => {
  try {
    const response = await roomAPI.acceptInvitation(roomId)
    return response.data
  } catch (error) {
    console.error('接受邀请失败:', error)
    return { success: false, error: '接受邀请失败' }
  }
}

// 拒绝邀请
export const rejectInvitation = async (roomId: string) => {
  try {
    const response = await roomAPI.rejectInvitation(roomId)
    return response.data
  } catch (error) {
    console.error('拒绝邀请失败:', error)
    return { success: false, error: '拒绝邀请失败' }
  }
}
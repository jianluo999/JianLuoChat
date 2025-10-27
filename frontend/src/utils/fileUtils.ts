/**
 * 文件工具函数
 */

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileIcon = (filename: string, mimeType?: string): string => {
  if (!filename && !mimeType) return '📄'
  
  const ext = filename ? filename.split('.').pop()?.toLowerCase() : ''
  const type = mimeType?.toLowerCase() || ''
  
  // 图片文件
  if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
    return '🖼️'
  }
  
  // 视频文件
  if (type.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext || '')) {
    return '🎥'
  }
  
  // 音频文件
  if (type.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext || '')) {
    return '🎵'
  }
  
  // 文档文件
  if (['pdf'].includes(ext || '') || type.includes('pdf')) {
    return '📕'
  }
  
  if (['doc', 'docx'].includes(ext || '') || type.includes('word')) {
    return '📘'
  }
  
  if (['xls', 'xlsx'].includes(ext || '') || type.includes('sheet')) {
    return '📗'
  }
  
  if (['ppt', 'pptx'].includes(ext || '') || type.includes('presentation')) {
    return '📙'
  }
  
  // 压缩文件
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
    return '🗜️'
  }
  
  // 代码文件
  if (['js', 'ts', 'html', 'css', 'py', 'java', 'cpp', 'c', 'php'].includes(ext || '')) {
    return '💻'
  }
  
  // 默认文件图标
  return '📄'
}

export const isImageFile = (filename: string, mimeType?: string): boolean => {
  const ext = filename ? filename.split('.').pop()?.toLowerCase() : ''
  const type = mimeType?.toLowerCase() || ''
  
  return type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')
}

export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
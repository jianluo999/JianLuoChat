import { createI18n } from 'vue-i18n'

// 中文语言包
const zh = {
  common: {
    username: '用户名',
    password: '密码',
    email: '邮箱',
    displayName: '显示名称',
    login: '登录',
    register: '注册',
    cancel: '取消',
    confirm: '确认',
    loading: '加载中...',
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '信息'
  },
  login: {
    title: '连接到矩阵',
    subtitle: '进入 JianluoChat 聊天世界',
    usernamePlaceholder: '输入用户名',
    passwordPlaceholder: '输入密码',
    loginButton: '连接到矩阵',
    registerLink: '新用户？创建矩阵账户',
    loginSuccess: '登录成功',
    loginFailed: '登录失败',
    systemStatus: '系统状态',
    matrixProtocol: '矩阵协议',
    federationEnabled: '联邦已启用',
    encryptionActive: '加密已激活',
    worldChannel: '世界频道',
    privateRooms: '私人房间',
    userOnline: '用户在线'
  },
  register: {
    title: '创建矩阵账户',
    subtitle: '加入 JianluoChat 开始聊天',
    usernamePlaceholder: '请输入用户名',
    emailPlaceholder: '请输入邮箱地址',
    displayNamePlaceholder: '请输入显示名称（可选）',
    passwordPlaceholder: '请输入密码',
    confirmPasswordPlaceholder: '请再次输入密码',
    registerButton: '创建账户',
    loginLink: '已有账号？立即登录',
    registerSuccess: '注册成功',
    registerFailed: '注册失败',
    passwordMismatch: '两次输入的密码不一致',
    usernameRequired: '请输入用户名',
    usernameLength: '用户名长度在 3 到 20 个字符',
    usernamePattern: '用户名只能包含字母、数字和下划线',
    emailRequired: '请输入邮箱地址',
    emailInvalid: '请输入正确的邮箱地址',
    displayNameLength: '显示名称不能超过 50 个字符',
    passwordRequired: '请输入密码',
    passwordLength: '密码长度不能少于 6 个字符',
    confirmPasswordRequired: '请确认密码'
  },
  chat: {
    worldChannel: '世界频道',
    privateRooms: '私人房间',
    sendMessage: '发送消息',
    messagePlaceholder: '输入消息...',
    online: '在线',
    offline: '离线',
    worldChannelWelcome: '欢迎来到世界频道！这是一个全球公共聊天空间。',
    globalChannel: '全球公共频道'
  },
  matrix: {
    realLogin: {
      title: 'Matrix 协议登录',
      subtitle: '使用真正的 Matrix 账户登录去中心化网络',
      matrixId: 'Matrix ID',
      usernamePlaceholder: '用户名',
      homeserverPlaceholder: 'matrix.org',
      password: '密码',
      passwordPlaceholder: '输入密码',
      popularServers: '热门服务器：',
      login: '登录',
      connecting: '连接中...',
      noAccount: '没有 Matrix 账户？',
      registerElement: '在 Element 上注册',
      learnMore: '了解更多关于 Matrix',
      errors: {
        invalidCredentials: '用户名或密码错误',
        userDeactivated: '账户已被停用',
        connectionFailed: '无法连接到服务器 {server}',
        loginFailed: '登录失败：{message}'
      }
    },
    federated: '联邦',
    protocol: 'Matrix 协议'
  }
}

// 英文语言包
const en = {
  common: {
    username: 'Username',
    password: 'Password',
    email: 'Email',
    displayName: 'Display Name',
    login: 'Login',
    register: 'Register',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info'
  },
  login: {
    title: 'CONNECT TO MATRIX',
    subtitle: 'Enter JianluoChat World',
    usernamePlaceholder: 'Enter username',
    passwordPlaceholder: 'Enter password',
    loginButton: 'CONNECT TO MATRIX',
    registerLink: 'NEW USER? CREATE MATRIX ACCOUNT',
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed',
    systemStatus: 'SYSTEM STATUS',
    matrixProtocol: 'Matrix Protocol',
    federationEnabled: 'Federation Enabled',
    encryptionActive: 'Encryption Active',
    worldChannel: 'World Channel',
    privateRooms: 'Private Rooms',
    userOnline: 'Users Online'
  },
  register: {
    title: 'CREATE MATRIX ACCOUNT',
    subtitle: 'Join JianluoChat to Start Chatting',
    usernamePlaceholder: 'Enter username',
    emailPlaceholder: 'Enter email address',
    displayNamePlaceholder: 'Enter display name (optional)',
    passwordPlaceholder: 'Enter password',
    confirmPasswordPlaceholder: 'Confirm password',
    registerButton: 'CREATE ACCOUNT',
    loginLink: 'Already have an account? Login now',
    registerSuccess: 'Registration successful',
    registerFailed: 'Registration failed',
    passwordMismatch: 'Passwords do not match',
    usernameRequired: 'Please enter username',
    usernameLength: 'Username length should be 3 to 20 characters',
    usernamePattern: 'Username can only contain letters, numbers and underscores',
    emailRequired: 'Please enter email address',
    emailInvalid: 'Please enter a valid email address',
    displayNameLength: 'Display name cannot exceed 50 characters',
    passwordRequired: 'Please enter password',
    passwordLength: 'Password length cannot be less than 6 characters',
    confirmPasswordRequired: 'Please confirm password'
  },
  chat: {
    worldChannel: 'World Channel',
    privateRooms: 'Private Rooms',
    sendMessage: 'Send Message',
    messagePlaceholder: 'Type a message...',
    online: 'Online',
    offline: 'Offline',
    worldChannelWelcome: 'Welcome to the World Channel! This is a global public chat space.',
    globalChannel: 'Global Public Channel'
  },
  matrix: {
    realLogin: {
      title: 'Matrix Protocol Login',
      subtitle: 'Login with real Matrix account to decentralized network',
      matrixId: 'Matrix ID',
      usernamePlaceholder: 'username',
      homeserverPlaceholder: 'matrix.org',
      password: 'Password',
      passwordPlaceholder: 'Enter password',
      popularServers: 'Popular servers:',
      login: 'Login',
      connecting: 'Connecting...',
      noAccount: 'Don\'t have a Matrix account?',
      registerElement: 'Register on Element',
      learnMore: 'Learn more about Matrix',
      errors: {
        invalidCredentials: 'Invalid username or password',
        userDeactivated: 'Account has been deactivated',
        connectionFailed: 'Failed to connect to server {server}',
        loginFailed: 'Login failed: {message}'
      }
    },
    federated: 'Federated',
    protocol: 'Matrix Protocol'
  }
}

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'zh',
  fallbackLocale: 'en',
  messages: {
    zh,
    en
  }
})

export default i18n

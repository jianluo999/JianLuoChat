// 数据库恢复路由配置
import DatabaseRecoveryPage from '@/pages/DatabaseRecoveryPage.vue';

const databaseRecoveryRoutes = [
  {
    path: '/database-recovery',
    name: 'DatabaseRecovery',
    component: DatabaseRecoveryPage,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: '数据库恢复管理',
      icon: 'fas fa-database'
    }
  }
];

export default databaseRecoveryRoutes;
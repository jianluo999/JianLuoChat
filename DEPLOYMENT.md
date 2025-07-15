# Deployment Guide / 部署指南

This guide covers different deployment options for JianLuoChat.  
本指南涵盖了简络聊的不同部署选项。

## English

### 🐳 Docker Deployment (Recommended)

#### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

#### Quick Start
```bash
# Clone the repository
git clone https://github.com/yourusername/jianluochat.git
cd jianluochat

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Docker Compose Configuration
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: jianluochat
      POSTGRES_USER: jianluochat
      POSTGRES_PASSWORD: jianluochat123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/jianluochat
      SPRING_REDIS_HOST: redis
    depends_on:
      - postgres
      - redis
    ports:
      - "8080:8080"

  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: http://localhost:8080/api
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 🚀 Production Deployment

#### 1. Environment Variables
Create `.env` file:
```env
# Database
POSTGRES_DB=jianluochat
POSTGRES_USER=jianluochat
POSTGRES_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=86400000

# Matrix
MATRIX_HOMESERVER=https://matrix.org

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

#### 2. SSL/TLS Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### 3. Health Checks
```yaml
# Add to docker-compose.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### 📊 Monitoring

#### Application Metrics
- Spring Boot Actuator endpoints
- Prometheus metrics
- Grafana dashboards

#### Log Management
```yaml
logging:
  level:
    com.jianluochat: INFO
    org.springframework.security: DEBUG
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: /var/log/jianluochat/application.log
```

### 🔧 Troubleshooting

#### Common Issues
1. **Database Connection Failed**
   - Check PostgreSQL service status
   - Verify connection string
   - Ensure database exists

2. **Matrix Login Issues**
   - Verify homeserver URL
   - Check network connectivity
   - Review Matrix credentials

3. **Frontend Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify environment variables

---

## 中文

### 🐳 Docker 部署（推荐）

#### 环境要求
- Docker 20.10+
- Docker Compose 2.0+

#### 快速开始
```bash
# 克隆仓库
git clone https://github.com/yourusername/jianluochat.git
cd jianluochat

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 🚀 生产环境部署

#### 1. 环境变量配置
创建 `.env` 文件：
```env
# 数据库
POSTGRES_DB=jianluochat
POSTGRES_USER=jianluochat
POSTGRES_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=86400000

# Matrix
MATRIX_HOMESERVER=https://matrix.org

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

#### 2. SSL/TLS 配置
使用 Nginx 反向代理配置 HTTPS

#### 3. 健康检查
添加应用健康检查监控

### 📊 监控

#### 应用指标
- Spring Boot Actuator 端点
- Prometheus 指标
- Grafana 仪表板

#### 日志管理
配置结构化日志输出

### 🔧 故障排除

#### 常见问题
1. **数据库连接失败**
   - 检查 PostgreSQL 服务状态
   - 验证连接字符串
   - 确保数据库存在

2. **Matrix 登录问题**
   - 验证家庭服务器 URL
   - 检查网络连接
   - 审查 Matrix 凭据

3. **前端构建错误**
   - 清除 node_modules 并重新安装
   - 检查 Node.js 版本兼容性
   - 验证环境变量

---

## 📞 Support / 技术支持

For deployment issues, please:
如遇部署问题，请：

- Check the [troubleshooting section](#troubleshooting) / 查看[故障排除部分](#故障排除)
- Search [existing issues](https://github.com/yourusername/jianluochat/issues) / 搜索[现有问题](https://github.com/yourusername/jianluochat/issues)
- Create a [new issue](https://github.com/yourusername/jianluochat/issues/new) / 创建[新问题](https://github.com/yourusername/jianluochat/issues/new)

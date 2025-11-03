# PostgreSQL 嵌入式数据库

这个目录包含Matrix聊天客户端的嵌入式PostgreSQL数据库。

## 重要提示

由于PostgreSQL数据库文件较大（约100MB+），在实际部署时需要：

1. **手动下载PostgreSQL**: 从 https://www.enterprisedb.com/downloads/postgres-postgresql-downloads 下载Windows版本
2. **解压到此目录**: 确保包含bin/、share/、lib/等目录
3. **包含的文件**:
   - start-postgres.bat - 自动启动脚本
   - README.md - 说明文件

## 目录结构

```
postgres/
├── bin/                    # PostgreSQL可执行文件
│   ├── postgres.exe       # PostgreSQL服务器
│   ├── initdb.exe         # 数据库初始化工具
│   └── ...
├── share/                 # PostgreSQL共享文件
├── lib/                   # PostgreSQL库文件
├── data/                  # 数据库数据目录（运行时生成）
├── start-postgres.bat     # 自动启动脚本
└── README.md             # 说明文件
```

## 使用方法

应用启动时会自动：
1. 检查PostgreSQL是否已安装
2. 如果没有，提示用户下载
3. 自动启动PostgreSQL服务
4. 连接数据库并启动应用

## 注意事项

- 首次运行需要下载完整的PostgreSQL
- 后续运行会自动使用已安装的数据库
- 数据库文件会自动初始化
- 应用关闭时会自动停止数据库服务
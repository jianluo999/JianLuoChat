# Git LFS配置指南

## 📋 概述

Git LFS (Large File Storage) 是Git的扩展，用于管理大型文件。当您的项目包含大文件（如PostgreSQL数据库文件、Redis可执行文件、构建输出等）时，使用Git LFS可以避免仓库变得过于臃肿。

## 🚀 为什么需要Git LFS

### 问题
- **仓库膨胀**: 大文件直接存储在Git中会使仓库体积迅速增长
- **克隆缓慢**: 克隆包含大文件的仓库需要很长时间
- **协作困难**: 大文件会拖慢团队协作效率
- **存储浪费**: Git会为每个版本保存完整的文件副本

### 解决方案
- **高效存储**: Git LFS只在Git中存储指针，实际文件存储在LFS服务器中
- **快速克隆**: 克隆时只下载指针，按需下载大文件
- **版本控制**: 大文件仍然保持完整的版本控制
- **团队协作**: 提高团队协作效率

## 📦 已配置的LFS文件类型

### 数据库相关
- `electron/postgres-full/bin/icudt67.dll` (28MB)
- `electron/postgres-full/bin/icuin67.dll` (2.6MB)
- `electron/postgres-full/bin/libcrypto-3-x64.dll` (4.5MB)
- `electron/redis-full/bin/redis-server.exe` (1.8MB)

### 构建输出
- `electron/dist/*.exe` (700MB+)
- 安装包和压缩文件

### 其他大文件
- 日志文件 (.log)
- 数据库文件 (.db, .sqlite)
- 备份文件 (.bak, .backup)
- 媒体文件 (图片、视频、音频)
- 机器学习模型文件
- 字体文件

## 🔧 设置步骤

### 1. 安装Git LFS

```bash
# Windows
git lfs install

# macOS
brew install git-lfs
git lfs install

# Linux
# Ubuntu/Debian
sudo apt-get install git-lfs
git lfs install

# CentOS/RHEL
sudo yum install git-lfs
git lfs install
```

### 2. 验证安装

```bash
git lfs version
# 应该显示类似: git-lfs/3.0.2 (GitHub; windows amd64; go 1.16.2)
```

### 3. 初始化LFS

```bash
# 在项目根目录执行
git lfs install
```

### 4. 检查LFS状态

```bash
# 查看当前LFS配置
git lfs ls-files

# 查看LFS跟踪的文件
git lfs status
```

## 📋 常用命令

### 添加新文件到LFS

```bash
# 添加特定文件
git lfs track "path/to/large-file.exe"

# 添加文件类型
git lfs track "*.psd"
git lfs track "*.mp4"

# 查看当前跟踪的模式
git lfs track
```

### 移除文件从LFS

```bash
# 停止跟踪特定文件
git lfs untrack "path/to/file.exe"

# 从Git历史中完全移除大文件（谨慎使用）
git filter-branch --tree-filter 'rm -f path/to/large-file.exe' HEAD
```

### 文件操作

```bash
# 下载LFS文件
git lfs pull

# 上传LFS文件
git add .
git commit -m "Add LFS files"
git push

# 强制下载所有LFS文件
git lfs fetch --all
git lfs checkout
```

### 状态检查

```bash
# 查看LFS仓库信息
git lfs env

# 查看LFS文件状态
git lfs status

# 查看已下载的LFS文件
git lfs ls-files
```

## 🎯 最佳实践

### 1. 文件分类
- **LFS文件**: >10MB的文件
- **Git文件**: <10MB的文本文件、代码文件
- **忽略文件**: 临时文件、构建输出

### 2. 提交策略
```bash
# 小文件频繁提交
git add small-file.js
git commit -m "Fix bug"

# 大文件批量提交
git add large-file.exe
git commit -m "Add large binary file"
```

### 3. 分支管理
```bash
# 开发分支包含LFS文件
git checkout develop
git lfs pull

# 发布分支确保LFS文件完整
git checkout release
git lfs pull --recent
```

## ⚠️ 注意事项

### 1. 网络要求
- LFS文件需要网络连接下载
- 首次克隆后需要额外的LFS拉取

### 2. 存储配额
- GitHub免费账户: 1GB存储 + 1GB带宽/月
- 企业账户有更高配额
- 超出配额需要付费

### 3. 团队协作
```bash
# 新成员加入时
git clone <repository>
git lfs install
git lfs pull
```

### 4. CI/CD集成
```yaml
# GitHub Actions示例
- name: Install Git LFS
  run: git lfs install
  
- name: Pull LFS files
  run: git lfs pull
```

## 🔍 故障排除

### 常见问题

1. **LFS文件未下载**
   ```bash
   git lfs pull
   ```

2. **LFS文件损坏**
   ```bash
   git lfs fsck
   git lfs pull --force
   ```

3. **LFS配置丢失**
   ```bash
   git lfs install
   git lfs track  # 重新应用.gitattributes
   ```

4. **网络连接问题**
   ```bash
   git lfs env  # 检查LFS配置
   git config --get lfs.url  # 检查LFS服务器地址
   ```

### 诊断命令

```bash
# 检查LFS环境
git lfs env

# 检查特定文件状态
git lfs ls-files | grep filename

# 强制重新下载
git lfs pull --force
```

## 📊 监控和管理

### 查看LFS使用情况

```bash
# 查看LFS文件统计
git lfs ls-files | wc -l  # 文件数量
git lfs ls-files --size    # 文件大小统计
```

### 清理LFS缓存

```bash
# 清理未使用的LFS对象
git lfs prune

# 强制清理所有缓存
git lfs prune --force
```

## 🎉 总结

通过配置Git LFS，您的jilouchat项目现在可以：
- ✅ 有效管理大型二进制文件
- ✅ 保持Git仓库的轻量级
- ✅ 提高团队协作效率
- ✅ 确保完整的版本控制
- ✅ 优化CI/CD流程

**重要提醒**: 请确保所有团队成员都安装并配置了Git LFS，以免出现文件缺失问题。
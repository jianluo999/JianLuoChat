# Git LFS 配置指南

## 📋 概述

本文档详细记录了如何配置和使用 Git LFS (Large File Storage) 来解决 GitHub 大文件推送限制问题。

## 🚨 问题描述

在推送代码到 GitHub 时遇到以下错误：

```
remote: warning: File backend/target/jianluochat-backend-1.0.0.jar is 63.93 MB; this is larger than GitHub's recommended maximum file size of 50.00 MB
remote: error: File electron/dist/Matrix聊天客户端 Setup 1.0.0.exe is 158.46 MB; this exceeds GitHub's file size limit of 100.00 MB
remote: error: GH001: Large files detected. You may want to try Git Large File Storage - https://git-lfs.github.com.
```

## 🔧 解决方案

### 1. 检查 Git LFS 安装状态

```bash
# 检查 Git LFS 是否已安装
git lfs --version
```

**预期输出：**
```
git-lfs/3.7.0 (GitHub; windows amd64; go 1.24.4; git 92dddf56)
```

### 2. 安装/重置 Git LFS

```bash
# 重置 Git LFS 配置（如果存在配置问题）
git lfs install --force
```

**预期输出：**
```
Updated Git hooks.
Git LFS initialized.
```

### 3. 配置 Git LFS 跟踪规则

```bash
# 跟踪 JAR 文件
git lfs track "*.jar"

# 跟踪 EXE 文件
git lfs track "*.exe"
```

**预期输出：**
```
Tracking "*.jar"
Tracking "*.exe"
```

### 4. 验证跟踪配置

```bash
# 查看当前跟踪的文件类型
git lfs track
```

**预期输出：**
```
Listing tracked patterns
    *.jar (.gitattributes)
    *.exe (.gitattributes)
Listing excluded patterns
```

### 5. 清理 Git 历史记录

由于远程仓库中已存在超过限制的文件，需要从历史记录中移除：

```bash
# 设置警告抑制（Windows）
set FILTER_BRANCH_SQUELCH_WARNING=1

# 从历史记录中移除大文件
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch \"electron/dist/Matrix聊天客户端 Setup 1.0.0.exe\"" --prune-empty --tag-name-filter cat -- --all
```

**关键步骤说明：**
- `--force`: 强制执行过滤
- `--index-filter`: 只修改索引，不处理工作目录
- `git rm --cached --ignore-unmatch`: 从索引中移除文件，忽略不存在的文件
- `--prune-empty`: 删除空的提交
- `--tag-name-filter cat`: 更新标签引用
- `-- --all`: 处理所有分支

### 6. 清理 Git 仓库

```bash
# 清理原始引用
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin

# 清理引用日志
git reflog expire --expire=now --all

# 垃圾回收
git gc --prune=now
```

### 7. 强制推送清理后的历史记录

```bash
# 强制推送所有分支
git push origin --force --all

# 强制推送所有标签
git push origin --force --tags

# 设置上游跟踪并推送
git push -u origin master
```

### 8. 验证 Git LFS 状态

```bash
# 查看当前 LFS 跟踪的文件
git lfs ls-files
```

**预期输出：**
```
2db75c4078 * android/gradle/wrapper/gradle-wrapper.jar
1f1c70ddc0 * backend/target/jianluochat-backend-1.0.0.jar
2db75c4078 * frontend/android/gradle/wrapper/gradle-wrapper.jar
```

## 📁 生成的配置文件

### .gitattributes

```gitattributes
*.jar filter=lfs diff=lfs merge=lfs -text
*.exe filter=lfs diff=lfs merge=lfs -text
```

**说明：**
- `filter=lfs`: 使用 LFS 过滤器
- `diff=lfs`: 使用 LFS 差异比较
- `merge=lfs`: 使用 LFS 合并策略
- `-text`: 标记为二进制文件，不进行文本处理

## 🚀 后续使用指南

### 添加新的大文件

```bash
# 强制添加大文件到 Git LFS
git add -f large-file.jar

# 提交更改
git commit -m "Add large file via LFS: large-file.jar"

# 推送（LFS 会自动处理大文件）
git push
```

### 查看 LFS 状态

```bash
# 查看 LFS 状态
git lfs status

# 列出所有 LFS 跟踪的文件
git lfs ls-files

# 查看 LFS 对象信息
git lfs objects
```

### LFS 存储使用情况

```bash
# 查看 LFS 存储使用情况
git lfs status

# 查看远程存储使用情况（需要 GitHub 账户）
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
     https://api.github.com/repos/username/repo/lfs/objects
```

## ⚠️ 注意事项

1. **历史记录修改风险**：`git filter-branch` 会重写历史记录，强制推送会影响所有协作者
2. **协作影响**：执行此操作后，其他协作者需要重新克隆仓库
3. **备份建议**：在执行历史记录清理前，建议备份当前仓库
4. **文件大小限制**：GitHub LFS 免费账户有 1GB 月度带宽限制

## 🔍 故障排除

### 问题1：Git LFS 未正确安装

**解决方法：**
```bash
# 卸载并重新安装 Git LFS
git lfs uninstall
git lfs install --force
```

### 问题2：推送时仍遇到大文件错误

**解决方法：**
```bash
# 检查是否有未跟踪的大文件
git check-ignore path/to/large/file

# 强制添加到 LFS
git add -f path/to/large/file
```

### 问题3：协作者无法拉取 LFS 文件

**解决方法：**
```bash
# 确保协作者安装了 Git LFS
git lfs install

# 重新拉取 LFS 文件
git lfs pull
```

## 📊 配置验证清单

- [x] Git LFS 已正确安装
- [x] `.gitattributes` 文件已创建
- [x] 大文件已从历史记录中移除
- [x] 大文件已通过 LFS 跟踪
- [x] 代码已成功推送到远程仓库
- [x] LFS 状态正常工作

## 📞 支持

如果遇到任何问题，请参考：
- [Git LFS 官方文档](https://git-lfs.github.com/)
- [GitHub LFS 指南](https://docs.github.com/en/repositories/working-with-files/managing-large-files)
- [Git LFS 故障排除](https://github.com/git-lfs/git-lfs/wiki/Troubleshooting)
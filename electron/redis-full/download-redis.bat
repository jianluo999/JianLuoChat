@echo off
chcp 65001 >nul
echo 正在下载Redis for Windows...

:: 检查是否已经下载过
if exist "redis-server.exe" (
    echo Redis already downloaded.
    exit /b 0
)

:: 下载Redis Windows版本
echo Downloading Redis for Windows...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/tporadowski/redis/releases/download/v5.0.14/Redis-x64-5.0.14.msi' -OutFile 'redis-installer.msi'"

if errorlevel 1 (
    echo Redis download failed
    exit /b 1
)

echo Installing Redis...
msiexec /i redis-installer.msi /quiet /norestart ADDLOCAL=All

if errorlevel 1 (
    echo Redis installation failed
    exit /b 1
)

:: 复制Redis可执行文件到bin目录
copy "C:\Program Files\Redis\redis-server.exe" "bin\"
copy "C:\Program Files\Redis\redis-cli.exe" "bin\"
copy "C:\Program Files\Redis\redis-benchmark.exe" "bin\"
copy "C:\Program Files\Redis\redis-check-aof.exe" "bin\"
copy "C:\Program Files\Redis\redis-check-rdb.exe" "bin\"

:: 创建默认配置文件
echo Creating redis.conf...
echo port 6379 > conf\redis.conf
echo bind 127.0.0.1 >> conf\redis.conf
echo timeout 0 >> conf\redis.conf
echo tcp-keepalive 300 >> conf\redis.conf
echo loglevel notice >> conf\redis.conf
echo logfile "" >> conf\redis.conf
echo databases 16 >> conf\redis.conf
echo save 900 1 >> conf\redis.conf
echo save 300 10 >> conf\redis.conf
echo save 60 10000 >> conf\redis.conf
echo stop-writes-on-bgsave-error yes >> conf\redis.conf
echo rdbcompression yes >> conf\redis.conf
echo rdbchecksum yes >> conf\redis.conf
echo dbfilename dump.rdb >> conf\redis.conf
echo dir ./data >> conf\redis.conf
echo slave-serve-stale-data yes >> conf\redis.conf
echo slave-read-only yes >> conf\redis.conf
echo repl-diskless-sync no >> conf\redis.conf
echo repl-diskless-sync-delay 5 >> conf\redis.conf
echo repl-ping-slave-period 10 >> conf\redis.conf
echo repl-timeout 60 >> conf\redis.conf
echo repl-disable-tcp-nodelay no >> conf\redis.conf
echo repl-backlog-size 1mb >> conf\redis.conf
echo repl-backlog-ttl 3600 >> conf\redis.conf
echo maxclients 10000 >> conf\redis.conf
echo maxmemory 1gb >> conf\redis.conf
echo maxmemory-policy allkeys-lru >> conf\redis.conf
echo lazyfree-lazy-eviction no >> conf\redis.conf
echo lazyfree-lazy-expire no >> conf\redis.conf
echo lazyfree-lazy-server-del no >> conf\redis.conf
echo slave-lazy-flush no >> conf\redis.conf
echo appendonly no >> conf\redis.conf
echo appendfilename "appendonly.aof" >> conf\redis.conf
echo appendfsync everysec >> conf\redis.conf
echo no-appendfsync-on-rewrite no >> conf\redis.conf
echo auto-aof-rewrite-percentage 100 >> conf\redis.conf
echo auto-aof-rewrite-min-size 64mb >> conf\redis.conf
echo aof-load-truncated yes >> conf\redis.conf
echo aof-use-rdb-preamble no >> conf\redis.conf
echo lua-time-limit 5000 >> conf\redis.conf
echo slowlog-log-slower-than 10000 >> conf\redis.conf
echo slowlog-max-len 128 >> conf\redis.conf
echo latency-monitor-threshold 0 >> conf\redis.conf
echo notify-keyspace-events "" >> conf\redis.conf
echo hash-max-ziplist-entries 512 >> conf\redis.conf
echo hash-max-ziplist-value 64 >> conf\redis.conf
echo list-max-ziplist-size -2 >> conf\redis.conf
echo list-compress-depth 0 >> conf\redis.conf
echo set-max-intset-entries 512 >> conf\redis.conf
echo zset-max-ziplist-entries 128 >> conf\redis.conf
echo zset-max-ziplist-value 64 >> conf\redis.conf
echo hll-sparse-max-bytes 3000 >> conf\redis.conf
echo stream-node-max-bytes 4096 >> conf\redis.conf
echo stream-node-max-entries 100 >> conf\redis.conf
echo activerehashing yes >> conf\redis.conf
echo client-output-buffer-limit normal 0 0 0 >> conf\redis.conf
echo client-output-buffer-limit replica 256mb 64mb 60 >> conf\redis.conf
echo client-output-buffer-limit pubsub 32mb 8mb 60 >> conf\redis.conf
echo hz 10 >> conf\redis.conf
echo dynamic-hz yes >> conf\redis.conf
echo aof-rewrite-incremental-fsync yes >> conf\redis.conf
echo rdb-save-incremental-fsync yes >> conf\redis.conf

:: 创建数据目录
mkdir data

echo Redis安装完成！
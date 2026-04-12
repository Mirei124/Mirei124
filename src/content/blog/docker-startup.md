---
title: "docker入门"
pubDate: "2022-02-18T22:50"
updatedDate: "2022-02-20T01:03"
tags: ["Docker"]
category: "技术向"
---

# Docker

# 镜像加速器

`vi /etc/docker/daemon.json`

```powershell
"registry-mirrors": [
"https://mirror.baidubce.com",
"https://docker.mirrors.ustc.edu.cn",
"https://docker.io"
]
```

# 镜像

1. 获取镜像 `$ docker pull [选项] [Docker Registry 地址[:端口号]/]仓库名[:标签]`
2. 列出镜像 `docker image ls`
3. 查看镜像、容器、数据卷所占用的空间 `docker system df`
4. 删除无用虚悬镜像 `docker image prune`
5. 删除本地镜像 `$ docker image rm [选项] <镜像1> [<镜像2> ...]`

# 容器

1. 运行容器

   ```bash
   $ docker run -it --rm ubuntu:18.04 bash
   ```

2. 启动已终止容器 `docker container start`
3. 参数 `-d` 让容器后台运行
   1. 获取容器输出 `docker container logs`
4. 终止、重启容器 `docker container stop/restart`
5. 打开后台运行的容器 `docker exec`
6. 导出、导入 `docker export/import`
7. 删除 `docker container rm`
8. 清理掉所有处于终止状态的容器 `docker container prune`
9. 端口映射 `-p\-P IP:host_port:container_port`
10. 绑定目录 `docker run --mount type=bind,src=$PWD,dst=/etc,ro ...`

## 其他

> [Docker 从入门到实践](https://yeasy.gitbook.io/docker_practice/)

## 无法启动docker-desktop

```powershell
wsl --unregister docker-desktop
wsl --unregister docker-desktop-data
```

## vim 修改文件

设置选项 `set backupcopy=yes` or `set bkc=yes`

## 限制资源使用

```shell
docker update --cpus '3.5' --memory '8G' ID
```

# podman

镜像配置
阿里云：[aliyun podman mirror](https://cr.console.aliyun.com/cn-shenzhen/instances/mirrors)

```conf
unqualified-search-registries = ["docker.io"]

[[registry]]
prefix = "docker.io"
location = "xxxxxx.mirror.aliyuncs.com"
```

# 使用nvidia显卡

## 1. 安装 nvidia 驱动

## 2. 安装 docker-ce

[Install Docker Engine on Ubuntu | Docker Documentation](https://docs.docker.com/engine/install/ubuntu/#install-using-the-convenience-script)

## 3. 安装 Nvidia Docker 2.0

[Installation Guide — NVIDIA Cloud Native Technologies documentation](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html#docker)

## 4. 拉取 tensorflow 镜像

[Docker  |  TensorFlow](https://www.tensorflow.org/install/docker#examples_using_gpu-enabled_images)

## 5. 创建 Dockerfile

[Sample application | Docker Documentation](https://docs.docker.com/get-started/02_our_app/)

## 6. 补充。。。

[TensorFlow with GPU using Docker (and PyCharm) (josehoras.github.io)](https://josehoras.github.io/tensorflow-with-gpu-using-docker-and-pycharm/)

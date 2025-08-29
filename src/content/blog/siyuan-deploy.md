---
title: "思源笔记Docker部署"
pubDate: "2025-08-29T23:30"
updatedDate: "2025-08-29T23:30"
tags: ["Docker"]
category: "技术向"
---

记录一下使用Docker部署思源笔记的过程，这里选择用docker-compose.yml把思源笔记和反代服务集中到一起管理。首先是思源笔记部分：

```yml
name: siyuanAll

networks:
  net1:
    name: my-net1
    ipam:
      config:
        - subnet: "172.19.0.0/24"
          ip_range: "172.19.0.0/24"
          gateway: "172.19.0.1"

services:
  siyuan:
    image: b3log/siyuan
    restart: unless-stopped
    environment:
      PUID: 1000
      PGID: 1000
    # ports:
    #   - 6806:6806
    volumes:
      - $HOME/siyuan/workspace:/workspace
    command: ["--accessAuthCode=secret", "--workspace=/workspace", "--ssl=true"]
    networks:
      net1:
        ipv4_address: 172.19.0.2
```

这里创建了网络my-net1用来固定容器的IP,保证每次启动的IP是固定的，方便后面nginx反代的配置。笔记的所有数据都会保存到workspace里面，访问笔记的密码通过accessAuthCode选项设置。然后是反代部分：

```yml
nginx:
  image: "jc21/nginx-proxy-manager"
  restart: unless-stopped
  environment:
    PUID: 1000
    PGID: 1000
  ports:
    - 80:80
    - 443:443
    - 81:81
  volumes:
    - $HOME/siyuan/nginx_data:/data
    - $HOME/siyuan/letsencrypt:/etc/letsencrypt
  networks:
    net1:
      ipv4_address: 172.19.0.3
```

因为nginx可以配置的选项太多，这里为了简单直接使用nginx-proxy-manager生成反代配置。容器启动后访问81端口的管理后台设置proxy host即可。然后开始配置HTTPS，nginx-proxy-manager可以从let's encrypt生成证书，但是由于我这里只能通过IP地址进行访问，所以需要用下面的命令生成证书：

```bash
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout key.pem \
    -out cert.pem \
    -subj "/CN=example.com"
```

生成证书和密钥以后上传到nginx-proxy-manager中就可以用了。

配置完以后用curl测试发现HTTPS没法正常访问，经过一番搜索了解到，直接使用IP访问时curl没法像访问域名一样提供SNI信息，导致nginx出错。通过设置nginx配置中的default_server可以让nginx在没有匹配到server_name时使用默认的server_name，而不是报错。于是把原来的配置中 `listen 443 ssl;` 修改成 `listen 443 ssl default_server;` 以后就能正常访问了。

配置完成后用curl指定SNI信息进行测试：`curl https://DOMAIN.EXAMPLE --resolve 'DOMAIN.EXAMPLE:443:192.0.2.17'`，使用 `-k` 选项可以忽略证书错误。单独测试证书配置对不对需要使用 `openssl s_client -connect 1.2.3.4:443 -servername example.com` 看返回的证书和域名是否对应。

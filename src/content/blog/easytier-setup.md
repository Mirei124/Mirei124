---
title: "easytier 组网配置记录"
pubDate: "2026-01-14T21:00"
updatedDate: "2026-01-14T21:00"
tags: ["easytier", "network"]
category: "技术向"
---

最近有从校外访问校内服务器的需求，但是在Linux下不管是EasyConnect还是Atrust都不是很好用，然后刚好看到有[easytier](https://easytier.cn)这个强大的组网工具，于是尝试用它进行组网实现校外对校内服务器的访问，发现体验还不错，在这里记录一下配置的过程。

我这里的网络拓扑如下图所示，主要涉及三台主机，校内服务器A，用来转发流量的公网主机B，校外的也就是我正在使用的主机C：

```
  ┌-------------■-------------┐
  │          Host B           │
  │      203.0.113.10         │
  │      (具有公网IP)         │
  └----┬-------------┬--------┘
       │             │
       │             │
       │      ┌------■------┐
       │      │    Host C   │
       │      │ 203.0.148.11│
       │      └-------------┘
┌------│---------------------┐
│      │ 10.0.0.0/24         │
│ ┌----■----┐    ┌----■----┐ │
│ │ Host A  │    │ Host D  │ │
│ │ (内网)  │    │ (内网)  │ │
│ │10.0.0.2 │    │10.0.0.3 │ │
│ └---------┘    └---------┘ │
└----------------------------┘
```

## 安装easytier

首先在公网服务器B上安装easytier，使用wget下载easytier并解压，然后设置环境变量

```sh
wget https://github.com/EasyTier/EasyTier/releases/download/v2.4.5/easytier-linux-x86_64-v2.4.5.zip
sudo unzip easytier-linux-x86_64-v2.4.5.zip -d /usr/local/
sudo mv /usr/local/easytier-linux-x86_64 /usr/local/easytier
export PATH=/usr/local/easytier:$PATH
```

然后创建systemd service文件并重载配置，其中service文件是从[archlinuxcn仓库](https://github.com/archlinuxcn/repo/blob/178175de6a95f9bf8d92eb470a257d59d9265633/archlinuxcn/easytier/easytier.service)复制的：

```sh
sudo tee /etc/systemd/system/easytier.service <<EOF
[Unit]
Description=A simple, decentralized mesh VPN with WireGuard support.
After=network.target

[Service]
TimeoutStartSec=10s
Type=exec
ExecStart=/usr/bin/easytier-core -c /etc/easytier/config.toml
LimitNPROC=500
LimitNOFILE=1000000
Restart=on-failure
RestartSec=5s
WorkingDirectory=/var/lib/easytier

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
```

现在创建easytier的配置文件并保存到`/etc/easytier/config.toml`，配置文件可以用[生成器](https://easytier.cn/web/index.html#config_generator)生成：

```toml
hostname = "hostB"
instance_name = "easytier"
instance_id = "6b79d20d-20d3-4443-8b1c-37a74a001f7e"
dhcp = true
listeners = [
    "tcp://0.0.0.0:11010",
    "udp://0.0.0.0:11010",
    "wg://0.0.0.0:11011",
]

[network_identity]
network_name = "YourNetName"
network_secret = "YourNetPassWd"

# [[peer]]
# uri = "tcp://public.easytier.top:11010"

[flags]
enable_kcp_proxy = true
enable_quic_proxy = true
no_tun = true
```

这里需要设置自己的 `network_name` 和 `network_secret`，三台主机需要保持一致，同时需要设置防火墙放行11010,11011,11012端口。由于我这里只希望使用B主机转发流量，同时也防止easytier与其他工具冲突，在配置文件中设置了 `no_tun=true`。

然后启动并运行服务，主机B就配置好了：

```sh
systemctl enable --now easytier.service
```

## 配置内网主机A

然后用同样的方法在主机A上安装easytier并进行配置：

```toml
hostname = "hostA"
instance_name = "easytier"
instance_id = "6b79d20d-20d3-4443-8b1c-37a74a001f7e"
dhcp = true
listeners = [
    "tcp://0.0.0.0:11010",
    "udp://0.0.0.0:11010",
    "wg://0.0.0.0:11011",
]

[network_identity]
network_name = "YourNetName"
network_secret = "YourNetPassWd"

[[peer]]
uri = "tcp://203.0.113.10:11010"  # 主机B的IP

[[proxy_network]]
cidr = "10.0.0.0/24"

[flags]
enable_kcp_proxy = true
enable_quic_proxy = true
no_tun = true
```

这台主机没有访问主机B或C的需求（除easytier组网外），所以这里同样设置 `no_tun=true`，同时为了从主机C能够访问主机A所在的整个内网的所有主机，在这里配置了子网代理：`cidr = "10.0.0.0/24"`。然后启用并运行easytier服务。

## 配置主机C并连接

现在在主机C上进行同样的安装和配置：

```toml
hostname = "hostC"
instance_name = "easytier"
instance_id = "6b79d20d-20d3-4443-8b1c-37a74a001f7e"
dhcp = true
listeners = [
    "tcp://0.0.0.0:11010",
    "udp://0.0.0.0:11010",
    "wg://0.0.0.0:11011",
]

[network_identity]
network_name = "YourNetName"
network_secret = "YourNetPassWd"

[[peer]]
uri = "tcp://203.0.113.10:11010"  # 主机B的IP

[flags]
enable_kcp_proxy = true
enable_quic_proxy = true
```

这里启用了tun模式，启动easytier以后就可以像在学校里一样访问到主机A和学校内网里的主机D等所有主机了。

## 检查运行状态

使用 `easytier-cli peer` 命令可以看到所有组网成功的主机，`easytier-cli route` 能够看到当前的路由表以及下一跳的主机。

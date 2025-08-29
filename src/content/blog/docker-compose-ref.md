---
title: "docker compose reference"
pubDate: "2025-08-29T23:00"
updatedDate: "2025-08-29T23:00"
tags: ["Docker"]
category: "技术向"
---

```yaml
# COMPOSE_PROJECT_NAME
name: myapp

services:
  foo:
    image: busybox

  proxy:
    # [<registry>/][<project>/]<image>[:<tag>|@<digest>]
    image: nginx
    container_name: my-web-container
    # no always on-failure[:max-retries] unless-stopped
    restart: "no"
    # VOLUME:CONTAINER_PATH:ACCESS_MODE rw/ro/z/Z
    # z: SELinux option indicating that the bind mount host content is shared among multiple containers
    # Z: SELinux option indicating that the bind mount host content is private and unshared for other containers
    volumes:
      - type: volume
        source: db-data
        target: /data
        volume:
          nocopy: true
          subpath: sub
      - type: bind
        source: /var/run/postgres/postgres.sock
        target: /var/run/postgres/postgres.sock
    ports:
      - 80:80
      # HOST:CONTAINER should always be specified as a (quoted) string
      - "127.0.0.1:8001:8001"
    # When not explicitly set, tcp protocol is used. If the Dockerfile for the image already exposes ports, it is visible to other containers on the network even if expose is not set in your Compose file.
    expose:
      - "8000"
      - "8080-8085/tcp"
    env_file:
      # - ./a.env
      # or
      - path: ./a.env
        # allow file missing
        required: false
    # higher priority
    environment:
      - A=b
      - SHOW=true
      - USER_INPUT
    user: 0:0
    mem_limit: 1m
    mem_swappiness: 0
    # if memory="300m" and memswap_limit="1g", the container can use 300m of memory and 700m (1g - 300m) swap
    memswap_limit: 1m
    # number of usable CPUs
    cpu_count: 1
    # usable percentage of the available CPUs
    cpu_percent: 0.8
    # explicit CPUs in which to allow execution. Can be a range 0-3 or a list 0,1
    cpuset: 0-3
    # defines the networks that service containers are attached to
    networks:
      # - my
      my:
        # Specify a static IP address for a service container when joining the network
        # The corresponding network configuration in the top-level networks section must have an ipam attribute with subnet configurations covering each static address.
        ipv4_address: 172.16.238.10
        ipv6_address: 2001:3984:3989::10
        # declares alternative hostnames for the service on the network
        aliases:
          - alias1
    # host none service:{name} container:{name}
    network_mode: "host"
    # overrides default CMD
    command: echo "I'm running ${COMPOSE_PROJECT_NAME}"
    # overrides ENTRYPOINT
    entrypoint: /code/entrypoint.sh
    # mounts all of the volumes from another service or container
    volumes_from:
      - service_name
      - service_name:ro
      - container:container_name
      - container:container_name:rw
    depends_on:
      - backend
    # Configs allow services to adapt their behaviour without the need to rebuild a Docker image
    configs:
      - my_config
    dns:
      - 8.8.8.8
    # block io limit
    blkio_config:
      weight: 300
      weight_device:
        - path: /dev/sda
          weight: 400
      device_read_bps:
        - path: /dev/sdb
          rate: "12mb"
      device_read_iops:
        - path: /dev/sdb
          rate: 120
      device_write_bps:
        - path: /dev/sdb
          rate: "1024k"
      device_write_iops:
        - path: /dev/sdb
          rate: 30
    devices:
      # HOST_PATH:CONTAINER_PATH[:CGROUP_PERMISSIONS]
      - "/dev/ttyUSB0:/dev/ttyUSB0"
    dns_opt:
      - use-vc
    dns_search: example.com
    # can define a common set of service options in one place and refer to it from anywhere
    extends:
      file: common.yml
    # adds hostname mappings to the container network interface configuration
    extra_hosts:
      - "somehost=162.242.195.82"
    # specifies additional groups
    group_add:
      - mail
    # declares a check that's run to determine whether or not the service containers are "healthy"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 1m30s
      timeout: 10s
      retries: 3
      start_period: 40s
      start_interval: 5s
    # declares a custom host name
    hostname: xxx
    # runs an init process (PID 1) inside the container that forwards signals and reaps processes
    init: true
    oom_kill_disable: true
    # -1000 to 1000
    oom_score_adj: 1
    # This is the same as running a container with the -i flag
    stdin_open: true
    # how long Compose must wait when attempting to stop a container if it doesn't handle SIGTERM (or whichever stop signal has been specified with stop_signal), before sending SIGKILL
    stop_grace_period: 1m30s
    stop_signal: SIGUSR1
    sysctls:
      net.ipv4.tcp_syncookies: 0
    # mounts a temporary file system
    tmpfs:
      - /run
    # same as running a container with the -t or --tty flag
    tty: true
    ulimits:
      nproc: 65535
      nofile:
        soft: 20000
        hard: 40000
    working_dir: xxx
    labels:
      com.example.description: "Accounting webapp"
      com.example.department: "Finance"
      com.example.label-with-empty-value: ""

  backend:
    build:
      context: backend
      target: builder

networks:
  frontend:
    name: my-app-net
    driver: bridge
    driver_opts:
      com.docker.network.bridge.host_binding_ipv4: "127.0.0.1"
    # specifies that this network’s lifecycle is maintained outside of that of the application. Compose doesn't attempt to create these networks, and returns an error if one doesn't exist
    external: true

  front-tier:
    ipam:
      driver: default
      config:
        - subnet: "172.18.0.0/16"
          ip_range: "172.18.0.0/24"
          gateway: "172.18.0.1"
        - subnet: "2001:3984:3989::/64"

volumes:
  db-data:
    name: "my-app-data"
```

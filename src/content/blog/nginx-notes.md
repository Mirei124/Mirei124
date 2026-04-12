---
title: "nginx学习笔记"
pubDate: "2024-05-04T14:48"
updatedDate: "2024-05-04T14:48"
tags: ["nginx"]
category: "技术向"
---

# 全局块

## user 指令

user:用于配置运行 Nginx 服务器的 worker 进程的用户和用户组。

| 语法   | user user [group] |
| ------ | ----------------- |
| 默认值 | nobody            |
| 位置   | 全局块            |

该属性也可以在编译的时候指定，语法如下`./configure --user=user --group=group`,如果两个地方都进行了设置，最终生效的是配置文件中的配置。

## work process 指令

master_process:用来指定是否开启工作进程。

| 语法   | master_process on\|off; |
| ------ | ----------------------- |
| 默认值 | master_process on;      |
| 位置   | 全局块                  |

worker_processes:用于配置 Nginx 生成工作进程的数量，这个是 Nginx 服务器实现并发处理服务的关键所在。理论上来说 workder process 的值越大，可以支持的并发处理量也越多，但事实上这个值的设定是需要受到来自服务器自身的限制，建议将该值和服务器 CPU 的内核数保存一致。

## error_log

error_log:用来配置 Nginx 的错误日志存放路径

| 语法   | error_log file [日志级别];      |
| ------ | ------------------------------- |
| 默认值 | error_log logs/error.log error; |
| 位置   | 全局块、http、server、location  |

该属性可以通过`./configure --error-log-path=PATH`来指定

其中日志级别的值有：debug|info|notice|warn|error|crit|alert|emerg，翻译过来为试|信息|通知|警告|错误|临界|警报|紧急，这块建议大家设置的时候不要设置成 info 以下的等级，因为会带来大量的磁盘 I/O 消耗，影响 Nginx 的性能。

## include

include:用来引入其他配置文件，使 Nginx 的配置更加灵活

| 语法   | include file; |
| ------ | ------------- |
| 默认值 | 无            |
| 位置   | any           |

# events 块

（1）accept_mutex:用来设置 Nginx 网络连接序列化

| 语法   | accept_mutex on\|off; |
| ------ | --------------------- |
| 默认值 | accept_mutex on;      |
| 位置   | events                |

这个配置主要可以用来解决常说的"惊群"问题。大致意思是在某一个时刻，客户端发来一个请求连接，Nginx 后台是以多进程的工作模式，也就是说有多个 worker 进程会被同时唤醒，但是最终只会有一个进程可以获取到连接，如果每次唤醒的进程数目太多，就会影响 Nginx 的整体性能。如果将上述值设置为 on(开启状态)，将会对多个 Nginx 进程接收连接进行序列号，一个个来唤醒接收，就防止了多个进程对连接的争抢。

（2）multi_accept:用来设置是否允许同时接收多个网络连接

| 语法   | multi_accept on\|off; |
| ------ | --------------------- |
| 默认值 | multi_accept off;     |
| 位置   | events                |

如果 multi_accept 被禁止了，nginx 一个工作进程只能同时接受一个新的连接。否则，一个工作进程可以同时接受所有的新连接。

（3）worker_connections：用来配置单个 worker 进程最大的连接数

| 语法   | worker_connections number; |
| ------ | -------------------------- |
| 默认值 | worker_commections 512;    |
| 位置   | events                     |

这里的连接数不仅仅包括和前端用户建立的连接数，而是包括所有可能的连接数。另外，number 值不能大于操作系统支持打开的最大文件句柄数量。

（4）use:用来设置 Nginx 服务器选择哪种事件驱动来处理网络消息。

| 语法   | use method;    |
| ------ | -------------- |
| 默认值 | 根据操作系统定 |
| 位置   | events         |

> 注意：此处所选择事件处理模型是 Nginx 优化部分的一个重要内容，method 的可选值有 select/poll/epoll/kqueue 等。

也可以在编译的时候使用

`--with-select_module`、`--without-select_module`、

` --with-poll_module`、` --without-poll_module`来设置是否需要将对应的事件驱动模块编译到 Nginx 的内核。

## http 块

### 定义 MIME-Type

我们都知道浏览器中可以显示的内容有 HTML、XML、GIF 等种类繁多的文件、媒体等资源，浏览器为了区分这些资源，就需要使用 MIME Type。所以说 MIME Type 是网络资源的媒体类型。Nginx 作为 web 服务器，也需要能够识别前端请求的资源类型。

在 Nginx 的配置文件中，默认有两行配置

```
include mime.types;
default_type application/octet-stream;
```

（1）default_type:用来配置 Nginx 响应前端请求默认的 MIME 类型。

| 语法   | default_type mime-type;   |
| ------ | ------------------------- |
| 默认值 | default_type text/plain； |
| 位置   | http、server、location    |

在 default_type 之前还有一句`include mime.types`,include 之前我们已经介绍过，相当于把 mime.types 文件中 MIMT 类型与相关类型文件的文件后缀名的对应关系加入到当前的配置文件中。

举例：

```nginx
location /get_text {
	#这里也可以设置成text/plain
    default_type text/html;
    return 200 "This is nginx's text";
}
location /get_json{
    default_type application/json;
    return 200 '{"name":"TOM","age":18}';
}
```

### 自定义服务日志

Nginx 中日志的类型分 access.log、error.log。

access.log:用来记录用户所有的访问请求。

error.log:记录 nginx 本身运行时的错误信息，不会记录用户的访问请求。

Nginx 服务器支持对服务日志的格式、大小、输出等进行设置，需要使用到两个指令，分别是 access_log 和 log_format 指令。

（1）access_log:用来设置用户访问日志的相关属性。

| 语法   | access_log path[format[buffer=size]] |
| ------ | ------------------------------------ |
| 默认值 | access_log logs/access.log combined; |
| 位置   | `http`, `server`, `location`         |

（2）log_format:用来指定日志的输出格式。

| 语法   | log_format name [escape=default\|json\|none] string....; |
| ------ | -------------------------------------------------------- |
| 默认值 | log_format combined "...";                               |
| 位置   | http                                                     |

### 其他配置指令

（1）sendfile:用来设置 Nginx 服务器是否使用 sendfile()传输文件，该属性可以大大提高 Nginx 处理静态资源的性能

| 语法   | sendfile on\|off；     |
| ------ | ---------------------- |
| 默认值 | sendfile off;          |
| 位置   | http、server、location |

（2）keepalive_timeout:用来设置长连接的超时时间。

> **为什么要使用 keepalive？**
>
> 我们都知道 HTTP 是一种无状态协议，客户端向服务端发送一个 TCP 请求，服务端响应完毕后断开连接。
> 如果客户端向服务端发送多个请求，每个请求都需要重新创建一次连接，效率相对来说比较低，使用 keepalive 模式，可以告诉服务器端在处理完一个请求后保持这个 TCP 连接的打开状态，若接收到来自这个客户端的其他请求，服务端就会利用这个未被关闭的连接，而不需要重新创建一个新连接，提升效率，但是这个连接也不能一直保持，这样的话，连接如果过多，也会是服务端的性能下降，这个时候就需要我们进行设置其的超时时间。

| 语法   | keepalive_timeout time; |
| ------ | ----------------------- |
| 默认值 | keepalive_timeout 75s;  |
| 位置   | http、server、location  |

（3）keepalive_requests:用来设置一个 keep-alive 连接使用的次数。

| 语法   | keepalive_requests number; |
| ------ | -------------------------- |
| 默认值 | keepalive_requests 100;    |
| 位置   | http、server、location     |

### server 块和 location 块

```nginx
server {
  listen 80;
  server_name localhost;
  location / {
    root html;
    index index.html index.htm;
  }

  error_page 500 502 503 504 404 /50x.html;
  location = /50x.html {
    root html;
  }
}
```

### Nginx 静态资源的配置指令

#### listen 指令

listen:用来配置监听端口。

| 语法   | listen address[:port] [default_server]...;<br/>listen port [default_server]...; |
| ------ | ------------------------------------------------------------------------------- |
| 默认值 | listen _:80 \| _:8000                                                           |
| 位置   | server                                                                          |

listen 的设置比较灵活，我们通过几个例子来把常用的设置方式熟悉下：

```
listen 127.0.0.1:8000; // listen localhost:8000 监听指定的IP和端口
listen 127.0.0.1;	监听指定IP的所有端口
listen 8000;	监听指定端口上的连接
listen *:8000;	监听指定端口上的连接
```

default_server 属性是标识符，用来将此虚拟主机设置成默认主机。所谓的默认主机指的是如果没有匹配到对应的 address:port，则会默认执行的。如果不指定默认使用的是第一个 server。

```
server{
	listen 8080;
	server_name 127.0.0.1;
	location /{
		root html;
		index index.html;
	}
}
server{
	listen 8080 default_server;
	server_name localhost;
	default_type text/plain;
	return 444 'This is a error request';
}
```

#### server_name 指令

#### server_name 指令

server_name：用来设置虚拟主机服务名称。

127.0.0.1 、 localhost 、域名[www.baidu.com | www.jd.com]

| 语法   | server_name name ...;<br/>name 可以提供多个中间用空格分隔 |
| ------ | --------------------------------------------------------- |
| 默认值 | server_name "";                                           |
| 位置   | server                                                    |

关于 server_name 的配置方式有三种，分别是：

- 精确匹配
- 通配符匹配
- 正则表达式匹配

配置方式一：精确匹配

如：

```
server {
	listen 80;
	server_name www.itcast.cn www.itheima.cn;
	...
}
```

配置方式二:使用通配符配置

server_name 中支持通配符"\*",但需要注意的是通配符不能出现在域名的中间，只能出现在首段或尾段，如：

```
server {
	listen 80;
	server_name  *.itcast.cn	www.itheima.*;
	# www.itcast.cn abc.itcast.cn www.itheima.cn www.itheima.com
	...
}
```

下面的配置就会报错

```
server {
	listen 80;
	server_name  www.*.cn www.itheima.c*
	...
}
```

配置三:使用正则表达式配置

server_name 中可以使用正则表达式，并且使用`~`作为正则表达式字符串的开始标记。

配置如下：

```
server{
        listen 80;
        server_name ~^www\.(\w+)\.com$;
        default_type text/plain;
        return 200 $1  $2 ..;
}
```

> 注意 ~后面不能加空格，括号可以取值

##### 匹配执行顺序

```nginx
server{
	listen 80;
	server_name ~^www\.\w+\.com$;
	default_type text/plain;
	return 200 'regex_success';
}

server{
	listen 80;
	server_name www.itheima.*;
	default_type text/plain;
	return 200 'wildcard_after_success';
}

server{
	listen 80;
	server_name *.itheima.com;
	default_type text/plain;
	return 200 'wildcard_before_success';
}

server{
	listen 80;
	server_name www.itheima.com;
	default_type text/plain;
	return 200 'exact_success';
}

server{
	listen 80 default_server;
	server_name _;
	default_type text/plain;
	return 444 'default_server not found server';
}
```

结论：

1. 准确匹配 server_name

2. 通配符在开始时匹配 server_name 成功

3. 通配符在结束时匹配 server_name 成功

4. 正则表达式匹配 server_name 成功

5. 被默认的 default_server 处理，如果没有指定默认找第一个 server

#### location 指令

```
server{
	listen 80;
	server_name localhost;
	location / {

	}
	location /abc{

	}
	...
}
```

#### location:用来设置请求的 URI

| 语法   | location [ = \| ~ \| ~* \| ^~ \|@ ] uri{...} |
| ------ | -------------------------------------------- |
| 默认值 | —                                            |
| 位置   | server,location                              |

uri 变量是待匹配的请求字符串，可以不包含正则表达式，也可以包含正则表达式，那么 nginx 服务器在搜索匹配 location 的时候，是先使用不包含正则表达式进行匹配，找到一个匹配度最高的一个，然后在通过包含正则表达式的进行匹配，如果能匹配到直接访问，匹配不到，就使用刚才匹配度最高的那个 location 来处理请求。

属性介绍:

不带符号，要求必须以指定模式开始

```
server {
	listen 80;
	server_name 127.0.0.1;
	location /abc{
		default_type text/plain;
		return 200 "access success";
	}
}
以下访问都是正确的
http://192.168.200.133/abc
http://192.168.200.133/abc?p1=TOM
http://192.168.200.133/abc/
http://192.168.200.133/abcdef
```

= : 用于不包含正则表达式的 uri 前，必须与指定的模式精确匹配

```
server {
	listen 80;
	server_name 127.0.0.1;
	location =/abc{
		default_type text/plain;
		return 200 "access success";
	}
}
可以匹配到
http://192.168.200.133/abc
http://192.168.200.133/abc?p1=TOM
匹配不到
http://192.168.200.133/abc/
http://192.168.200.133/abcdef
```

~ ： 用于表示当前 uri 中包含了正则表达式，并且区分大小写

~\*: 用于表示当前 uri 中包含了正则表达式，并且不区分大小写

换句话说，如果 uri 包含了正则表达式，需要用上述两个符合来标识

```
server {
	listen 80;
	server_name 127.0.0.1;
	location ~^/abc\w${
		default_type text/plain;
		return 200 "access success";
	}
}
server {
	listen 80;
	server_name 127.0.0.1;
	location ~*^/abc\w${
		default_type text/plain;
		return 200 "access success";
	}
}
```

^~: 用于不包含正则表达式的 uri 前，功能和不加符号的一致，唯一不同的是，如果模式匹配，那么就停止搜索其他模式了。

```
server {
	listen 80;
	server_name 127.0.0.1;
	location ^~/abc{
		default_type text/plain;
		return 200 "access success";
	}
}
```

#### 设置请求资源的目录 root / alias

root：设置请求的根目录

| 语法   | root path;             |
| ------ | ---------------------- |
| 默认值 | root html;             |
| 位置   | http、server、location |

path 为 Nginx 服务器接收到请求以后查找资源的根目录路径。

alias：用来更改 location 的 URI

| 语法   | alias path; |
| ------ | ----------- |
| 默认值 | —           |
| 位置   | location    |

path 为修改后的根路径。

以上两个指令都可以来指定访问资源的路径，那么这两者之间的区别是什么?

举例说明：

（1）在`/usr/local/nginx/html`目录下创建一个 images 目录,并在目录下放入一张图片`mv.png`图片

```
location /images {
	root /usr/local/nginx/html;
}
```

访问图片的路径为:

```
http://192.168.200.133/images/mv.png
```

（2）如果把 root 改为 alias

```
location /images {
	alias /usr/local/nginx/html;
}
```

再次访问上述地址，页面会出现 404 的错误，查看错误日志会发现是因为地址不对，所以验证了：

```
root的处理结果是: root路径+location路径
/usr/local/nginx/html/images/mv.png
alias的处理结果是:使用alias路径替换location路径
/usr/local/nginx/html/images
```

需要在 alias 后面路径改为

```
location /images {
	alias /usr/local/nginx/html/images;
}
```

（3）**_如果 location 路径是以/结尾,则 alias 也必须是以/结尾，root 没有要求_**

将上述配置修改为

```
location /images/ {
	alias /usr/local/nginx/html/images;
}
```

访问就会出问题，查看错误日志还是路径不对，所以需要把 alias 后面加上 /

小结：

```
root的处理结果是: root路径+location路径
alias的处理结果是:使用alias路径替换location路径
alias是一个目录别名的定义，root则是最上层目录的含义。
如果location路径是以/结尾,则alias也必须是以/结尾，root没有要求
```

#### index 指令

index:设置网站的默认首页

| 语法   | index file ...;        |
| ------ | ---------------------- |
| 默认值 | index index.html;      |
| 位置   | http、server、location |

index 后面可以跟多个设置，如果访问的时候没有指定具体访问的资源，则会依次进行查找，找到第一个为止。

举例说明：

```
location / {
	root /usr/local/nginx/html;
	index index.html index.htm;
}
访问该location的时候，可以通过 http://ip:port/，地址后面如果不添加任何内容，则默认依次访问index.html和index.htm，找到第一个来进行返回
```

#### error_page 指令

error_page:设置网站的错误页面

| 语法   | error_page code ... [=[response]] uri; |
| ------ | -------------------------------------- |
| 默认值 | —                                      |
| 位置   | http、server、location......           |

当出现对应的响应 code 后，如何来处理。

举例说明：

（1）可以指定具体跳转的地址

```
server {
	error_page 404 http://www.itcast.cn;
}
```

（2）可以指定重定向地址

```
server{
	error_page 404 /50x.html;
	error_page 500 502 503 504 /50x.html;
	location =/50x.html{
		root html;
	}
}
```

（3）使用 location 的@符合完成错误信息展示

```
server{
	error_page 404 @jump_to_error;
	location @jump_to_error {
		default_type text/plain;
		return 404 'Not Found Page...';
	}
}
```

可选项`=[response]`的作用是用来将相应代码更改为另外一个

```
server{
	error_page 404 =200 /50x.html;
	location =/50x.html{
		root html;
	}
}
这样的话，当返回404找不到对应的资源的时候，在浏览器上可以看到，最终返回的状态码是200，这块需要注意下，编写error_page后面的内容，404后面需要加空格，200前面不能加空格
```

### 静态资源优化配置语法

Nginx 对静态资源如何进行优化配置。这里从三个属性配置进行优化：

```
sendfile on;
tcp_nopush on;
tcp_nodelay on;
```

（1）sendﬁle，用来开启高效的文件传输模式。

| 语法   | sendﬁle on \|oﬀ;          |
| ------ | ------------------------- |
| 默认值 | sendﬁle oﬀ;               |
| 位置   | http、server、location... |

请求静态资源的过程：客户端通过网络接口向服务端发送请求，操作系统将这些客户端的请求传递给服务器端应用程序，服务器端应用程序会处理这些请求，请求处理完成以后，操作系统还需要将处理得到的结果通过网络适配器传递回去。

如：

```
server {
	listen 80;
	server_name localhost；
	location / {
		root html;
		index index.html;
	}
}
在html目录下有一个welcome.html页面，访问地址
http://192.168.200.133/welcome.html
```

（2）tcp_nopush：该指令必须在 sendfile 打开的状态下才会生效，主要是用来提升网络包的传输'效率'

| 语法   | tcp_nopush on\|off;    |
| ------ | ---------------------- |
| 默认值 | tcp_nopush oﬀ;         |
| 位置   | http、server、location |

（3）tcp_nodelay：该指令必须在 keep-alive 连接开启的情况下才生效，来提高网络包传输的'实时性'

| 语法   | tcp_nodelay on\|off;   |
| ------ | ---------------------- |
| 默认值 | tcp_nodelay on;        |
| 位置   | http、server、location |

经过刚才的分析，"tcp_nopush"和”tcp_nodelay“看起来是"互斥的"，那么为什么要将这两个值都打开，这个大家需要知道的是在 linux2.5.9 以后的版本中两者是可以兼容的，三个指令都开启的好处是，sendfile 可以开启高效的文件传输模式，tcp_nopush 开启可以确保在发送到客户端之前数据包已经充分“填满”， 这大大减少了网络开销，并加快了文件发送的速度。 然后，当它到达最后一个可能因为没有“填满”而暂停的数据包时，Nginx 会忽略 tcp_nopush 参数， 然后，tcp_nodelay 强制套接字发送数据。由此可知，TCP_NOPUSH 可以与 TCP_NODELAY 一起设置，它比单独配置 TCP_NODELAY 具有更强的性能。所以我们可以使用如下配置来优化 Nginx 静态资源的处理

```
sendfile on;
tcp_nopush on;
tcp_nodelay on;
```

### Nginx 静态资源压缩实战

在 Nginx 的配置文件中可以通过配置 gzip 来对静态资源进行压缩，相关的指令可以配置在 http 块、server 块和 location 块中，Nginx 可以通过

```
ngx_http_gzip_module模块
ngx_http_gzip_static_module模块
ngx_http_gunzip_module模块
```

对这些指令进行解析和处理。

#### Gzip 模块配置指令

接下来所学习的指令都来自 ngx_http_gzip_module 模块，该模块会在 nginx 安装的时候内置到 nginx 的安装环境中，也就是说我们可以直接使用这些指令。

1. gzip 指令：该指令用于开启或者关闭 gzip 功能

| 语法   | gzip on\|off;             |
| ------ | ------------------------- |
| 默认值 | gzip off;                 |
| 位置   | http、server、location... |

注意只有该指令为打开状态，下面的指令才有效果

```
http{
   gzip on;
}
```

2. gzip_types 指令：该指令可以根据响应页的 MIME 类型选择性地开启 Gzip 压缩功能

| 语法   | gzip_types mime-type ...; |
| ------ | ------------------------- |
| 默认值 | gzip_types text/html;     |
| 位置   | http、server、location    |

所选择的值可以从 mime.types 文件中进行查找，也可以使用"\*"代表所有。

```
http{
	gzip_types application/javascript;
}
```

3. gzip_comp_level 指令：该指令用于设置 Gzip 压缩程度，级别从 1-9,1 表示要是程度最低，要是效率最高，9 刚好相反，压缩程度最高，但是效率最低最费时间。

| 语法   | gzip_comp_level level; |
| ------ | ---------------------- |
| 默认值 | gzip_comp_level 1;     |
| 位置   | http、server、location |

```
http{
	gzip_comp_level 6;
}
```

4. gzip_vary 指令：该指令用于设置使用 Gzip 进行压缩发送是否携带“Vary:Accept-Encoding”头域的响应头部。主要是告诉接收方，所发送的数据经过了 Gzip 压缩处理

| 语法   | gzip_vary on\|off;     |
| ------ | ---------------------- |
| 默认值 | gzip_vary off;         |
| 位置   | http、server、location |

5. gzip_buffers 指令：该指令用于处理请求压缩的缓冲区数量和大小。

| 语法   | gzip_buffers number size;  |
| ------ | -------------------------- |
| 默认值 | gzip_buffers 32 4k\|16 8k; |
| 位置   | http、server、location     |

其中 number:指定 Nginx 服务器向系统申请缓存空间个数，size 指的是每个缓存空间的大小。主要实现的是申请 number 个每个大小为 size 的内存空间。这个值的设定一般会和服务器的操作系统有关，所以建议此项不设置，使用默认值即可。

```
gzip_buffers 4 16K;	  #缓存空间大小
```

6. gzip_disable 指令：针对不同种类客户端发起的请求，可以选择性地开启和关闭 Gzip 功能。

| 语法   | gzip_disable regex ...; |
| ------ | ----------------------- |
| 默认值 | —                       |
| 位置   | http、server、location  |

regex:根据客户端的浏览器标志(user-agent)来设置，支持使用正则表达式。指定的浏览器标志不使用 Gzip.该指令一般是用来排除一些明显不支持 Gzip 的浏览器。

```
gzip_disable "MSIE [1-6]\.";
```

7. gzip_http_version 指令：针对不同的 HTTP 协议版本，可以选择性地开启和关闭 Gzip 功能。

| 语法   | gzip_http_version 1.0\|1.1; |
| ------ | --------------------------- |
| 默认值 | gzip_http_version 1.1;      |
| 位置   | http、server、location      |

该指令是指定使用 Gzip 的 HTTP 最低版本，该指令一般采用默认值即可。

8. gzip_min_length 指令：该指令针对传输数据的大小，可以选择性地开启和关闭 Gzip 功能

| 语法   | gzip_min_length length; |
| ------ | ----------------------- |
| 默认值 | gzip_min_length 20;     |
| 位置   | http、server、location  |

```
nignx计量大小的单位：bytes[字节] / kb[千字节] / M[兆]
例如: 1024 / 10k|K / 10m|M
```

Gzip 压缩功能对大数据的压缩效果明显，但是如果要压缩的数据比较小的化，可能出现越压缩数据量越大的情况，因此我们需要根据响应内容的大小来决定是否使用 Gzip 功能，响应页面的大小可以通过头信息中的`Content-Length`来获取。但是如何使用了 Chunk 编码动态压缩，该指令将被忽略。建议设置为 1K 或以上。

9. gzip_proxied 指令：该指令设置是否对服务端返回的结果进行 Gzip 压缩。

| 语法   | gzip_proxied off\|expired\|no-cache\|<br/>no-store\|private\|no_last_modified\|no_etag\|auth\|any; |
| ------ | -------------------------------------------------------------------------------------------------- |
| 默认值 | gzip_proxied off;                                                                                  |
| 位置   | http、server、location                                                                             |

off - 关闭 Nginx 服务器对后台服务器返回结果的 Gzip 压缩

expired - 启用压缩，如果 header 头中包含 "Expires" 头信息

no-cache - 启用压缩，如果 header 头中包含 "Cache-Control:no-cache" 头信息

no-store - 启用压缩，如果 header 头中包含 "Cache-Control:no-store" 头信息

private - 启用压缩，如果 header 头中包含 "Cache-Control:private" 头信息

no_last_modified - 启用压缩,如果 header 头中不包含 "Last-Modified" 头信息

no_etag - 启用压缩 ,如果 header 头中不包含 "ETag" 头信息

auth - 启用压缩 , 如果 header 头中包含 "Authorization" 头信息

any - 无条件启用压缩

#### Gzip 压缩功能的实例配置

```
gzip on;  			  #开启gzip功能
gzip_types *;		  #压缩源文件类型,根据具体的访问资源类型设定
gzip_comp_level 6;	  #gzip压缩级别
gzip_min_length 1024; #进行压缩响应页面的最小长度,content-length
gzip_buffers 4 16K;	  #缓存空间大小
gzip_http_version 1.1; #指定压缩响应所需要的最低HTTP请求版本
gzip_vary  on;		  #往头信息中添加压缩标识
gzip_disable "MSIE [1-6]\."; #对IE6以下的版本都不进行压缩
gzip_proxied  off； #nginx作为反向代理压缩服务端返回数据的条件
```

这些配置在很多地方可能都会用到，所以我们可以将这些内容抽取到一个配置文件中，然后通过 include 指令把配置文件再次加载到 nginx.conf 配置文件中，方法使用。

nginx_gzip.conf

```
gzip on;
gzip_types *;
gzip_comp_level 6;
gzip_min_length 1024;
gzip_buffers 4 16K;
gzip_http_version 1.1;
gzip_vary  on;
gzip_disable "MSIE [1-6]\.";
gzip_proxied  off;
```

nginx.conf

```
include nginx_gzip.conf
```

#### Gzip 和 sendfile 共存问题

前面在讲解 sendfile 的时候，提到过，开启 sendfile 以后，在读取磁盘上的静态资源文件的时候，可以减少拷贝的次数，可以不经过用户进程将静态文件通过网络设备发送出去，但是 Gzip 要想对资源压缩，是需要经过用户进程进行操作的。所以如何解决两个设置的共存问题。

可以使用 ngx_http_gzip_static_module 模块的 gzip_static 指令来解决。

##### gzip_static 指令

gzip_static: 检查与访问资源同名的.gz 文件时，response 中以 gzip 相关的 header 返回.gz 文件的内容。

| 语法   | **gzip_static** on \| off \| always; |
| ------ | ------------------------------------ |
| 默认值 | gzip_static off;                     |
| 位置   | http、server、location               |

添加上述命令后，会报一个错误，`unknown directive "gzip_static"`主要的原因是 Nginx 默认是没有添加 ngx_http_gzip_static_module 模块。如何来添加?

##### 添加模块到 Nginx 的实现步骤

(1)查询当前 Nginx 的配置参数

```
nginx -V
```

(2)将 nginx 安装目录下 sbin 目录中的 nginx 二进制文件进行更名

```
cd /usr/local/nginx/sbin
mv nginx nginxold
```

(3) 进入 Nginx 的安装目录

```
cd /root/nginx/core/nginx-1.16.1
```

(4)执行 make clean 清空之前编译的内容

```
make clean
```

(5)使用 configure 来配置参数

```
./configure --with-http_gzip_static_module
```

(6)使用 make 命令进行编译

```
make
```

(7) 将 objs 目录下的 nginx 二进制执行文件移动到 nginx 安装目录下的 sbin 目录中

```
mv objs/nginx /usr/local/nginx/sbin
```

(8)执行更新命令

```
make upgrade
```

### 静态资源的缓存处理

#### 浏览器缓存的执行流程

HTTP 协议中和页面缓存相关的字段，我们先来认识下：

| header        | 说明                                          |
| ------------- | --------------------------------------------- |
| Expires       | 缓存过期的日期和时间                          |
| Cache-Control | 设置和缓存相关的配置信息                      |
| Last-Modified | 请求资源最后修改时间                          |
| ETag          | 请求变量的实体标签的当前值，比如文件的 MD5 值 |

（1）用户首次通过浏览器发送请求到服务端获取数据，客户端是没有对应的缓存，所以需要发送 request 请求来获取数据；

（2）服务端接收到请求后，获取服务端的数据及服务端缓存的允许后，返回 200 的成功状态码并且在响应头上附上对应资源以及缓存信息；

（3）当用户再次访问相同资源的时候，客户端会在浏览器的缓存目录中查找是否存在响应的缓存文件

（4）如果没有找到对应的缓存文件，则走(2)步

（5）如果有缓存文件，接下来对缓存文件是否过期进行判断，过期的判断标准是(Expires),

（6）如果没有过期，则直接从本地缓存中返回数据进行展示

（7）如果 Expires 过期，接下来需要判断缓存文件是否发生过变化

（8）判断的标准有两个，一个是 ETag(Entity Tag),一个是 Last-Modified

（9）判断结果是未发生变化，则服务端返回 304，直接从缓存文件中获取数据

（10）如果判断是发生了变化，重新从服务端获取数据，并根据缓存协商(服务端所设置的是否需要进行缓存数据的设置)来进行数据缓存。

#### 浏览器缓存相关指令

Nginx 需要进行缓存相关设置，就需要用到如下的指令

##### expires 指令

expires:该指令用来控制页面缓存的作用。可以通过该指令控制 HTTP 应答中的“Expires"和”Cache-Control"

| 语法   | expires [modified] time<br/>expires epoch\|max\|off; |
| ------ | ---------------------------------------------------- |
| 默认值 | expires off;                                         |
| 位置   | http、server、location                               |

time:可以整数也可以是负数，指定过期时间，如果是负数，Cache-Control 则为 no-cache,如果为整数或 0，则 Cache-Control 的值为 max-age=time;

epoch: 指定 Expires 的值为'1 January,1970,00:00:01 GMT'(1970-01-01 00:00:00)，Cache-Control 的值 no-cache

max:指定 Expires 的值为'31 December2037 23:59:59GMT' (2037-12-31 23:59:59) ，Cache-Control 的值为 10 年

off:默认不缓存。

> 例：expires 1000 表示 1000 秒，expires 10d 表示 10 天。

##### add_header 指令

add_header 指令是用来添加指定的响应头和响应值。

| 语法   | add_header name value [always]; |
| ------ | ------------------------------- |
| 默认值 | —                               |
| 位置   | http、server、location...       |

Cache-Control 作为响应头信息，可以设置如下值：

缓存响应指令：

```
Cache-control: must-revalidate
Cache-control: no-cache
Cache-control: no-store
Cache-control: no-transform
Cache-control: public
Cache-control: private
Cache-control: proxy-revalidate
Cache-Control: max-age=<seconds>
Cache-control: s-maxage=<seconds>
```

| 指令             | 说明                                           |
| ---------------- | ---------------------------------------------- |
| must-revalidate  | 可缓存但必须再向源服务器进行确认               |
| no-cache         | 缓存前必须确认其有效性                         |
| no-store         | 不缓存请求或响应的任何内容                     |
| no-transform     | 代理不可更改媒体类型                           |
| public           | 可向任意方提供响应的缓存                       |
| private          | 仅向特定用户返回响应                           |
| proxy-revalidate | 要求中间缓存服务器对缓存的响应有效性再进行确认 |
| max-age=<秒>     | 响应最大 Age 值                                |
| s-maxage=<秒>    | 公共缓存服务器响应的最大 Age 值                |

max-age=[秒]：

### Nginx 的跨域问题解决

同源: 协议、域名(IP)、端口相同即为同源。

#### 解决方案

使用 add_header 指令，该指令可以用来添加一些头信息

| 语法   | add_header name value... |
| ------ | ------------------------ |
| 默认值 | —                        |
| 位置   | http、server、location   |

此处用来解决跨域问题，需要添加两个头信息，一个是`Access-Control-Allow-Origin`,`Access-Control-Allow-Methods`

Access-Control-Allow-Origin: 直译过来是允许跨域访问的源地址信息，可以配置多个(多个用逗号分隔)，也可以使用`*`代表所有源

Access-Control-Allow-Methods:直译过来是允许跨域访问的请求方式，值可以为 GET POST PUT DELETE...,可以全部设置，也可以根据需要设置，多个用逗号分隔

具体配置方式

```
location /getUser{
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods GET,POST,PUT,DELETE;
    default_type application/json;
    return 200 '{"id":1,"name":"TOM","age":18}';
}
```

### 静态资源防盗链

#### Nginx 防盗链的实现原理：

了解防盗链的原理之前，我们得先学习一个 HTTP 的头信息 Referer,当浏览器向 web 服务器发送请求的时候，一般都会带上 Referer,来告诉浏览器该网页是从哪个页面链接过来的。

后台服务器可以根据获取到的这个 Referer 信息来判断是否为自己信任的网站地址，如果是则放行继续访问，如果不是则可以返回 403(服务端拒绝访问)的状态信息。

Nginx 防盗链的具体实现:

valid_referers:nginx 会通过查看 referer 自动和 valid_referers 后面的内容进行匹配，如果匹配到了就将$invalid_referer 变量置 0，如果没有匹配到，则将\$invalid_referer 变量置为 1，匹配的过程中不区分大小写。

| 语法   | valid_referers none\|blocked\|server_names\|string... |
| ------ | ----------------------------------------------------- |
| 默认值 | —                                                     |
| 位置   | server、location                                      |

none: 如果 Header 中的 Referer 为空，允许访问

blocked:在 Header 中的 Referer 不为空，但是该值被防火墙或代理进行伪装过，如不带"http://" 、"https://"等协议头的资源允许访问。

server_names:指定具体的域名或者 IP

string: 可以支持正则表达式和\*的字符串。如果是正则表达式，需要以`~`开头表示，例如

```
location ~*\.(png|jpg|gif){
           valid_referers none blocked www.baidu.com 192.168.200.222 *.example.com example.*  www.example.org  ~\.google\.;
           if ($invalid_referer){
                return 403;
           }
           root /usr/local/nginx/html;

}
```

遇到的问题:图片有很多，该如何批量进行防盗链？

#### 针对目录进行防盗链

配置如下：

```
location /images {
           valid_referers none blocked www.baidu.com 192.168.200.222 *.example.com example.*  www.example.org  ~\.google\.;
           if ($invalid_referer){
                return 403;
           }
           root /usr/local/nginx/html;

}
```

这样我们可以对一个目录下的所有资源进行翻到了操作。

遇到的问题：Referer 的限制比较粗，比如随意加一个 Referer，上面的方式是无法进行限制的。那么这个问题改如何解决？

此处我们需要用到 Nginx 的第三方模块`ngx_http_accesskey_module`，第三方模块如何实现盗链，如果在 Nginx 中使用第三方模块的功能，这些我们在后面的 Nginx 的模块篇再进行详细的讲解。

### Rewrite 功能配置

Rewrite 是 Nginx 服务器提供的一个重要基本功能，是 Web 服务器产品中几乎必备的功能。主要的作用是用来实现 URL 的重写。

注意:Nginx 服务器的 Rewrite 功能的实现依赖于 PCRE 的支持，因此在编译安装 Nginx 服务器之前，需要安装 PCRE 库。Nginx 使用的是 ngx_http_rewrite_module 模块来解析和处理 Rewrite 功能的相关配置。

#### "地址重写"与"地址转发"

重写和转发的区别:

```
地址重写浏览器地址会发生变化而地址转发则不变
一次地址重写会产生两次请求而一次地址转发只会产生一次请求
地址重写到的页面必须是一个完整的路径而地址转发则不需要
地址重写因为是两次请求所以request范围内属性不能传递给新页面而地址转发因为是一次请求所以可以传递值
地址转发速度快于地址重写
```

#### Rewrite 规则

#### set 指令

该指令用来设置一个新的变量。

| 语法   | set $variable value; |
| ------ | -------------------- |
| 默认值 | —                    |
| 位置   | server、location、if |

variable:变量的名称，该变量名称要用"$"作为变量的第一个字符，且不能与 Nginx 服务器预设的全局变量同名。

value:变量的值，可以是字符串、其他变量或者变量的组合等。

#### Rewrite 常用全局变量

| 变量               | 说明                                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| $args              | 变量中存放了请求 URL 中的请求指令。比如http://192.168.200.133:8080?arg1=value1&args2=value2中的"arg1=value1&arg2=value2"，功能和$query_string一样 |
| $http_user_agent   | 变量存储的是用户访问服务的代理信息(如果通过浏览器访问，记录的是浏览器的相关版本信息)                                                              |
| $host              | 变量存储的是访问服务器的 server_name 值                                                                                                           |
| $document_uri      | 变量存储的是当前访问地址的 URI。比如http://192.168.200.133/server?id=10&name=zhangsan中的"/server"，功能和$uri一样                                |
| $document_root     | 变量存储的是当前请求对应 location 的 root 值，如果未设置，默认指向 Nginx 自带 html 目录所在位置                                                   |
| $content_length    | 变量存储的是请求头中的 Content-Length 的值                                                                                                        |
| $content_type      | 变量存储的是请求头中的 Content-Type 的值                                                                                                          |
| $http_cookie       | 变量存储的是客户端的 cookie 信息，可以通过 add_header Set-Cookie 'cookieName=cookieValue'来添加 cookie 数据                                       |
| $limit_rate        | 变量中存储的是 Nginx 服务器对网络连接速率的限制，也就是 Nginx 配置中对 limit_rate 指令设置的值，默认是 0，不限制。                                |
| $remote_addr       | 变量中存储的是客户端的 IP 地址                                                                                                                    |
| $remote_port       | 变量中存储了客户端与服务端建立连接的端口号                                                                                                        |
| $remote_user       | 变量中存储了客户端的用户名，需要有认证模块才能获取                                                                                                |
| $scheme            | 变量中存储了访问协议                                                                                                                              |
| $server_addr       | 变量中存储了服务端的地址                                                                                                                          |
| $server_name       | 变量中存储了客户端请求到达的服务器的名称                                                                                                          |
| $server_port       | 变量中存储了客户端请求到达服务器的端口号                                                                                                          |
| $server_protocol   | 变量中存储了客户端请求协议的版本，比如"HTTP/1.1"                                                                                                  |
| $request_body_file | 变量中存储了发给后端服务器的本地文件资源的名称                                                                                                    |
| $request_method    | 变量中存储了客户端的请求方式，比如"GET","POST"等                                                                                                  |
| $request_filename  | 变量中存储了当前请求的资源文件的路径名                                                                                                            |
| $request_uri       | 变量中存储了当前请求的 URI，并且携带请求参数，比如http://192.168.200.133/server?id=10&name=zhangsan中的"/server?id=10&name=zhangsan"              |

#### if 指令

该指令用来支持条件判断，并根据条件判断结果选择不同的 Nginx 配置。

| 语法   | if (condition){...} |
| ------ | ------------------- |
| 默认值 | —                   |
| 位置   | server、location    |

condition 为判定条件，可以支持以下写法：

1. 变量名。如果变量名对应的值为空或者是 0，if 都判断为 false,其他条件为 true。

```
if ($param){

}
```

2. 使用"="和"!="比较变量和字符串是否相等，满足条件为 true，不满足为 false

```
if ($request_method = POST){
	return 405;
}
```

注意：此处和 Java 不太一样的地方是字符串不需要添加引号。

3. 使用正则表达式对变量进行匹配，匹配成功返回 true，否则返回 false。变量与正则表达式之间使用"~","~\*","!~","!~\*"来连接。

   "~"代表匹配正则表达式过程中区分大小写，

   "~\*"代表匹配正则表达式过程中不区分大小写

   "!~"和"!~\*"刚好和上面取相反值，如果匹配上返回 false,匹配不上返回 true

```
if ($http_user_agent ~ MSIE){
	#$http_user_agent的值中是否包含MSIE字符串，如果包含返回true
}
```

> 注意：正则表达式字符串一般不需要加引号，但是如果字符串中包含"}"或者是";"等字符时，就需要把引号加上。

4. 判断请求的文件是否存在使用"-f"和"!-f",

   当使用"-f"时，如果请求的文件存在返回 true，不存在返回 false。

   当使用"!f"时，如果请求文件不存在，但该文件所在目录存在返回 true,文件和目录都不存在返回 false,如果文件存在返回 false

```
if (-f $request_filename){
	#判断请求的文件是否存在
}
if (!-f $request_filename){
	#判断请求的文件是否不存在
}
```

5. 判断请求的目录是否存在使用"-d"和"!-d",

   当使用"-d"时，如果请求的目录存在，if 返回 true，如果目录不存在则返回 false

   当使用"!-d"时，如果请求的目录不存在但该目录的上级目录存在则返回 true，该目录和它上级目录都不存在则返回 false,如果请求目录存在也返回 false.

6. 判断请求的目录或者文件是否存在使用"-e"和"!-e"

   当使用"-e",如果请求的目录或者文件存在时，if 返回 true,否则返回 false.

   当使用"!-e",如果请求的文件和文件所在路径上的目录都不存在返回 true,否则返回 false

7. 判断请求的文件是否可执行使用"-x"和"!-x"

   当使用"-x",如果请求的文件可执行，if 返回 true,否则返回 false

   当使用"!-x",如果请求文件不可执行，返回 true,否则返回 false

#### break 指令

该指令用于中断当前相同作用域中的其他 Nginx 配置。与该指令处于同一作用域的 Nginx 配置中，位于它前面的指令配置生效，位于后面的指令配置无效。

| 语法   | break;               |
| ------ | -------------------- |
| 默认值 | —                    |
| 位置   | server、location、if |

例子:

```
location /{
	if ($param){
		set $id $1;
		break;
		limit_rate 10k;
	}
}
```

#### return 指令

该指令用于完成对请求的处理，直接向客户端返回响应状态代码。在 return 后的所有 Nginx 配置都是无效的。

| 语法   | return code [text];<br/>return code URL;<br/>return URL; |
| ------ | -------------------------------------------------------- |
| 默认值 | —                                                        |
| 位置   | server、location、if                                     |

code:为返回给客户端的 HTTP 状态代理。可以返回的状态代码为 0~999 的任意 HTTP 状态代理

text:为返回给客户端的响应体内容，支持变量的使用

URL:为返回给客户端的 URL 地址

#### rewrite 指令

该指令通过正则表达式的使用来改变 URI。可以同时存在一个或者多个指令，按照顺序依次对 URL 进行匹配和处理。

URL 和 URI 的区别：

```
URI:统一资源标识符
URL:统一资源定位符
```

| 语法   | rewrite regex replacement [flag]; |
| ------ | --------------------------------- |
| 默认值 | —                                 |
| 位置   | server、location、if              |

regex:用来匹配 URI 的正则表达式

replacement:匹配成功后，用于替换 URI 中被截取内容的字符串。如果该字符串是以"http://"或者"https://"开头的，则不会继续向下对 URI 进行其他处理，而是直接返回重写后的 URI 给客户端。

flag:用来设置 rewrite 对 URI 的处理行为，可选值有如下：

- last: 将 rewrite 后的地址重新在 server 标签执行。
- break: 将 rewrite 后地址重新在当前的 location 标签执行。
- redirect: 302 跳转到 rewrtie 后面的地址。
- permanent: 301 永久调整到 rewrtie 后面的地址，即当前地址已经永久迁移到新地址，一般是为了对搜索引擎友好。

#### rewrite_log 指令

该指令配置是否开启 URL 重写日志的输出功能。

| 语法   | rewrite_log on\|off;       |
| ------ | -------------------------- |
| 默认值 | rewrite_log off;           |
| 位置   | http、server、location、if |

开启后，URL 重写的相关日志将以 notice 级别输出到 error_log 指令配置的日志文件汇总。

### Rewrite 的案例

#### 域名跳转

》问题分析

先来看一个效果，如果我们想访问京东网站，大家都知道我们可以输入`www.jd.com`,但是同样的我们也可以输入`www.360buy.com`同样也都能访问到京东网站。这个其实是因为京东刚开始的时候域名就是www.360buy.com，后面由于各种原因把自己的域名换成了www.jd.com, 虽然说域名变量，但是对于以前只记住了www.360buy.com的用户来说，我们如何把这部分用户也迁移到我们新域名的访问上来，针对于这个问题，我们就可以使用Nginx中Rewrite的域名跳转来解决。

》环境准备

- 准备两个域名 www.360buy.com | www.jd.com

```
vim /etc/hosts
```

```
192.168.200.133 www.360buy.com
192.168.200.133 www.jd.com
```

- 在/usr/local/nginx/html/hm 目录下创建一个访问页面

```
<html>
	<title></title>
	<body>
		<h1>欢迎来到我们的网站</h1>
	</body>
</html>
```

- 通过 Nginx 实现当访问 www.访问到系统的首页

```
server {
	listen 80;
	server_name www.hm.com;
	location /{
		root /usr/local/nginx/html/hm;
		index index.html;
	}
}
```

》通过 Rewrite 完成将www.360buy.com的请求跳转到www.jd.com

```
server {
	listen 80;
	server_name www.360buy.com;
	rewrite ^/ http://www.jd.com permanent;
}
```

问题描述:如何在域名跳转的过程中携带请求的 URI？

修改配置信息

```
server {
	listen 80;
	server_name www.itheima.com;
	rewrite ^(.*) http://www.hm.com$1 permanent;
}
```

问题描述:我们除了上述说的www.jd.com 、www.360buy.com其实还有我们也可以通过www.jingdong.com来访问，那么如何通过Rewrite来实现多个域名的跳转?

添加域名

```
vim /etc/hosts
192.168.200.133 www.jingdong.com
```

修改配置信息

```
server{
	listen 80;
	server_name www.360buy.com www.jingdong.com;
	rewrite ^(.*) http://www.jd.com$1 permanent;
}
```

#### 域名镜像

上述案例中，将www.360buy.com 和 www.jingdong.com都能跳转到www.jd.com，那么www.jd.com我们就可以把它起名叫主域名，其他两个就是我们所说的镜像域名，当然如果我们不想把整个网站做镜像，只想为其中某一个子目录下的资源做镜像，我们可以在location块中配置rewrite功能，比如:

```
server {
	listen 80;
	server_name rewrite.myweb.com;
	location ^~ /source1{
		rewrite ^/resource1(.*) http://rewrite.myweb.com/web$1 last;
	}
	location ^~ /source2{
		rewrite ^/resource2(.*) http://rewrite.myweb.com/web$1 last;
	}
}
```

#### 独立域名

一个完整的项目包含多个模块，比如购物网站有商品商品搜索模块、商品详情模块已经购物车模块等，那么我们如何为每一个模块设置独立的域名。

需求：

```
http://search.hm.com  访问商品搜索模块
http://item.hm.com	  访问商品详情模块
http://cart.hm.com	  访问商品购物车模块
```

```
server{
	listen 80;
	server_name search.hm.com;
	rewrite ^(.*) http://www.hm.com/bbs$1 last;
}
server{
	listen 81;
	server_name item.hm.com;
	rewrite ^(.*) http://www.hm.com/item$1 last;
}
server{
	listen 82;
	server_name cart.hm.com;
	rewrite ^(.*) http://www.hm.com/cart$1 last;
}
```

#### 目录自动添加"/"

问题描述

通过一个例子来演示下问题:

```
server {
	listen	80;
	server_name localhost;
	location / {
		root html;
		index index.html;
	}
}

```

要想访问上述资源，很简单，只需要通过http://192.168.200.133直接就能访问，地址后面不需要加/,但是如果将上述的配置修改为如下内容:

```
server {
	listen	80;
	server_name localhost;
	location /hm {
		root html;
		index index.html;
	}
}
```

这个时候，要想访问上述资源，按照上述的访问方式，我们可以通过 `http://192.168.200.133/hm/` 来访问,但是如果地址后面不加斜杠，页面就会出问题。如果不加斜杠，Nginx服务器内部会自动做一个301的重定向，重定向的地址会有一个指令叫server_name_in_redirect on|off;来决定重定向的地址：

```
如果该指令为on
	重定向的地址为:  http://server_name/目录名/;
如果该指令为off
	重定向的地址为:  http://原URL中的域名/目录名/;
```

所以就拿刚才的地址来说，http://192.168.200.133/hm如果不加斜杠，那么按照上述规则，如果指令server_name_in_redirect为on，则301重定向地址变为 http://localhost/hm/,如果为 off，则 301 重定向地址变为http://192.168.200.133/ht/。后面这个是正常的，前面地址就有问题。

注意 server_name_in_redirect 指令在 Nginx 的 0.8.48 版本之前默认都是 on，之后改成了 off,所以现在我们这个版本不需要考虑这个问题，但是如果是 0.8.48 以前的版本并且 server_name_in_redirect 设置为 on，我们如何通过 rewrite 来解决这个问题？

解决方案

我们可以使用 rewrite 功能为末尾没有斜杠的 URL 自动添加一个斜杠

```nginx
server {
	listen	80;
	server_name localhost;
	server_name_in_redirect on;
	location /hm {
		if (-d $request_filename){
			rewrite ^/(.*)([^/])$ http://$host/$1$2/ permanent;
		}
		# or
		set $dest $http_destination;
      	if (-d $request_filename) {
            rewrite ^(.*[^/])$ $1/;
            set $dest $dest/;
        }
	}
}
```

#### 合并目录

搜索引擎优化(SEO)是一种利用搜索引擎的搜索规则来提供目的网站的有关搜索引擎内排名的方式。我们在创建自己的站点时，可以通过很多中方式来有效的提供搜索引擎优化的程度。其中有一项就包含 URL 的目录层级一般不要超过三层，否则的话不利于搜索引擎的搜索也给客户端的输入带来了负担，但是将所有的文件放在一个目录下又会导致文件资源管理混乱并且访问文件的速度也会随着文件增多而慢下来，这两个问题是相互矛盾的，那么使用 rewrite 如何解决上述问题?

举例，网站中有一个资源文件的访问路径时 /server/11/22/33/44/20.html,也就是说 20.html 存在于第 5 级目录下，如果想要访问该资源文件，客户端的 URL 地址就要写成 `http://www.web.name/server/11/22/33/44/20.html`,

```nginx
server {
	listen 80;
	server_name www.web.name;
	location /server{
		root html;
	}
}
```

但是这个是非常不利于 SEO 搜索引擎优化的，同时客户端也不好记.使用 rewrite 我们可以进行如下配置:

```nginx
server {
	listen 80;
	server_name www.web.name;
	location /server{
		rewrite ^/server-([0-9]+)-([0-9]+)-([0-9]+)-([0-9]+)\.html$ /server/$1/$2/$3/$4/$5.html last;
	}
}
```

这样的花，客户端只需要输入http://www.web.name/server-11-22-33-44-20.html就可以访问到20.html页面了。这里也充分利用了rewrite指令支持正则表达式的特性。

#### 防盗链

防盗链之前我们已经介绍过了相关的知识，在 rewrite 中的防盗链和之前将的原理其实都是一样的，只不过通过 rewrite 可以将防盗链的功能进行完善下，当出现防盗链的情况，我们可以使用 rewrite 将请求转发到自定义的一张图片和页面，给用户比较好的提示信息。下面我们就通过根据文件类型实现防盗链的一个配置实例:

```
server{
	listen 80;
	server_name www.web.com;
	locatin ~* ^.+\.(gif|jpg|png|swf|flv|rar|zip)${
		valid_referers none blocked server_names *.web.com;
		if ($invalid_referer){
			rewrite ^/ http://www.web.com/images/forbidden.png;
		}
	}
}
```

根据目录实现防盗链配置：

```
server{
	listen 80;
	server_name www.web.com;
	location /file/{
		root /server/file/;
		valid_referers none blocked server_names *.web.com;
		if ($invalid_referer){
			rewrite ^/ http://www.web.com/images/forbidden.png;
		}
	}
}
```

### Nginx 反向代理的配置语法

Nginx 反向代理模块的指令是由`ngx_http_proxy_module`模块进行解析，该模块在安装 Nginx 的时候已经自己加装到 Nginx 中了，接下来我们把反向代理中的常用指令一一介绍下：

```
proxy_pass
proxy_set_header
proxy_redirect
```

#### proxy_pass

该指令用来设置被代理服务器地址，可以是主机名称、IP 地址加端口号形式。

| 语法   | proxy_pass URL; |
| ------ | --------------- |
| 默认值 | —               |
| 位置   | location        |

URL:为要设置的被代理服务器地址，包含传输协议(`http`,`https://`)、主机名称或 IP 地址加端口号、URI 等要素。

举例：

```
proxy_pass http://www.baidu.com;
location /server{}
proxy_pass http://192.168.200.146;
    http://192.168.200.146/server/index.html
proxy_pass http://192.168.200.146/;
    http://192.168.200.146/index.html
```

大家在编写 proxy_pass 的时候，后面的值要不要加"/"?

接下来通过例子来说明刚才我们提到的问题：

```
server {
	listen 80;
	server_name localhost;
	location /{
		#proxy_pass http://192.168.200.146;
		proxy_pass http://192.168.200.146/;
	}
}
当客户端访问 http://localhost/index.html,效果是一样的
server{
	listen 80;
	server_name localhost;
	location /server{
		#proxy_pass http://192.168.200.146;
		proxy_pass http://192.168.200.146/;
	}
}
当客户端访问 http://localhost/server/index.html
这个时候，第一个proxy_pass就变成了http://localhost/server/index.html
第二个proxy_pass就变成了http://localhost/index.html效果就不一样了。
```

#### proxy_set_header

该指令可以更改 Nginx 服务器接收到的客户端请求的请求头信息，然后将新的请求头发送给代理的服务器

| 语法   | proxy_set_header field value;                                             |
| ------ | ------------------------------------------------------------------------- |
| 默认值 | proxy_set_header Host $proxy_host;<br/>proxy_set_header Connection close; |
| 位置   | http、server、location                                                    |

需要注意的是，如果想要看到结果，必须在被代理的服务器上来获取添加的头信息。

被代理服务器： [192.168.200.146]

```
server {
        listen  8080;
        server_name localhost;
        default_type text/plain;
        return 200 $http_username;
}
```

代理服务器: [192.168.200.133]

```
server {
        listen  8080;
        server_name localhost;
        location /server {
                proxy_pass http://192.168.200.146:8080/;
                proxy_set_header username TOM;
        }
    }

```

访问测试

#### proxy_redirect

该指令是用来重置响应头信息中的"Location"和"Refresh"的值。

| 语法   | proxy_redirect redirect replacement;<br/>proxy_redirect default;<br/>proxy_redirect off; |
| ------ | ---------------------------------------------------------------------------------------- |
| 默认值 | proxy_redirect default;                                                                  |
| 位置   | http、server、location                                                                   |

》为什么要用该指令?

服务端[192.168.200.146]

```
server {
    listen  8081;
    server_name localhost;
    if (!-f $request_filename){
    	return 302 http://192.168.200.146;
    }
}

```

代理服务端[192.168.200.133]

```
server {
	listen  8081;
	server_name localhost;
	location / {
		proxy_pass http://192.168.200.146:8081/;
		proxy_redirect http://192.168.200.146 http://192.168.200.133;
	}
}
```

》该指令的几组选项

proxy_redirect redirect replacement;

```
redirect:目标,Location的值
replacement:要替换的值
```

proxy_redirect default;

```
default;
将location块的uri变量作为replacement,
将proxy_pass变量作为redirect进行替换
```

proxy_redirect off;

```
关闭proxy_redirect的功能
```

### Nginx 的安全控制

关于 web 服务器的安全是比较大的一个话题，里面所涉及的内容很多，Nginx 反向代理是如何来提升 web 服务器的安全呢？

安全隔离

什么是安全隔离?

通过代理分开了客户端到应用程序服务器端的连接，实现了安全措施。在反向代理之前设置防火墙，仅留一个入口供代理服务器访问。

#### 如何使用 SSL 对流量进行加密

翻译成大家能熟悉的说法就是将我们常用的 http 请求转变成 https 请求，那么这两个之间的区别简单的来说两个都是 HTTP 协议，只不过 https 是身披 SSL 外壳的 http.

HTTPS 是一种通过计算机网络进行安全通信的传输协议。它经由 HTTP 进行通信，利用 SSL/TLS 建立全通信，加密数据包，确保数据的安全性。

SSL(Secure Sockets Layer)安全套接层

TLS(Transport Layer Security)传输层安全

上述这两个是为网络通信提供安全及数据完整性的一种安全协议，TLS 和 SSL 在传输层和应用层对网络连接进行加密。

总结来说为什么要使用 https:

```
http协议是明文传输数据，存在安全问题，而https是加密传输，相当于http+ssl，并且可以防止流量劫持。
```

Nginx 要想使用 SSL，需要满足一个条件即需要添加一个模块`--with-http_ssl_module`,而该模块在编译的过程中又需要 OpenSSL 的支持，这个我们之前已经准备好了。

##### nginx 添加 SSL 的支持

（1）完成 `--with-http_ssl_module`模块的增量添加

```
》将原有/usr/local/nginx/sbin/nginx进行备份
》拷贝nginx之前的配置信息
》在nginx的安装源码进行配置指定对应模块  ./configure --with-http_ssl_module
》通过make模板进行编译
》将objs下面的nginx移动到/usr/local/nginx/sbin下
》在源码目录下执行  make upgrade进行升级，这个可以实现不停机添加新模块的功能
```

##### Nginx 的 SSL 相关指令

因为刚才我们介绍过该模块的指令都是通过 ngx_http_ssl_module 模块来解析的。

(1) ssl:该指令用来在指定的服务器开启 HTTPS,可以使用 listen 443 ssl,后面这种方式更通用些。

| 语法   | ssl on \| off; |
| ------ | -------------- |
| 默认值 | ssl off;       |
| 位置   | http、server   |

```
server{
	listen 443 ssl;
}
```

(2) ssl_certificate:为当前这个虚拟主机指定一个带有 PEM 格式证书的证书。

| 语法   | ssl_certificate file; |
| ------ | --------------------- |
| 默认值 | —                     |
| 位置   | http、server          |

(3) ssl_certificate_key:该指令用来指定 PEM secret key 文件的路径

| 语法   | ssl_ceritificate_key file; |
| ------ | -------------------------- |
| 默认值 | —                          |
| 位置   | http、server               |

(4) ssl_session_cache:该指令用来配置用于 SSL 会话的缓存

| 语法   | ssl_sesion_cache off\|none\|[builtin[:size]] [shared:name:size] |
| ------ | --------------------------------------------------------------- |
| 默认值 | ssl_session_cache none;                                         |
| 位置   | http、server                                                    |

off:禁用会话缓存，客户端不得重复使用会话

none:禁止使用会话缓存，客户端可以重复使用，但是并没有在缓存中存储会话参数

builtin:内置 OpenSSL 缓存，仅在一个工作进程中使用。

shared:所有工作进程之间共享缓存，缓存的相关信息用 name 和 size 来指定

(5) ssl_session_timeout：开启 SSL 会话功能后，设置客户端能够反复使用储存在缓存中的会话参数时间。

| 语法   | ssl_session_timeout time; |
| ------ | ------------------------- |
| 默认值 | ssl_session_timeout 5m;   |
| 位置   | http、server              |

(6) ssl_ciphers:指出允许的密码，密码指定为 OpenSSL 支持的格式

| 语法   | ssl_ciphers ciphers;          |
| ------ | ----------------------------- |
| 默认值 | ssl_ciphers HIGH:!aNULL:!MD5; |
| 位置   | http、server                  |

可以使用`openssl ciphers`查看 openssl 支持的格式。

(7) ssl_prefer_server_ciphers：该指令指定是否服务器密码优先客户端密码

| 语法   | ssl_perfer_server_ciphers on\|off; |
| ------ | ---------------------------------- |
| 默认值 | ssl_perfer_server_ciphers off;     |
| 位置   | http、server                       |

##### 生成证书

方式一：使用阿里云/腾讯云等第三方服务进行购买。

方式二:使用 openssl 生成证书

先要确认当前系统是否有安装 openssl

```
openssl version
```

安装下面的命令进行生成

```
mkdir /root/cert
cd /root/cert
openssl genrsa -des3 -out server.key 1024
openssl req -new -key server.key -out server.csr
cp server.key server.key.org
openssl rsa -in server.key.org -out server.key
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
```

##### 开启 SSL 实例

```
server {
    listen       443 ssl;
    server_name  localhost;

    ssl_certificate      server.cert;
    ssl_certificate_key  server.key;

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    location / {
        root   html;
        index  index.html index.htm;
    }
}
```

（4）验证

### 反向代理系统调优

反向代理值 Buffer 和 Cache

Buffer 翻译过来是"缓冲"，Cache 翻译过来是"缓存"。

总结下：

```
相同点:
两种方式都是用来提供IO吞吐效率，都是用来提升Nginx代理的性能。
不同点:
缓冲主要用来解决不同设备之间数据传递速度不一致导致的性能低的问题，缓冲中的数据一旦此次操作完成后，就可以删除。
缓存主要是备份，将被代理服务器的数据缓存一份到代理服务器，这样的话，客户端再次获取相同数据的时候，就只需要从代理服务器上获取，效率较高，缓存中的数据可以重复使用，只有满足特定条件才会删除.
```

（1）Proxy Buffer 相关指令

》proxy_buffering :该指令用来开启或者关闭代理服务器的缓冲区；

| 语法   | proxy_buffering on\|off; |
| ------ | ------------------------ |
| 默认值 | proxy_buffering on;      |
| 位置   | http、server、location   |

》proxy_buffers:该指令用来指定单个连接从代理服务器读取响应的缓存区的个数和大小。

| 语法   | proxy_buffers number size;                |
| ------ | ----------------------------------------- |
| 默认值 | proxy_buffers 8 4k \| 8K;(与系统平台有关) |
| 位置   | http、server、location                    |

number:缓冲区的个数

size:每个缓冲区的大小，缓冲区的总大小就是 number\*size

》proxy_buffer_size:该指令用来设置从被代理服务器获取的第一部分响应数据的大小。保持与 proxy_buffers 中的 size 一致即可，当然也可以更小。

| 语法   | proxy_buffer_size size;                     |
| ------ | ------------------------------------------- |
| 默认值 | proxy_buffer_size 4k \| 8k;(与系统平台有关) |
| 位置   | http、server、location                      |

》proxy_busy_buffers_size：该指令用来限制同时处于 BUSY 状态的缓冲总大小。

| 语法   | proxy_busy_buffers_size size;    |
| ------ | -------------------------------- |
| 默认值 | proxy_busy_buffers_size 8k\|16K; |
| 位置   | http、server、location           |

》proxy_temp_path:当缓冲区存满后，仍未被 Nginx 服务器完全接受，响应数据就会被临时存放在磁盘文件上，该指令设置文件路径

| 语法   | proxy_temp_path path;       |
| ------ | --------------------------- |
| 默认值 | proxy_temp_path proxy_temp; |
| 位置   | http、server、location      |

注意 path 最多设置三层。

》proxy_temp_file_write_size：该指令用来设置磁盘上缓冲文件的大小。

| 语法   | proxy_temp_file_write_size size;    |
| ------ | ----------------------------------- |
| 默认值 | proxy_temp_file_write_size 8K\|16K; |
| 位置   | http、server、location              |

通用网站的配置

```
proxy_buffering on;
proxy_buffer_size 4 32k;
proxy_busy_buffers_size 64k;
proxy_temp_file_write_size 64k;
```

根据项目的具体内容进行相应的调节。

### 负载均衡常用的处理方式

#### 方式一:用户手动选择

#### 方式二:DNS 轮询方式

#### 方式三:四/七层负载均衡

介绍四/七层负载均衡之前，我们先了解一个概念，OSI(open system interconnection),叫开放式系统互联模型，这个是由国际标准化组织 ISO 指定的一个不基于具体机型、操作系统或公司的网络体系结构。该模型将网络通信的工作分为七层。

应用层：为应用程序提供网络服务。

表示层：对数据进行格式化、编码、加密、压缩等操作。

会话层：建立、维护、管理会话连接。

传输层：建立、维护、管理端到端的连接，常见的有 TCP/UDP。

网络层：IP 寻址和路由选择

数据链路层：控制网络层与物理层之间的通信。

物理层：比特流传输。

所谓四层负载均衡指的是 OSI 七层模型中的传输层，主要是基于 IP+PORT 的负载均衡

```
实现四层负载均衡的方式：
硬件：F5 BIG-IP、Radware等
软件：LVS、Nginx、Hayproxy等
```

所谓的七层负载均衡指的是在应用层，主要是基于虚拟的 URL 或主机 IP 的负载均衡

```
实现七层负载均衡的方式：
软件：Nginx、Hayproxy等
```

四层和七层负载均衡的区别

```
四层负载均衡数据包是在底层就进行了分发，而七层负载均衡数据包则在最顶端进行分发，所以四层负载均衡的效率比七层负载均衡的要高。
四层负载均衡不识别域名，而七层负载均衡识别域名。
```

处理四层和七层负载以为其实还有二层、三层负载均衡，二层是在数据链路层基于 mac 地址来实现负载均衡，三层是在网络层一般采用虚拟 IP 地址的方式实现负载均衡。

实际环境采用的模式

```
四层负载(LVS)+七层负载(Nginx)
```

### Nginx 七层负载均衡

Nginx 要实现七层负载均衡需要用到 proxy_pass 代理模块配置。Nginx 默认安装支持这个模块，我们不需要再做任何处理。Nginx 的负载均衡是在 Nginx 的反向代理基础上把用户的请求根据指定的算法分发到一组【upstream 虚拟服务池】。

#### Nginx 七层负载均衡的指令

##### upstream 指令

该指令是用来定义一组服务器，它们可以是监听不同端口的服务器，并且也可以是同时监听 TCP 和 Unix socket 的服务器。服务器可以指定不同的权重，默认为 1。

| 语法   | upstream name {...} |
| ------ | ------------------- |
| 默认值 | —                   |
| 位置   | http                |

##### server 指令

该指令用来指定后端服务器的名称和一些参数，可以使用域名、IP、端口或者 unix socket

| 语法   | server name [paramerters] |
| ------ | ------------------------- |
| 默认值 | —                         |
| 位置   | upstream                  |

#### Nginx 七层负载均衡的实现流程

服务端设置

```
server {
    listen   9001;
    server_name localhost;
    default_type text/html;
    location /{
    	return 200 '<h1>192.168.200.146:9001</h1>';
    }
}
server {
    listen   9002;
    server_name localhost;
    default_type text/html;
    location /{
    	return 200 '<h1>192.168.200.146:9002</h1>';
    }
}
server {
    listen   9003;
    server_name localhost;
    default_type text/html;
    location /{
    	return 200 '<h1>192.168.200.146:9003</h1>';
    }
}
```

负载均衡器设置

```
upstream backend{
	server 192.168.200.146:9001;
	server 192.168.200.146:9002;
	server 192.168.200.146:9003;
}
server {
	listen 8083;
	server_name localhost;
	location /{
		proxy_pass http://backend;
	}
}
```

#### 负载均衡状态

代理服务器在负责均衡调度中的状态有以下几个：

| 状态         | 概述                                |
| ------------ | ----------------------------------- |
| down         | 当前的 server 暂时不参与负载均衡    |
| backup       | 预留的备份服务器                    |
| max_fails    | 允许请求失败的次数                  |
| fail_timeout | 经过 max_fails 失败后, 服务暂停时间 |
| max_conns    | 限制最大的接收连接数                |

##### down

down:将该服务器标记为永久不可用，那么该代理服务器将不参与负载均衡。

```
upstream backend{
	server 192.168.200.146:9001 down;
	server 192.168.200.146:9002
	server 192.168.200.146:9003;
}
server {
	listen 8083;
	server_name localhost;
	location /{
		proxy_pass http://backend;
	}
}
```

该状态一般会对需要停机维护的服务器进行设置。

##### backup

backup:将该服务器标记为备份服务器，当主服务器不可用时，将用来传递请求。

```
upstream backend{
	server 192.168.200.146:9001 down;
	server 192.168.200.146:9002 backup;
	server 192.168.200.146:9003;
}
server {
	listen 8083;
	server_name localhost;
	location /{
		proxy_pass http://backend;
	}
}
```

##### max_conns

max_conns=number:用来设置代理服务器同时活动链接的最大数量，默认为 0，表示不限制，使用该配置可以根据后端服务器处理请求的并发量来进行设置，防止后端服务器被压垮。

##### max_fails 和 fail_timeout

max_fails=number:设置允许请求代理服务器失败的次数，默认为 1。

fail_timeout=time:设置经过 max_fails 失败后，服务暂停的时间，默认是 10 秒。

```
upstream backend{
	server 192.168.200.133:9001 down;
	server 192.168.200.133:9002 backup;
	server 192.168.200.133:9003 max_fails=3 fail_timeout=15;
}
server {
	listen 8083;
	server_name localhost;
	location /{
		proxy_pass http://backend;
	}
}
```

#### 负载均衡策略

介绍完 Nginx 负载均衡的相关指令后，我们已经能实现将用户的请求分发到不同的服务器上，那么除了采用默认的分配方式以外，我们还能采用什么样的负载算法?

Nginx 的 upstream 支持如下六种方式的分配算法，分别是:

| 算法名称   | 说明              |
| ---------- | ----------------- |
| 轮询       | 默认方式          |
| weight     | 权重方式          |
| ip_hash    | 依据 ip 分配方式  |
| least_conn | 依据最少连接方式  |
| url_hash   | 依据 URL 分配方式 |
| fair       | 依据响应时间方式  |

##### 轮询

是 upstream 模块负载均衡默认的策略。每个请求会按时间顺序逐个分配到不同的后端服务器。轮询不需要额外的配置。

```
upstream backend{
	server 192.168.200.146:9001 weight=1;
	server 192.168.200.146:9002;
	server 192.168.200.146:9003;
}
server {
	listen 8083;
	server_name localhost;
	location /{
		proxy_pass http://backend;
	}
}
```

##### weight 加权[加权轮询]

weight=number:用来设置服务器的权重，默认为 1，权重数据越大，被分配到请求的几率越大；该权重值，主要是针对实际工作环境中不同的后端服务器硬件配置进行调整的，所有此策略比较适合服务器的硬件配置差别比较大的情况。

```
upstream backend{
	server 192.168.200.146:9001 weight=10;
	server 192.168.200.146:9002 weight=5;
	server 192.168.200.146:9003 weight=3;
}
server {
	listen 8083;
	server_name localhost;
	location /{
		proxy_pass http://backend;
	}
}
```

##### ip_hash

当对后端的多台动态应用服务器做负载均衡时，ip_hash 指令能够将某个客户端 IP 的请求通过哈希算法定位到同一台后端服务器上。这样，当来自某一个 IP 的用户在后端 Web 服务器 A 上登录后，在访问该站点的其他 URL，能保证其访问的还是后端 web 服务器 A。

| 语法   | ip_hash; |
| ------ | -------- |
| 默认值 | —        |
| 位置   | upstream |

```
upstream backend{
	ip_hash;
	server 192.168.200.146:9001;
	server 192.168.200.146:9002;
	server 192.168.200.146:9003;
}
server {
	listen 8083;
	server_name localhost;
	location /{
		proxy_pass http://backend;
	}
}
```

需要额外多说一点的是使用 ip_hash 指令无法保证后端服务器的负载均衡，可能导致有些后端服务器接收到的请求多，有些后端服务器接收的请求少，而且设置后端服务器权重等方法将不起作用。

##### least_conn

最少连接，把请求转发给连接数较少的后端服务器。轮询算法是把请求平均的转发给各个后端，使它们的负载大致相同；但是，有些请求占用的时间很长，会导致其所在的后端负载较高。这种情况下，least_conn 这种方式就可以达到更好的负载均衡效果。

```
upstream backend{
	least_conn;
	server 192.168.200.146:9001;
	server 192.168.200.146:9002;
	server 192.168.200.146:9003;
}
server {
	listen 8083;
	server_name localhost;
	location /{
		proxy_pass http://backend;
	}
}
```

此负载均衡策略适合请求处理时间长短不一造成服务器过载的情况。

##### url_hash

按访问 url 的 hash 结果来分配请求，使每个 url 定向到同一个后端服务器，要配合缓存命中来使用。同一个资源多次请求，可能会到达不同的服务器上，导致不必要的多次下载，缓存命中率不高，以及一些资源时间的浪费。而使用 url_hash，可以使得同一个 url（也就是同一个资源请求）会到达同一台服务器，一旦缓存住了资源，再此收到请求，就可以从缓存中读取。

```
upstream backend{
	hash &request_uri;
	server 192.168.200.146:9001;
	server 192.168.200.146:9002;
	server 192.168.200.146:9003;
}
server {
	listen 8083;
	server_name localhost;
	location /{
		proxy_pass http://backend;
	}
}
```

##### fair

fair 采用的不是内建负载均衡使用的轮换的均衡算法，而是可以根据页面大小、加载时间长短智能的进行负载均衡。那么如何使用第三方模块的 fair 负载均衡策略。

```
upstream backend{
	fair;
	server 192.168.200.146:9001;
	server 192.168.200.146:9002;
	server 192.168.200.146:9003;
}
server {
	listen 8083;
	server_name localhost;
	location /{
		proxy_pass http://backend;
	}
}
```

但是如何直接使用会报错，因为 fair 属于第三方模块实现的负载均衡。需要添加`nginx-upstream-fair`,如何添加对应的模块:

1. 下载 nginx-upstream-fair 模块

```
下载地址为:
	https://github.com/gnosek/nginx-upstream-fair
```

2. 将下载的文件上传到服务器并进行解压缩

```
unzip nginx-upstream-fair-master.zip
```

3. 重命名资源

```
mv nginx-upstream-fair-master fair
```

4. 使用./configure 命令将资源添加到 Nginx 模块中

```
./configure --add-module=/root/fair
```

5. 编译

```
make
```

编译可能会出现如下错误，ngx_http_upstream_srv_conf_t 结构中缺少 default_port

解决方案:

在 Nginx 的源码中 src/http/ngx_http_upstream.h,找到`ngx_http_upstream_srv_conf_s`，在模块中添加添加 default_port 属性

```
in_port_t	   default_port
```

然后再进行 make.

6. 更新 Nginx

   6.1 将 sbin 目录下的 nginx 进行备份

```
mv /usr/local/nginx/sbin/nginx /usr/local/nginx/sbin/nginxold
```

6.2 将安装目录下的 objs 中的 nginx 拷贝到 sbin 目录

```
cd objs
cp nginx /usr/local/nginx/sbin
```

6.3 更新 Nginx

```
cd ../
make upgrade
```

7. 编译测试使用 Nginx

上面介绍了 Nginx 常用的负载均衡的策略，有人说是 5 种，是把轮询和加权轮询归为一种，也有人说是 6 种。那么在咱们以后的开发中到底使用哪种，这个需要根据实际项目的应用场景来决定的。

##### 案例五：实现带有 URL 重写的负载均衡

```
upstream backend{
	server 192.168.200.146:9001;
	server 192.168.200.146:9002;
	server 192.168.200.146:9003;
}
server {
	listen	80;
	server_name localhost;
	location /file/ {
		rewrite ^(/file/.*) /server/$1 last;
	}
	location / {
		proxy_pass http://backend;
	}
}
```

### Nginx 四层负载均衡

Nginx 在 1.9 之后，增加了一个 stream 模块，用来实现四层协议的转发、代理、负载均衡等。stream 模块的用法跟 http 的用法类似，允许我们配置一组 TCP 或者 UDP 等协议的监听，然后通过 proxy_pass 来转发我们的请求，通过 upstream 添加多个后端服务，实现负载均衡。

四层协议负载均衡的实现，一般都会用到 LVS、HAProxy、F5 等，要么很贵要么配置很麻烦，而 Nginx 的配置相对来说更简单，更能快速完成工作。

#### 添加 stream 模块的支持

Nginx 默认是没有编译这个模块的，需要使用到 stream 模块，那么需要在编译的时候加上`--with-stream`。

完成添加`--with-stream`的实现步骤:

```
》将原有/usr/local/nginx/sbin/nginx进行备份
》拷贝nginx之前的配置信息
》在nginx的安装源码进行配置指定对应模块  ./configure --with-stream
》通过make模板进行编译
》将objs下面的nginx移动到/usr/local/nginx/sbin下
》在源码目录下执行  make upgrade进行升级，这个可以实现不停机添加新模块的功能
```

#### Nginx 四层负载均衡的指令

##### stream 指令

该指令提供在其中指定流服务器指令的配置文件上下文。和 http 指令同级。

| 语法   | stream { ... } |
| ------ | -------------- |
| 默认值 | —              |
| 位置   | main           |

##### upstream 指令

该指令和 http 的 upstream 指令是类似的。

nginx.conf 配置

```
stream {
        upstream redisbackend {
                server 192.168.200.146:6379;
                server 192.168.200.146:6378;
        }
        upstream tomcatbackend {
        		server 192.168.200.146:8080;
        }
        server {
                listen  81;
                proxy_pass redisbackend;
        }
        server {
        		listen	82;
        		proxy_pass tomcatbackend;
        }
}
```

### Nginx 缓存集成

#### 缓存的概念

缓存就是数据交换的缓冲区(称作:Cache),当用户要获取数据的时候，会先从缓存中去查询获取数据，如果缓存中有就会直接返回给用户，如果缓存中没有，则会发请求从服务器重新查询数据，将数据返回给用户的同时将数据放入缓存，下次用户就会直接从缓存中获取数据。

缓存其实在很多场景中都有用到，比如：

| 场景             | 作用                     |
| ---------------- | ------------------------ |
| 操作系统磁盘缓存 | 减少磁盘机械操作         |
| 数据库缓存       | 减少文件系统的 IO 操作   |
| 应用程序缓存     | 减少对数据库的查询       |
| Web 服务器缓存   | 减少对应用服务器请求次数 |
| 浏览器缓存       | 减少与后台的交互次数     |

缓存的优点

1.减少数据传输，节省网络流量，加快响应速度，提升用户体验；

2.减轻服务器压力；

3.提供服务端的高可用性；

缓存的缺点

1.数据的不一致

2.增加成本

本次课程注解讲解的是 Nginx,Nginx 作为 web 服务器，Nginx 作为 Web 缓存服务器，它介于客户端和应用服务器之间，当用户通过浏览器访问一个 URL 时，web 缓存服务器会去应用服务器获取要展示给用户的内容，将内容缓存到自己的服务器上，当下一次请求到来时，如果访问的是同一个 URL，web 缓存服务器就会直接将之前缓存的内容返回给客户端，而不是向应用服务器再次发送请求。web 缓存降低了应用服务器、数据库的负载，减少了网络延迟，提高了用户访问的响应速度，增强了用户的体验。

#### Nginx 的 web 缓存服务

Nginx 是从 0.7.48 版开始提供缓存功能。Nginx 是基于 Proxy Store 来实现的，其原理是把 URL 及相关组合当做 Key,在使用 MD5 算法对 Key 进行哈希，得到硬盘上对应的哈希目录路径，从而将缓存内容保存在该目录中。它可以支持任意 URL 连接，同时也支持 404/301/302 这样的非 200 状态码。Nginx 即可以支持对指定 URL 或者状态码设置过期时间，也可以使用 purge 命令来手动清除指定 URL 的缓存。

#### Nginx 缓存设置的相关指令

Nginx 的 web 缓存服务主要是使用`ngx_http_proxy_module`模块相关指令集来完成，接下来我们把常用的指令来进行介绍下。

##### proxy_cache_path

该指定用于设置缓存文件的存放路径

| 语法   | proxy_cache_path path [levels=number] <br/>keys_zone=zone_name:zone_size [inactive=time]\[max_size=size]; |
| ------ | --------------------------------------------------------------------------------------------------------- |
| 默认值 | —                                                                                                         |
| 位置   | http                                                                                                      |

path:缓存路径地址,如：

```
/usr/local/proxy_cache
```

levels: 指定该缓存空间对应的目录，最多可以设置 3 层，每层取值为 1|2 如 :

```
levels=1:2   缓存空间有两层目录，第一次是1个字母，第二次是2个字母
举例说明:
itheima[key]通过MD5加密以后的值为 43c8233266edce38c2c9af0694e2107d
levels=1:2   最终的存储路径为/usr/local/proxy_cache/d/07
levels=2:1:2 最终的存储路径为/usr/local/proxy_cache/7d/0/21
levels=2:2:2 最终的存储路径为??/usr/local/proxy_cache/7d/10/e2
```

keys_zone:用来为这个缓存区设置名称和指定大小，如：

```
keys_zone=itcast:200m  缓存区的名称是itcast,大小为200M,1M大概能存储8000个keys
```

inactive:指定缓存的数据多次时间未被访问就将被删除，如：

```
inactive=1d   缓存数据在1天内没有被访问就会被删除
```

max_size:设置最大缓存空间，如果缓存空间存满，默认会覆盖缓存时间最长的资源，如:

```
max_size=20g
```

配置实例:

```
http{
	proxy_cache_path /usr/local/proxy_cache keys_zone=itcast:200m  levels=1:2:1 inactive=1d max_size=20g;
}
```

##### proxy_cache

该指令用来开启或关闭代理缓存，如果是开启则自定使用哪个缓存区来进行缓存。

| 语法   | proxy_cache zone_name\|off; |
| ------ | --------------------------- |
| 默认值 | proxy_cache off;            |
| 位置   | http、server、location      |

zone_name：指定使用缓存区的名称

##### proxy_cache_key

该指令用来设置 web 缓存的 key 值，Nginx 会根据 key 值 MD5 哈希存缓存。

| 语法   | proxy_cache_key key;                              |
| ------ | ------------------------------------------------- |
| 默认值 | proxy_cache_key \$scheme\$proxy_host$request_uri; |
| 位置   | http、server、location                            |

##### proxy_cache_valid

该指令用来对不同返回状态码的 URL 设置不同的缓存时间

| 语法   | proxy_cache_valid [code ...] time; |
| ------ | ---------------------------------- |
| 默认值 | —                                  |
| 位置   | http、server、location             |

如：

```
proxy_cache_valid 200 302 10m;
proxy_cache_valid 404 1m;
为200和302的响应URL设置10分钟缓存，为404的响应URL设置1分钟缓存
proxy_cache_valid any 1m;
对所有响应状态码的URL都设置1分钟缓存
```

##### proxy_cache_min_uses

该指令用来设置资源被访问多少次后被缓存

| 语法   | proxy_cache_min_uses number; |
| ------ | ---------------------------- |
| 默认值 | proxy_cache_min_uses 1;      |
| 位置   | http、server、location       |

##### proxy_cache_methods

该指令用户设置缓存哪些 HTTP 方法

| 语法   | proxy_cache_methods GET\|HEAD\|POST; |
| ------ | ------------------------------------ |
| 默认值 | proxy_cache_methods GET HEAD;        |
| 位置   | http、server、location               |

默认缓存 HTTP 的 GET 和 HEAD 方法，不缓存 POST 方法。

#### Nginx 缓存的清除

##### 方式一:删除对应的缓存目录

```
rm -rf /usr/local/proxy_cache/......
```

##### 方式二:使用第三方扩展模块

###### ngx_cache_purge

（1）下载 ngx_cache_purge 模块对应的资源包，并上传到服务器上。

```
ngx_cache_purge-2.3.tar.gz
```

（2）对资源文件进行解压缩

```
tar -zxf ngx_cache_purge-2.3.tar.gz
```

（3）修改文件夹名称，方便后期配置

```
mv ngx_cache_purge-2.3 purge
```

（4）查询 Nginx 的配置参数

```
nginx -V
```

（5）进入 Nginx 的安装目录，使用./configure 进行参数配置

```
./configure --add-module=/root/nginx/module/purge
```

（6）使用 make 进行编译

```
make
```

（7）将 nginx 安装目录的 nginx 二级制可执行文件备份

```
mv /usr/local/nginx/sbin/nginx /usr/local/nginx/sbin/nginxold
```

（8）将编译后的 objs 中的 nginx 拷贝到 nginx 的 sbin 目录下

```
cp objs/nginx /usr/local/nginx/sbin
```

（9）使用 make 进行升级

```
make upgrade
```

（10）在 nginx 配置文件中进行如下配置

```
server{
	location ~/purge(/.*) {
		proxy_cache_purge itcast itheima;
	}
}
```

#### Nginx 设置资源不缓存

前面咱们已经完成了 Nginx 作为 web 缓存服务器的使用。但是我们得思考一个问题就是不是所有的数据都适合进行缓存。比如说对于一些经常发生变化的数据。如果进行缓存的话，就很容易出现用户访问到的数据不是服务器真实的数据。所以对于这些资源我们在缓存的过程中就需要进行过滤，不进行缓存。

Nginx 也提供了这块的功能设置，需要使用到如下两个指令

proxy_no_cache

该指令是用来定义不将数据进行缓存的条件。

| 语法   | proxy_no_cache string ...; |
| ------ | -------------------------- |
| 默认值 | —                          |
| 位置   | http、server、location     |

配置实例

```
proxy_no_cache $cookie_nocache $arg_nocache $arg_comment;
```

proxy_cache_bypass

该指令是用来设置不从缓存中获取数据的条件。

| 语法   | proxy_cache_bypass string ...; |
| ------ | ------------------------------ |
| 默认值 | —                              |
| 位置   | http、server、location         |

配置实例

```
proxy_cache_bypass $cookie_nocache $arg_nocache $arg_comment;
```

上述两个指令都有一个指定的条件，这个条件可以是多个，并且多个条件中至少有一个不为空且不等于"0",则条件满足成立。上面给的配置实例是从官方网站获取的，里面使用到了三个变量，分别是\$cookie_nocache、\$arg_nocache、\$arg_comment

##### $cookie_nocache、\$arg_nocache、\$arg_comment

这三个参数分别代表的含义是:

```
$cookie_nocache
指的是当前请求的cookie中键的名称为nocache对应的值
$arg_nocache和$arg_comment
指的是当前请求的参数中属性名为nocache和comment对应的属性值
```

案例演示下:

```
log_format params $cookie_nocache | $arg_nocache | $arg_comment；
server{
	listen	8081;
	server_name localhost;
	location /{
		access_log logs/access_params.log params;
		add_header Set-Cookie 'nocache=999';
		root html;
		index index.html;
	}
}
```

##### 案例实现

设置不缓存资源的配置方案

```
server{
	listen	8080;
	server_name localhost;
	location / {
		if ($request_uri ~ /.*\.js$){
           set $nocache 1;
        }
		proxy_no_cache $nocache $cookie_nocache $arg_nocache $arg_comment;
        proxy_cache_bypass $nocache $cookie_nocache $arg_nocache $arg_comment;
	}
}
```

### Nginx 的用户认证模块

对应系统资源的访问，我们往往需要限制谁能访问，谁不能访问。这块就是我们通常所说的认证部分，认证需要做的就是根据用户输入的用户名和密码来判定用户是否为合法用户，如果是则放行访问，如果不是则拒绝访问。

Nginx 对应用户认证这块是通过 ngx_http_auth_basic_module 模块来实现的，它允许通过使用"HTTP 基本身份验证"协议验证用户名和密码来限制对资源的访问。默认情况下 nginx 是已经安装了该模块，如果不需要则使用--without-http_auth_basic_module。

该模块的指令比较简单，

（1）auth_basic:使用“ HTTP 基本认证”协议启用用户名和密码的验证

| 语法   | auth_basic string\|off;           |
| ------ | --------------------------------- |
| 默认值 | auth_basic off;                   |
| 位置   | http,server,location,limit_except |

开启后，服务端会返回 401，指定的字符串会返回到客户端，给用户以提示信息，但是不同的浏览器对内容的展示不一致。

（2）auth_basic_user_file:指定用户名和密码所在文件

| 语法   | auth_basic_user_file file;        |
| ------ | --------------------------------- |
| 默认值 | —                                 |
| 位置   | http,server,location,limit_except |

指定文件路径，该文件中的用户名和密码的设置，密码需要进行加密。可以采用工具自动生成

实现步骤:

1.nginx.conf 添加如下内容

```
location /download{
    root /usr/local;
    autoindex on;
    autoindex_exact_size on;
    autoindex_format html;
    autoindex_localtime on;
    auth_basic 'please input your auth';
    auth_basic_user_file htpasswd;
}
```

2.我们需要使用`htpasswd`工具生成

```
yum install -y httpd-tools
```

```
htpasswd -c /usr/local/nginx/conf/htpasswd username //创建一个新文件记录用户名和密码
htpasswd -b /usr/local/nginx/conf/htpasswd username password //在指定文件新增一个用户名和密码
htpasswd -D /usr/local/nginx/conf/htpasswd username //从指定文件删除一个用户信息
htpasswd -v /usr/local/nginx/conf/htpasswd username //验证用户名和密码是否正确
```

3. 也可使用 openssl 生成

```bash
printf "username:$(openssl passwd Passw0rd)\n" >> dav.pass
```

上述方式虽然能实现用户名和密码的验证，但是大家也看到了，所有的用户名和密码信息都记录在文件里面，如果用户量过大的话，这种方式就显得有点麻烦了，这时候我们就得通过后台业务代码来进行用户权限的校验了。

### nginx 访问控制 allow、deny（ngx_http_access_module）

(1) allow

allow

| 语法:      | allow address \| CIDR \| unix: \| all; |
| ---------- | -------------------------------------- |
| 默认值:    |  —                                     |
| 配置段:    |  http, server, location, limit_except  |

允许某个 ip 或者一个 ip 段访问.如果指定 unix:,那将允许 socket 的访问.注意：unix 在 1.5.1 中新加入的功能，如果你的版本比这个低，请不要使用这个方法。

(2) deny

| 语法:      | deny address \| CIDR \| unix: \| all; |
| ---------- | ------------------------------------- |
| 默认值:    | —                                     |
| 配置段:    |  http, server, location, limit_except |

禁止某个 ip 或者一个 ip 段访问.如果指定 unix:,那将禁止 socket 的访问.注意：unix 在 1.5.1 中新加入的功能，如果你的版本比这个低，请不要使用这个方法。

从上到下的顺序，类似 iptables。匹配到了便跳出。

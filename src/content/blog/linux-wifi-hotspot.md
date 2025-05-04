---
title: "Intel AX200无法创建热点解决方法"
pubDate: "2025-05-04T21:00"
updatedDate: "2025-05-04T21:00"
tags: ["网卡", "内核"]
category: "技术向"
---

最近升级 6.11 版本的内核之后，就没办法正常用 linux-wifi-hotspot 开热点给手机用，搜索了很久也没找到解决方法。后来在 github 看到是 iwlwifi 驱动的新提交造成的，然后试着撤销了修改，重新编译内核模块，发现可以正常创建 wifi 热点了。

## 解决方法

根据这个[issue](https://github.com/lakinduakash/linux-wifi-hotspot/issues/435)的说明，只需要把这个提交更改的限制改回原本的就可以了。

首先需要下载对应内核版本的源码，比如`https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.14.4.tar.xz`，然后按照以下修改文件`linux-6.14.2/drivers/net/wireless/intel/iwlwifi/mvm/mac80211.c`的第 57 行附近：

```c
static const struct ieee80211_iface_combination iwl_mvm_iface_combinations[] = {
	// {
	// 	.num_different_channels = 2,
	// 	.max_interfaces = 3,
	// 	.limits = iwl_mvm_limits,
	// 	.n_limits = ARRAY_SIZE(iwl_mvm_limits),
	// },
	{
		.num_different_channels = 2,
		.max_interfaces = 3,
		.limits = iwl_mvm_limits_ap,
		.n_limits = ARRAY_SIZE(iwl_mvm_limits_ap),
	},
};
```

切换到 iwlwifi 目录编译内核模块：

```sh
cd linux-6.14.2/drivers/net/wireless/intel/iwlwifi
make -C /lib/modules/`uname -r`/build M=$PWD
```

安装编译好的 iwlwifi 模块，这一步需要 ROOT 权限：

```sh
sudo make -C /lib/modules/`uname -r`/build M=$PWD modules_install
```

然后重启就能正常创建 wifi 热点了。

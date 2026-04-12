---
title: "kvm虚拟机安装及显卡直通"
pubDate: "2024-05-01T14:48"
updatedDate: "2024-05-01T14:48"
tags: ["kvm", "nvidia", "gpu"]
category: "技术向"
---

> [[#显卡直通]]
> [PCI_passthrough_via_OVMF WIKI](https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF#Setting_up_IOMMU)

# 虚拟机安装

## 下载windows镜像和virtio驱动包

[virtio 硬盘驱动](https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/latest-virtio/)

[驱动（win安装后）](https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/upstream-virtio/)

## 安装所需包

```
pacman -S qemu libvirt ovmf ebtables dnsmasq bridge-utils openbsd-netcat virt-manager
yay looking-glass
```

## 添加组

```
usermod -aG libvirt $(whoami)
usermod -aG kvm $(whoami)
usermod -aG input $(whoami)
```

## 配置ovmf

> ovmf is an open-source UEFI firmware for QEMU virtual machines

```shell
# /etc/libvirt/qemu.conf
# 取消注释
nvram = [ "/usr/share/ovmf/x64/OVMF_CODE.fd:/usr/share/ovmf/x64/OVMF_VARS.fd"
]
```

重启libvirtd.service

## 设置网络

### 桥接

[桥接网络](https://wiki.libvirt.org/page/Networking#Bridged_networking_.28aka_.22shared_physical_device.22.29)

### nat

```
virsh net-list --all
virsh net-autostart --network default
virsh net-start --network default
```

## 创建虚拟机

- 选中Customize configuration before install
- 修改overview中firmware为uefi，芯片组q35
  > (Hint: If that is grayed out maybe you hit this bug: [https://bugs.archlinux.org/task/64175)](https://bugs.archlinux.org/task/64175%29)
- select `Copy host CPU configuration` in `CPUs`
- 更改`sata disk` 中`disk bus` 为 `virtio`
- 更改`nic...` 中`device model` 为 `virtio`
- 添加存储设备，类型为cdrom,添加virtio驱动iso

## 开始安装

> Just type `exit` if you land there if the command prompt appears. Select the `Boot Manager` entry

1. 安装virtio驱动
2. 重启设置完成进入桌面
3. 打开设备管理器，为other devices中设备安装驱动（E盘，选中包含子目录）

## 配置音频

1. `sudo virsh edit [vmname]`
   修改第一行为：
   `<domain type='kvm' xmlns:qemu='http://libvirt.org/schemas/domain/qemu/1.0'>`

2. `id -a` 获得用户id，替换下方`1000`
   在文件末尾 `</devices>` 下一行添加：

```xml

```

3. 重启服务

```
sudo systemctl restart libvirtd.service
systemctl --user restart pulseaudio.service/pipe
```

> in this case `pulseaudio` is a user service so we don’t use `sudo` and we need to supply the `--user` option

## windows 安装 ssh

```
# Install the OpenSSH Client
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0

# Install the OpenSSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
```

```
# Start the sshd service
Start-Service sshd

# OPTIONAL but recommended:
Set-Service -Name sshd -StartupType 'Automatic'

# Confirm the Firewall rule is configured. It should be created automatically by setup. Run the following to verify
if (!(Get-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue | Select-Object Name, Enabled)) {
    Write-Output "Firewall Rule 'OpenSSH-Server-In-TCP' does not exist, creating it..."
    New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
} else {
    Write-Output "Firewall rule 'OpenSSH-Server-In-TCP' has been created and exists."
}
```

# 显卡直通

## 开启iommu

添加内核参数 `iommu=pt`

if intel cpu: `intel_iommu=on`

## 重启，检查iommu

`dmesg | grep -i -e DMAR -e IOMMU`

## 获得iommu group

Next I needed to ensure that the IOMMU groups are valid. An IOMMU group is the smallest set of physical devices that can be passed to a virtual machine. To get all groups we can use this Bash script:

```shell
#!/bin/bash
shopt -s nullglob
for g in $(find /sys/kernel/iommu_groups/* -maxdepth 0 -type d | sort -V); do
    echo "IOMMU Group ${g##*/}:"
    for d in $g/devices/*; do
        echo -e "\t$(lspci -nns ${d##*/})"
    done;
done;
```

输出：

```shell
IOMMU Group 28:
        0d:00.0 VGA compatible controller [0300]: NVIDIA Corporation GP106 [GeForce GTX 1060 6GB] [10de:1c03] (rev a1)
        0d:00.1 Audio device [0403]: NVIDIA Corporation GP106 High Definition Audio Controller [10de:10f1] (rev a1)
```

> This is basically exactly what we want and what we need. The NVIDIA graphics card which I want to use for the Windows VM and the NVIDIA HDMI Audio output are in one IOMMU group. That’s perfect :-) If there would have been other devices listed in this IOMMU group that would have been not so nice. Because then the additional devices either also must be passed through to the Windows VM or you have to try different PCIe slots and hope that the Nvidia card will be placed in different IOMMU group next time.

## 隔离nvidia显卡

```shell
# /etc/modprobe.d/vfio.conf
options vfio-pci ids=10de:1c03,10de:10f1
```

为保证vfio-pci在显卡驱动前加载，编辑/etc/mkinitcpio.conf

`MODULES=(vfio_pci vfio vfio_iommu_type1 ...)`

`HOOKS=(... modconf ...)`

> As of kernel 6.2, the `vfio_virqfd` functionality has been folded into the base vfio module.

重启验证

`dmesg | grep -i vfio`

`lspci -nnk -d 10de:1c03` 输出应包含Kernel driver in use: ==vfio-pci==

## 移除无用硬件，添加显卡设备

## 修改虚拟机配置 `virsh edit win10`

```
<!-- 把 features 一段改成这样，就是让 QEMU 隐藏虚拟机的特征 -->
<features>
  <acpi/>
  <apic/>
  <hyperv mode="custom">
    <relaxed state="on"/>
    <vapic state="on"/>
    <spinlocks state="on" retries="8191"/>
    <vpindex state="on"/>
    <runtime state="on"/>
    <synic state="on"/>
    <stimer state="on"/>
    <reset state="on"/>
    <vendor_id state="on" value="GenuineIntel"/>
    <frequencies state="on"/>
    <tlbflush state="on"/>
  </hyperv>
  <kvm>
    <hidden state="on"/>
  </kvm>
  <vmport state="off"/>
</features>
<!-- 添加显卡直通的 PCIe 设备 -->
<hostdev mode='subsystem' type='pci' managed='yes'>
  <source>
    <address domain='0x0000' bus='0x01' slot='0x00' function='0x0'/>
  </source>
  <rom bar='off'/>
  <!-- 注意这里的 PCIe 总线地址必须是 01:00.0，一点都不能差 -->
  <!-- 如果保存时提示 PCIe 总线地址冲突，就把其它设备的 <address> 全部删掉 -->
  <!-- 这样 Libvirt 会重新分配一遍 PCIe 地址 -->
  <address type='pci' domain='0x0000' bus='0x01' slot='0x00' function='0x0' multifunction='on'/>
</hostdev>
<!-- 添加一块在虚拟机和宿主机之间共享的内存，以便将虚拟机显示内容传回宿主机 -->
<shmem name='looking-glass'>
  <model type='ivshmem-plain'/>
  <!-- 这里内存大小的公式是：分辨率宽 x 分辨率高 / 131072，然后向上取到 2 的 n 次方 -->
  <!-- 因为大部分 HDMI 假显示器的分辨率都是 3840 x 2160，计算结果是 63.28MB，向上取到 64MB -->
  <size unit='M'>64</size>
</shmem>
<!-- 禁用内存 Balloon，也就是内存动态伸缩，严重影响性能 -->
<memballoon model="none"/>
<!-- 在 </qemu:commandline> 之前添加这些参数 -->
<qemu:arg value='-acpitable'/>
<qemu:arg value='file=/ssdt1.dat'/>
```

此处的 ssdt1.dat 是一个修改后的 ACPI 表，用来模拟一块满电的电池。它对应如下 Base64，可以用 Base64 解码网站转换成二进制文件，放在根目录，或者从[本站下载](https://lantian.pub/usr/uploads/202007/ssdt1.dat)。

```base64
U1NEVKEAAAAB9EJPQ0hTAEJYUENTU0RUAQAAAElOVEwYEBkgoA8AFVwuX1NCX1BDSTAGABBMBi5f
U0JfUENJMFuCTwVCQVQwCF9ISUQMQdAMCghfVUlEABQJX1NUQQCkCh8UK19CSUYApBIjDQELcBcL
cBcBC9A5C1gCCywBCjwKPA0ADQANTElPTgANABQSX0JTVACkEgoEAAALcBcL0Dk=
```

```
width x height x 4 x 2 = total bytes
total bytes / 1024 / 1024 = total mebibytes
result = total mebibytes + 10
```

The result must be **rounded up** to the nearest power of two, and since 25.82 is bigger than 16 we should choose 32.

## 注意

> - 如果你的显卡直通进虚拟机后无法安装驱动，包括 Windows 不会自动下载安装、手动下载 NVIDIA 官网驱动安装器也提示找不到兼容的显卡，那么你大概率仍然需要提取显卡 BIOS。
> - 为了二次确认，你可以在虚拟机里进入设备管理器，找到你的显卡，查看它的硬件 ID，类似 `PCI\VEN_10DE&DEV_1C8D&SUBSYS_39D117AA&REV_A1`。如果 `SUBSYS` 后面跟着的是一串 0，这就意味着显卡 BIOS 加载失败，你需要手动提取显卡 BIOS。
> - 将设备管理器切换到 Device by Connection（按照连接方式显示设备），确认显卡的地址是总线 Bus 1，接口 Slot 0，功能 Function 0，并且确认显卡上级的 PCIe 接口是总线 Bus 0，接口 Slot 1，功能 Function 0。
> - 如果对不上，你需要按上面的方法重新分配一遍设备的 PCIe 地址。
> - 关闭虚拟机并再次启动，注意**不是直接重启**，再次在设备管理器里确认显卡工作正常。
> - 如果此时出现代码 43 了，检查你有没有添加好第二步最后的模拟电池。
> - 我第一次尝试用的是 Windows 10 LTSC 2019，也是重启后出现了代码 43。但因为当时我没有添加模拟电池，我无法确认是 NVIDIA 驱动不兼容系统版本，还是模拟电池的原因。建议使用最新版本的 Windows 10 或 Windows 11。

## looking-glass 配置

> For libvirt versions **before** 5.10.0, if you are using AppArmor, you need to add permissions for QEMU to access the shared memory file.
> 修改 `/etc/apparmor.d/local/abstractions/libvirt-qemu`
> `/dev/shm/looking-glass rw,`

创建 `/etc/tmpfiles.d/looking-glass.conf`，写入以下内容，把 `lantian` 换成你的用户名

`f /dev/shm/looking-glass 0660 lantian kvm -`

然后运行 `sudo systemd-tmpfiles /etc/tmpfiles.d/looking-glass.conf --create` 生效

## 安装 IVSHMEM 驱动

下载 [IVSHMEM 驱动](https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/upstream-virtio/virtio-win10-prewhql-0.1-161.zip)

在虚拟机里进入设备管理器，找到系统设备 - PCI 标准内存控制器（PCI standard RAM controller），更新驱动

虚拟机中安装同版本 looking-glass

`virsh edit [vmname]` 找到 `<video><model type="qxl" ...></video>`，将 type 改为 none，以禁用 QXL 虚拟显卡

宿主机中启动looking-glass `looking-glass-client -s -a`

> `-s` enables the built in SPICE client for input and/or clipboard support and `-a` will auto resize the window to the guest.

# 提取VBIOS

```
S1. 利用BIOS更新程序提取VBIOS
https://github.com/coderobe/VBiosFinder.git
https://github.com/awilliam/rom-parser.git
https://github.com/LongSoft/UEFITool.git

S2. 生成打补丁的OVMF并替换虚拟机配置中OVMF_CODE.fd
https://github.com/T-vK/ovmf-with-vbios-patch.git
```

> 使用下载的BIOS升级程序提取VBIOS，不要用GPU-Z

[详细步骤](https://lantian.pub/article/modify-computer/laptop-intel-nvidia-optimus-passthrough.lantian/)

## 编辑虚拟机配置

```xml
<hostdev mode='subsystem' type='pci' managed='yes'>
	<source>
		<address domain='0x0000' bus='0x01' slot='0x00' function='0x0'/>
	</source>
	<rom bar='on' file='/opt/qemu/nvidia-vbios.rom'/>
	<alias name="hostdev0"/>
	<address type='pci' domain='0x0000' bus='0x01' slot='0x00' function='0x0' multifunction='on'/>
</hostdev>
<qemu:override>
	<qemu:device alias='hostdev0'>
	<qemu:frontend>
	<qemu:property name='x-pci-vendor-id' type='unsigned' value='4318'/>
	<qemu:property name='x-pci-device-id' type='unsigned' value='8089'/>
	<qemu:property name='x-pci-sub-vendor-id' type='unsigned' value='6058'/>
	<qemu:property name='x-pci-sub-device-id' type='unsigned' value='14915'/>
	</qemu:frontend>
	</qemu:device>
</qemu:override>
```

# 防火墙

```shell
sudo firewall-cmd --permanent --zone=libvirt --add-rich-rule='rule priority="-1" family="ipv4" source address="192.168.122.0/24" protocol value="tcp" accept'
```

# rdp 连接 Makefile

```shell
yay -S freerdp

xfreerdp /u:ADMINISTRATOR /p:passwd /v:1.1.1.1 /f /sound:sys:pulse /mic:sys:pulse,format:1 /gfx:AVC444:on +clipboard
```

# [[nginx#12.10 webdav 配置|共享主机文件]]

# Makefile

```makefile
.DEFAULT_GOAL := virt

define pr
	@echo -e "\033[1;32m$1\033[0m"
endef

rdp = xfreerdp
height = 1020
ifdef WAYLAND_DISPLAY
	rdp = wlfreerdp
	height = 1040
endif

.PHONY: virt
virt:
	$(call pr,start libvirtd.service)
	sudo systemctl start libvirtd.service
	sleep 5
	# $(call pr,start nginx)
	# sudo systemctl start nginx.service
	$(call pr,start nfs)
	sudo systemctl start nfs-server.service
	$(call pr,start win10)
	-sudo virsh start win10
	sleep 15
	$(call pr,start $(rdp))
	$(rdp) /u:ADMINISTRATOR /p:passwd /v:1.1.1.1 /size:1920x$(height) /sound /video +clipboard -z

.PHONY: vst
vst:
	$(call pr,stop nfs)
	sudo systemctl stop nfs-server.service
	# $(call pr,stop nginx)
	# sudo systemctl stop nginx.service
```

# 性能提升

- [cpu固定](https://zhuanlan.zhihu.com/p/377931138)
- https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF

```
...
<vcpu placement='static'>8</vcpu>
<iothreads>1</iothreads>
<cputune>
  <vcpupin vcpu='0' cpuset='2'/>
  <vcpupin vcpu='1' cpuset='3'/>
  <vcpupin vcpu='2' cpuset='4'/>
  <vcpupin vcpu='3' cpuset='5'/>
  <vcpupin vcpu='4' cpuset='6'/>
  <vcpupin vcpu='5' cpuset='7'/>
  <vcpupin vcpu='6' cpuset='8'/>
  <vcpupin vcpu='7' cpuset='9'/>
  <emulatorpin cpuset='0-1'/>
  <iothreadpin iothread='1' cpuset='0-1'/>
</cputune>
    ...
    <topology sockets='1' cores='4' threads='2'/>
    ...
```

- 如果客户机是Windows，启用Hyper-V enlightenments可以改善性能

```
<qemu:arg value='-cpu'/>
<qemu:arg value='host,hv_relaxed,hv_spinlocks=0x1fff,hv_vapic,hv_time'/>
```

# hook manager

## 安装

```shell
sudo mkdir -p /etc/libvirt/hooks

sudo wget 'https://raw.githubusercontent.com/PassthroughPOST/VFIO-Tools/master/libvirt_hooks/qemu' \
     -O /etc/libvirt/hooks/qemu

sudo chmod +x /etc/libvirt/hooks/qemu

sudo service libvirtd restart
```

[使用说明](https://passthroughpo.st/simple-per-vm-libvirt-hooks-with-the-vfio-tools-hook-helper/)

[自动隔离显卡 hook](https://github.com/saaurenma/gpu-passthrough)

[切换显示器](https://github.com/PassthroughPOST/VFIO-Tools/blob/master/libvirt_hooks/hooks/switch_displays.sh)

# 参考

- [Optimus MUXed 笔记本上的 NVIDIA 虚拟机显卡直通](https://lantian.pub/article/modify-computer/laptop-muxed-nvidia-passthrough.lantian/)
- [Linux, AMD Ryzen 3900X, X570, NVIDIA GTX 1060, AMD 5700XT, Looking Glass, PCI Passthrough and Windows 10](https://www.tauceti.blog/posts/linux-amd-x570-nvidia-gpu-pci-passthrough-2-prepare-linux/)
- [KVM-GPU-Passthrough](https://github.com/BigAnteater/KVM-GPU-Passthrough)
- [Single GPU Passthrough Community Guide](https://gitlab.com/risingprismtv/single-gpu-passthrough/-/wikis/home)

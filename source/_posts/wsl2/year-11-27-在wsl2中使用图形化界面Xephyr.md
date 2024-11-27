---
title: 在wsl2中使用图形化界面Xephyr
date: 2024-11-27 16:21:38
tags: Xephyr,图形化
categories: wsl2
author: clint
---

想法很简单，不想装双系统，玩崩溃了window里也可能受到影响，但是有时候的测试环境又必须在linux下，比如windows的clang、mingw、msys2就没有原生的gcc编译器好用，如果需要用matlablib画图的话，wsl2又不能完全支持，所以就有了在window是中操作图形化wsl ubuntu的想法，方案来自于互联网检索，并非原创。

{% note warning %}
生产环境请选择双系统方案，此方法仅做临时调试测试用
{% endnote %}


> wsl2 ubuntu 24.04.1LTS
> win11 23H2
> WSL 版本： 2.3.26.0


# 安装KDE桌面环境
```bash
sudo apt install plasma-desktop
```

# 配置桌面环境
将下面程序放到`~/.profile`中，告诉系统使用x当作渲染端
```bash
echo "export XDG_SESSION_TYPE=x11" >> ~/.profile
echo "export GDK_PLATFORM=x11" >> ~/.profile
echo "export GDK_BACKEND=x11" >> ~/.profile
echo "export QT_QPA_PLATFORM=xcb" >> ~/.profile
echo "export WAYLAND_DISPLAY=" >> ~/.profile

source ~/.profile
```

# 安装Xephyr服务器
```bash
sudo apt install xserver-xephyr
```

# 启动桌面环境
## 1.启动X server
```bash 
# Xephyr的指令，視窗可縮放
Xephyr -br -ac -noreset -resizeable -screen 1600x900 :1 &
```

> 出现` Xephyr cannot open host display`问题,参考[链接](https://github.com/dnschneid/crouton/issues/18)

```bash
export DISPLAY=:1 XAUTHORITY=/etc/X11/host-Xauthority
Xephyr :1 # 会跳出一个黑框框
```
以后每次启动，都需要成功运行一次上面的操作，才能自定义分辨率，我也不知道为啥，测试了好多次，才找到规律。

```bash
# 关闭上面的程序，重新设置分辨率
Xephyr :1 -screen [自己需要的分辨率]
```

## 2.开启桌面
```bash
export DISPLAY=:1
dbus-launch --exit-with-session startplasma-x11
```
接下来就可以看到成功的界面了

![](images/Xephyr.png)
# 恢复普通的wslg界面x
删除`~/.profile`中添加的内容，重启即可


# 参考资料
- [Windows 11 WSL2跑Linux桌面環境與圖形程式的方法，使用WSLg XWayland](https://ivonblog.com/posts/run-linux-desktop-on-wsl)

- [Full desktop shell in WSL2 using WSLg (XWayland)](https://gist.github.com/tdcosta100/e28636c216515ca88d1f2e7a2e188912#file-wsl2guiwslg-xwayland-en-md)

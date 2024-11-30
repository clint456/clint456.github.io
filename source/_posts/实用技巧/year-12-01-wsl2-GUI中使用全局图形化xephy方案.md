---
title: wsl2-GUI中使用全局图形化xephy方案
date: 2024-12-01 00:55:29
tags: wsl2,xephy
categories: [实用技巧]
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
> 出现` Xephyr cannot open host display`问题,参考[链接](https://github.com/dnschneid/crouton/issues/18)

```bash
export DISPLAY=:0 XAUTHORITY=/etc/X11/host-Xauthority #开启0号窗口
Xephyr :1  -screen 2100x1500 -br -ac -noreset -resizeable & # x开启在1号窗口，设置自己需要的分辨率
# 会跳出一个黑框框
```

## 2.开启桌面
```bash
export DISPLAY=:1 # 将桌面投射到1号窗口
dbus-launch --exit-with-session startplasma-x11
```
接下来就可以看到成功的界面了

![](https://raw.githubusercontent.com/clint456/PicGo/main/实用技巧/wslg-xephy.png)
# 恢复普通的wslg界面x
删除`~/.profile`中添加的内容，重启即可


# 参考资料
- [Windows 11 WSL2跑Linux桌面環境與圖形程式的方法，使用WSLg XWayland](https://ivonblog.com/posts/run-linux-desktop-on-wsl)

- [Full desktop shell in WSL2 using WSLg (XWayland)](https://gist.github.com/tdcosta100/e28636c216515ca88d1f2e7a2e188912#file-wsl2guiwslg-xwayland-en-md)

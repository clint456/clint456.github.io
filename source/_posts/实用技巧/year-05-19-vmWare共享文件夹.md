---
title: vmWare共享文件夹
date: 2025-05-19 13:56:07
tags: vmWare
categories: [实用技巧]
---

## 1、vm设置共享文件夹
网上有很多的参考教程，在vm中设置共享文件夹目录即可

## 2、挂载共享文件夹
一般来说从vm17.5开始就支持自动挂载共享文件，但是有的时候会存在无法挂载的情况

- 手动挂载共享文件夹
```bash
sudo mount -t fuse.vmhgfs-fuse .host:/ /mnt/hgfs -o allow_other
```
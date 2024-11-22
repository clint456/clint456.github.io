---
title: windows部署jekyll with chripy
author: clint
date:   2023-09-20 14:10:00 +0800
categories: [Jekyll,Install]
tags: [Windows]

---
#### 前言：
- 最近想搞个博客，记录一下自己考研过程中学习c语言的一些笔记，上来用过`jekyll的原生主题`，感觉不舒服，也用过`GitBook`主题，也觉得差点什么，最后选择了chripy。主要是因为star多，其次是用着真舒服；但是有一点麻烦的就是，`chripy`的图片使用`cdn`加载的，对于我们平名玩家不是很友好，还要买服务器。再加上GitHub page加载要很久，调试很浪费时间。
- 所以打算换个姿势写博客（一下子就是两天没了，我哭死）：
- 在`windows`上调试预览，然后丢到`Github Page`上，主打一个能看笔记就行。
- 后期如果域名解析弄好了，也会使用`cdn`加载图片的方案，提升访问舒适度。
- 先上个效果图：
![](/images/jekyll/show.png)
  
---
### 一、安装Ruby：
- 先去官网下载一个Ruby安装包[Ruby官网](https://rubyinstaller.org/downloads/)
 
- 我这里下载的是` Ruby+Devkit 3.2.2-1 (x86) `

- 然后点击安装

- 记得勾选上`msys2 development toolchain`

- 点击finish
- 选择`选项1`---`MYSY2 base installation`
- 等待安装完成，关闭即可


---
### 二、安装rubygems--ruby的包管理器
- [rubygems安装包](https://rubygems.org/rubygems/rubygems-3.4.19.zip)
- 下载完成后，解压，然后点击setup安装
- 如果没有反应，右键一下，选择打开方式，再安装即可
- cmd输入`gem`检查是否安装成功
![](/images/jekyll/gem.png)

  ---

### 三、安装jekyll
- 打开cmd命令提示符窗口
- `gem install jekyll -v [版本号]`
- 我这里是`4.3.2`的版本
![](/images/jekyll/jekyll_install.png)

---

### 四、从github克隆chripy主题
- `git clone https://github.com/cotes2020/chirpy-starter.git`
  
--- 

### 五、在本地运行
- 进入项目根目录，然后cmd输入`bundle` --- 检查并匹配依赖项
- 构建`jekyll build`
- 在本地8080端口运行`bundle exec jekyll serve --port 8080`
- Server address: `http://127.0.0.1:8080/`或`localhost:8080`
![](/images/jekyll/run.png)

### 六、linux版本
[linux版本安装参考](https://jeza-chen.com/2019/11/20/Run_Or_Debug_Github_Pages_In_Linux/)
  
--- 
---
title: 将html网站抓取为md文件
date: 2024-11-30 19:42:33
tags: html2md
categories: [实用技巧]
---

# [clean-mark工具](https://github.com/croqaz/clean-mark?tab=readme-ov-file#-clean-mark)
### 安装
```cmd
npm install clean-mark --global
```
![cleanMark](https://raw.githubusercontent.com/clint456/PicGo/main/实用技巧/cleanMark.png)

以下是您提供的命令行用法的中文解释：

---

### 使用方法：
1. **基本用法：**
   ```cmd
   $ clean-mark "http://some-website.com/fancy-article"
   ```
   这条命令会自动根据 URL 路径生成文章的文件名。比如，上面的命令会生成名为 `fancy-article.md` 的文件，默认输出格式是 Markdown。

2. **指定文件类型：**
   ```cmd
   $ clean-mark "http://some-website.com/fancy-article" -t html
   ```
   你可以通过 `-t` 参数来指定输出的文件类型。可选的类型有：
   - HTML
   - TEXT
   - Markdown（默认）

3. **指定输出文件路径和文件名：**
   ```cmd
   $ clean-mark "http://some-website.com/fancy-article" -o /tmp/article
   ```
   通过 `-o` 参数，你可以指定输出文件的路径和文件名。在这个例子中，输出文件将会是 `/tmp/article.md`，因为程序会根据指定路径自动添加 `.md` 扩展名。

---

### 总结：
- 使用 `clean-mark` 命令可以抓取指定 URL 的文章内容并转换为 Markdown、HTML 或纯文本格式。
- 如果不指定文件名，默认会根据 URL 路径生成文件名。
- 可以通过 `-t` 参数指定输出格式，通过 `-o` 参数指定文件的输出路径和文件名。
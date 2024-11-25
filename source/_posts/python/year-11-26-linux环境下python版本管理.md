---
title: linux环境下pyenv的使用
date: 2024-11-26 00:52:58
tags: pyenv
categories: python
---


## 使用 Anaconda 或 pyenv 管理多版本 Python（推荐用于开发者）

使用 pyenv 安装最新版本：

安装 pyenv：
```bash
curl https://pyenv.run | bash
```
更新环境变量（编辑 ~/.bashrc 或 ~/.zshrc）：
```bash
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init --path)"
eval "$(pyenv virtualenv-init -)"
```
列出最新版本并安装：
```bash
pyenv install --list   # 查看所有版本
pyenv install 3.12.0   # 安装最新稳定版
pyenv global 3.12.0    # 设置为全局版本
```
验证安装：
```bash
python --version
```
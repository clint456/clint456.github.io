---
title: linux中快速且稳定的python环境配置
date: 2024-11-26 00:52:58
tags: python环境
categories: python
---
# `pyenv+poetry`快速实现稳定的测试环境

>偶尔想使用python跑一跑一些测试的程序,环境的适配就是个迷,每次都耗费大量时间在这上面

> 快速安装不同的新python - `pyenv`

> 不同项目下的python虚拟环境管理 - `poetry`


## 1.使用 pyenv 管理多版本 Python

`pyenv` 是一个用于管理多个 Python 版本的工具，它允许你轻松地安装和切换不同版本的 Python，并为每个项目设置特定的 Python 版本。下面是 `pyenv` 的基本使用教程：

### 安装 pyenv

`pyenv` 的安装通常依赖于你的操作系统。下面是几个常见平台上的安装方法。

#### 在 macOS 上安装

1. 安装 Homebrew（如果尚未安装）：
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. 使用 Homebrew 安装 `pyenv`：
   ```bash
   brew install pyenv
   ```

3. 配置 Shell，确保 `pyenv` 可以正确加载。在你的 shell 配置文件中（例如 `~/.bash_profile` 或 `~/.zshrc`），加入以下内容：
   ```bash
   export PATH="$HOME/.pyenv/bin:$PATH"
   eval "$(pyenv init --path)"
   eval "$(pyenv init -)"
   ```

4. 重新加载配置：
   ```bash
   source ~/.bash_profile  # 如果使用 bash
   source ~/.zshrc         # 如果使用 zsh
   ```

#### 在 Ubuntu 或其他 Linux 上安装

1. 安装依赖：
   ```bash
   sudo apt update
   sudo apt install -y make build-essential libssl-dev zlib1g-dev \
   libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
   libncurses5-dev libncursesw5-dev libffi-dev liblzma-dev \
   python3-openssl git
   ```

2. 安装 `pyenv`：
   ```bash
   curl https://pyenv.run | bash
   ```

3. 配置 Shell，确保 `pyenv` 可以正确加载。在你的 shell 配置文件中（例如 `~/.bashrc` 或 `~/.zshrc`），加入以下内容：
   ```bash
   export PATH="$HOME/.pyenv/bin:$PATH"
   eval "$(pyenv init --path)"
   eval "$(pyenv init -)"
   ```

4. 重新加载配置：
   ```bash
   source ~/.bashrc  # 如果使用 bash
   source ~/.zshrc   # 如果使用 zsh
   ```

#### 在 Windows 上安装

对于 Windows，推荐使用 `pyenv-win`：

1. 使用 PowerShell 安装：
   ```bash
   Invoke-WebRequest -Uri https://github.com/pyenv-win/pyenv-win/releases/latest/download/pyenv-win.zip -OutFile "$env:USERPROFILE\pyenv.zip"
   Expand-Archive -Path "$env:USERPROFILE\pyenv.zip" -DestinationPath "$env:USERPROFILE\.pyenv"
   ```

2. 在 PowerShell 配置文件中添加以下内容（例如 `$PROFILE`）：
   ```bash
   $env:PYENV = "$env:USERPROFILE\.pyenv"
   $env:Path = "$env:PYENV\bin;$env:PYENV\shims;$env:Path"
   ```

### 安装 Python 版本

安装 `pyenv` 后，你可以安装不同版本的 Python。

1. 查看可用的 Python 版本：
   ```bash
   pyenv install --list
   ```

2. 安装特定版本的 Python，例如安装 Python 3.10.6：
   ```bash
   pyenv install 3.10.6
   ```

3. 安装过程可能需要一些时间，取决于你的网络和计算机性能。

### 设置全局 Python 版本

使用 `pyenv`，你可以设置全局的 Python 版本（即默认版本）。

1. 设置全局版本：
   ```bash
   pyenv global 3.10.6
   ```

2. 验证当前的全局 Python 版本：
   ```bash
   python --version
   ```

### 设置项目特定的 Python 版本

你可以为特定的项目设置不同的 Python 版本，而不是使用全局版本。

1. 在项目目录中设置本地 Python 版本：
   ```bash
   cd /path/to/your/project
   pyenv local 3.9.1
   ```

2. 你可以使用 `pyenv version` 来查看当前目录下的 Python 版本：
   ```bash
   pyenv version
   ```

### 升级和卸载 Python 版本

- 升级 Python 版本：
  ```bash
  pyenv install 3.10.7  # 安装新版本
  pyenv global 3.10.7   # 设置为全局版本
  ```

- 卸载已安装的 Python 版本：
  ```bash
  pyenv uninstall 3.9.1
  ```

### 使用 pyenv 的其他功能

- 查看已安装的 Python 版本：
  ```bash
  pyenv versions
  ```

- 为当前会话临时设置 Python 版本：
  ```bash
  pyenv shell 3.8.5
  ```

### 小贴士

- `pyenv` 会为每个 Python 版本自动安装 `pip`，因此你可以直接使用 `pip` 来管理依赖。
- 使用 `pyenv` 的时候，记得定期更新 Python 版本和插件：
  ```bash
  pyenv update
  ```

## 2.使用poetry管理python项目的依赖
`poetry` 是一个用于 Python 项目的依赖管理和构建工具。它通过提供简洁的命令行界面来简化包管理和项目管理的过程，取代了传统的 `pip` 和 `virtualenv` 的使用。

### 安装 Poetry

要安装 Poetry，可以使用以下命令：

#### 使用 pip 安装：
```bash
pip install poetry
```

#### 或者使用官方推荐的安装脚本：
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

安装完成后，确认 Poetry 是否成功安装：
```bash
poetry --version
```

### 创建新项目

要使用 Poetry 创建一个新的 Python 项目，可以运行：
```bash
poetry new my_project
```
这将创建一个包含基础目录结构的项目：
```
my_project/
  pyproject.toml
  my_project/
    __init__.py
  tests/
    __init__.py
```

### 初始化现有项目

如果你已有一个现有的 Python 项目，可以在项目根目录下运行：
```bash
poetry init
```
这将引导你逐步配置项目的 `pyproject.toml` 文件。

### 安装依赖

使用 Poetry 安装依赖非常简单。你可以运行以下命令来安装某个库：
```bash
poetry add requests
```
这将自动将 `requests` 添加到项目的依赖中，并更新 `pyproject.toml` 文件。

如果你需要安装开发依赖（如 `pytest`），可以使用：
```bash
poetry add --dev pytest
```

### 安装所有依赖

如果你需要安装 `pyproject.toml` 中列出的所有依赖，可以运行：
```bash
poetry install
```

### 使用虚拟环境

Poetry 自动为每个项目创建一个隔离的虚拟环境。你无需手动创建虚拟环境，所有依赖都将安装到该虚拟环境中。

要进入虚拟环境：
```bash
poetry shell
```

### 运行脚本

在 Poetry 的虚拟环境中，你可以直接运行 Python 脚本。比如运行项目的入口脚本：
```bash
poetry run python my_project/main.py
```

### 发布包

当你准备好发布你的项目时，Poetry 可以帮助你打包并上传到 PyPI。

首先，确保项目已经按照标准结构组织，并且 `pyproject.toml` 文件中包含了必要的信息。

然后，使用以下命令构建包：
```bash
poetry build
```

最后，将包发布到 PyPI：
```bash
poetry publish --build
```

### 其他常用命令

- 查看当前安装的依赖：
  ```bash
  poetry show
  ```

- 更新项目依赖：
  ```bash
  poetry update
  ```

- 检查依赖的安全性（需要配置 PyUp API）：
  ```bash
  poetry check
  ```

通过这些基本操作，你可以高效地管理和维护 Python 项目。如果你有更具体的需求或问题，可以提供更多细节！
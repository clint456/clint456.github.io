---
title: VsCode+Cmake使用全流程
date: 2024-12-02 16:36:47
tags: Cmake使用流程
categories: CPP
---


在 Ubuntu 环境下使用 **CMake Tools** 和 **CMake** 构建 C++ 项目，并编写 `CMakeLists.txt` 文件，以下是详细步骤：

### 1. 安装必要工具

#### 安装 CMake 和 CMake Tools 插件

1. 安装 CMake：
   在 Ubuntu 上，首先需要安装 CMake（如果尚未安装）：
   ```bash
   sudo apt update
   sudo apt install cmake
   ```

2. 安装编译器：
   确保你已经安装了 C++ 编译器（GCC 或 Clang）。在 Ubuntu 上，可以通过安装 `build-essential` 包来获得 GCC 编译器：
   ```bash
   sudo apt install build-essential
   ```

3. 安装 VSCode：
   如果你尚未安装 VSCode，可以使用以下命令安装：
   ```bash
   sudo snap install --classic code
   ```

4. 安装 CMake Tools 插件：
   打开 VSCode 后，按 `Ctrl+Shift+X` 打开插件市场，搜索 **CMake Tools** 插件并安装。

### 2. 配置 CMake 项目

假设你已经有一个 CMake 项目（如果没有，可以参考以下步骤创建一个）。

#### 创建项目结构
一个基本的 CMake 项目结构通常如下：

```
my_project/
├── CMakeLists.txt
├── src/
│   └── main.cpp
└── build/  # 用于存放构建输出
```

- `CMakeLists.txt` 文件是 CMake 的配置文件，负责描述如何构建项目。
- `src/` 文件夹存放源代码。

#### 示例 `CMakeLists.txt` 文件
`CMakeLists.txt` 文件通常位于项目的根目录，用于配置构建设置。以下是一个简单的 `CMakeLists.txt` 示例：

```cmake
# 设置最低版本要求
cmake_minimum_required(VERSION 3.5.0)

# 设置项目名称
project(MyProject)

# 设置 C++ 标准
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# 添加源文件，创建可执行文件
add_executable(MyProject src/main.cpp)
```

- `cmake_minimum_required`：定义了 CMake 的最低版本。
- `project(MyProject)`：设置项目名称为 `MyProject`。
- `set(CMAKE_CXX_STANDARD 11)`：设置使用 C++11 标准。
- `add_executable(MyProject src/main.cpp)`：指定源文件并生成可执行文件。

#### `src/main.cpp` 示例：
```cpp
#include <iostream>

int main() {
    std::cout << "Hello, CMake!" << std::endl;
    return 0;
}
```

### 3. 在 VSCode 中打开项目

1. 打开 VSCode，点击 **文件 -> 打开文件夹**，选择你的项目根目录（即包含 `CMakeLists.txt` 文件的文件夹）。
2. VSCode 会自动识别项目中的 `CMakeLists.txt` 文件，并提示你安装 CMake 和编译工具（如果尚未安装）。

### 4. 配置 CMake 构建

1. 在 VSCode 中打开项目后，按 `Ctrl+Shift+P` 打开命令面板，输入并选择 `CMake: Select a Kit`。
   
   - 如果你已经安装了 GCC 或 Clang，CMake Tools 会自动检测并显示可用的编译器工具链。选择一个适合你的编译器。
   
2. 按 `Ctrl+Shift+P` 打开命令面板，输入并选择 `CMake: Configure`。
   
   - CMake Tools 会自动生成构建文件。你可以选择构建工具，例如 **Unix Makefiles**（默认）或 **Ninja**。如果你没有特殊要求，选择默认的 **Unix Makefiles**。

3. 配置完成后，CMake Tools 会在 VSCode 的状态栏显示当前的构建类型（例如 `Debug` 或 `Release`）。

### 5. 构建项目

1. 按 `Ctrl+Shift+P` 打开命令面板，输入并选择 `CMake: Build`，然后选择要构建的目标。
   
2. 或者，点击 VSCode 状态栏中的 **Build** 按钮，开始构建项目。

3. 构建完成后，生成的可执行文件通常位于 `build/` 目录中。

### 6. 运行项目

1. 如果你的 CMake 项目是一个可执行文件，可以直接在终端中运行它：
   ```bash
   ./build/MyProject
   ```

2. 你还可以在 VSCode 中配置调试器，点击调试按钮开始调试。

### 7. 调试 CMake 项目

1. 配置调试器：按 `Ctrl+Shift+D` 打开调试面板。
2. 点击 **创建一个 `launch.json` 文件**，然后选择 **C++ (GDB/LLDB)** 配置。
3. 在 `launch.json` 中配置调试信息：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug MyProject",
      "type": "cppdbg",
      "request": "launch",
      "program": "${workspaceFolder}/build/MyProject",  // 这里填写你的可执行文件路径
      "args": [],
      "stopAtEntry": false,
      "cwd": "${workspaceFolder}",
      "environment": [],
      "externalConsole": false,
      "MIMode": "gdb",
      "miDebuggerPath": "/usr/bin/gdb",
      "preLaunchTask": "build",  // 在调试前构建项目
      "setupCommands": [
        {
          "description": "Enable pretty-printing for gdb",
          "text": "-enable-pretty-printing",
          "ignoreFailures": true
        }
      ]
    }
  ]
}
```

4. 配置完成后，点击调试按钮来开始调试。

### 8. 使用 CMake Presets（可选）

CMake 3.19 引入了 **CMake Presets** 功能，允许你为项目设置预定义的构建配置。在项目根目录下创建 `CMakePresets.json` 文件，以便在不同的构建环境中使用不同的配置。例如：

```json
{
  "version": 3,
  "cmakeMinimumRequired": {
    "major": 3,
    "minor": 19,
    "patch": 0
  },
  "configurePresets": [
    {
      "name": "default",
      "binaryDir": "${sourceDir}/build",
      "cacheVariables": {
        "CMAKE_BUILD_TYPE": "Debug"
      }
    }
  ]
}
```

这会为你定义一个默认的 **Debug** 构建配置，并指定构建输出目录。

### 总结

通过在 Ubuntu 环境中配置和使用 CMake Tools 插件，你可以高效地管理 CMake 项目。关键步骤如下：

1. 安装 CMake 和 CMake Tools 插件。
2. 编写 `CMakeLists.txt` 文件并组织项目结构。
3. 在 VSCode 中配置、构建和调试项目。
4. 使用 **CMake Presets**（可选）来管理多种构建配置。

通过这些步骤，你可以轻松开始和管理 C++ 项目的开发。
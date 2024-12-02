---
title: Cmake官文文档[翻译]
date: 2024-12-02 16:56:46
tags: Cmake
categories: CPP
---
以下是一个全面的 CMake 入门教程，涵盖了从基本概念到进阶功能的各个方面。教程以 Markdown 格式呈现，适合用作快速学习和参考：

---

# CMake 入门教程

## 1. CMake 概述

CMake 是一个跨平台的开源构建系统，它通过 CMakeLists.txt 文件来定义项目的构建流程。CMake 可以生成针对不同平台的本地构建系统（如 Makefile 或 Visual Studio 项目文件），使得在不同平台上构建同一项目变得更加容易。

### CMake 的基本目标
- 自动化构建过程。
- 支持跨平台构建。
- 管理项目的依赖和链接库。

## 2. CMake 基本命令

### 2.1 `cmake_minimum_required`

**用途**：设置 CMake 项目的最低版本要求。

**示例**：
```cmake
cmake_minimum_required(VERSION 3.10)
```

此命令确保 CMake 版本不低于 3.10，若版本过低，则会显示错误。

### 2.2 `project`

**用途**：设置项目的名称、版本号以及使用的语言。

**示例**：
```cmake
project(MyProject VERSION 1.0 LANGUAGES CXX)
```

- `MyProject`：项目名称。
- `VERSION 1.0`：项目版本。
- `LANGUAGES CXX`：指定使用 C++ 语言。

### 2.3 `add_executable`

**用途**：创建可执行文件。

**示例**：
```cmake
add_executable(MyApp main.cpp)
```

这条命令会将 `main.cpp` 编译成名为 `MyApp` 的可执行文件。

### 2.4 `add_library`

**用途**：创建库文件。

**示例**：
```cmake
add_library(MyLibrary STATIC mylib.cpp)
```

- `STATIC`：指定创建静态库。
- `mylib.cpp`：库文件的源代码。

### 2.5 `target_link_libraries`

**用途**：为目标链接库文件。

**示例**：
```cmake
target_link_libraries(MyApp MyLibrary)
```

此命令将 `MyLibrary` 链接到 `MyApp` 可执行文件中。

### 2.6 `include_directories`

**用途**：指定头文件搜索路径。

**示例**：
```cmake
include_directories(/path/to/include)
```

这条命令将 `/path/to/include` 目录添加到头文件搜索路径中。

### 2.7 `set`

**用途**：设置变量的值。

**示例**：
```cmake
set(CMAKE_CXX_STANDARD 11)
```

此命令设置 C++ 标准为 C++11。

## 3. CMakeLists.txt 示例

### 3.1 基本的 CMake 项目

```cmake
cmake_minimum_required(VERSION 3.10)

# 设置项目名称和版本
project(MyProject VERSION 1.0 LANGUAGES CXX)

# 设置 C++ 标准
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# 添加源文件并创建可执行文件
add_executable(MyApp main.cpp)

# 可选：设置头文件搜索路径
include_directories(include)
```

### 3.2 创建静态库和可执行文件

```cmake
cmake_minimum_required(VERSION 3.10)

# 设置项目名称
project(MyProject VERSION 1.0 LANGUAGES CXX)

# 创建静态库
add_library(MyLibrary STATIC src/mylib.cpp)

# 创建可执行文件
add_executable(MyApp src/main.cpp)

# 链接库文件
target_link_libraries(MyApp MyLibrary)
```

### 3.3 配置头文件

为了避免在多个源文件中重复硬编码版本号等信息，CMake 提供了配置文件功能，可以动态生成包含版本号等信息的头文件。

#### 3.3.1 创建版本头文件

1. 创建 `TutorialConfig.h.in` 文件，包含版本号占位符：
   ```cpp
   // TutorialConfig.h.in
   #define TUTORIAL_VERSION_MAJOR @TUTORIAL_VERSION_MAJOR@
   #define TUTORIAL_VERSION_MINOR @TUTORIAL_VERSION_MINOR@
   ```

2. 在 `CMakeLists.txt` 中使用 `configure_file` 命令替换占位符：
   ```cmake
   project(Tutorial VERSION 1.0)

   # 配置头文件
   configure_file(TutorialConfig.h.in TutorialConfig.h)

   # 将输出的配置头文件添加到包含目录
   target_include_directories(MyApp PUBLIC "${PROJECT_BINARY_DIR}")
   ```

#### 3.3.2 使用配置头文件

在 `main.cpp` 中包含并使用该头文件：

```cpp
#include "TutorialConfig.h"

int main() {
    std::cout << "Tutorial Version: " 
              << TUTORIAL_VERSION_MAJOR << "."
              << TUTORIAL_VERSION_MINOR << std::endl;
    return 0;
}
```

## 4. 使用 CMake 的构建过程

CMake 使用两个主要步骤来构建项目：

### 4.1 配置

1. 在终端或命令行中，创建一个构建目录：
   ```bash
   mkdir build
   cd build
   ```

2. 运行 CMake 以配置项目：
   ```bash
   cmake ..
   ```

3. CMake 会检查源代码和依赖项，并生成构建系统文件（如 Makefile 或 Visual Studio 项目文件）。

### 4.2 构建

根据项目选择的构建工具（如 Make、Ninja 或 Visual Studio）来构建项目：

- 使用 Make：
  ```bash
  make
  ```

- 使用 Ninja：
  ```bash
  ninja
  ```

- 使用 Visual Studio：直接在 Visual Studio 中打开生成的 `.sln` 文件并构建。

### 4.3 运行

构建成功后，可以运行生成的可执行文件：

```bash
./MyApp
```

## 5. 高级功能

### 5.1 设置目标属性

CMake 允许设置目标属性，如优化级别、调试信息等：

```cmake
set_target_properties(MyApp PROPERTIES
    CXX_STANDARD 14
    CXX_STANDARD_REQUIRED YES
    CXX_EXTENSIONS NO
)
```

### 5.2 查找库和包

CMake 提供了 `find_package` 和 `find_library` 命令来查找外部依赖：

```cmake
find_package(OpenCV REQUIRED)
target_link_libraries(MyApp OpenCV::Core)
```

### 5.3 跨平台构建

CMake 支持跨平台构建，允许你为不同操作系统（如 Linux、Windows、macOS）生成本地构建系统。通过在 `CMakeLists.txt` 中设置合适的路径和选项，CMake 会自动处理平台差异。

---

## 总结

CMake 是一个强大且灵活的工具，能够帮助你自动化构建过程并实现跨平台构建。通过熟练掌握 CMake 的基本命令和概念，你将能够更轻松地管理项目构建，并且能在多平台上进行构建和部署。
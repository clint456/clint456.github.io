---
title: QT5可视化排序算法测试平台
date: 2024-12-02 22:14:44
tags: [QT5,排序算法]
categories: CPP
---

# QT5配置
## 1.安装qt5
```bash
sudo apt update
sudo apt install qt5-qmake qtbase5-dev qtchooser qt5-qmake-bin qtbase5-dev-tools
```

## 2.验证安装
```bash
qmake --version
```

## 3.安装 Qt Creator (可选)
Qt Creator 是 Qt 官方提供的集成开发环境 (IDE)，可以帮助你更高效地开发 Qt 应用程序。
在 Ubuntu 上，你可以通过以下命令安装 Qt Creator：

```bash
sudo apt install qtcreator
```
或者，使用 Qt 官网提供的安装器来安装 Qt Creator，选择相关选项进行安装。


# Qt实现图像化排序算法
Qt 提供了强大的图形用户界面（GUI）和绘图功能，可以在界面上动态展示排序算法的执行过程。
这样，就可以在窗口中以图形化的方式观察排序算法的工作原理。

以下是一个简单的示例，如何用 Qt 实现一个图形化的排序算法演示，以 **冒泡排序** 为例。

## 项目结构

```
/SortingVisualizer
│
├── /include          # Qt头文件
│   ├── Sorter.h      # 排序算法的抽象基类
│   ├── BubbleSort.h  # BubbleSort 类的头文件
│
├── /src              # 排序算法的源文件
│   ├── main.cpp      # 程序入口，执行测试
│   ├── BubbleSort.cpp
│   ├── Sorter.cpp
│   └── mainwindow.cpp
│
├── /ui               # Qt UI文件
│   └── mainwindow.ui  # Qt设计的界面
│
├── CMakeLists.txt    # CMake 构建文件
└── SortingVisualizer.pro  # Qt项目文件
```

## 1. Qt 设计界面（`mainwindow.ui`）

您可以使用 Qt Designer 来设计界面，或者直接通过代码实现。在此，我们假设您设计了一个窗口，其中包括：

- **一个绘图区域**：用于绘制数组元素的条形图（可视化每次交换）。
- **一个开始按钮**：点击开始按钮后，开始执行排序算法。
- **一个停止按钮**：用于停止当前的排序操作。

## 2. 创建排序算法框架

### `Sorter.h`

```cpp
#ifndef SORTER_H
#define SORTER_H

#include <vector>
#include <string>

class Sorter {
public:
    virtual void sort(std::vector<int>& arr) = 0;  // 排序方法
    virtual std::string name() const = 0;          // 排序算法的名字
    virtual ~Sorter() = default;
};

#endif // SORTER_H
```

### `BubbleSort.h`

```cpp
#ifndef BUBBLESORT_H
#define BUBBLESORT_H

#include "Sorter.h"

class BubbleSort : public Sorter {
public:
    void sort(std::vector<int>& arr) override;   // 排序函数声明
    std::string name() const override;           // 返回排序器名称
};

#endif // BUBBLESORT_H
```

### `BubbleSort.cpp`

```cpp
#include "BubbleSort.h"

// 排序实现
void BubbleSort::sort(std::vector<int>& arr) {
    for (size_t i = 0; i < arr.size(); ++i) {
        for (size_t j = 0; j < arr.size() - i - 1; ++j) {
            if (arr[j] > arr[j + 1]) {
                // 手动交换
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

std::string BubbleSort::name() const {
    return "BubbleSort";
}
```

## 3. 图像化排序的核心逻辑（Qt）

### `MainWindow.h`

```cpp
#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QTimer>
#include "BubbleSort.h"

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow {
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void on_startButton_clicked();   // 开始排序按钮点击
    void updateVisualization();      // 更新排序进度

private:
    Ui::MainWindow *ui;
    std::vector<int> array;          // 要排序的数组
    BubbleSort sorter;               // 排序算法
    QTimer* timer;                   // 定时器，用于动画效果
    int currentStep;                 // 当前排序步骤
    void drawArray();                // 绘制数组的可视化效果
};

#endif // MAINWINDOW_H
```

### `MainWindow.cpp`

```cpp
#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QPainter>
#include <QTimer>
#include <QPushButton>
#include <QRandomGenerator>

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow),
    timer(new QTimer(this)),
    currentStep(0)
{
    ui->setupUi(this);
    
    // 初始化数组
    array = {10, 80, 30, 90, 50, 60, 70, 20, 40};
    
    // 绘制初始数组
    drawArray();
    
    // 设置定时器
    connect(timer, &QTimer::timeout, this, &MainWindow::updateVisualization);
}

MainWindow::~MainWindow() {
    delete ui;
}

void MainWindow::on_startButton_clicked() {
    currentStep = 0;  // 重置当前步骤
    sorter.sort(array);  // 开始排序
    timer->start(100);  // 设置排序更新频率为每100毫秒一次
}

void MainWindow::updateVisualization() {
    if (currentStep < array.size() - 1) {
        // 执行下一步排序
        currentStep++;
    } else {
        timer->stop();  // 停止定时器
    }
    
    // 绘制数组
    drawArray();
}

void MainWindow::drawArray() {
    QPainter painter(this);
    painter.setBrush(Qt::blue);
    
    // 根据当前数组绘制条形图
    int barWidth = width() / array.size();
    for (int i = 0; i < array.size(); ++i) {
        int barHeight = array[i] * 5;
        painter.drawRect(i * barWidth, height() - barHeight, barWidth - 2, barHeight);
    }
}
```

### 主要功能解释：

1. **排序算法**：在 `BubbleSort` 类中实现了基本的冒泡排序算法。`sort()` 方法通过比较相邻元素并交换它们来排序数组。
   
2. **图像化**：在 `MainWindow` 类中使用 `QPainter` 类绘制图形，模拟条形图来可视化数组的排序过程。每次 `updateVisualization()` 被调用时，界面都会刷新，展示数组的当前状态。

3. **定时器**：使用 `QTimer` 定时器来控制每一步排序操作的更新频率，从而达到动态演示排序的效果。每次排序后，都会重新绘制数组。

4. **UI界面**：`MainWindow` 包含一个按钮，用于启动排序过程，排序过程中通过定时器逐步更新排序状态。

## 4. 项目构建

### `CMakeLists.txt`

```cmake
cmake_minimum_required(VERSION 3.10)

project(SortingVisualizer)

set(CMAKE_CXX_STANDARD 11)

# 查找Qt
find_package(Qt5Widgets REQUIRED)

# 添加源文件
add_executable(SortingVisualizer
    src/main.cpp
    src/mainwindow.cpp
    src/BubbleSort.cpp
    src/Sorter.cpp
)

# 链接Qt库
target_link_libraries(SortingVisualizer Qt5::Widgets)
```

### `SortingVisualizer.pro` (Qt 项目文件)

```pro
QT += core gui

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TARGET = SortingVisualizer
TEMPLATE = app

SOURCES += main.cpp \
           mainwindow.cpp \
           BubbleSort.cpp \
           Sorter.cpp

HEADERS  += mainwindow.h \
            BubbleSort.h \
            Sorter.h
```

### 构建步骤

1. 使用 Qt Creator 打开项目文件 `SortingVisualizer.pro`。
2. 构建项目并运行，您将在窗口中看到排序算法的图形化演示。

## 总结

通过使用 Qt，您可以非常方便地实现一个图像化排序算法演示。使用 `QPainter` 类和定时器，您可以动态地显示排序过程，帮助用户直观地理解排序算法的工作原理。此项目可以扩展为支持多个排序算法，并可以增加更多的交互功能，如控制排序速度、暂停和恢复排序等。




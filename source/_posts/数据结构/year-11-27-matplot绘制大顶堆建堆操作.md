---
title: matplot绘制大顶堆建堆操作
date: 2024-11-27 21:24:52
tags: [python,matplotlib]
categories: 数据结构
---

# 步骤 1：安装系统依赖

## 1.根据你的操作系统，安装 Graphviz 的相关依赖：
Linux (Ubuntu/Debian 系列)

运行以下命令安装 Graphviz 和其开发工具：
```bash
sudo apt-get update
sudo apt-get install graphviz graphviz-dev
```
MacOS

使用 brew 安装：
```
brew install graphviz
```
Windows

    下载并安装 Graphviz 官方安装程序。
    安装完成后，将 Graphviz 的路径（通常是 C:\Program Files\Graphviz\bin）添加到系统的 PATH 环境变量中。

## 2.安装 matplotlib 和 networkx 库：
```bash
pip install matplotlib networkx pygraphviz
```


# 步骤 2：程序设计
## 代码
```python
import matplotlib
import matplotlib.pyplot as plt
import networkx as nx
import matplotlib.animation as animation
import os

# Helper function to plot the heap as a tree
def plot_heap(heap, title, highlighted_nodes=None, save_path=None):
    """
    绘制堆的二叉树表示图，并可选地高亮显示某些节点
    """
    G = nx.DiGraph()
    labels = {}
    
    # 添加二叉树结构的边
    for i in range(len(heap)):
        labels[i] = heap[i]
        left = 2 * i + 1
        right = 2 * i + 2
        if left < len(heap):
            G.add_edge(i, left)
        if right < len(heap):
            G.add_edge(i, right)
    
    # 创建布局并绘制图形
    pos = nx.nx_agraph.graphviz_layout(G, prog="dot")
    plt.figure(figsize=(8, 5))
    
    # 绘制节点
    nx.draw(G, pos, with_labels=False, node_size=1500, node_color='skyblue', font_size=10, font_weight='bold')

    # 高亮节点
    if highlighted_nodes is not None:
        nx.draw_networkx_nodes(G, pos, nodelist=highlighted_nodes, node_color='red', node_size=1500)

    # 绘制标签和标题
    nx.draw_networkx_labels(G, pos, labels, font_size=10)
    plt.title(title)
    plt.axis('off')

    # 保存图像到文件夹
    if save_path is not None:
        if not os.path.exists(save_path):
            os.makedirs(save_path)  # 如果文件夹不存在，创建文件夹
        plt.savefig(os.path.join(save_path, f"{title}.png"))  # 保存图像文件

# Heapify function for a subtree rooted at index i
def heapify(heap, n, i, step_title, highlighted_nodes, update_func, save_path):
    largest = i  # 假设根节点是最大的
    left = 2 * i + 1  # 左子节点索引
    right = 2 * i + 2  # 右子节点索引

    # 检查左子节点是否存在且大于根节点
    if left < n and heap[left] > heap[largest]:
        largest = left

    # 检查右子节点是否存在且大于当前最大值
    if right < n and heap[right] > heap[largest]:
        largest = right

    # 如果最大值不是根节点，则交换并继续堆化
    if largest != i:
        heap[i], heap[largest] = heap[largest], heap[i]  # 交换
        highlighted_nodes.append(i)  # 将当前节点添加到高亮节点列表中
        highlighted_nodes.append(largest)  # 高亮交换的节点
        update_func(heap, step_title, highlighted_nodes, save_path)  # 更新堆的可视化
        heapify(heap, n, largest, step_title, highlighted_nodes, update_func, save_path)  # 递归堆化

# 构建最大堆并进行动画展示
def build_max_heap(heap, save_path):
    n = len(heap)
    highlighted_nodes = []  # 用于存储每次高亮的节点
    fig, ax = plt.subplots(figsize=(8, 5))
    
    # 创建动画更新函数
    def update_plot(heap, step_title, highlighted_nodes, save_path):
        ax.clear()  # 清除上次绘制的图
        plot_heap(heap, step_title, highlighted_nodes, save_path)  # 重新绘制堆并高亮节点
        plt.pause(0.5)  # 暂停0.5秒，创建动画效果
    
    plot_heap(heap, "Initial array as binary tree", [], save_path)  # 可视化初始堆
    plt.pause(1)  # 暂停1秒，让初始图形展示出来
    
    # 从最后一个非叶子节点开始向上构建堆
    for i in range(n // 2 - 1, -1, -1):
        heapify(heap, n, i, f"Heap after adjusting node {i}", highlighted_nodes, update_plot, save_path)

# 输入的堆数组
heap = [48, 62, 35, 77, 55, 14, 35, 98]

# 设置保存图像的文件夹路径，文件夹名称为项目名称（heapSort）
project_name = "heapSort"
build_max_heap(heap, project_name)

plt.show()
```

## 执行结果

![](https://raw.githubusercontent.com/clint456/PicGo/main/%E7%AE%97%E6%B3%95%E5%8F%AF%E8%A7%86%E5%8C%96/%E5%A4%A7%E9%A1%B6%E5%A0%86%E5%BB%BA%E5%A0%8601.png)
![](https://raw.githubusercontent.com/clint456/PicGo/main/%E7%AE%97%E6%B3%95%E5%8F%AF%E8%A7%86%E5%8C%96/%E5%A4%A7%E9%A1%B6%E5%A0%86%E5%BB%BA%E5%A0%8603.png)
![](https://raw.githubusercontent.com/clint456/PicGo/main/算法可视化/Heap%20after%20adjusting%20node%201.png)
![](https://raw.githubusercontent.com/clint456/PicGo/main/%E7%AE%97%E6%B3%95%E5%8F%AF%E8%A7%86%E5%8C%96/%E5%A4%A7%E9%A1%B6%E5%A0%86%E5%BB%BA%E5%A0%8604.png)


对于数组 `[48, 62, 35, 77, 55, 14, 35, 98]`，我们将按照 **大顶堆** 的规则从最后一个非叶子节点向上逐步进行堆化操作。以下是构建大顶堆的详细步骤：

---

### **1. 初始数组（完全二叉树结构）**

初始数组的结构为：

```
              48
           /      \
         62        35
       /   \     /   \
     77    55  14    35
    /
   98
```

---

### **2. 找到最后一个非叶子节点**

对于一个数组，最后一个非叶子节点的索引为 `n // 2 - 1`，其中 `n` 是数组的长度。

- 数组长度 `n = 8`
- 最后一个非叶子节点索引：`8 // 2 - 1 = 3`
- 最后一个非叶子节点的值为 **77**。

---

### **3. 从最后一个非叶子节点开始堆化**

#### **步骤 1**：堆化节点 **77**（索引 3）

- 左子节点：`2 * 3 + 1 = 7`，值为 **98**。
- 右子节点：`2 * 3 + 2 = 8`（不存在）。
- **98 > 77**，交换 **77** 和 **98**。

堆调整结果：

```
              48
           /      \
         62        35
       /   \     /   \
     98    55  14    35
    /
   77
```

---

#### **步骤 2**：堆化节点 **62**（索引 1）

- 左子节点：`2 * 1 + 1 = 3`，值为 **98**。
- 右子节点：`2 * 1 + 2 = 4`，值为 **55**。
- **98 > 62**，交换 **62** 和 **98**。

堆调整结果：

```
              48
           /      \
         98        35
       /   \     /   \
     62    55  14    35
    /
   77
```

继续堆化节点 **62**（索引 3）：

- 左子节点：`2 * 3 + 1 = 7`，值为 **77**。
- 右子节点：`2 * 3 + 2 = 8`（不存在）。
- **77 > 62**，交换 **62** 和 **77**。

堆调整结果：

```
              48
           /      \
         98        35
       /   \     /   \
     77    55  14    35
    /
   62
```

---

#### **步骤 3**：堆化节点 **48**（索引 0）

- 左子节点：`2 * 0 + 1 = 1`，值为 **98**。
- 右子节点：`2 * 0 + 2 = 2`，值为 **35**。
- **98 > 48**，交换 **48** 和 **98**。

堆调整结果：

```
              98
           /      \
         48        35
       /   \     /   \
     77    55  14    35
    /
   62
```

继续堆化节点 **48**（索引 1）：

- 左子节点：`2 * 1 + 1 = 3`，值为 **77**。
- 右子节点：`2 * 1 + 2 = 4`，值为 **55**。
- **77 > 48**，交换 **48** 和 **77**。

堆调整结果：

```
              98
           /      \
         77        35
       /   \     /   \
     48    55  14    35
    /
   62
```

继续堆化节点 **48**（索引 3）：

- 左子节点：`2 * 3 + 1 = 7`，值为 **62**。
- 右子节点：`2 * 3 + 2 = 8`（不存在）。
- **62 > 48**，交换 **48** 和 **62**。

堆调整结果：

```
              98
           /      \
         77        35
       /   \     /   \
     62    55  14    35
    /
   48
```

---

### **4. 最终的大顶堆**

经过以上步骤，最终的大顶堆为：

```
              98
           /      \
         77        35
       /   \     /   \
     62    55  14    35
    /
   48
```

对应的数组表示为：`[98, 77, 35, 62, 55, 14, 35, 48]`.

---

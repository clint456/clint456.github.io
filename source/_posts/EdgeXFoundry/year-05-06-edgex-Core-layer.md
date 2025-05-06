---
title: edgex-Core-layer.md
date: 2025-05-06 09:22:06
categories: [EdgeXFoundry]
tags: core-layer
---
# Core Services

![image-20250401100550304](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250401100550304.png)

​	核心服务是 EdgeX 南北两端的中介。顾名思义，这些服务是 EdgeX 功能的 “核心”。核心服务创建的作用是连接的 “物”、收集的传感器数据和 EdgeX 配置。核心由以下微型服务组成：

- [Core data](https://docs.edgexfoundry.org/4.0/microservices/core/data/Purpose/)：用于从南侧对象收集的数据的持久存储库和相关管理服务。
- [Command](https://docs.edgexfoundry.org/4.0/microservices/core/command/Purpose/)：一种促进和控制从北侧到南侧的执行请求的服务。
- [Metadata](https://docs.edgexfoundry.org/4.0/microservices/core/metadata/Purpose/)：连接到 EdgeX Foundry 的对象元数据的存储库和相关管理服务。元数据提供了配置新设备并将其与所属设备服务配对的功能。
- [Registry and Configuration](https://docs.edgexfoundry.org/4.0/microservices/configuration/ConfigurationAndRegistry/)：为其他 EdgeX Foundry 微型服务提供系统内相关服务的信息和微型服务配置属性（即**初始化值存储库**）。

---

# Core Data

## Purpose

​	核心数据微服务为[devices](https://docs.edgexfoundry.org/4.0/general/Definitions/#device)收集的数据提供集中持久性存储。收集传感器数据的设备服务会调用核心数据服务，将传感器数据存储在边缘系统（如[gateway](https://docs.edgexfoundry.org/4.0/general/Definitions/#gateway)）中，直到数据 “北移”，然后导出到企业和云系统。核心数据将数据持久保存在本地数据库中。
​	默认使用 [PosgreSQL](https://www.postgresql.org/)，但数据库抽象层允许添加其他数据库实现。

![image-20250401100833617](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250401100833617.png)



​	EdgeX 特有的、外部的其他服务和系统通过**核心数据服务**访问**传感器数据**。当数据在边缘时，核心数据还能为收集到的数据提供一定程度的**安全保护**。

> [!Note]
>
> Core data是完全可选的。Device service可以通过消息总线直接连接到应用服务。如果不需要本地持久化，该服务可以被移除。

​	当然如果需要本地持久化，传感器数据可以通过消息总线传递，然后在持久化数据。详细见如下。

Sensor data可以通过两种方式发送到core data:



​	1、Services（比如device services)和其它的系统能将传感器数据放在消息总线Topic上，核心数据可配置为订阅该Topic。**这是向核心数据获取数据的默认方式**。任何服务（如应用服务或规则引擎服务）或第三系统也可以订阅相同的主题。如果传感器数据不需要本地持久化，核心数据就不必订阅消息总线主题--这使得核心数据完全成为可选项。**默认情况下，信息总线使用 MQTT 实现。**
NATS 可用作信息总线的另一种实现方式。（这里官网文档应该是有误）

![image-20250401103512755](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250401103512755.png)

​	2、devices和systems可调用核心数据 REST API 向核心数据发送数据，并将数据存入本地存储。REST 方法是向核心数据发送数据的另一种方法。通过 REST 向核心数据发送数据后，核心数据会将数据重新发布到消息总线上，以便其他服务可以订阅。

![image-20250401103758380](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250401103758380.png)

​	Core data 默认通过 MQTT 将数据传输到应用服务（和边缘分析器）。 MQTT 或 NATS（在构建时选择使用）可交替使用。 使用 MQTT 需要使用 MQTT 代理（如 mosquitto）。 使用 NATS 要求所有服务都启用 NATS 并安装 NATS 服务器。



​	消息传输基础架构抽象已到位，允许创建和使用其他消息总线（如 AMQP）实现。



---

## Getting Started

## Overview

​	Core data是EdgeX 核心服务之一。需要持久化事件/阅读内容的应用程序需要它。 对于不需要存储和访问 "事件 "和 "读数 "的解决方案，可以在没有Core data的情况下使用 EdgeX 框架。



## Running Services with Core Data

​	通过使用 [Compose Builder](https://github.com/edgexfoundry/edgex-compose/tree/main/compose-builder)是最简单的方法运行所需必要服务。

1、clone https://github.com/edgexfoundry/edgex-compose/tree/main

2、cd **compose-builder**

3、`make run no-secty ds-virtual`

> 该命令，运行在非安全模式下，包括了core-data、Devive Virtial和所有基础的EdgeX 服务。
>
> Core Data将会使用PostgreSQL数据库。

## Running Service without Core Data

前两步一样，第三步的时候

3、`make gen no-secty ds-virtual`

4、`docker-compose.xml`文件中删除core-data相关的内容

5、运行compose file,`docker compose -f * up`

----

## **Core Data - Configuration**

请参考 [Common Configuration documentation](https://docs.edgexfoundry.org/4.0/microservices/configuration/CommonConfiguration/)以获取所有服务通用的配置设置。以下仅列出 Core Data 特有的额外配置项和部分。

------

> [!Note]
>
> **Edgex 3.0**
>
> 在 EdgeX 3.0 版本中，**MessageQueue** 配置已被移动到通用配置中的 **MessageBus** 之下。

------

### **Writable**

| 属性                                         | 默认值 | 描述                                                         |
| -------------------------------------------- | ------ | ------------------------------------------------------------ |
| **可写属性**可在运行时动态生效，无需重启服务 |        |                                                              |
| **LogLevel**                                 | INFO   | [severity level](https://en.wikipedia.org/wiki/Syslog#Severity_level)，低于该级别的日志不会被记录 |
| **PersistData**                              | true   | 若为 `true`，Core Data 会将接收到的所有传感器数据存储到关联的数据库 |
| **EventPurge**                               | false  | 若为 `true`，当 Core Data 接收到设备删除的系统事件时，会自动删除相关事件和读取数据 |

------

### **Writable.Telemetry**

| 属性                                                         | 默认值 | 描述                                                         |
| ------------------------------------------------------------ | ------ | ------------------------------------------------------------ |
| **请参阅 [Common Configuration](https://docs.edgexfoundry.org/4.0/microservices/configuration/CommonConfiguration/#configuration-properties)的 Writable.Telemetry 以获取所有服务通用的遥测配置** |        |                                                              |
| **Metrics**                                                  |        | Core Data 收集的服务指标，`true/false` 表示是否启用该指标报告 |
| **Metrics.EventsPersisted**                                  | false  | 是否启用事件持久化数量的统计报告                             |
| **Metrics.ReadingsPersisted**                                | false  | 是否启用读取数据持久化数量的统计报告                         |
| **Tags**                                                     | <空>   | Core Data 服务级别的标签列表，这些标签会包含在每条上报的指标中 |

------

### **Service**

| 属性                                                         | 默认值                                   | 描述                     |
| ------------------------------------------------------------ | ---------------------------------------- | ------------------------ |
| **唯一的 Core Data 配置，通用配置可在通用配置文档[Common Configuration](https://docs.edgexfoundry.org/4.0/microservices/configuration/CommonConfiguration/#configuration-properties)中找到** |                                          |                          |
| **Port**                                                     | 59880                                    | 微服务端口号             |
| **StartupMsg**                                               | This is the EdgeX Core Data Microservice | 服务完成启动后的日志消息 |

------

### **Database**

| 属性                                                         | 默认值   | 描述                   |
| ------------------------------------------------------------ | -------- | ---------------------- |
| **唯一的 Core Data 配置，通用配置可在 [Common Configuration](https://docs.edgexfoundry.org/4.0/microservices/configuration/CommonConfiguration/#configuration-properties)通用配置文档中找到** |          |                        |
| **Name**                                                     | coredata | 数据库或文档存储的名称 |

------

### **MessageBus.Optional**

| 属性                                                      | 默认值      | 描述                                  |
| --------------------------------------------------------- | ----------- | ------------------------------------- |
| **唯一的 Core Data 配置，通用配置可在通用配置文档中找到** |             |                                       |
| **ClientId**                                              | "core-data" | 连接 MQTT 或 NATS 消息总线时使用的 ID |

------

### **MaxEventSize**

| 属性             | 默认值 | 描述                                                         |
| ---------------- | ------ | ------------------------------------------------------------ |
| **MaxEventSize** | 25000  | 通过 REST 或 MessageBus 接收的最大事件大小（KB）。若为 0，则表示使用系统默认最大值。 |

------

### **Retention**

| 属性                | 默认值 | 描述                                                         |
| ------------------- | ------ | ------------------------------------------------------------ |
| **Interval**        | 10m    | 事件清理的时间间隔，即数据库应何时清除超出 MaxCap 的事件     |
| **DefaultMaxCap**   | -1     | 事件最大存储容量的默认值。当超过该上限时，数据库会触发清理操作。默认值 `-1` 表示禁用该功能 |
| **DefaultMinCap**   | 1      | 事件的最小存储容量，即清理时要保留的最小事件数量。默认值 `1`。注意：数据库使用偏移量（offset）计算行数，数值越大，查询时间越长 |
| **DefaultDuration** | 168h   | 事件默认的保留时间，默认值为 `168h`（7 天）                  |

------

### **V3 Configuration Migration Guide**

无配置更新。
 请参考 **[Common Configuration Reference](https://docs.edgexfoundry.org/4.0/microservices/configuration/V3MigrationCommonConfig/) **，以获取完整的通用配置更改详情。



---

## API Reference

EdgeX Foundry Core data 微服务与数据库交互存储从设备与传感器接收的Events、Readings；

其APIs将该数据可想其它服务暴露，允许其它服务Add、Query和Delete Events/Readings。

[edgex foundry - core data api v4.0](https://docs.edgexfoundry.org/4.0/microservices/core/data/ApiReference/)

---



## Events and Readings

​	从传感器收集到的数据被汇集到 EdgeX Events和Readings的对象中（以 JSON 对象或编码为  [CBOR](https://docs.edgexfoundry.org/4.0/general/Definitions/#cbor)的二进制对象的形式传递给核心数据）。**一个Event代表一个或多个传感器读数的集合**。Readings的数量取决于所连接的设备/传感器。

​	**一个`Event`必须至少有一个读数**。Events与传感器或设备相关联，传感器或设备是感知环境并产生读数的 “东西”。Readings是Events的一个组成部分。Readings是一个简单的键/值对，其中键（资源名称）是所感知的度量，值是所感知的实际数据。
​	Readings可能包含其他信息，以便为数据用户提供更多上下文（例如，值的数据类型）。读取的数据可由数据可视化系统、分析工具等使用。

> [!Tip]
>
> ![image-20250401135739252](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250401135739252.png)
>
> 来自 "motor123 "设备的事件有两个读数（或感应值）。 第一个读数表示电机 123 设备报告的电机压力为 1300（测量单位可能是 PSI）。
>
> 读取的值类型属性（如上图所示）让信息消费者知道该值是以 64 为底的整数。 第二个读数表明，在报告压力的同时，motor123 设备还报告了电机的温度为 120（单位可能是华氏度）。

---

## Data Retention and Persisitent Caps

数据保留和持久上限

> [!Warning]
>
> EdgeX 4.0 
>
> 增强了 EdgeX 4.0 中的原始设计，Core Data 服务通过指定的自动事件源和保留策略清除事件。

---

### Overview

在用例中，由于核心数据无限期地将数据持久化在本地数据库中，因此需要仅持久化最近的事件/读数并清理旧的事件/读数，因为保持无限数量的事件/读数被认为在计算上是昂贵的，并且可能导致机器内存的缺乏。因此，**在核心数据上放置了一个保留机制来保存事件和读数**。

### Configure the Retention Policy

#### 在Auto中定义保留策略

您可以在添加或更新设备数据时在`自动事件`中定义`保留策略 `，如下所示。如果您未定义默认保留值或未将其设置为零，则 Core Data 服务将应用默认保留值，并将根据保留策略执行基于时间或基于计数的事件保留。

```yml
"device": {
"name": "testDevice",
...
"profileName": "testProfile",
"autoEvents": [
{ "interval": "10s", "onChange": false, "sourceName": "INT16_0" },  <= apply the default maxCap, minCap, and duration from the configuration file

	{ "interval": "10s", 
	"onChange": false,
	"sourceName": "INT16_1", 
	"retention":{"maxCap": 0, "minCap": 1000, "duration": "30m"}}, 
	<= apply the default maxCap from the configuration file

	{ "interval": "10s",
	"onChange": false,
	"sourceName": "INT16_2", 
	"retention": {"maxCap": 2000, "minCap": 0, "duration": "30m"}},
    <= apply the default minCap from the configuration file

	{ "interval": "10s",
    "onChange": false, 
    "sourceName": "INT16_2", 
    "retention": {"maxCap": 2000, "minCap": 1000, "duration": ""}},  
    <= apply the default duration from the configuration file

	{ "interval": "10s", 
	"onChange": false, 
	"sourceName": "INT16_3", 
	"retention": {"maxCap": 2000, "minCap": 1000, "duration": "30m"}}
]
}
```

- 如果未定义Retention，则将从configuration.yaml应用默认值
- `MaxCap` 是最大事件容量，应检测事件的“水位线”以将事件量清除到最小容量，您可以通过设置 `MaxCap`=`-1 来`禁用“水位线”检测。
- `MinCap` 是事件的最小容量，事件总数在清除后应保存在 Core Data 中。如果设置 `MinCap`=`-1，` 则可以清除所有事件
- `Duration` 是保留事件的持续时间，过期的事件应该被检测出来进行清除，如果 `MinCap` 不为 `-1`，服务可以保留旧的事件，如果设置 `duration` 为“0 s”，可以禁用过期检查。有效的时间单位是“s”、“m”、“h”，例如，“1.5 小时”或“2 小时 45 分钟”。

#### 定义保留触发间隔和默认策略
核心数据服务根据 `configuration.yml` 文件中定义的保留间隔触发事件清理过程。

**保留配置：**
```yaml
Retention: 
  Interval: "10m"
  DefaultMaxCap: -1
  DefaultMinCap: 1      
  DefaultDuration: "168h"
```

- **Interval（间隔）**：默认值为 "10m"，您可以通过设置为 "0s" 来禁用事件清理过程。有效的时间单位包括 "s"（秒）、"m"（分钟）、"h"（小时），例如："1.5h" 或 "2h45m"。
- **DefaultMaxCap**：默认最大事件容量，默认值为 -1。
- **DefaultMinCap**：默认最小事件容量，默认值为 1。请注意使用 `minCap`，因为数据库通过偏移量计算行数，当值变大时，数据库需要更多时间来计数。
- **DefaultDuration**：默认保留事件的持续时间，默认值为 "168h"（即 7 天）。

---

### 使用方法

#### 基于计数的保留策略
您可以定义 `maxCap` 和 `minCap` 来实现基于计数的保留策略。

```json
"device": {
    "name": "device_int_autoevents",
    ...
    "profileName": "profile_int_resources",
    "autoEvents": [
        { 
            "interval": "1s", 
            "onChange": false, 
            "sourceName": "INT16_1", 
            "retention": {
                "maxCap": 2000, 
                "minCap": 1000, 
                "duration": "0s"
            }
        }
    ]
}
```
在此示例中，核心数据服务会检查事件数量是否超过 2000。如果事件数量达到或超过 2000，则服务会清理事件以维持 `minCap` 的值为 1000。如果 `minCap` 设置为 -1，则服务将删除所有旧数据。

---

#### 基于时间的保留策略（不带 MinCap）
您可以定义 `duration` 来清理基于时间的事件。

```json
"device": {
    "name": "device_int_autoevents",
    ...
    "profileName": "profile_int_resources",
    "autoEvents": [
        { 
            "interval": "1s", 
            "onChange": false, 
            "sourceName": "INT16_1", 
            "retention": {
                "maxCap": -1, 
                "minCap": -1, 
                "duration": "24h"
            }
        }
    ]
}
```
在此示例中，`minCap` 设置为 -1，这意味着我们不会保留旧数据，然后核心数据服务会清理那些年龄（当前时间 - 事件生成时间）超过 "24h" 的事件。

---

#### 基于时间的保留策略（带 MinCap）
您可以定义 `duration` 和 `minCap` 来实现基于时间的保留策略，同时确保在数据库中保留一定数量的过期事件。注意，`minCap` 用于在清理事件时保留旧数据。即使数据库中有新数据，该过程仍会保留一些旧数据。这在设备意外关闭时非常有用，可以保留旧数据以便后续追踪。

```json
"device": {
    "name": "device_int_autoevents",
    ...
    "profileName": "profile_int_resources",
    "autoEvents": [
        { 
            "interval": "1s", 
            "onChange": false, 
            "sourceName": "INT16_1", 
            "retention": {
                "maxCap": -1, 
                "minCap": 1000, 
                "duration": "24h"
            }
        }
    ]
}
```
在此示例中，核心数据服务会清理那些年龄（当前时间 - 事件生成时间）超过 "24h" 的事件，并在数据库中保留最近的 1000 个旧事件。  
服务会识别最近的第 1000 个事件。如果第 1000 个事件不存在，则跳过清理；否则，它会删除比第 1000 个事件更早的数据。

---

#### 结合计数和时间的保留策略
> **注意**：通常不建议同时配置基于计数和基于时间的保留策略，因为这可能导致不必要的复杂性和潜在混淆。

用户可以通过定义 `maxCap`、`minCap` 和 `duration` 来结合计数和时间的保留策略。

```json
"device": {
    "name": "device_int_autoevents",
    ...
    "profileName": "profile_int_resources",
    "autoEvents": [
        { 
            "interval": "1s", 
            "onChange": false, 
            "sourceName": "INT16_1", 
            "retention": {
                "maxCap": 2000, 
                "minCap": 1000, 
                "duration": "24h"
            }
        }
    ]
}
```
在此示例中，核心数据服务会检查事件数量是否超过 2000。如果事件数量达到或超过 2000，则执行基于时间的保留策略（如前一节所述）。

---

### 先决条件知识
- 有关数据保留的详细信息，请参阅 [Core Data 配置属性](https://example.com) 下的保留选项卡。
- 有关其他详细信息，请参阅 [通知配置属性](https://example.com) 下的保留选项卡。

---

### 启用数据保留
数据保留机制默认启用。您可以通过将保留间隔设置为 `0s` 来禁用它。

#### 使用环境变量覆盖默认配置：
```bash
RETENTION_INTERVAL: <interval>  
RETENTION_DEFAULTMAXCAP: <maxcap>
RETENTION_DEFAULTMINCAP: <mincap>
RETENTION_DEFAULTDURATION: <duration>  
```
有关环境变量覆盖的更多信息，请参阅 [服务配置覆盖](https://example.com)。

#### 使用 Core Keeper 覆盖默认配置
例如，将 core-data 的保留 `MinCap` 从 8000 更新为 10000，请参阅 [Core Keeper API 文档](https://example.com) 获取更多信息。
```bash
curl -X PUT "http://localhost:59890/api/v3/kvs/key/edgex/v4/core-data/Retention/MinCap" \
-H "Content-Type: application/json" \
-d '{"value": "10000"}'
```

---



# Core Metadata

## Purpose
Core Metadata微服务管理关于[devices](https://docs.edgexfoundry.org/3.1/general/Definitions/#device)和传感器的信息。这些信息被其他服务（如设备服务、命令服务等）用来与设备进行通信。

具体来说，元数据服务具有以下功能：

- **管理连接到 EdgeX Foundry 并由其操作的设备的相关信息。**
- **知道设备报告的数据类型及其组织结构**。
- **知道如何向设备发送命令。**

尽管元数据服务拥有这些能力，但它并不执行以下活动：

- **它不负责从设备实际收集数据**，这项任务由设备服务和Core data服务完成。
- **它不负责向设备发出命令**，这项任务由Core command服务和device服务完成。

![image-20250401145039952](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250401145039952.png)

---

## Getting Started

#### 数据模型
要理解元数据，了解 EdgeX 管理的数据对象非常重要。元数据将其知识存储在本地持久化数据库中。默认情况下使用 Redis，但数据库抽象层允许使用其他数据库。

---

### 设备配置文件（Device Profile）
设备配置文件定义了设备的一般特性、它们提供的数据以及如何对其进行操作。可以将设备配置文件视为某种类型或分类的设备模板。例如，BACnet 热水器设备配置文件提供了 BACnet 热水器发送的数据类型的一般特性，例如当前温度和湿度水平。它还定义了 EdgeX 可以发送给 BACnet 热水器的哪些类型命令或操作。示例可能包括设置冷却或加热点的操作。设备配置文件通常以 YAML 文件的形式指定并上传到 EdgeX。下面提供了更多详细信息。

---

#### 设备配置文件详情
![](https://docs.edgexfoundry.org/3.1/microservices/core/metadata/EdgeX_MetadataModel_Profile.png)



---

### *元数据设备profile模型（Metadata device profile object model）*

设备配置文件包含以下关键部分：

- **设备资源（Device Resources）**
- **属性（Attributes）**
- **属性（Properties）**
- **设备命令（Device Commands）**
- **核心命令（Core Commands）**

​	设备配置文件具有多个高层次属性，用于为配置文件提供上下文和标识。  

#### 1、General Properties

- **name** 字段是必填项，并且在 EdgeX 部署中必须唯一。
- 其他字段是可选的，虽然它们不会被设备服务直接使用，但可以填充以提供信息性内容：
  - **Description**（描述）
  - **Manufacturer**（制造商）
  - **Model**（型号）
  - **Labels**（标签）

​	以下是一个示例，展示了 BACnet 设备服务提供的 KMC 9001 BACnet 恒温器设备配置文件的通用信息部分（您可以在 [GitHub](https://example.com) 中找到该配置文件）。在此部分中，只有 `name` 是必填项。设备配置文件的名称在任何 EdgeX 部署中都必须唯一。`manufacturer`、`model` 和 `labels` 是可选信息，用于更好地查询系统中的设备配置文件。

```yaml
name: "BAC-9001"
manufacturer: "KMC"
model: "BAC-9001"
labels: 
    - "B-AAC"
description: "KMC BAC-9001 BACnet thermostat"
```

- **标签（Labels）** 提供了一种标记、组织或分类各种配置文件的方式。它们在 EdgeX 内部没有实际用途。

#### 2、Device Resources

​	设备资源（在 YAML 文件的 deviceResources 部分中）指定了设备中的一个传感器值，该值可以是单独读取或写入，也可以作为设备命令的一部分（见下文）。将设备资源视为可以从底层设备获取的特定值，或可以设置到底层设备的值。在恒温器中，设备资源可能是一个温度或湿度（从设备中感应到的值），或冷却点或加热点（可以设置/激活的值，以允许恒温器确定相关加热/冷却系统何时开启或关闭）。设备资源有一个名称用于识别，以及一个描述用于信息目的。

​	设备资源的属性部分也得到了极大的简化。详见下文。

​	回到 BACnet 示例，这里有两个设备资源。一个将用于获取温度（读取）当前温度，另一个用于设置（写入或激活）活动冷却设定点。必须提供设备资源名称**，并且它必须在任何 EdgeX 部署中是唯一的。**

```yaml
name: Temperature
description: "Get the current temperature"
isHidden: false

name: ActiveCoolingSetpoint
description: "The active cooling set point"
isHidden: false
```

> [!Note]
>
> 虽然在这个示例中已明确指出，未指定时 `isHidden` 默认为 false。 `isHidden` 表示是否将设备资源暴露给核心命令服务。
设备服务允许通过 REST 端点访问设备资源。设备配置文件中设备资源部分指定的值可以通过以下 URL 模式访问：

- http://:/api/v3/device/name//

#### 3、Attributes

​	设备资源关联的属性是设备服务**访问特定值所需的具体参数**。换句话说，属性是“面向内部”的，并由设备服务用来确定如何与设备通信以读取或写入（获取或设置）其某些值。属性是详细的协议和/或设备特定信息，它告知设备服务如何与设备通信以获取（或设置）感兴趣的值。

​	返回到 BACnet 设备配置文件示例，以下是示例设备中温度和活动冷却设定点的完整设备资源部分 - 包括属性。

```yaml
-
    name: Temperature
    description: "Get the current temperature"
    isHidden: false
    attributes: 
        { type: "analogValue", instance: "1", property: "presentValue", index: "none"  }
-
    name: ActiveCoolingSetpoint
    description: "The active cooling set point"
    isHidden: false
    attributes:
        { type: "analogValue", instance: "3", property: "presentValue", index: "none"  }
```

#### 4、Properties

设备资源的属性描述了在设备上获取或设置的值。属性可以可选地通知设备服务对值执行一些简单的处理。再次以 BACnet 配置文件为例，以下是与恒温器温度设备资源关联的属性。

```yaml
name: Temperature
description: "Get the current temperature"
attributes: 
    { type: "analogValue", instance: "1", property: "presentValue", index: "none"  }
properties: 
    valueType: "Float32"
    readWrite: "R"
    units: "Degrees Fahrenheit"
```

属性中的`valueType`属性提供了关于收集或设置的值的更多详细信息。在这种情况下，提供了要设置的温度值的详细信息。该值提供了有关收集或设置的数据类型的详细信息，以及该值是否可读、可写或两者均可。

以下字段可在值属性中可用：

- valueType - 必填。值的类型。支持类型有 Bool、Int8 - Int64、Uint8 - Uint64、Float32、Float64、String、Binary、Object 以及原始类型（整数、浮点数、布尔值）的数组。数组指定为例如 Float32Array、BoolArray 等。
- readWrite - R、RW 或 W，表示值是否可读或可写。
- units - 提供与值关联的度量单位的相关详细信息。在此例中，温度的度量单位是华氏度
- min - 允许的最小值
- max - 允许的最大值
- defaultValue - 用于未指定值的 PUT 请求的默认值。
- base -  在返回之前，将原始读数提升到该值的幂。
- scale - 在返回读取值之前要乘以的系数。
- offset - 在返回读取值之前要添加的值。
- mask - 将应用于整数读数的二进制掩码。
- shift - 整数读数将右移的位数。

基于基、缩放、偏移、掩码和移位定义的处理按此顺序应用。这是在 SDK 内部完成的。SDK 会对设置操作中的传入数据进行反向转换（NB 掩码转换在设置中尚未实现）

#### 5、Device Command

​	设备命令（在 YAML 文件的 deviceCommands 部分中）定义了对多个同时设备资源的读写访问。设备命令是可选的。每个命名的设备命令应包含一定数量的获取和/或设置资源操作，分别描述读取或写入。

​	设备命令在读取逻辑上相关的数据时可能很有用，例如，对于三轴加速度计，一起读取所有轴（X、Y 和 Z）是有帮助的。

每个device command包含以下属性：

- name - 设备命令的名称
- readWrite - R、RW 或 W，表示操作是可读的还是可写的。
- isHidden - 表示是否向核心命令服务公开设备命令（可选，默认为 false）
- resourceOperations - 命令中包含的设备资源操作的列表。

每个 resourceOperation 将指定：

- the deviceResource - 设备资源的名称
- defaultValue - 可选的，当操作不提供值时返回的值
- parameter - 可选的，如果 PUT 请求未指定，将使用此值
- mappings - 可选的，允许将字符串类型的读取重新映射

设备命令也可以通过设备服务的 REST API 以类似的方式访问，如设备资源所述

- http://:/api/v3/device/name//

  **如果设备命令和设备资源具有相同的名称，则将可用的是设备命令。**

#### 6、Core Command

设备资源或非隐藏的设备命令可通过 EdgeX 核心命令服务查看和使用。

其他服务（如规则引擎）或 EdgeX 的外部客户端应通过核心命令服务请求设备服务，当它们这样做时，它们正在调用设备服务的未隐藏设备命令或设备资源。直接访问设备服务的设备命令或设备资源是不被推荐的。通过 EdgeX 命令服务提供的命令允许 EdgeX 采用者添加额外的安全或控制，以确定谁/什么/何时触发并调用实际设备上的操作。

![](https://docs.edgexfoundry.org/3.1/microservices/core/metadata/EdgeX_DS_Access.png)





---

### 设备（Device）
​	**实际设备的数据**是core metadata微服务存储和管理的另一种信息类型。**每个由 EdgeX Foundry 管理的设备都会通过其所属的设备服务注册到core data服务中**。每个设备必须有一个**唯一**的名称。

​	元数据服务会将设备的相关信息（例如设备地址）与设备名称一起存储在数据库中。此外，每个设备还会关联到一个设备配置文件。这种关联使元数据能够将设备配置文件提供的知识应用到每个设备上。例如，恒温器配置文件可能会声明它以摄氏度报告温度值。将特定恒温器（例如大厅中的恒温器）与恒温器配置文件关联后，元数据服务就能知道大厅中的恒温器以摄氏度报告温度值。

![](https://docs.edgexfoundry.org/3.1/microservices/core/metadata/EdgeX_Metadata2.png)

---

### 设备服务（Device Service）
​	(core metadata)元数据服务还**存储**和**管理**有关**设备服务的信息**。设备服务作为 EdgeX 与实际设备和传感器之间的**接口**。

​	设备服务是其他通过**设备协议**与**设备通信**的**微服务**。例如，Modbus 设备服务可以促进所有类型 Modbus 设备之间的通信。Modbus 设备的例子包括电机控制器、接近传感器、恒温器和电力计量表。设备服务简化了 EdgeX 与设备之间的通信。

​	当设备服务启动时，它会使用元数据注册自己。当 EdgeX 配置新设备时，设备会与其所属的设备服务相关联。这种关联也存储在元数据中。

<img src="https://raw.githubusercontent.com/clint456/PicGo/main/edgex/EdgeX_Metadata3.png" style="zoom:50%;" />

---

**设备元数据、设备服务以及设备配置文件模型**

###### ![](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/EdgeX_MetadataModel.png)

*设备配置文件、设备和设备服务对象模型及其关联性*



---

### 配置监视器（Provision Watcher）

设备服务可能包含自动配置新设备的逻辑。这可以通过静态或动态方式进行。

#### 静态设备配置（Static Device Configuration）
在静态设备配置（也称为静态配置）中，设备服务从配置中连接并建立它管理的 EdgeX 中的新设备（特别是元数据）。例如，设备服务可能在启动时提供特定设备的 IP 地址和附加设备详细信息（或多个设备）。在静态配置中，假设设备将存在，并且它将在配置中指定的地址或位置可用。设备及其连接信息在设备服务启动时已知。

#### 动态发现（Dynamic Discovery）
在动态发现（也称为自动配置）中，设备服务被提供一些关于查找位置和设备（或设备）的一般参数的通用信息。例如，设备服务可能被提供一组 BLE 地址空间范围，并被告知在此范围内寻找特定性质的设备。然而，设备服务并不知道设备是否真的在那里——设备可能在启动时并不存在。它必须在操作期间（通常按照某种时间表）不断扫描，以寻找配置提供的位置和设备参数范围内的新设备。

并非所有设备服务都支持动态发现。如果支持动态发现，则配置信息（即在哪里查找，换句话说，在哪里扫描）关于要查找什么新设备由配置监视器指定。配置监视器是提供给设备服务（通常在启动时）的特定配置信息，该信息存储在元数据中。除了提供扫描期间要查找的设备详细信息外，配置监视器还可能包含“阻止”指示符，这些指示符定义了不应自动配置的设备参数。这允许缩小设备扫描的范围或允许避免特定设备。

![元数据的自动配置观察者对象模型](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/EdgeX_MetadataModel_ProvisionWatcher.png)

*元数据的配置监视器对象模型*(*Metadata's provision watcher object model*)

---

## Configuration

请参阅通用配置文档 [Common Configuration documentation](https://docs.edgexfoundry.org/3.1/microservices/configuration/CommonConfiguration/) ，了解适用于所有服务的配置设置。以下仅包含针对核心元数据的附加设置和部分。

> [!Note]
> 
> EdgeX 3.0 中已移除通知配置。元数据将利用设备系统事件来替代原始的设备变更通知。
> 
> 对于 EdgeX 3.0， `MessageQueue` 配置已移动到 `MessageBus` 在通用配置中。

### 1、Writable 可写

| Property 属性     | Default Value 默认值 | Description 描述                                             |
| :---------------- | :------------------- | :----------------------------------------------------------- |
|                   |                      | flag 配置的可写部分中的条目可以在服务运行时动态更改，如果服务以 `-cp/--configProvider` 标志运行 |
| LogLevel 日志级别 | INFO                 | 日志条目严重级别。不是默认级别或更高级别的日志条目将被忽略。 |

### 2、Writable.Telemetry

| Property 属性 | Default Value 默认值 | Description 描述                                             |
| :------------ | :------------------- | :----------------------------------------------------------- |
|               |                      | 请参阅 `Writable.Telemetry` 中的通用配置，以获取所有服务共用的遥测配置 |
| Metrics 指标  | `<TBD>`              | .核心元数据收集的服务指标。布尔值表示是否启用指标的报告。    |
| Tags 标签     | `<empty>`            | 包含在每个报告的指标中的任意核心元数据服务级别标签列表。     |

### 3、Writable.ProfileChange

| Property 属性              | Default Value 默认值 | Description 描述                                             |
| :------------------------- | :------------------- | :----------------------------------------------------------- |
| StrictDeviceProfileChanges | false                | 是否允许修改设备配置文件，设置为 `true` 以拒绝所有可能影响现有事件和读数的修改。因此， `manufacture` 、 `isHidden` 或 `description` 的更改仍然可以进行。 |
| StrictDeviceProfileDeletes | false                | 是否允许删除设备配置文件，设置为 `true` 以拒绝所有删除操作。 |

### 4、Writable.UoM

| Property 属性 | Default Value 默认值 | Description 描述                                             |
| :------------ | :------------------- | :----------------------------------------------------------- |
| Validation    | false                | 是否启用单位验证，设置为 `true` 以验证所有设备配置文件 `units` 是否与核心元数据中的单位列表匹配。 |

### 5、Service

| Property 属性 | Default Value 默认值        | Description 描述                                   |
| :------------ | :-------------------------- | :------------------------------------------------- |
|               |                             | 核心元数据的独特设置。通用设置可在通用配置中找到。 |
| Port          | 59881                       | 微服务端口号                                       |
| StartupMsg    | 这是 EdgeX 核心元数据微服务 | 服务完成引导启动时记录的消息                       |

### 6、UoM单位

| Property 属性    | Default Value 默认值 | Description 描述       |
| :--------------- | :------------------- | :--------------------- |
| UoMFile 单位文件 | './res/uom.yaml'     | 单位配置文件位置的路径 |

### 7、Database

| Property 属性 | Default Value 默认值 | Description 描述                                 |
| :------------ | :------------------- | :----------------------------------------------- |
|               |                      | 核心元数据的独特设置。通用设置可在通用配置中找到 |
| Name          | metadata             | 数据库或文档存储名称                             |

### 8、MessageBus.Optional

| Property 属性 | Default Value 默认值 | Description 描述                                 |
| :------------ | :------------------- | :----------------------------------------------- |
|               |                      | 核心元数据的唯一设置。通用设置可在通用配置中找到 |
| ClientId      | core-metadata        | 连接到 MQTT 或 NATS 基础消息总线时使用的 ID      |

## Units of Measure 测量单位


核心元数据将在启动时读取位于 `UoM.UoMFile` 的度量单位配置（见下面的配置示例），指定的配置可能是一个本地配置文件或配置的 URI。有关文件 URI 的详细信息，请参阅文件 URI 部分[URI for Files](https://docs.edgexfoundry.org/3.1/microservices/general/#uri-for-files) 。



>EdgeX 3.1
>
>EdgeX 3.1 新增支持通过 URI 加载 `UoM.UoMFile` 配置。




**样例单位配置（Sample unit of measure configuration）**

```yaml
Source: reference to source for all UoM if not specified below
Units:
  temperature:
    Source: www.weather.com
    Values:
      - C
      - F
      - K
  weights:
    Source: www.usa.gov/federal-agencies/weights-and-measures-division
    Values:
      - lbs
      - ounces
      - kilos
      - grams
```

​	当启用验证（ `Writable.UoM.Validation` 设置为 `true` ）时，所有设备配置文件 `units` （在设备资源、设备属性中）将根据核心元数据中的度量单位列表进行验证。
​	换句话说，当通过核心元数据 API 创建或更新设备配置文件时，设备资源中 `units` 字段指定的单位将对照通过核心元数据配置提供的有效单位列表进行检查。
​	如果 `units` 值与配置的单位之一匹配，则设备资源被认为是有效的，允许创建或更新操作继续进行。如果 `units` 值与配置的单位之一不匹配，则拒绝设备配置文件或设备资源操作（创建或更新）（返回错误代码 500），并在响应中返回适当的错误消息给核心元数据 API 的调用者。

> [!Note] 
>
> 配置文件中的 `units` 字段是可选的，并且应保持可选。如果设备配置文件中没有指定 `units` 字段，则假定设备资源没有定义良好的度量单位。换句话说，核心元数据不会因为设备资源未指定 `units` 字段而使配置文件失败。
> 

### V3 Configuration Migration Guide V3 配置迁移指南

- 已移除 `RequireMessageBus`
- UoMFile 值已更改为指向 YAML 文件，而不是 TOML 文件

See [Common Configuration Reference](https://docs.edgexfoundry.org/3.1/microservices/configuration/V3MigrationCommonConfig/) for complete details on common configuration changes.

---

## Core Data - API Reference

核心元数据微服务包括设备/传感器元数据数据库以及用于将此数据库暴露给其他服务的 API。特别是，设备配置服务通过此服务的 API 存储和管理设备元数据。

### Source Code

https://github.com/edgexfoundry/edgex-go/tree/v3.1/cmd/core-metadata.

## Additional Details

### Core Metadata - Device Profile

设备配置文件描述了 EdgeX 系统中的一种 [device](https://docs.edgexfoundry.org/3.1/general/Definitions/#device)类型。每个由设备服务管理的设备都与一个设备配置文件相关联，该配置文件定义了该设备类型，通过其支持的运算来定义。
有关设备配置文件字段及其所需值的完整列表，请参阅设备配置文件参考 [device profile reference](https://docs.edgexfoundry.org/3.1/microservices/core/metadata/details/DeviceProfile/#device-profile-reference)。
有关设备配置文件模型及其所有属性的详细说明，请参阅设备配置文件数据模型 [metadata device profile data model](https://docs.edgexfoundry.org/3.1/microservices/core/metadata/GettingStarted/#data-models)。

### Identification

配置文件包含各种标识字段。 `Name` 字段是必需的，必须在 EdgeX 部署中是唯一的。其他字段是可选的 - 设备服务不使用这些字段，但可以填充以供信息目的。

- Description
- Manufacturer
- Model
- Labels

### DeviceResources

​	设备资源指定设备内的传感器值，这些值可以单独读取或写入，也可以作为设备命令的一部分。它具有一个用于识别的名称和一个用于信息目的的描述。
​	设备服务允许通过其 `device` REST 端点访问设备资源。
​	设备资源中的 `Attributes` 是访问特定值所需的设备服务特定参数。每个设备服务实现都将有其自己的命名值集合，这里需要，例如，BACnet 设备服务可能需要一个对象标识符和一个属性标识符，而蓝牙设备服务可以使用 UUID 来标识值。
设备资源中的 `Properties` 描述了值，并可选择请求对其进行一些简单处理。以下字段可用：

- valueType - 必需。值的类型。支持类型有 `Bool` ， `Int8` - `Int64` ， `Uint8` - `Uint64` ， `Float32` ， `Float64` ， `String` ， `Binary` ， `Object` 以及原始类型的数组（ints，floats，bool）。数组指定为 eg. `Float32Array` ， `BoolArray` 等。
- readWrite - `R` ， `RW` 或 `W` ，表示值是否可读或可写。
- unit - 表示值的单位，例如安培、摄氏度等。
- minimum - SET 命令允许的最小值，超出范围将导致错误。
- maximum  - SET 命令允许的最大值，超出范围将导致错误。
- defaultValue  - 用于未指定值的 SET 命令的值。
- assertion - 一个字符串值，用于将处理后的读取值与之比较。如果读取值与断言值不同，则将设备的操作状态设置为禁用。这可以用于**健康检查**。
- base - 在返回之前，将原始读数提升到该值的幂。
- scale -  在返回之前乘以读取值的系数。
- offset -  在返回之前添加到读取值中的值。
- mask -  将应用于整数读取值的二进制掩码。
- shift -  整数读取将右移的位数。
- mediaType -  表示 `Binary` 值格式的字符串。
- optional - 给定设备资源的可选属性映射。
  基于基值、缩放、偏移、掩码和移位定义的处理按此顺序应用。这是在 SDK 内部完成的。SDK 对设置操作中的传入数据进行反向转换（NB 掩码转换在设置操作中尚未实现）。

### DeviceCommands 设备命令

设备命令定义了对多个同时设备资源的读写访问。每个命名的设备命令应包含一定数量的 `resourceOperations` 。
当读取值在逻辑上相关时，设备命令可能很有用，例如，对于 3 轴加速度计，一起读取所有轴是有帮助的。
资源操作由以下属性组成：

- deviceResource - 要访问的设备资源名称。

- defaultValue -  可选，如果 SET 命令未指定，将使用此值。

- mappings - optional, 允许将字符串类型的读取重新映射

  设备服务允许通过与访问设备资源相同的 `device` REST 端点访问设备命令。

### Device Profile Reference 


本章详细介绍了设备配置文件的结构和其字段的允许值。

### Device Profile 

| Field Name 字段名称      | Type 类型                            | Required? 是否必需？ | Notes 备注                                                   |
| :----------------------- | :----------------------------------- | :------------------- | :----------------------------------------------------------- |
| name 名称                | String                               | Y                    | 必须在 EdgeX 部署中唯一。仅允许使用在 https://datatracker.ietf.org/doc/html/rfc3986#section-2.3 中定义的非保留字符。 |
| description 描述         | String 字符串                        | N                    |                                                              |
| manufacturer 厂商        | String 字符串                        | N                    |                                                              |
| model                    | String 字符串                        | N                    |                                                              |
| labels 标签              | Array of String 字符串数组           | N                    |                                                              |
| deviceResources 设备资源 | Array of DeviceResource 设备资源数组 | Y                    |                                                              |
| deviceCommands 设备命令  | Array of DeviceCommand 设备命令数组  | N                    |                                                              |

### DeviceResource 

| Field Name 字段名称 | Type 类型                           | Required? 是否必需？ | Notes 备注                                                   |
| :------------------ | :---------------------------------- | :------------------- | :----------------------------------------------------------- |
| name 名称           | String 字符串                       | Y                    | 必须在 EdgeX 部署中唯一。仅允许使用在 https://datatracker.ietf.org/doc/html/rfc3986#section-2.3 中定义的非保留字符。 |
| description 描述    | String 字符串                       | N                    |                                                              |
| isHidden 是否隐藏   | Bool 布尔值                         | N                    | 是否将 DeviceResource 暴露给 Command Service，默认为 false   |
| tag 标签            | String 字符串                       | N                    |                                                              |
| attributes 属性     | String-Interface Map 字符串接口映射 | N                    | 每个设备服务应定义所需和可选键                               |
| properties 属性     | ResourceProperties 资源属性         | Y                    |                                                              |

### ResourceProperties 

| Field Name 字段名称 | Type 类型                      | Required? 是否必需？ | Notes 备注                                                   |
| :------------------ | :----------------------------- | :------------------- | :----------------------------------------------------------- |
| valueType 数据类型  | Enum 枚举                      | Y                    | `Uint8`, `Uint16`, `Uint32`, `Uint64`, `Int8`, `Int16`, `Int32`, `Int64`, `Float32`, `Float64`, `Bool`, `String`, `Binary`, `Object`, `Uint8Array`, `Uint16Array`, `Uint32Array`, `Uint64Array`, `Int8Array`, `Int16Array`, `Int32Array`, `Int64Array`, `Float32Array`, `Float64Array`, `BoolArray` |
| readWrite 读写      | Enum 枚举                      | Y                    | `R`, `W`, `RW`                                               |
| units 单位          | String 字符串                  | N                    | Developer is open to define units of value 开发者可定义值单位 |
| minimum 最小值      | Float64                        | N                    | Error if SET command value out of minimum range 如果 SET 命令的值超出最小范围，则报错 |
| maximum 最大        | Float64                        | N                    | Error if SET command value out of maximum range 设置命令值超出最大范围时出错 |
| defaultValue 默认值 | String 字符串                  | N                    | If present, should be compatible with the Type field 如果存在，应与类型字段兼容 |
| mask 掩码           | Uint64                         | N                    | Only valid where Type is one of the unsigned integer types 仅当类型为无符号整数类型之一时有效 |
| shift 移位          | Int64                          | N                    | Only valid where Type is one of the unsigned integer types 仅当类型为无符号整数类型之一时有效 |
| scale 缩放          | Float64                        | N                    | Only valid where Type is one of the integer or float types 仅在类型为整数或浮点类型时有效 |
| offset 偏移量       | Float64                        | N                    | Only valid where Type is one of the integer or float types 仅当类型为整数或浮点类型之一时有效 |
| base 基础           | Float64                        | N                    | Only valid where Type is one of the integer or float types 仅在类型为整数或浮点类型时有效 |
| assertion 断言      | String 字符串                  | N                    | String value to which the reading is compared 用于比较读数的字符串值 |
| mediaType 媒体类型  | String 字符串                  | N                    | Only required when valueType is `Binary` 仅当 valueType 为 `Binary` 时才需要 |
| optional 可选的     | String-Any Map 字符串-任意映射 | N                    | Optional mapping for the given resource 给定资源的可选映射   |

### DeviceCommand 

| Field Name 字段名称         | Type 类型                                 | Required? 是否必需？ | Notes 备注                                                   |
| :-------------------------- | :---------------------------------------- | :------------------- | :----------------------------------------------------------- |
| name 名称                   | String 字符串                             | Y                    | **必须在此配置文件中唯一**。如果一个设备命令只有一个设备资源是冗余的，除非重命名和/或限制读写访问。例如，设备资源是读写，但设备命令是只读的。仅允许使用在 https://datatracker.ietf.org/doc/html/rfc3986#section-2.3 中定义的非保留字符。 |
| isHidden 隐藏               | Bool 布尔值                               | N                    | 是否将设备命令暴露给命令服务，默认为 false                   |
| readWrite 读写              | Enum 枚举                                 | Y                    | `R`, `W`, `RW`                                               |
| resourceOperations 资源操作 | Array of ResourceOperation 资源操作的数组 | Y                    |                                                              |

## ResourceOperation 资源操作

| Field Name 字段名称     | Type 类型                           | Required? 是否必需？ | Notes 备注                                |
| :---------------------- | :---------------------------------- | :------------------- | :---------------------------------------- |
| deviceResource 设备资源 | String 字符串                       | Y                    | 必须在此配置文件中指定一个 DeviceResource |
| defaultValue 默认值     | String 字符串                       | N                    | I如果存在，应与指定设备资源的类型字段兼容 |
| mappings 映射           | String-String Map 字符串-字符串映射 | N                    | 将 GET 资源操作值映射到另一个字符串值     |

---

## Core Metadata - Device System Events

系统事件是由设备元数据对象（设备、设备配置文件等）的添加、更新或删除触发的。每当添加新对象、更新现有对象或删除现有对象时，都会向 EdgeX 消息总线发布一个系统事件 DTO。

>  系统事件类型 `deviceservice` 、 `deviceprofile` 和 `provisionwatcher` 在 EdgeX 3.0 中为新增

系统事件 DTO 具有以下属性：

| Property 属性    | Description 描述                                             | Value 值                                                     |
| :--------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| Type 类型        | Type of System Event 系统事件类型                            | `device`, `deviceservice`, `deviceprofile`, or `provisionwatcher` `device` ， `deviceservice` ， `deviceprofile` 或 `provisionwatcher` |
| Action 动作      | System Event action 系统事件动作                             | `add`, `update`, or `delete` in this case `add` 、 `update` 或 `delete` 在此情况下 |
| Source 源        | Source of the System Event 系统事件的源                      | `core-metadata` in this case  `core-metadata` 在此情况下     |
| Owner 拥有者     | Owner of the data in the System Event 系统事件中数据的拥有者 | In this case it is the name of the device service that owns the device or `core-metadata` 在这种情况下，是拥有设备的设备服务名称或 `core-metadata` |
| Tags 标签        | Key value map of additional data 额外数据的键值映射          | empty in this case 在这种情况下为空                          |
| Details 详细信息 | The data object that trigger the System Event 触发系统事件的请求数据对象 | the added, updated, or deleted Device/Device Profile/Device Service/Provision Watcher in this case 本例中添加、更新或删除的设备/设备配置文件/设备服务/配置监视器 |
| Timestamp 时间戳 | Date and time of the System Event 系统事件的日期和时间       | timestamp 时间戳                                             |

### Publish Topic

设备系统事件的系统事件 DTO 发布到上面指定的 `MessageQueue.PublishTopicPrefix` 配置设置的主题，默认为 `edgex/system-events` ，以及以下数据项，这些数据项被添加以允许接收者通过订阅进行筛选。

- source = core-metadata source
- type = device type 
- action = add/update/delete
- owner = [device service name which owns the device]
- profile = [device profile name associated with the device]

**示例设备系统事件发布主题**

```
edgex/system-events/core-metadata/device/add/device-onvif-camera/onvif-camera
edgex/system-events/core-metadata/device/update/device-rest/sample-numeric
edgex/system-events/core-metadata/device/delete/device-virtual/Random-Boolean-Device
```

---

# Core Command

![](https://docs.edgexfoundry.org/3.1/microservices/core/command/EdgeX_Command.png)

## Introduction

命令微服务（通常称为指挥和控制微服务）能够代表以下设备发布命令或执行操作：

- Edgex Foundry 中的其他微服务（例如，边缘分析或规则引擎微服务）
- 可能与EdgeX Foundry存在同一个系统上的其他应用程序（例如，需要关闭传感器的管理代码）
- 对于需要控制这些设备的任何外部系统（例如，确定需要修改设备集合设置需求的基于云的应用程序）

命令微服务以通用、规范的方式公开命令，以简化与设备的通信。可以向设备发送两种类型的命令：

- GET：命令用于从设备请求数据。这通常用于请求最新的传感器读数。
- SET：用于对设备进行操作或激活，或设置设备上的某些配置

大多数情况下，GET命令是请求设备最新传感器的简单请求。因此，请求通常是无参数的。SET命令需要请求body，提供用于请求中的参数key/value数组。

命令微服务从core Metadata服务中获取其关于设备的信息。命令设备服务始终通过Device Service将（SET、GET）转发给设备。命令服务从不直接与设备通信。因此，**命令微服务是来自Edgex北向到特定协议设备服务和相关设备控制请求的代理服务。**

命令服务可以为设备提供一层保护（虽然目前不是其职责的一部分）。可以添加额外的安全措施，以防止为未授权与设备交互（通过设备服务）。命令服务还可以调节设备上的请求数量，以免设备过载——也许甚至可以缓存相应，以避免在必要时唤醒设备。

## Getting Started

### Commands via Messaging

以前，第三方系统（企业应用、云应用等）与Edgex通信以控制设备或获取传感器的最新信息，只能通过REST完成——第三方系统通过REST调用命令服务，然后通过REST将请求转发给设备服务，EdgeX没有内置的消息请求方式来与EdegX或其管理的设备/传感器进行通信。

从v2.3（Levski）版本开始，core command服务增加了对外部MQTT连接的支持（与应用程序提供的外部MQTT连接方式相同），**让core command允许成为内部消息总线（Mqtt&Redis pub/sub)和外部MQTT消息总线之间的桥梁**。

### Core Command as Message Bus Bridge

核心命令服务作为Edgex外部命令的入口点，通过消息总线请求实现对南向的访问。

![](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/command-msg.png)

第三方系统不应被授予访问 EdgeX 内部消息总线的权限。因此，为了通过消息总线（特别是 MQTT）实现通信，命令服务需要从第三方或外部 MQTT 主题接收消息，并将它们传递到 EdgeX 内部消息总线，以便最终将它们路由到设备服务，然后传递到设备/传感器（南端）。

反之，来自南边的响应消息也将通过内部 EdgeX 消息总线发送到命令服务，然后可以将其桥接到外部 MQTT 主题，并响应第三方系统请求者。

### Message Structure

由于大多数消息总线协议缺乏通用的消息头机制（如 HTTP），提供请求/响应元数据是通过为每个请求/响应定义一个 `MessageEnvelope` 对象来实现的。消息主题名称类似于 REST 请求中的 HTTP 路径和方法。也就是说，主题名称指定了任何命令请求的设备接收者，就像 HTTP 请求中的路径一样。

![](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/command-msg-structure.png)



### Message Envelope

```yaml
// 命令请求示例
{ "apiVersion" : "v3",
  "RequestId": "e6e8a2f4-eb14-4649-9e2b-175247911369",
  "CorrelationID": "14a42ea6-c394-41c3-8bcd-a29b9f5e6835",
  "ContentType": "application/json",
  "QueryParams": {
    "offset": "0",
    "limit": "10"
  }
}
```

```yaml
// 命令查询示例
{
  "ApiVersion":"v2",
  "RequestID":"e6e8a2f4-eb14-4649-9e2b-175247911369",
  "CorrelationID":"14a42ea6-c394-41c3-8bcd-a29b9f5e6835",
  "ErrorCode":0,
  "Payload":"...",
  "ContentType":"application/json"
}
```

格式化请求和响应的消息共享一个公共的基本结构。最外层的JSON对象代表消息信封，用于传达请求/相应的core data，包括ApiVersion、RequestID、CorrelationID等。

Payload字段包括base64编码的响应体。

`ErrorCode`字段提供错误指示。`ErrorCode`将表示为0、1（错误）。当存在错误（1），playload包含一个消息字符串，指示有关错误的更多信息。当没有错误时，将没有内容。

---

### Command Query（查询）

核心命令服务订阅了配置文件中定义的`QueryRequestTopic`，并将响应发布到`QueryResponseTopic`。在接受到请求后，核心命令服务将尝试从请求主题中解析`device-name`。第三方系统或应用程序必须发布命令查询请求消息，并订阅来自同一主题级别的响应。以下是核心命令默认使用的主题命名：

- 订阅查询请求主题：`edgex/commandquery/request/#`
- 发布查询响应主题：`edgex/commandquery/response`

请求主题中的最后一个主题级别必须是`all`或`<device-name>`

#### Query by Device Name

通过消息查询设备和兴命令的示例：按设备查询

1、向外部MQTT代理发送请求消息，主题为`edgex/commandquery/request/Random-Boolean-Device`

```yaml
{
  "apiVersion" : "v3",
  "ContentType": "application/json",
  "CorrelationID": "14a42ea6-c394-41c3-8bcd-a29b9f5e6835",
  "RequestId": "e6e8a2f4-eb14-4649-9e2b-175247911369"
}
```

2、从外部MQTT代理接受查询消息到主题`edgex/commandquery/response` 

```yaml
{
  "ReceivedTopic":"",
  "CorrelationID":"14a42ea6-c394-41c3-8bcd-a29b9f5e6835",
  "ApiVersion":"v2",
  "RequestID":"e6e8a2f4-eb14-4649-9e2b-175247911369",
  "ErrorCode":0,
  "Payload":"eyJhcGlWZXJzaW9uIjoidjIiLCJyZXF1ZXN0SWQiOiJlNmU4YTJmNC1lYjE0LTQ2NDktOWUyYi0xNzUyNDc5MTEzNjkiLCJzdGF0dXNDb2RlIjoyMDAsImRldmljZUNvcmVDb21tYW5kIjp7ImRldmljZU5hbWUiOiJSYW5kb20tQm9vbGVhbi1EZXZpY2UiLCJwcm9maWxlTmFtZSI6IlJhbmRvbS1Cb29sZWFuLURldmljZSIsImNvcmVDb21tYW5kcyI6W3sibmFtZSI6IldyaXRlQm9vbFZhbHVlIiwic2V0Ijp0cnVlLCJwYXRoIjoiL2FwaS92Mi9kZXZpY2UvbmFtZS9SYW5kb20tQm9vbGVhbi1EZXZpY2UvV3JpdGVCb29sVmFsdWUiLCJ1cmwiOiJodHRwOi8vZWRnZXgtY29yZS1jb21tYW5kOjU5ODgyIiwicGFyYW1ldGVycyI6W3sicmVzb3VyY2VOYW1lIjoiQm9vbCIsInZhbHVlVHlwZSI6IkJvb2wifSx7InJlc291cmNlTmFtZSI6IkVuYWJsZVJhbmRvbWl6YXRpb25fQm9vbCIsInZhbHVlVHlwZSI6IkJvb2wifV19LHsibmFtZSI6IldyaXRlQm9vbEFycmF5VmFsdWUiLCJzZXQiOnRydWUsInBhdGgiOiIvYXBpL3YyL2RldmljZS9uYW1lL1JhbmRvbS1Cb29sZWFuLURldmljZS9Xcml0ZUJvb2xBcnJheVZhbHVlIiwidXJsIjoiaHR0cDovL2VkZ2V4LWNvcmUtY29tbWFuZDo1OTg4MiIsInBhcmFtZXRlcnMiOlt7InJlc291cmNlTmFtZSI6IkJvb2xBcnJheSIsInZhbHVlVHlwZSI6IkJvb2xBcnJheSJ9LHsicmVzb3VyY2VOYW1lIjoiRW5hYmxlUmFuZG9taXphdGlvbl9Cb29sQXJyYXkiLCJ2YWx1ZVR5cGUiOiJCb29sIn1dfSx7Im5hbWUiOiJCb29sIiwiZ2V0Ijp0cnVlLCJzZXQiOnRydWUsInBhdGgiOiIvYXBpL3YyL2RldmljZS9uYW1lL1JhbmRvbS1Cb29sZWFuLURldmljZS9Cb29sIiwidXJsIjoiaHR0cDovL2VkZ2V4LWNvcmUtY29tbWFuZDo1OTg4MiIsInBhcmFtZXRlcnMiOlt7InJlc291cmNlTmFtZSI6IkJvb2wiLCJ2YWx1ZVR5cGUiOiJCb29sIn1dfSx7Im5hbWUiOiJCb29sQXJyYXkiLCJnZXQiOnRydWUsInNldCI6dHJ1ZSwicGF0aCI6Ii9hcGkvdjIvZGV2aWNlL25hbWUvUmFuZG9tLUJvb2xlYW4tRGV2aWNlL0Jvb2xBcnJheSIsInVybCI6Imh0dHA6Ly9lZGdleC1jb3JlLWNvbW1hbmQ6NTk4ODIiLCJwYXJhbWV0ZXJzIjpbeyJyZXNvdXJjZU5hbWUiOiJCb29sQXJyYXkiLCJ2YWx1ZVR5cGUiOiJCb29sQXJyYXkifV19XX19",
  "ContentType":"application/json",
  "QueryParams":{}
}
```

Base64 解码playload：

```yaml
{
  "apiVersion":"v2",
  "requestId":"e6e8a2f4-eb14-4649-9e2b-175247911369",
  "statusCode":200,
  "deviceCoreCommand":{
    "deviceName":"Random-Boolean-Device",
    "profileName":"Random-Boolean-Device",
    "coreCommands":[
      {
        "name":"WriteBoolValue",
        "set":true,
        "path":"/api/v3/device/name/Random-Boolean-Device/WriteBoolValue",
        "url":"http://edgex-core-command:59882",
        "parameters":[
          {"resourceName":"Bool", "valueType":"Bool"},
          {"resourceName":"EnableRandomization_Bool","valueType":"Bool"}
        ]
      },
      {
        "name":"WriteBoolArrayValue",
        "set":true,
        "path":"/api/v3/device/name/Random-Boolean-Device/WriteBoolArrayValue",
        "url":"http://edgex-core-command:59882",
        "parameters":[
          {"resourceName":"BoolArray","valueType":"BoolArray"},
          {"resourceName":"EnableRandomization_BoolArray","valueType":"Bool"}
        ]
      },
      {
        "name":"Bool",
        "get":true,
        "set":true,
        "path":"/api/v3/device/name/Random-Boolean-Device/Bool",
        "url":"http://edgex-core-command:59882",
        "parameters":[
          {"resourceName":"Bool","valueType":"Bool"}
        ]
      },
      {
        "name":"BoolArray",
        "get":true,
        "set":true,
        "path":"/api/v3/device/name/Random-Boolean-Device/BoolArray",
        "url":"http://edgex-core-command:59882",
        "parameters":[
          {"resourceName":"BoolArray","valueType":"BoolArray"}
        ]
      }
    ]
  }
}
```

#### Query All

通过messaging请求所有设备的示例

1. 发送请求message到外部MQTT代理的`edgex/commandquery/request/all`

```yml
{
"apiVersion" : "v3",
"ContentType" : "application/json",
  "CorrelationID": "14a42ea6-c394-41c3-8bcd-a29b9f5e6835",
  "RequestId": "e6e8a2f4-eb14-4649-9e2b-175247911369",
  "QueryParams": {
    "offset": "0",
    "limit": "5"
  }
}
```

2. 从MQTT代理的`edgex/commandquery/reponse`接受请求应答message

```yaml
{
  "ApiVersion":"v2",
  "ContentType":"application/json",
  "CorrelationID":"14a42ea6-c394-41c3-8bcd-a29b9f5e6835",
  "RequestID":"e6e8a2f4-eb14-4649-9e2b-175247911369",
  "ErrorCode":0,
  "Payload":"..."
}
```

### Command Request（请求）

核心命令服务订阅了从configuration.yml红定义的`CommandRequestTopic`。在接受请求后，核心命令服务将尝试从请求主题级别中解析`<device-name>``<command-name>`和`<method>`，并将这些内容添加到配置文件中定义的`CommandResponseTopicPrefix`后发送响应。第三方系统或应用程序必须发布命令请求消息并订阅来自同一主题的响应。以下是和兴命令默认使用的主题命名：

- 订阅命令请求主题：`edegx/command/request/#`
- 发布命令响应主题：`egdex/command/response/<device-name>/<command-name>/<method>`

请求主题的最后一个级别必须是`get`or`set`

### Get Command

通过消息发送get命令请求的示例：

1. 发送命令请求消息到主题`edgex/command/request/Random-Boolean-Device/get`的外部MQTT代理

   ```yaml
   {
     "apiVersion" : "v3",
     "ContentType": "application/json",
     "CorrelationID": "14a42ea6-c394-41c3-8bcd-a29b9f5e6835",
     "RequestId": "e6e8a2f4-eb14-4649-9e2b-175247911369",
     "QueryParams": {
       "ds-pushevent": "false",
       "ds-returnevent": "true"
     }
   }
   ```

2. 从外部MQTT代理接受命令响应消息，主题为`edgex/command/response/#`

   ```yaml
   {
     "ReceivedTopic":"edgex/command/response/Random-Boolean-Device/Bool/get",
     "CorrelationID":"14a42ea6-c394-41c3-8bcd-a29b9f5e6835",
     "ApiVersion":"v2",
     "RequestID":"e6e8a2f4-eb14-4649-9e2b-175247911369",
     "ErrorCode":0,
     "Payload":"eyJhcGlWZXJzaW9uIjoidjIiLCJyZXF1ZXN0SWQiOiJlNmU4YTJmNC1lYjE0LTQ2NDktOWUyYi0xNzUyNDc5MTEzNjkiLCJzdGF0dXNDb2RlIjoyMDAsImV2ZW50Ijp7ImFwaVZlcnNpb24iOiJ2MiIsImlkIjoiM2JiMDBlODYtMTZkZi00NTk1LWIwMWEtMWFhNTM2ZTVjMTM5IiwiZGV2aWNlTmFtZSI6IlJhbmRvbS1Cb29sZWFuLURldmljZSIsInByb2ZpbGVOYW1lIjoiUmFuZG9tLUJvb2xlYW4tRGV2aWNlIiwic291cmNlTmFtZSI6IkJvb2wiLCJvcmlnaW4iOjE2NjY1OTE2OTk4NjEwNzcwNzYsInJlYWRpbmdzIjpbeyJpZCI6IjFhMmM5NTNkLWJmODctNDhkZi05M2U3LTVhOGUwOWRlNDIwYiIsIm9yaWdpbiI6MTY2NjU5MTY5OTg2MTA3NzA3NiwiZGV2aWNlTmFtZSI6IlJhbmRvbS1Cb29sZWFuLURldmljZSIsInJlc291cmNlTmFtZSI6IkJvb2wiLCJwcm9maWxlTmFtZSI6IlJhbmRvbS1Cb29sZWFuLURldmljZSIsInZhbHVlVHlwZSI6IkJvb2wiLCJ2YWx1ZSI6ImZhbHNlIn1dfX0=",
     "ContentType":"application/json",
     "QueryParams":{}
   }
   ```

   Base64解码playload

   ```yaml
   {
     "apiVersion":"v2",
     "requestId":"e6e8a2f4-eb14-4649-9e2b-175247911369",
     "statusCode":200,
     "event":{
       "apiVersion":"v2",
       "id":"3bb00e86-16df-4595-b01a-1aa536e5c139",
       "deviceName":"Random-Boolean-Device",
       "profileName":"Random-Boolean-Device",
       "sourceName":"Bool",
       "origin":1666591699861077076,
       "readings":[
         {
           "id":"1a2c953d-bf87-48df-93e7-5a8e09de420b",
           "origin":1666591699861077076,
           "deviceName":"Random-Boolean-Device",
           "resourceName":"Bool",
           "profileName":"Random-Boolean-Device",
           "valueType":"Bool",
           "value":"false"
         }
       ]
     }
   }
   ```

   #### Set Command

   通过消息发送put请求示例：

   1. 发送命令请求到主题`edgex/command/request/Random-Boolean-Device/WriteBoolValue/set` 的外部MQTT代理

      ```yaml
      {
        "apiVersion" : "v3",
        "ContentType": "application/json",
        "CorrelationID": "14a42ea6-c394-41c3-8bcd-a29b9f5e6835",
        "RequestId": "e6e8a2f4-eb14-4649-9e2b-175247911369",
        "Payload": "eyJCb29sIjogImZhbHNlIn0="
      }
      ```

   > [!Note]
   >
   > 有些情况下，Core Command服务无法正确发布响应，例如：
   >
   > - 配置文件中未指定响应主题
   > - 请求`MessageEnvelope` Json解析失败
   > - 解析`<device-name>`、`<command-name>`或`<method>`失败

### Configuring for secure MQTT connection

在实际应用中，用户通常需要提供凭证或证书来连接到外部MQTT代理。要将此类秘密种子到命令服务的Secret Store，您可以按照 [Seeding Service Secrets](https://docs.edgexfoundry.org/3.1/security/SeedingServiceSecrets/) 文档中的说明进行操作。

以下示例展示了如何设置命令服务以连接到外部MQTT代理并使用`usernamepasswd`认证。

> [!Tip]
>
> 示例 - 通过环境变量覆盖设置SecretFile和外部MQTTT
>
> ```yaml
> environment:
>     EXTERNALMQTT_ENABLED: "true"
>     EXTERNALLMQTT_URL: "<url>" # e.g. tcps://broker.hivemq.com:8883
>     EXTERNALMQTT_AUTHMODE: usernamepassword
>     SECRETSTORE_SECRETSFILE: "/tmp/core-command/secrets.json"
> ...
> volumes:
>     - /tmp/core-command/secrets.json:/tmp/core-command/secrets.json
> ```

> [!Tip]
>
> 示例 - secrets.json
>
> ```json
> {
>     "secrets": [
>         {
>             "secretName": "mqtt",
>             "imported": false,
>             "secretData": [
>                 {
>                     "key": "username",
>                     "value": "edgexuser"
>                 },
>                 {
>                     "key": "password",
>                     "value": "p@55w0rd"
>                 }
>             ]
>         }
>     ]
> }
> ```

> [!Note]
>
> 自Edgex3.0以来，`ExternalMQTT`部分`SecretPath`配置属性已经重命名为`SecretName`。然而，在源代码中它任然被称为`SecretPPath`，如果启用MQTT，将会导致命令服务崩溃。这是一个已知问题，将会在Edgex3.1中修复。在Edgex3.1之前，要解决这个问题，您需要通过Consul UI手动添加`SecretPath`到配置中，并重新启动命令服务以生效。

---

## Configuration

> 了解所有共有的配置设置，请参阅[Common Configuration documentation](https://docs.edgexfoundry.org/3.1/microservices/configuration/CommonConfiguration/)，以下仅列出针对核心命令的附加设置和特定部分。

> [!Note]
>
> 对于Edgex3.0，`MessageQueue.Internal`配置已经移动到通用配置中的`Message`，`MessageQueue.External`已经移动到下面的`ExternalMQTT`。

### Writable

| Property 属性     | Default Value 默认值 | Description 描述                                             |
| :---------------- | :------------------- | :----------------------------------------------------------- |
|                   |                      | 如果服务以 `-cp/--configProvider` 标志运行，则配置中可写部分的条目可以在服务运行时即时更改。 |
| LogLevel 日志级别 | INFO                 | 日志条目严重级别。不是默认级别或更高级别的日志条目将被忽略。 |

### Writable.InsecureSecrets 

| Property 属性 | Default Value 默认值 | Description 描述                                 |
| :------------ | :------------------- | :----------------------------------------------- |
| .mqtt         | ---                  | 在非安全模式下运行时连接到安全外部 MQTT 时的密钥 |

### Writable.Telemetry 

| Property 属性 | Default Value 默认值 | Description 描述                                       |
| :------------ | :------------------- | :----------------------------------------------------- |
|               |                      | 通用配置中的遥测配置，这是所有服务共有的配置           |
| Metrics 指标  | `<TBD>`              | 核心命令收集的服务指标。布尔值表示是否启用指标的报告   |
| Tags 标签     | `<empty>`            | 包含在每个报告的指标中的任意核心元数据服务级别标签列表 |

### Service 

| Property 属性       | Default Value 默认值      | Description 描述                               |
| :------------------ | :------------------------ | :--------------------------------------------- |
|                     |                           | 核心命令的独特设置。通用设置可在通用配置中找到 |
| Port 端口           | 59882                     | 微服务端口号                                   |
| StartupMsg 启动消息 | 这是 EdgeX 核心命令微服务 | 服务完成引导启动时记录的消息                   |

### Clients.core-metadata

| Property 属性 | Default Value 默认值 | Description 描述              |
| :------------ | :------------------- | :---------------------------- |
| Protocol 协议 | http                 | 构建服务端点 URI 时使用的协议 |
| Host 主机     | localhost 本地主机   | 服务所在的主机名或 IP 地址    |
| Port 端口     | 59881                | 目标服务暴露的端口            |

### MessageBus.Optional

| Property 属性      | Default Value 默认值       | Description 描述                               |
| :----------------- | :------------------------- | :--------------------------------------------- |
|                    |                            | 核心命令的独特设置。通用设置可在通用配置中找到 |
| ClientId 客户端 ID | "core-command core-command | 连接到 MQTT 或 NATS 基础消息总线时使用的 ID    |

### ExternalMqtt 

| Property 属性               | Default Value 默认值  | Description 描述                                             |
| :-------------------------- | :-------------------- | :----------------------------------------------------------- |
| Enabled 已启用              | false                 | 表示是否通过消息连接到外部 MQTT 代理进行命令                 |
| Url 网址                    | `tcp://localhost:1883 | 连接到 MQTT 代理的完全限定 URL                               |
| ClientId 客户端 ID          | `core-command`        | 连接到代理的客户端 ID                                        |
| ConnectTimeout 连接超时     | 5s 5 秒               | i.e "30s" 表示在超时之前等待的时间长度，例如“30 秒”          |
| AutoReconnect 自动重连      | true 是               | 表示是否在断开连接后重试连接                                 |
| KeepAlive                   | 10                    | 客户端无活跃数据传输时发送 ping 的间隔时间，必须大于 2 秒    |
| QOS                         | 0                     | 服务质量等级 0（最多一次）、1（至少一次）或 2（恰好一次）    |
| Retain 保留                 | true 是               | 保留 MQTT 连接设置                                           |
| SkipCertVerify 跳过证书验证 | false                 | 指示是否应跳过证书验证                                       |
| SecretName                  | `mqtt`                | 在密钥提供程序中检索您的密钥的路径名称。必须非空。           |
| AuthMode 认证模式           | `none`                | 指示连接到代理时使用的内容。必须是 "none"、"cacert"、"usernamepassword"、"clientcert" 之一。如果在 SecretPath 中存在 CA 证书，则除了 "none" 模式外，将使用该证书。 |

### ExternalMqtt.Topics

| Property 属性                               | Default Value 默认值           | Description 描述                                             |
| :------------------------------------------ | :----------------------------- | :----------------------------------------------------------- |
|                                             |                                | 键值映射允许发布和订阅外部消息总线                           |
| CommandRequestTopic 命令请求主题            | `edgex/command/request/#`      | 用于订阅第三方命令请求                                       |
| CommandResponseTopicPrefix 命令响应主题前缀 | `edgex/command/response`       | 用于将响应发布回第三方系统。将在发布主题前缀中添加“ `/<device-name>/<command-name>/<method>` ” |
| QueryRequestTopic 查询请求主题              | `edgex/commandquery/request/#` | 用于订阅第三方命令查询请求                                   |
| QueryResponseTopic 查询响应主题             | `edgex/commandquery/response`  | 用于将命令查询响应发布回第三方系统                           |

### V3 Configuration Migration Guide V3 配置迁移指南

- Removed `RequireMessageBus` 已移除 `RequireMessageBus`

- MessageQueue.External moved to ExternalMQTT
  消息队列外部移动到外部 MQTT

  查看通用配置参考以获取有关常见配置更改的完整详细信息。[Common Configuration Reference](https://docs.edgexfoundry.org/3.1/microservices/configuration/V3MigrationCommonConfig/)

---

## API Reference

> 核心命令微服务是  其他服务 通过其管理的 Device services 触发设备和传感器操作的通道。

## Source Code

https://github.com/edgexfoundry/edgex-go/tree/v3.1/cmd/core-command

## Regex Get Command

（正则表达式获取命令）

> 正则表达式获取命令在Edgex3.0中为新增功能

命令服务支持正则表达式语法用于命令名称过滤。正则表达式语法将与设备配置文件中的所有DeviceResources进行匹配。



```yaml
# 示例配置文件
apiVersion: "v2"
name: "Simple-Device"
deviceResources:
  -
    name: "Xrotation"
    isHidden: true
    description: "X axis rotation rate"
    properties:
        valueType: "Int32"
        readWrite: "RW"
        units: "rpm"
  -
    name: "Yrotation"
    isHidden: true
    description: "Y axis rotation rate"
    properties:
        valueType: "Int32"
        readWrite: "RW"
        "units": "rpm"
  -
    name: "Zrotation"
    isHidden: true
    description: "Z axis rotation rate"
    properties:
        valueType: "Int32"
        readWrite: "RW"
        "units": "rpm"
```

正则命令`.rotation`将返回Xrotation、Yrotation、Xrotation读取值的event

> 注意，Go的`regexp`包接受RE2语法包含字符如`.` `*` `+` ...etc，这些字符在执行前需要进行URL编码。

```yml
curl http://localhost:59882/api/v3/device/name/Simple-Device01/%2Erotation
==========>
{
  "apiVersion" : "v3",
  "statusCode": 200,
  "event": {
    "apiVersion" : "v3",
    "id": "821f9a5d-e521-4ea7-83f9-f6bce6881dce",
    "deviceName": "Simple-Device01",
    "profileName": "Simple-Device",
    "sourceName": ".rotation",
    "origin": 1679464105224933600,
    "readings": [
      {
        "id": "c008960a-c3cc-4cfc-b9f7-a1f1516168ea",
        "origin": 1679464105224933600,
        "deviceName": "Simple-Device01",
        "resourceName": "Xrotation",
        "profileName": "Simple-Device",
        "valueType": "Int32",
        "units": "rpm",
        "value": "0"
      },
      {
        "id": "7f38677a-aa1f-446b-9e28-4555814ea79d",
        "origin": 1679464105224933600,
        "deviceName": "Simple-Device01",
        "resourceName": "Yrotation",
        "profileName": "Simple-Device",
        "valueType": "Int32",
        "units": "rpm",
        "value": "0"
      },
      {
        "id": "ad72be23-1d0e-40a3-b4ec-2fa0fa5aba58",
        "origin": 1679464105224933600,
        "deviceName": "Simple-Device01",
        "resourceName": "Zrotation",
        "profileName": "Simple-Device",
        "valueType": "Int32",
        "units": "rpm",
        "value": "0"
      }
    ]
  }
}
```

---

## Redis Database

EdgeX Foundry的参考实现数据库（用于传感器数据、元数据和所有需要持久化到数据库中的内容）是Redis。

Redis是一个开源的内存数据结构存储，在EdgeX中用作数据库和消息代理。它支持字符串、散列表、列表、集合、有序集合（带范围查询）、位图、超日志、地理空间索引（带半径查询）和流等数据结构。Redis是持久的，并且仅使用持久性来恢复状态；Redis操作的唯一数据是在内存中的。

### Memory Utilization

内存利用率

Redis使用多种技术来优化内存利用率。Antirez和Redis Labs已经撰写了许多关于底层细节的文章（见下文列表），这些策略一直在不断发展。在考虑您的架构时，请考虑数据在边缘存活的时间以及消耗的内存（物理或物理+虚拟）

- http://antirez.com/news/92
- https://redislabs.com/blog/redis-ram-ramifications-part-i/
- https://redis.io/topics/memory-optimization
- http://antirez.com/news/128

### On-disk Persistence

磁盘持久化

Redis支持多种不同的磁盘持久化级别。默认情况下，数据快照每60s或100个key发生变化后就会进行持久化。除了增加快照频率意外，还支持追加文件，用于记录每次数据库的写入操作。有关如何平衡这些选项的相信讨论，请参阅https://redis.io/topics/persistence。

Redis支持设置内存使用限制以及当无法为写入操作分配内存时的策略。请参阅

https://raw.githubusercontent.com/antirez/redis/5.0/redis.conf中的内存管理部分以获取配置选项。由于Edgex和Redis目前没有在数据追逐上进行通信，您需要使用EdgeX调度器来控制内存使用，而不是Redis驱逐策略。

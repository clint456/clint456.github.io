---
title: edgex-device-layer
date: 2025-05-06 09:24:44
categories: [EdgeXFoundry]
tags: device-layer
---
# 设备服务

> [!Note]
>
> 此文章存在EdgeX3.1与EdgeX4.0的版本混杂问题



![image-20250320135437747](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250320135437747.png)



## Overview

[设备服务层官方文档](https://docs.edgexfoundry.org/4.0/microservices/device/DeviceService/)

设备服务层与设备服务进行交互。

设备服务是与设备交互的边缘连接器，这些设备包括但不限于：家用电器、报警系统、暖通空调设备、照明、任何行业的机器、灌溉系统、无人机、交通信号、自动化交通工具等等。

EdgeX 设备服务通过数百种协议和数千种格式，将来自设备的信息翻译并引入 EdgeX。换句话说，设备服务摄取由"物"提供的传感器数据。在摄取传感器数据时，设备服务将"物"产生和通信的数据转换为 EdgeX Foundry 的通用数据结构，并将转换后的数据发送到核心服务层，以及 EdgeX Foundry 其他层的其他微服务。

设备服务还接收并处理返回给设备的任何操作请求。设备服务从 EdgeX 接收一个通用命令来执行某种操作，并将其翻译成特定协议的请求，然后将该请求转发给目标设备。

设备服务是 EdgeX 与传感器/设备交互的主要方式。因此，除了获取传感器数据和操作设备外，设备服务还：

- 获取设备/传感器的状态更新

- 在将传感器数据发送到 EdgeX 之前进行数据转换

- 更改配置

- 发现设备
  设备服务可以同时服务一个或多个设备。

  

设备服务所管理的设备可能**不仅仅是一个简单的单一物理设备**。该设备可能是一个边缘/IoT 网关（及其所有设备）、设备管理器、传感器中心、通过 HTTP 提供的 Web 服务，或者作为一个设备或设备集合的软件传感器，对 EdgeX Foundry 而言。

![image-20250320135515718](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250320135515718.png)

设备服务通过每个设备对象原生的协议与设备通信。EdgeX 提供了一些设备服务，支持许多常见的 IoT 协议，如 Modbus、BACnet、BLE 等。当遇到新协议并需要 EdgeX 与新设备通信时，EdgeX 还通过设备服务软件开发工具包（SDK）提供了创建新设备服务的手段。

## 设备服务抽象

设备服务实际上是对设备及其相关固件、软件和协议栈的软件抽象。它允许 EdgeX 的其余部分（以及 EdgeX 的用户）通过抽象 API 与设备通信，从而从通信的角度看，所有设备都显得相同。在底层，设备服务的实现有一些共同元素，但也可能因底层设备、协议和相关软件的不同而有很大差异。

![image-20250320135541471](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250320135541471.png)

设备服务提供了 EdgeX 其余部分与物理设备之间的抽象。换句话说，设备服务"封装"了协议通信代码、设备驱动程序/固件和实际设备。

EdgeX 中的每个设备服务都是一个独立的微服务。设备服务通常使用设备服务 SDK 创建。SDK 实际上是一个库，提供所有设备服务所需的通用脚手架代码和便利方法。虽然不是必须的，但 EdgeX 社区使用 SDK 作为社区提供的所有设备服务的基础。SDK 使创建设备服务变得更简单，允许开发者专注于设备特定的通信、功能等，而不是编写大量 EdgeX 服务模板代码。使用 SDK 还有助于确保设备服务遵循设备服务所需的规则。

除非您需要创建新的设备服务或修改现有设备服务，否则您可能无需深入了解设备服务的工作原理。然而，对设备服务的功能及其实现方式有一些大致了解，有助于定制、设置配置和诊断问题。

## 发布到消息总线

设备服务现在能够直接将事件发布到 EdgeX 消息总线，而不是通过 REST 将事件 POST 到核心数据。这一功能由 `Device.UseMessageBus` 配置属性控制（见下文），默认设置为 true。核心数据默认配置为订阅 EdgeX 消息总线，以接收和持久化事件。应用程序服务，如 EdgeX 1.x 中那样，订阅 EdgeX 消息总线以接收和处理事件。

>  什么是REST？
>
>  REST（Representational State Transfer）是一种架构风格，广泛用于设计网络应用程序，尤其是在 Web 服务中。REST 基于一些原则和约束，旨在通过简单和标准的 HTTP 方法来实现客户端与服务器之间的通信。它并不是一种具体的协议，而是设计网络服务时的指导思想。
>
>  REST 的主要特点包括：
>
>  1. **无状态（Stateless）**：每个请求都应该包含所有必要的信息来完成请求，不依赖于服务器的状态。这意味着服务器不存储客户端的任何信息，每个请求都是独立的。
>  2. **客户端-服务器（Client-Server）**：客户端和服务器应该分开，客户端处理用户界面和用户体验，服务器处理数据存储和业务逻辑。二者通过网络通信。
>  3. **统一接口（Uniform Interface）**：REST 的核心原则之一，要求系统通过统一的接口与客户端进行交互，通常就是 HTTP 的标准方法，如 GET、POST、PUT 和 DELETE。
>  4. **可缓存（Cacheable）**：客户端可以缓存响应，从而减少不必要的请求，提高性能。
>  5. **分层系统（Layered System）**：客户端通常不能直接知道它正在与哪一层交互，可能是一个中间代理服务器，也可能是实际的应用服务器。
>  6. **按需代码（Code on Demand，可选）**：服务器可以临时传送可执行代码到客户端，客户端执行后可以扩展功能。
>
>  通过这些设计原则，RESTful API 提供了一种灵活、简单和可扩展的方式来构建 Web 服务。每个 REST API 通常通过 URL（Uniform Resource Locator）来定义资源，并通过 HTTP 方法（如 GET、POST、PUT、DELETE）来定义对这些资源的操作。

>  [!Note] 
>
>  EdgeX 4.0
>
>  在成功执行 PUT 命令后，只要资源不是只写，设备服务还将更新后的资源值的事件发布到 EdgeX 消息总线。



---

## 总结

设备服务层是 EdgeX Foundry 的核心组成部分，负责与各种物理设备交互，并充当设备与 EdgeX 系统之间的桥梁。设备服务通过支持多种协议（如 Modbus、BACnet 等）摄取传感器数据，将其转换为统一的 EdgeX 数据结构，并传输到核心服务层或其他微服务，同时处理设备的操作请求。设备服务不仅限于单一设备，还可以管理复杂的系统，如网关或传感器中心。

设备服务通过抽象层隐藏了底层协议和设备的复杂性，提供一致的 API 接口，便于 EdgeX 系统与其交互。开发者可通过设备服务 SDK 快速创建新的服务，而无需从头编写大量代码。设备服务还能发现设备、更新状态、转换数据并支持配置更改。

在 EdgeX 3.0 中，设备服务增强了与消息总线的集成，默认支持直接发布事件，提高了系统的灵活性和效率。总的来说，设备服务层是 EdgeX 连接和管理物联网设备的关键模块，具有高度的可扩展性和适应性。





# 设备服务- Getting Started

## 设备服务 - 功能

所有设备服务必须执行以下任务：

1. **注册到核心元数据**  
   通过向核心元数据注册，通知整个 EdgeX 系统其正在运行并准备好管理设备。对于已有的设备服务，它会更新其元数据注册并获取任何新的信息。

2. **从 EdgeX 配置服务获取配置设置**  
   从 EdgeX 的配置服务（或本地配置文件，如果未使用配置服务）中获取其配置设置。

3. **在 EdgeX 注册服务中注册自身**  
   将自身注册为运行中的 EdgeX 微服务（运行时），从而允许其他 EdgeX 服务与其通信。

4. **加载和管理物理设备**  
   加载并管理它知道如何通信的物理设备，这一过程称为设备的"配置"（provisioning）。在某些情况下，设备服务可能具备自动检测和配置设备的能力。例如，一个 Onvif 设备服务可能在其范围内自动执行摄像头发现，然后将该设备配置到 EdgeX 和相关的 Onvif 设备服务中。

5. **更新并通知 EdgeX 设备运行状态**  
   更新并告知 EdgeX 它所管理设备的运行状态（例如，设备是否仍在运行并能够通信）。

6. **监控配置更改并应用新配置**  
   监控配置更改并在适用的情况下应用新配置。注意，在某些情况下，配置更改无法动态应用（例如，更改设备服务的运行端口）。

7. **获取传感器数据并传递给 EdgeX**  
   获取传感器数据（即摄取传感器数据），并通过消息总线将这些数据传递给 EdgeX 的其余部分（核心数据、应用服务等）。

8. **接收并响应基于 REST 或消息总线的操作命令**  
   接收并对 REST 或消息总线发送的操作命令做出反应。

可以想象，许多任务（如向核心元数据注册）对所有设备服务来说是通用的，因此由 SDK 提供。而其他任务（如从底层设备获取传感器数据）则与底层设备协议高度相关。在这些情况下，设备服务 SDK 提供了执行工作的空函数，但开发者需要根据特定设备协议填充函数代码。

## 设备服务功能需求

[Requirements for the device service](https://docs.edgexfoundry.org/4.0/design/legacy-requirements/device-service/)设备服务的需求在本文档中提供。这些需求用于定义通过任何设备服务 SDK 提供哪些功能，以生成设备服务的脚手架代码。它们还可以帮助读者进一步理解设备服务的职责和角色。

---

## 总结

设备服务的功能是 EdgeX 系统与物理设备交互的基础，所有设备服务必须完成一系列核心任务，包括向核心元数据和注册服务注册、获取配置、管理设备、更新状态、监控配置变化、摄取传感器数据以及响应操作命令。这些任务确保设备服务能够无缝集成到 EdgeX 生态系统中，并与各种设备通信。

其中，通用任务（如注册）由 SDK 提供支持，而特定于设备协议的任务（如数据获取）需要开发者根据实际情况实现。设备服务的功能需求文档进一步明确了这些职责，为 SDK 的开发提供了指导，同时也帮助用户理解设备服务的作用。总体而言，设备服务是连接物理世界与 EdgeX 数字生态的关键环节，具有标准化与灵活性兼备的特点。



# 设备服务 - 远程部署非安全模式

在某些使用场景中，设备连接到的节点并未运行核心 EdgeX 服务。在这种情况下，适当的设备服务需要在能够连接到设备的远程节点上运行，并与运行其余 EdgeX 服务的宿主节点进行通信。

本页提供了一个在非安全模式下使用多个节点远程部署 `device-usb-camera` [device-usb-camera](https://docs.edgexfoundry.org/3.1/microservices/device/services/device-usb-camera/General/)服务的示例。部署可以通过原生运行服务或在 Docker 中运行来完成。

## 示例

此示例使用两个节点进行远程部署。一个节点（宿主节点）用于在 Docker 中运行所有 EdgeX 核心服务，另一个节点（远程节点）用于运行 `device-usb-camera` 服务，可以选择原生运行或在 Docker 中运行。两个节点在同一网络中。此示例可进一步扩展为在多个节点上运行多个 `device-usb-camera` 服务实例。

## 运行示例

1. **准备两个节点以进行远程部署**  
   请参考《USB 服务设置》 [USB Service Setup](https://docs.edgexfoundry.org/3.1/microservices/device/services/device-usb-camera/walkthrough/setup/)了解系统要求和依赖项，例如 Git、Docker、Docker Compose 等。如果要在远程节点上原生构建和运行 `device-usb-camera` 服务，还需安装 Golang。

2. **在宿主节点安装 EdgeX Compose**  
   在宿主节点上运行所有 EdgeX 核心服务[EdgeX compose](https://github.com/edgexfoundry/edgex-compose) 。为此，克隆 `edgex-compose` 仓库：

   ```
   git clone https://github.com/edgexfoundry/edgex-compose.git
   ```

   切换到所需版本：

   ```
   git checkout v3.1
   ```

   更新 `docker-compose-no-secty.yml` [docker-compose-no-secty.yml](https://github.com/edgexfoundry/edgex-compose/blob/v3.1/docker-compose-no-secty.yml) 文件，删除所有 EdgeX 核心服务的 `host_ip` 部分。例如：

   ```
   host_ip: 127.0.0.1
   ```

   删除上述示例行，`host_ip` 将在运行 USB 服务时提供。如有需要，可删除或注释掉非核心服务（如 `device-rest`、`device-virtual`、`app-rules-engine` 等）。  
   运行 EdgeX 核心服务：

   ```
   make run no-secty
   ```

   验证服务是否正常运行：

   ```
   docker ps
   ```

3. **运行 `device-usb-camera` 服务**  
   请按照以下指南在 Docker 或原生环境中运行 `device-usb-camera` 服务。

## Docker

在远程节点的任意位置创建 `docker-compose.yml` 文件，以在 Docker 中运行设备服务。将以下内容复制到文件中，并根据需要编辑适当的值：

```yaml
name: edgex
services:
  device-usb-camera:
    container_name: edgex-device-usb-camera
    device_cgroup_rules:
      - c 81:* rw
    environment:
      EDGEX_SECURITY_SECRET_STORE: "false"
      EDGEX_REMOTE_SERVICE_HOSTS: "<remote-node-ip-address>,<host-node-ip-address>,<service-bind-address>"
      # 示例：EDGEX_REMOTE_SERVICE_HOSTS: "172.118.1.92,172.118.1.167,0.0.0.0"
      DRIVER_RTSPSERVERHOSTNAME: "<remote-node-ip-address>"
      DRIVER_RTSPAUTHENTICATIONSERVER: "<service-bind-address>:8000"
        hostname: edgex-device-usb-camera
    image: <published docker image of device-usb-camera>
    ports:
      - "59983:59983"
      - "8554:8554"
    read_only: true
    restart: always
    security_opt:
      - no-new-privileges:true
    user: root:root
    volumes:
      - type: bind
        source: /dev
        target: /dev
        bind:
          create_host_path: true
      - type: bind
        source: /run/udev
        target: /run/udev
        read_only: true
        bind:
          create_host_path: true
```

**注意**  
如果需要运行多个服务实例，请在上述环境中添加 `EDGEX_INSTANCE_NAME` 环境变量，并设置所需实例数量的值。

运行 `docker-compose.yml`：

```
docker compose up -d
```

## 验证服务、设备及后续步骤

确保服务无错误，并检查服务是否已添加到 EdgeX（即宿主节点中运行的核心元数据）：

```
curl -s http://<host-node-ip-address>:59881/api/v3/deviceservice/name/device-usb-camera | jq .
```

成功返回示例：

```json
{
  "apiVersion": "v3",
  "statusCode": 200,
  "service": {
    "created": 1658769423192,
    "modified": 1658872893286,
    "id": "04470def-7b5b-4362-9958-bc5ff9f54f1e",
    "name": "device-usb-camera",
    "baseAddress": "http://edgex-device-usb-camera:59983",
    "adminState": "UNLOCKED"
  }
}
```

失败返回示例：

```json
{
  "apiVersion": "v3",
  "message": "fail to query device service by name device-usb-camera",
  "statusCode": 404
}
```

验证设备是否成功添加：

```
curl -s http://<host-node-ip-address>:59881/api/v3/device/all | jq -r '"deviceName: " + '.devices[].name''
```

示例输出：

```
deviceName: NexiGo_N930AF_FHD_Webcam_NexiG-20201217010
```

参考《RTSP 流凭证》为 RTSP 流添加凭证，确保将 `localhost` 替换为主节点 IP 地址。

**注意**  
用于 RTSP [RTSP Stream Credentials](https://docs.edgexfoundry.org/3.1/microservices/device/services/device-usb-camera/walkthrough/deployment/#add-credentials-for-the-rtsp-stream) 流的远程节点应至少安装 FFMPEG 5.0 版本。

按照《USB 服务 API 指南[USB Service API Guide](https://docs.edgexfoundry.org/3.1/microservices/device/services/device-usb-camera/walkthrough/general-usage/)》执行流式传输等 API，确保将 `localhost` 替换为适用的宿主或远程节点 IP 地址。

---

## 总结

设备服务远程部署（非安全模式）适用于设备连接到未运行核心 EdgeX 服务的节点的情况。示例以 `device-usb-camera` 服务在两个节点上的部署为例：宿主节点运行核心服务，远程节点运行设备服务（支持 Docker 或原生运行）。部署需确保两节点在同一网络，并完成依赖安装（如 Docker、Golang 等）。

部署步骤包括：在宿主节点配置并运行 EdgeX 核心服务，在远程节点运行设备服务（通过 Docker Compose 配置 IP 和端口映射）。验证过程通过 API 检查服务和设备是否正确注册到核心元数据。此方法支持扩展到多实例部署，适用于需要分散式设备管理的场景。关键点在于正确配置网络地址和依赖环境，确保服务间通信顺畅。



# 设备服务 - 远程安全模式部署

Coming Soon.



# 设备服务 - 配置

请参考通用的《通用配置文档》，了解所有服务共用的配置属性。

> [!Note] 
>
> EdgeX 4.0
>
> - `UpdateLastConnected` 在 EdgeX 4.0 中已移除。
> - 在 EdgeX 4.0 中，`MessageQueue` 配置已移至《通用配置》中的 `MessageBus`。

> [!Note]
>
> EdgeX 4.0
>
> - EdgeX 4.0 新增了对文件 URI 的支持，允许通过 URI 从远程位置获取私有配置文件，而非本地文件系统。详情见《配置文件命令行》部分。

> [!Note]
>
> 以下配置部分名称旁带有 * 的，表示这些部分来自设备服务的通用配置，因此不在各个设备服务的私有配置文件中。

---

## Writable（可写配置）

| 属性         | 默认值 | 描述                                                         |
| ------------ | ------ | ------------------------------------------------------------ |
| **LogLevel** | INFO   | 日志输出严重级别。低于默认级别或更高等级的日志条目将被忽略。 |

## Writable.Reading*

| 属性             | 默认值 | 描述                                                         |
| ---------------- | ------ | ------------------------------------------------------------ |
| **ReadingUnits** | true   | 是否在 Reading 中显示值的计量单位，设置为 false 则不包含单位。 |

## Writable.Telemetry*  

| 属性           | 默认值 | 描述                                                         |
| -------------- | ------ | ------------------------------------------------------------ |
| **Metrics**    |        | 服务收集的服务指标。布尔值指示是否启用该指标的报告。包括通用和自定义指标。 |
| EventsSent     | false  | 启用/禁用内置 EventsSent 指标的报告。                        |
| ReadingsSent   | false  | 启用/禁用内置 ReadingsSent 指标的报告。                      |
| LastConnected  | false  | 启用/禁用内置 LastConnected 指标的报告。                     |
| <CustomMetric> | false  | 启用/禁用自定义设备服务自定义指标的报告。详情见《自定义设备服务指标》。 |
| **Tags**       | <空>   | 包含在每个报告指标中的任意服务级别标签列表。                 |

---

## Clients.core-metadata*

| 属性     | 默认值    | 描述                          |
| -------- | --------- | ----------------------------- |
| Protocol | http      | 构建服务端点 URI 时使用的协议 |
| Host     | localhost | 托管服务的域名或 IP 地址      |
| Port     | 59881     | 目标服务暴露的端口            |

---

## Device*

| 属性                     | 默认值           | 描述                                                         |
| ------------------------ | ---------------- | ------------------------------------------------------------ |
| **DataTransform**        | true             | 控制是否对数值读数应用转换                                   |
| **MaxCmdOps**            | 128              | 设备命令中的最大资源数（即事件中的读数）                     |
| **MaxCmdResultLen**      | 256              | 命令结果的最大 JSON 字符串长度                               |
| **ProfilesDir**          | './res/profiles' | 如果设置，则为包含要上传至核心元数据的配置文件目录或索引 URI。详情见《设备服务文件的 URI》[URI for Device Service Files](https://docs.edgexfoundry.org/4.0/microservices/device/Configuration/#uris-for-device-service-files) |
| **DevicesDir**           | './res/devices'  | 如果设置，则为包含要上传至核心元数据的设备定义文件目录或索引 URI。详情见《设备服务文件的 URI》 |
| **ProvisionWatchersDir** | ''               | 如果设置，则为包含要上传至核心元数据的预配置观察者定义文件目录或索引 URI（特定服务时需要）。详情见《设备服务文件的 URI》 |
| **EnableAsyncReadings**  | true             | 启用/禁用设备服务处理异步读数的能力                          |
| **AsyncBufferSize**      | 16               | 异步读数的缓冲区大小                                         |
| **Discovery/Enabled**    | false            | 控制是否启用设备发现                                         |
| **Discovery/Interval**   | 30s              | 自动发现运行之间的间隔时间，0 表示不自动运行发现             |

---

## MaxEventSize*

| 属性             | 默认值 | 描述                                                         |
| ---------------- | ------ | ------------------------------------------------------------ |
| **MaxEventSize** | 0      | 发送到核心数据 最大事件大小（单位：千字节）。0 表示默认使用系统最大值。 |

---

## 设备服务文件的 URI（EdgeX 4.0）

> [!Note]
>
> EdgeX 4.0 支持通过 URI 加载设备定义、设备配置文件和预配置观察者。

从 URI 加载设备定义、设备配置文件和预配置观察者时，目录字段（例如 `DevicesDir`、`ProfilesDir`、`ProvisionWatchersDir`）加载的是索引文件而非文件夹名称。索引文件内容指定要通过 URI 加载的单个文件，方法是将文件名附加到 URI 上，如下例所示。原始 URI 中指定的任何认证将用于后续 URI。详情见《文件 URI》部分。

**示例：从服务配置中的 URI 加载设备目录**

```
...
ProfilesDir = "./res/profiles"
DevicesDir = "http://example.com/devices/index.json"
ProvisionWatchersDir = "./res/provisionwatchers"
...
```

**设备定义 URI 示例**  
对于设备定义，索引文件包含指向包含一个或多个设备的文件列表。  
示例设备索引文件：`http://example.com/devices/index.json`

```json
[
    "device1.yaml", "device2.yaml"
]
```

生成的 URI：

- `http://example.com/devices/device1.yaml`
- `http://example.com/devices/device2.yaml`

**设备配置文件和预配置观察者 URI 示例**  
对于设备配置文件和预配置观察者，索引文件包含键值对字典，将配置文件或观察者名称映射到其文件。只有当尚未加载该名称的设备配置文件或观察者时，才会从 URI 加载资源。  
示例设备配置文件索引文件：`http://example.com/profiles/index.json`

{
    "Simple-Device": "Simple-Driver.yaml",
    "Simple-Device2": "Simple-Driver2.yml"
}

生成的 URI：

- `http://example.com/profiles/Simple-Driver.yaml`
- `http://example.com/profiles/Simple-Driver2.yml`

---

## 	设备服务自定义配置

设备服务可以通过以下两种方式拥有自定义配置：

1. **Driver**  

   - 用于简单自定义设置的 `Driver` 部分，通过 SDK 的 `DriverConfigs()` API 访问。返回包含 `configuration.yaml` 文件中 `Driver` 部分的 `map[string]string`。

   - 示例：

     ```
     Driver:
       MySetting: "My Value"
     ```

2. **自定义结构化配置**  

   For Go Device Services see [Go Custom Structured Configuration](https://docs.edgexfoundry.org/4.0/microservices/device/sdk/details/CustomConfiguration/#go-device-service-sdk---custom-structured-configuration) for more details.（文章后有）

   For C Device Service see [C Custom Structured Configuration](https://docs.edgexfoundry.org/4.0/microservices/device/sdk/details/CustomConfiguration/#c-device-service-sdk---custom-structured-configuration) for more details.


---

## 密钥（Secrets）

### 配置（EdgeX 4.0）

- 在 EdgeX 4.0 中，`SecretStore` 配置已从每个服务的配置文件中移除。它具有默认值，**可通过环境变量覆盖**。详情见《SecretStore 覆盖》部分。
- 在安全模式下运行的所有设备服务实例都需要由安全服务为其创建 `SecretStore`。详情见[Configuring Add-on Service（配置附加服务）](https://docs.edgexfoundry.org/4.0/security/Ch-Configuring-Add-On-Services/)以了解如何为设备服务配置 `SecretStore`。随着 Redis Pub/Sub 成为默认 EdgeX 消息总线，所有设备服务都需要在其 `SecretStore` 中添加 `redisdb` 已知秘密，以便连接到安全的 EdgeX 消息总线。详情见《安全消息总线文档》。

每个设备服务还具有详细配置，以启用与其专用 `SecretStore`  的 **RESTful API** 连接，详细参考[《Secret API Reference》](https://docs.edgexfoundry.org/4.0/api/devices/Ch-APIDeviceSDK/#swagger)。

### 储密钥

- **安全模式**  
  在安全模式下运行设备服务时，可通过向设备服务的 `/api/v3/secret` API 路由发送 HTTP POST 请求将秘密存储到 `SecretStore` 中。POST 的秘密数据存储到服务的 `secureSecretStore` 中。一旦秘密存储，只有添加该秘密的服务能够检索它。详情和示例见《[Secret API Reference](https://docs.edgexfoundry.org/4.0/microservices/device/sdk/details/Secrets/)》。

- **非安全模式**  
  在非安全模式下，秘密存储并从服务的 `configuration.yaml` 文件的 `Writable.InsecureSecrets` 部分检索。非安全秘密及其路径可按以下方式配置：  
  示例：

  ```yaml
  Writable:
    InsecureSecrets:
      DB:
        SecretName: "redisdb"
        SecretData:
          username: ""
          password: ""
      MQTT:
        SecretName: "credentials"
        SecretData:
          username: "mqtt-user"
          password: "mqtt-password"
  ```

### 检索密钥


Go设备提供`SecretProvider.GetSecret()`API来检索设备服务密钥，详见[Device MQTT Service](https://github.com/edgexfoundry/device-mqtt-go/blob/v3.1/internal/driver/config.go#L118)使用该方法提供的例子。

请注意，该代码实现了一个重试循环，允许一定时间的等待密钥由`/secret `端点推送给`SecretStore`，更多详细参考[Storing Secrets](https://docs.edgexfoundry.org/4.0/microservices/device/sdk/details/Secrets/#storing-secrets)。

---

## 总结

设备服务的配置涵盖了通用配置（如日志级别、遥测）和特定配置（如设备通信、发现、文件 URI）。EdgeX 4.0 和 4.0 引入了变更，如移除 `UpdateLastConnected`、迁移 `MessageQueue` 至 `MessageBus`，以及新增 URI 支持以从远程加载配置文件和设备定义。这些增强了配置的灵活性。

主要配置项包括：

- **Writable**：动态调整日志级别、读数单位和遥测指标。
- **Device**：控制数据转换、命令限制、异步读数及设备发现。
- **URI 支持（4.0）**：通过 URI 加载设备、配置文件和观察者，简化远程管理。
- **Secrets**：支持安全和非安全模式下的秘密存储与检索，适配不同安全需求。

自定义配置通过 `Driver` 或结构化方式实现，满足特定设备需求。总体而言，设备服务配置设计兼顾通用性和可扩展性，便于与 EdgeX 生态集成。





# [APIReference](https://docs.edgexfoundry.org/4.0/microservices/device/ApiReference/)

这是一个REST API，由Device Serive SDK提供，并被所有的设备继承。

点击链接即可。



# 其他细节配置

## Device Profiles 

### OverView

设备配置文件描述了 EdgeX 系统中某种类型的设备。每个由设备服务管理的设备都与一个设备配置文件相关联，该配置文件根据设备支持的操作定义了该设备类型。

通常，设备配置文件由设备服务从文件中加载，并**在首次启动时推送至核心元数据进行存储**。**一旦存储在核心元数据中，后续启动时将从核心元数据加载设备配置文件**。

> [!Note]
>
> **警告** 
> 在设备服务启动后编辑本地设备配置文件不会影响实际使用的设备配置文件。必须先从核心元数据中删除旧版本，然后重启设备服务以将新版本推送至核心元数据。
>
> 设备配置文件还可以通过核心元数据的《设备配置文件 REST API —— [REST API](https://docs.edgexfoundry.org/4.0/microservices/core/metadata/ApiReference/)》手动添加、更新或删除。



---

### 设备配置文件

设备配置文件包含以下字段：

| 字段名          | 类型                | 是否必需 | 描述                           |
| --------------- | ------------------- | -------- | ------------------------------ |
| name            | String              | 是       | 在 EdgeX 部署中必须唯一        |
| description     | String              | 否       | 设备配置文件的描述             |
| manufacturer    | String              | 否       | 设备制造商                     |
| model           | String              | 否       | 设备型号                       |
| labels          | String 数组         | 否       | 用于查询设备配置文件的自由标签 |
| deviceResources | DeviceResource 数组 | 是       | 见下文《设备资源》             |
| deviceCommands  | DeviceCommand 数组  | 否       | 见下文《设备命令》             |

---

### 设备资源（Device Resources）

设备资源指定设备内的一个传感器值，可以单独读取或写入，或者作为设备命令的一部分。它具有用于识别的名称和用于信息描述的说明。

设备资源包含以下字段：

| 字段名      | 类型                 | 是否必需 | 备注                                   |
| ----------- | -------------------- | -------- | -------------------------------------- |
| name        | String               | 是       | 在 EdgeX 部署中必须唯一                |
| description | String               | 否       | 设备资源的描述                         |
| isHidden    | Bool                 | 否       | 是否通过命令服务隐藏该资源，默认 false |
| tags        | String-Interface Map | 否       | 用户定义的标签集合                     |
| attributes  | String-Interface Map | 否       | 见下文《资源属性》                     |
| properties  | ResourceProperties   | 是       | 见下文《资源属性》                     |

### 设备特定属性（Resource Attributes）

设备资源中的属性是设备服务特定的参数，用于访问设备上的特定值。每个设备服务实现都有自己的一组必需的命名值，例如 BACnet 设备服务可能需要对象标识符和属性标识符，而蓝牙设备服务可能使用 UUID 来标识值。

**示例：ONVIF 相机设备的资源属性**

```yaml
attributes:
  service: "Device"
  getFunction: "GetDNS"
  setFunction: "SetDNS"
```

### 设备性能参数（Resource Properties）

资源属性描述了值及其可选的简单处理过程。

资源属性包含以下字段：

| 字段名       | 类型           | 是否必需 | 备注                                                         |
| ------------ | -------------- | -------- | ------------------------------------------------------------ |
| valueType    | Enum           | 是       | 值的类型，支持：Uint8, Uint16, Uint32, Uint64, Int8, Int16, Int32, Int64, Float32, Float64, Bool, String, Binary, Object, 以及各类数组类型 |
| readWrite    | Enum           | 是       | 值是否可读、可写或两者皆可：R（只读）、W（只写）、RW（读写） |
| units        | String         | 否       | 开发者定义的值单位，如秒、分等                               |
| minimum      | Float64        | 否       | 资源值可设置的最小值，超出范围的 SET 命令将报错              |
| maximum      | Float64        | 否       | 资源值可设置的最大值，超出范围的 SET 命令将报错              |
| defaultValue | String         | 否       | 当 SET 命令无值时使用的默认值，应与 valueType 兼容           |
| mask         | Uint64         | 否       | 对整数读数应用的二进制掩码，仅对无符号整数类型有效           |
| shift        | Int64          | 否       | 整数读数右移的位数，仅对无符号整数类型有效                   |
| scale        | Float64        | 否       | 返回前乘以读数的因子，仅对整数或浮点类型有效                 |
| offset       | Float64        | 否       | 返回前加到读数的值，仅对整数或浮点类型有效                   |
| base         | Float64        | 否       | 返回前将原始读数作为指数幂的值，仅对整数或浮点类型有效       |
| assertion    | String         | 否       | 处理后的读数与之比较的字符串值，不一致时设备状态置为禁用，用于健康检查 |
| mediaType    | String         | 否       | 二进制值的内容类型，valueType 为 Binary 时必需               |
| optional     | String-Any Map | 否       | 开发者使用的可选映射                                         |

> [!Note]
>
> **注意**  
> `base`、`scale`、`offset`、`mask` 和 `shift` 定义的处理按此顺序应用，由 SDK 执行。SET 操作的输入数据会由 SDK 应用逆向转换（注意：SET 操作的mask转换尚未实现）。



---

### 设备命令（Device Commands）

设备命令定义了对多个资源的同步访问。每个命名的设备命令一般包含多个对设备资源的操作。仅包含单一资源操作的设备命令与 SDK 为同一设备资源创建的隐式命令相比无额外价值。

设备命令在读数逻辑相关时特别有用，例如三轴加速度计需要同时读取所有轴。

设备命令包含以下字段：

| 字段名             | 类型                   | 是否必需 | 备注                                                       |
| ------------------ | ---------------------- | -------- | ---------------------------------------------------------- |
| name               | String                 | 是       | 在此配置文件中必须唯一                                     |
| isHidden           | Bool                   | 否       | 是否通过命令服务隐藏该命令，默认 false                     |
| readWrite          | Enum                   | 是       | 命令是否可读、可写或两者皆可：R、W、RW，须与包含的资源一致 |
| resourceOperations | ResourceOperation 数组 | 是       | 见下文《资源操作》                                         |

### 资源操作（Resource Operation）

资源操作包含以下字段：

| 字段名         | 类型              | 是否必需 | 备注                                     |
| -------------- | ----------------- | -------- | ---------------------------------------- |
| deviceResource | String            | 是       | 必须命名此配置文件中的一个设备资源       |
| defaultValue   | String            | 否       | 若存在，应与命名的设备资源的类型字段兼容 |
| mappings       | String-String Map | 否       | 将 GET 资源操作值映射到另一字符串值      |

---

### REST 命令端点

服务会为设备配置文件中指定的每个设备资源和设备命令隐式创建命令端点。详情见《[Device Service API Reference](https://docs.edgexfoundry.org/4.0/microservices/device/ApiReference/) 》中的GET and SET Device Command APIs。

---

### 示例设备配置文件

- **简单示例**：Go 设备 SDK 的《 [Simple Driver profile](https://github.com/edgexfoundry/device-sdk-go/blob/v3.1/example/cmd/device-simple/res/profiles/Simple-Driver.yaml)》是一个很好的起点。
- **Modbus 示例**：Modbus 设备配置文件展示了如何使用属性定义访问设备上的资源值。

---

### 总结

设备配置文件是 EdgeX 中定义设备类型的核心组件，与设备服务管理的每个设备关联，描述其支持的操作。配置文件通常由设备服务加载并存储至核心元数据，后续从元数据加载。修改需先删除旧版本并重启服务，或通过 REST API 手动管理。

配置文件包括基本信息（名称、描述等）、设备资源（定义传感器值及其属性和处理规则）和设备命令（支持多资源同步访问）。资源属性因设备服务而异（如 BACnet 的对象标识符），而资源处理支持数值转换（如掩码、缩放）。设备命令适用于相关读数场景，提供更高灵活性。

配置文件通过隐式 REST 端点与服务交互，示例如简单驱动和 Modbus 配置文件展示了实际应用。整体设计兼顾标准化与定制化，适用于多样化的物联网设备管理。

## Device Commands

### 概念



![image-20250321143053170](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250321143053170.png)

Device commands用于指示设备执行操作。如果我们想知道当前设备湿度，可以向核心命令控制服务(core command)发送请求,该服务拥有获取设备、设备服务、设备配置文件信息的权限，并且将它们收集起来，通过请求传递给设备服务层，设备服务层再进一步请求转发至控制设备/传感器（南向）。实现获取设备的当前湿度。



### 例子-类型

Decvice Commands表明拥有对于多个模拟设备资源的读写权限。换句话说，设备命令允许在同一时间向一个传感器请求（设置）多种数据类型。

这个例子，有两个设备资源表明Human Count、DogCount，换句话说，他们是用来控制单独的设备资源。此外，如果我们需要同时获取human和dog的计数，可以定义一个设备命令`Counts`，用于汇总所有资源到一个命令中，以在一个请求中获取两个数据。

```yaml
deviceCommands:
-
name: "Counts"
readWrite: "R"
isHidden: false
resourceOperations:
- { deviceResource: "HumanCount" }
- { deviceResource: "DogCount" }
```





两种命令可以传递给设备

- GET 命令(从设备中请求数据)
  - 常用于请求最新的传感器数据，大部分例子中，GET命令是对设备传感器最新值的一种简单请求。因此该请求通常不需要什么参数或者直接在程序体中请求。
- SET命令（向设备请求操作、激活、设置配置）
  - SET命令需要一个请求体（请求体提供键值对用于参数请求）
    - 例如`{"additionalProp1": "string", "additionalProp2": "string"}`



## Device Definitions

![image-20250321152819616](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250321152819616.png)

在 EdgeX 的术语中，"设备"指的是传感器、执行器或 IoT "事物"。传感器通常用于收集来自物理世界的信息——例如温度传感器或振动传感器。执行器是可以接收指令并执行操作的设备。执行器移动或控制机制或系统——例如，控制泵的阀门。虽然从技术上讲，传感器和执行器可能有所不同，但在 EdgeX 文档中，设备一词将泛指传感器、执行器或"事物"。

关于实际设备的数据是另一种类型的信息，每个设备必须具有一个唯一的名称与之关联。核心元数据微服务([core metadata micro service](https://docs.edgexfoundry.org/4.1/microservices/core/metadata/Purpose/))存储有关设备的信息。这些信息被其他服务（例如设备、命令等）用来与设备进行通信。每个设备还会与一个设备配置文件相关联。此关联使得元数据能够利用设备配置文件中提供的知识来描述每个设备。例如，恒温器配置文件会指定它报告的温度值是摄氏度。将特定的恒温器（例如大厅的恒温器）与恒温器配置文件关联，使得元数据能够知道大厅恒温器报告的温度值是以摄氏度为单位的。

### 使用方法

如何开始
 您可以首先通过创建设备配置文件来[define your device](https://docs.edgexfoundry.org/4.1/walk-through/Ch-WalkthroughDeviceProfile/)，并根据该配置文件添加您的设备。

### 设备配置

一些设备服务具有发现新设备的能力，详细信息请参见"[Provision a device](https://docs.edgexfoundry.org/4.1/walk-through/Ch-WalkthroughProvision/) "和"[Device Discovery](https://docs.edgexfoundry.org/4.1/microservices/device/details/DeviceDiscovery/) "。

##  Auto Events

![image-20250321153440096](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250321153440096.png)



在操作技术（Operational Technology OT）领域，需要检查/监控实际设备/传感器的状态。例如，当温度达到30°C时，空调会自动开启。然而，手动检查传感器的状态是非常耗时的，因此 EdgeX 提供了名为 **AutoEvents** 的功能，用于自动和定期检查传感器的状态。

如上图所示，AutoEvents 用于定义从设备服务收集事件/读数的频率，并将其发送到核心数据。当设备服务接收到来自核心元数据的设备创建、更新或删除的信息时，它会自动从实际设备获取读数，并将事件/读数发送到消息总线，供应用服务/Core Data 使用。

AutoEvents 是一个可选功能，当创建设备时，每个设备可能会或不会与多个 AutoEvents 相关联。AutoEvent 具有以下字段：

- **sourceName**：设备资源或设备命令的名称，表示要读取的内容。
- **interval**：一个字符串，表示读取之间的等待时间，使用整数后跟 ms、s、m 或 h 单位。
- **onChange**：一个布尔值：如果设置为 `true`，则仅在一个或多个包含的读数自上次事件以来发生变化时生成新事件。
- **onChangeThreshold**：一个 float64 值，表示当变化值超过阈值时（如果 `onChange` 为 true），则生成新事件。此功能仅适用于数值型读数。可用的值类型包括 Uint8、Uint16、Uint32、Uint64、Int8、Int16、Int32、Int64、Float32 和 Float64。例如，如果当前值为 0.03，前一个值为 0.05，阈值为 0.01，则 |0.03 - 0.05| > 0.01，设备服务应该生成一个新事件。

### 示例和用法

AutoEvent 在设备定义文件的 `autoEvents` 部分进行定义：

#### 示例：

```yaml
device:
  name: device-demo
  adminState: UNLOCKED
  operatingState: UP
  serviceName: device-virtual
  profileName: virtual-profile
  protocols: virtual
  autoEvents:
  - interval: 10s
    onChange: false
    sourceName: Bool
```

服务启动后，查询 Core Data 的 API 来查看事件数量：

```bash
curl http://localhost:59880/api/v3/event/device/name/device-demo
```

返回结果如下：

```json
{
   "apiVersion":"v3",
   "statusCode":200,
   "totalCount":1,
   "events":[
      {
         "apiVersion":"v3",
         "id":"cbb9d4bd-50e3-4a99-bdf0-63ca2d4b4a37",
         "deviceName":"device-demo",
         "profileName":"virtual-profile",
         "sourceName":"temperature",
         "origin":1705997198406508020,
         "readings":[
            {
               "id":"81decf04-3e9f-48cc-a3ee-1aeaa6730c76",
               "origin":1705997198406508020,
               "deviceName":"device-demo",
               "resourceName":"Bool",
               "profileName":"virtual-profile",
               "valueType":"Bool",
               "value":"false"
            }
         ]
      }
   ]
}
```

10秒后，再次查询 Core Data 的 API 查看事件数量。您会看到事件的 `totalCount` 变为 2。

```json
{
   "apiVersion":"v3",
   "statusCode":200,
   "totalCount":2,
   "events":[
      {
         "apiVersion":"v3",
         "id":"1dead670-fc91-48db-8f6a-74f30bd3e0d6",
         "deviceName":"device-demo",
         "profileName":"virtual-profile",
         "sourceName":"Bool",
         "origin":1707986208822384190,
         "readings":[
            {
               "id":"c66db516-f27f-4663-b0a1-39d3693bf5fc",
               "origin":1707986208822384190,
               "deviceName":"device-demo",
               "resourceName":"Bool",
               "profileName":"virtual-profile",
               "valueType":"Bool",
               "value":"true"
            }
         ]
      },
      {
         "apiVersion":"v3",
         "id":"2549332e-0dfb-4881-a305-a2044a7ae835",
         "deviceName":"device-demo",
         "profileName":"virtual-profile",
         "sourceName":"Bool",
         "origin":1707986198816126412,
         "readings":[
            {
               "id":"a5dd24ba-bc41-4a10-a99d-082c0edc026c",
               "origin":1707986198816126412,
               "deviceName":"device-demo",
               "resourceName":"Bool",
               "profileName":"virtual-profile",
               "valueType":"Bool",
               "value":"false"
            }
         ]
      }
   ]
}
```

## Device Discovery

**Device Service - Device Discovery and Provision Watchers（配置观察器）**

设备服务可能包含**自动配置新设备**的逻辑，这可以通过**静态或动态**方式实现。

### 静态配置

在静态配置中，设备服务会收到一个包含设备定义的设备文件，该文件用于静态配置设备。设备服务根据提供的设备定义配置，连接并在 EdgeX（具体来说是元数据）中建立它所管理的新设备。

例如，可以为设备服务提供特定设备的 IP 地址和附加设备详情，以便在启动时加载这些设备。在静态配置中，假设设备存在并且可以通过设备定义配置中，指定的地址或位置访问。设备及其连接信息在设备服务启动时是已知的。

### 动态配置

在动态配置（也称为设备发现）中，设备服务会收到一些关于查找位置和设备一般参数的信息。例如，设备服务可能会收到一个网络地址范围，并被告知在该范围内查找特定类型的设备。然而，设备服务并不知道设备是否实际存在——启动时设备可能并不在场。它必须在其操作期间（通常按照某种时间表）持续扫描，根据配置提供的地点和设备参数指南发现新设备。

并非所有设备服务都支持动态发现。如果支持动态发现，关于查找对象和位置（即扫描位置）的配置由**预配置观察者（Provision Watcher）**指定。预配置观察者通过调用核心元数据的预配置观察者 API [（core metadata provision watcher API）](https://docs.edgexfoundry.org/4.0/microservices/core/metadata/ApiReference/)创建（并存储在元数据数据库中）。

**Provision Watcher：**

预配置观察者是一个过滤器，应用于设备服务扫描设备时发现的任何新设备。它包含一组协议属性名称和值，这些值可以是正则表达式。如果要添加新设备，这些属性必须与新设备的相应属性匹配。此外，预配置观察者还可能包含"阻止"标识符，如果新设备的属性与这些标识符中的任何一个匹配（注意，此处的匹配不是基于正则表达式），则不会自动配置该设备。这允许缩小设备扫描的范围或避免特定设备。

可以为设备服务提供多个预配置观察者，发现的设备如果与其中任何一个匹配就会被添加。除了过滤标准外，预配置观察者还包括与匹配新设备关联的各种属性规格：配置文件名称、初始管理状态（AdminState），以及可选的自动事件（AutoEvents）。

### 管理状态（Admin State）

每个设备的管理状态（**adminState**）可以是 **LOCKED（锁定）** 或 **UNLOCKED（解锁）**。这是应用于设备的一种行政状态，由系统管理员定期设置，例如用于系统维护或传感器升级。当设备被锁定（LOCKED）时，通过设备服务对设备的请求将被停止，并向调用者返回设备已锁定的指示（HTTP 423 状态码）。

### 传感器读取计划

设备服务从设备收集的数据被整理成 EdgeX 事件和读取对象，并发布到 EdgeX 消息总线。这是设备服务的主要职责之一。通常，一个可配置的计划——称为自动事件计划（**auto event schedule**）——决定了设备服务何时从设备收集数据。

---

总结

设备服务的设备发现与预配置观察者机制支持静态和动态两种配置方式，以实现设备的自动加载和管理。

- **静态配置**：通过预定义的设备文件提供设备信息（如 IP 地址），设备服务启动时即连接并管理这些已知设备，适用于设备位置和连接信息固定的场景。
- **动态配置（设备发现）**：通过扫描指定范围（如网络地址）发现新设备，依赖预配置观察者定义扫描参数和过滤规则。设备服务需持续运行扫描计划，发现设备后根据匹配条件自动配置。不所有服务都支持此功能。

**预配置观察者**是动态发现的关键，它通过协议属性和正则表达式过滤新设备，并可设置阻止标识符以排除特定设备。匹配的设备会关联配置文件、管理状态（锁定/解锁）和自动事件计划。管理状态用于控制设备访问，而自动事件计划则安排数据采集并发布到消息总线。

此机制兼顾了灵活性与自动化，支持多种设备管理需求，是 EdgeX 设备服务的重要功能。



## Command-line Options

设备服务 - 命令行选项

请参阅《[Common Command Line Options](https://docs.edgexfoundry.org/4.0/microservices/configuration/CommonCommandLineOptions/)》以了解所有 EdgeX 服务共用的命令行选项集。以下是设备服务特定的命令行选项。

**运行多个实例**

**--instance 或 -i**

设备服务支持一个额外的命令行参数：`--instance` 或 `-i`。

此选项允许在 EdgeX 部署中运行同一设备服务的多个实例，通过为它们指定不同的名称。例如，运行 `device-modbus -i 1` 将生成一个名为 `device-modbus_1` 的服务，即 `instance` 参数的值会作为后缀添加到设备服务名称中。同样的效果也可以通过设置环境变量 `EDGEX_INSTANCE_NAME` 来实现。

---

总结

设备服务的命令行选项包括通用选项和特定选项，其中 `--instance`（或 `-i`）是其特有功能，用于支持运行多个服务实例。通过此参数或环境变量 `EDGEX_INSTANCE_NAME`，可以在服务名称后附加后缀（如 `device-modbus_1`），实现同一服务的多实例部署，增强了部署的灵活性。

## Environment Variables

 环境变量

请参阅[《通用环境变量》](https://docs.edgexfoundry.org/4.0/microservices/configuration/CommonEnvironmentVariables/)部分，以了解所有 EdgeX 服务共用的环境变量列表。本节剩余内容是设备服务特定的环境变量。

### EDGEX_INSTANCE_NAME

此环境变量会覆盖 -i/--instance [command-line option](https://docs.edgexfoundry.org/4.0/microservices/device/details/CommandLine/#running-multiple-instances) 以及设备服务设置的默认值。

------

总结

设备服务的环境变量包括通用变量和特定变量，其中 EDGEX_INSTANCE_NAME 是其特有变量，用于指定服务实例名称。它优先级高于命令行选项 -i/--instance 和默认设置，可用于运行多个实例，提供了配置上的灵活性。





## Seeding Secrets

设备服务 - 密钥种子

设备服务通常需要特定的秘密用于身份验证、加密等。这些秘密可以在启动时通过秘密种子文件植入服务的 `SecretStore` 中。有关更多详情，请参阅《[Seeding Service Secrets](https://docs.edgexfoundry.org/4.0/security/SeedingServiceSecrets/)安全页面。

---

总结

设备服务的秘密植入功能允许在启动时通过种子文件将特定秘密（如用于认证或加密的密钥）加载到 `SecretStore` 中。这一机制增强了服务的安全性与可配置性，详细信息可参考相关安全文档。



##  Service Metrics

设备服务 - 服务指标

所有设备服务都具有以下内置指标：

| 指标名称      | 类型 | 描述                                   |
| ------------- | ---- | -------------------------------------- |
| EventsSent    | bool | 启用/禁用内置 EventsSent 指标的报告    |
| ReadingsSent  | bool | 启用/禁用内置 ReadingsSent 指标的报告  |
| LastConnected | bool | 启用/禁用内置 LastConnected 指标的报告 |

有关在自定义设备服务中创建额外服务指标的详细信息，请参阅《自定义服务指标》页面。

---

总结

设备服务的服务指标功能内置了三项指标：`EventsSent`（事件发送）、`ReadingsSent`（读数发送）和 `LastConnected`（最后连接时间），均为布尔类型，可通过配置启用或禁用报告。这些指标监控服务的运行状态，自定义指标则可通过《[Custom Service Metrics](https://docs.edgexfoundry.org/4.0/microservices/device/sdk/details/CustomServiceMetrics/)》指南扩展功能。



# Device Service SDK

## [Purpose](https://docs.edgexfoundry.org/4.0/microservices/device/sdk/Purpose/)

![image-20250320143527806](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250320143527806.png)

#### 设备服务 SDK - 目的

EdgeX 设备服务软件开发工具包（SDK）帮助开发者为 EdgeX 创建新的设备连接器。SDK 提供了每个设备服务所需的通用脚手架，使开发者能够更快地创建新的设备/传感器连接器。

EdgeX 提供了两种软件开发工具包（SDK）来帮助开发者创建新的设备服务。尽管 EdgeX 社区及更大的 EdgeX 生态系统提供了许多开源和商业可用的设备服务供 EdgeX 使用，但无法保证每种协议和每种传感器都能通过预先存在的设备服务连接到 EdgeX。即使提供了所有设备服务连接功能，您的使用场景、传感器或安全基础设施可能仍需定制。因此，设备服务 SDK 提供了扩展或定制 EdgeX 设备连接的方法。

EdgeX 主要使用 Go 和 C 语言编写。目前提供了 Go 和 C 两种语言的设备服务 SDK，以支持 EdgeX 中较流行的语言。未来，社区可能会提供其他语言的 SDK，或者在更大的生态系统中提供更多选择。

SDK 实际上是用于集成到新微服务中的库，大大简化了编写新设备服务的过程。通过将您选择的 SDK 库导入到新的设备服务项目中，您可以专注于通过设备特定协议获取和操作传感器数据的细节。其他细节，如设备服务的初始化、获取服务配置、将传感器数据发送到 EdgeX 消息总线、与核心元数据的通信管理等，都由 SDK 库中的代码处理。SDK 中的代码还有助于确保您的设备服务遵循 EdgeX 的规则和标准，例如确保服务启动时在 EdgeX 注册服务中注册。

设备服务 SDK 支持以下功能：

这些概念和技术在物联网（IoT）中有广泛的应用场景，具体如下：

1. **同步读写操作**  
   - **应用场景**：在需要实时数据交互的物联网设备中，例如智能家居中的温控器或工业传感器，要求设备能够立即读取环境数据（如温度、湿度）并同步写入控制指令（如调节空调）。同步操作确保数据一致性和实时性，适用于对延迟敏感的场景。
   - **例子**：智能门锁在接收到开锁指令时需要同步验证用户身份并记录日志。

2. **异步设备数据收集**  
   - **应用场景**：适用于大规模分布式物联网系统，例如农业物联网中的土壤湿度传感器网络或城市交通监控系统。异步收集允许设备在后台持续上传数据，而无需实时等待响应，适合处理高并发或低功耗设备。
   - **例子**：智能电表定期异步上传用电数据到云端，避免网络拥堵。

3. **驱动程序接口的初始化与解构**  
   - **应用场景**：在物联网设备管理中，驱动程序接口的初始化用于建立设备与系统的通信（如连接 Zigbee 或 LoRa 模块），而解构则用于安全释放资源（如设备下线时断开连接）。这对动态设备管理至关重要。
   - **例子**：智能工厂中新增一台设备时，系统初始化其驱动程序；设备移除时解构接口以释放内存。

4. **设备连接的初始化与销毁**  
   - **应用场景**：物联网网络中设备的频繁上线和下线需要高效的连接管理。例如，移动医疗设备（如可穿戴心率监测器）在用户使用时初始化连接，结束后销毁连接以节省资源。
   - **例子**：物流中的冷链运输传感器在车辆启动时建立连接，到达目的地后销毁连接。

5. **自动化配置机制的框架**  
   - **应用场景**：大规模物联网部署（如智慧城市中的路灯系统）需要自动配置设备参数（如 IP 地址、通信协议）。自动化框架减少人工干预，提高部署效率。
   - **例子**：新安装的智能路灯自动从云端获取配置，加入网络并开始工作。

6. **支持具有配置文件的多类设备**  
   - **应用场景**：物联网系统通常包含多种设备（如摄像头、传感器、执行器），通过配置文件支持不同设备的特性和功能，便于统一管理和扩展。
   - **例子**：智能家居系统中，灯光、空调和安防摄像头各自有不同配置文件，但通过统一平台管理。

7. **支持由命令触发的一组动作**  
   - **应用场景**：适用于需要协同操作的物联网场景。例如，一个"回家"命令可以触发开门、开灯和调节室内温度等一系列动作，提升用户体验和自动化水平。
   - **例子**：工业自动化中，一条生产线启动命令可触发多个设备按序运行。

8. **对查询的缓存响应**  
   - **应用场景**：在数据查询频繁的物联网应用中（如智能能源管理系统），缓存常用查询结果可以减少网络负载和响应时间，尤其适合低带宽或离线场景。
   - **例子**：智能电表用户查询当月用电量时，系统从缓存中快速返回数据，而无需实时从设备拉取。

---

### 总结

设备服务 SDK 的目的是为开发者提供工具，快速创建和定制 EdgeX 的设备连接器，解决现有设备服务无法覆盖所有协议和场景的问题。EdgeX 提供 Go 和 C 两种 SDK，支持主流语言，未来可能扩展更多语言支持。SDK 以库的形式集成到新微服务中，提供通用功能（如初始化、配置、数据发送等），让开发者专注于设备协议和数据处理，确保服务符合 EdgeX 标准。其支持同步/异步操作、自动配置、多设备管理等功能，显著提升开发效率和灵活性。

## Getting Started

### [Go SDK](https://docs.edgexfoundry.org/4.0/microservices/device/sdk/devicesdk-getting-started/GettingStartedSDK-Go/) - 入门指南

本指南将帮助您创建一个简单的设备服务，该服务生成随机数以模拟从实际设备获取数据。通过这种方式，您可以探索 SDK 框架并完成设备服务所需的工作，而无需实际连接设备。

---

#### 安装依赖

请参阅《[Getting Started - Go Developers](https://docs.edgexfoundry.org/4.0/getting-started/Ch-GettingStartedGoDevelopers/) 》，安装开发 GoLang 服务所需的工具和基础设施。

---

#### 获取 EdgeX Go 设备服务 SDK

按照以下步骤在您的文件系统中创建文件夹，下载设备 SDK，并获取 GoLang 设备服务 SDK。

1. 在文件系统中创建嵌套文件夹集合 `~/edgexfoundry`，用于存放您的新设备服务。在 Linux 中，使用以下命令创建目录：

   ```
   mkdir -p ~/edgexfoundry
   ```

2. 在终端窗口中，切换到刚创建的文件夹，并使用以下命令拉取 Go SDK：

   ```
   cd ~/edgexfoundry
   git clone --depth 1 --branch v2.0.0 https://github.com/edgexfoundry/device-sdk-go.git
   ```

   ![image-20250323201413377](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250323201413377.png)

   > [!Note]
   > 上面的 clone 命令拉取的是与 Ireland 版本相关的 v2.0.0 Go SDK。EdgeX 有更新的版本，建议拉取与您使用的 EdgeX 主版本相对应的最新版本。您可以访问 `https://github.com/edgexfoundry/device-sdk-go` 检查最新发布版本。

3. 创建一个文件夹，用于存放新设备服务。文件夹名称也是您希望赋予新设备服务的名称。EdgeX 的标准做法是在设备服务名称前添加 `device-` 前缀。本例中使用 `device-simple`：

   ```
   mkdir -p ~/edgexfoundry/device-simple
   ```

4. 将 `device-sdk-go` 中的示例代码复制到 `device-simple`：

   ```
   cd ~/edgexfoundry
   cp -rf ./device-sdk-go/example/* ./device-simple/
   ```

5. 将 `Makefile` 复制到 `device-simple`：

   ```
   cp ./device-sdk-go/Makefile ./device-simple
   ```

6. 将 `version.go` 复制到 `device-simple`：

   ```
   cp ./device-sdk-go/version.go ./device-simple/
   ```

   完成这些步骤后，您的 `device-simple` 文件夹应如下图所示：

   ![image-20250324170431357](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250324170431357.png)

   

---

#### 启动新设备服务

设备服务应用结构就位后，现在是时候编程让服务模拟传感器数据获取功能。

1. 切换到 `device-simple` 目录：

   ```
   cd ~/edgexfoundry/device-simple
   ```

2. 使用您喜欢的文本编辑器打开 `cmd/device-simple` 文件夹中的 `main.go` 文件。修改导入语句：

   - 将 `github.com/edgexfoundry/device-sdk-go/v2/example/driver` 替换为 `github.com/edgexfoundry/device-simple/driver`。
   - 将 `github.com/edgexfoundry/device-sdk-go/v2` 替换为 `github.com/edgexfoundry/device-simple`。
   - 编辑完成后保存文件。

   ![image-20250324170447428](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250324170447428.png)

3. 使用编辑器打开 `~/edgexfoundry/device-simple` 中的 `Makefile` 文件，进行以下更改：

   - 将：

     ```
     MICROSERVICES=example/cmd/device-simple/device-simple
     ```

     替换为：

     ```
     MICROSERVICES=cmd/device-simple/device-simple
     ```

   - 将：

     ```
     GOFLAGS=-ldflags "-X github.com/edgexfoundry/device-sdk-go/v2.Version=$(VERSION)"
     ```

     改为引用新服务：

     ```
     GOFLAGS=-ldflags "-X github.com/edgexfoundry/device-simple.Version=$(VERSION)"
     ```

   - 将：

     ```
     example/cmd/device-simple/device-simple:
       go mod tidy
       $(GOCGO) build $(GOFLAGS) -o $@ ./example/cmd/device-simple
     ```

     改为：

     ```
     cmd/device-simple/device-simple:
       go mod tidy
       $(GOCGO) build $(GOFLAGS) -o $@ ./cmd/device-simple
     ```

   - 保存文件。

4. 输入以下命令创建初始模块定义并写入 `go.mod` 文件：

   ```
   GO111MODULE=on go mod init github.com/edgexfoundry/device-simple
   ```

   

5. 使用编辑器打开并编辑 `~/edgexfoundry/device-simple` 中的 `go.mod` 文件，在文件底部添加以下高亮代码，指定使用的设备服务 SDK 和相关 EdgeX 合约模块版本：

   ```
   require (
       github.com/edgexfoundry/device-sdk-go/v2 v2.0.0
       github.com/edgexfoundry/go-mod-core-contracts/v2 v2.0.0
   )
   ```

   ![image-20250324170504036](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250324170504036.png)

。

   6.使用编辑器打开并编辑 `~/edgexfoundry/device-simple` 目录下创建的 `go.mod` 文件。在文件底部添加下面高亮显示的代码。这段代码用于指定要使用的设备服务 SDK 版本以及相关的 EdgeX 合约模块。

   ```go
require (
    github.com/edgexfoundry/device-sdk-go/v2 v2.0.0
    github.com/edgexfoundry/go-mod-core-contracts/v2 v2.0.0
)
   ```

   ![image-20250324170659954](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250324170659954.png)

> [!Note]
>
> 您应始终检查最新发布版本 SDK 中的 `go.mod` 文件，以确保使用正确的 Go SDK 和 `go-mod-contracts` 版本

---

#### 构建您的设备服务

为确保移动和更新的代码仍正常工作，构建设备服务。在终端窗口中，确保您仍在 `device-simple` 文件夹（包含 `Makefile` 的文件夹）。使用以下命令构建服务：

```
make build
```

如果没有错误，您的服务已准备好添加自定义代码，以生成模拟传感器数据。

---

#### 定制您的设备服务

您创建的设备服务不会与真实设备通信，而是生成随机数，模拟从实际设备获取传感器数据。

1. 找到 `/driver` 文件夹中的 `simpledriver.go` 文件，用您喜欢的编辑器打开。

   ![image-20250324170802662](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250324170802662.png)

2. 在文件顶部的 `import()` 区域，在 `"time"` 下添加 `"math/rand"`。

   ![image-20250324170818606](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250324170818606.png)

3. 在同一文件（`simpledriver.go`）中找到 `HandleReadCommands()` 函数，定位以下代码（大约第 139 行）：

   ```go
   if reqs[0].DeviceResourceName == "SwitchButton" {
       cv, _ := sdkModels.NewCommandValue(reqs[0].DeviceResourceName, common.ValueTypeBool, s.switchButton)  
       res[0] = cv
   }
   ```

   在上述条件语句前添加以下条件（if-else）代码：

   ```go
   if reqs[0].DeviceResourceName == "randomnumber" {
       cv, _ := sdkModels.NewCommandValue(reqs[0].DeviceResourceName, common.ValueTypeInt32, int32(rand.Intn(100)))
       res[0] = cv
   } else
   ```

   ![image-20250324170833037](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250324170833037.png)

   第一行检查当前请求是否针对名为 `"randomnumber"` 的资源。第二行生成一个 0 到 100 之间的整数，作为设备服务发送到 EdgeX 的值，模拟从真实设备收集数据。通常，设备服务会在此处捕获传感器读数并发送到 EdgeX。`HandleReadCommands` 是您需要定制以与设备通信、获取最新传感器值并发送到 EdgeX 的地方。

4. 保存 `simpledriver.go` 文件。

---

#### 创建您的设备配置文件

设备配置文件是一个 YAML 文件，向 EdgeX 描述一类设备，包括设备类型的一般特性、提供的数据以及如何命令设备。设备配置文件告知设备服务从设备收集哪些数据以及如何收集。

按照以下步骤为简单的随机数生成设备服务创建设备配置文件：

1. 浏览 `cmd/device-simple/res/profiles` 文件夹中的文件。注意其中已有的示例 `Simple-Driver.yaml` 设备配置文件。用编辑器打开并探索其内容，注意 `deviceResources` 如何表示设备属性（如 `SwitchButton`、X、Y 和 Z 旋转）。

   ![image-20250324170847056](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250324170847056.png)

2. 本文档提供了一个预创建的随机数设备配置文件。下载 `random-generator.yaml`，并将其保存到 `~/edgexfoundry/device-simple/cmd/device-simple/res/profiles` 文件夹。

3. 用文本编辑器打开 `random-generator.yaml` 文件。在此配置文件中，描述的设备具有一个 `deviceResource: RandomNumber`。注意 `deviceResource` 与类型的关联，在此例中，配置文件告知 EdgeX `RandomNumber` 将是 `INT32` 类型。在现实世界的物联网场景中，此 `deviceResource` 列表可能非常广泛，可能包含多个资源，每个资源关联不同类型。

---

#### 创建您的设备

设备服务接受在启动时预定义的设备添加到 EdgeX。

按照以下步骤为简单的随机数生成设备服务创建预定义设备：

1. 浏览 `cmd/device-simple/res/devices` 文件夹中的文件。注意其中已有的示例 `simple-device.yaml`。用编辑器打开并探索其内容，注意 `DeviceList` 如何表示具有属性（例如 `Name`、`ProfileName`、`AutoEvents`）的实际设备。

2. 本文档提供了一个预创建的随机数设备文件。下载 `random-generator-devices.yaml`，并将其保存到 `~/edgexfoundry/device-simple/cmd/device-simple/res/devices` 文件夹。

3. 用文本编辑器打开 `random-generator-devices.yaml` 文件。在此例中，描述的设备具有 `ProfileName: RandNum-Device`，告知 EdgeX 它将使用我们在《创建您的设备配置文件》中创建的设备配置文件。

---

#### 验证您的设备

Go 设备服务提供 `/api/v3/validate/device` API 来验证设备的 `ProtocolProperties`。此功能允许协议有严格规则的设备服务在将设备添加到 EdgeX 前进行验证。

Go SDK 提供了 `DeviceValidator` 接口：

```go
// DeviceValidator 是由设备服务实现的低级设备特定接口，用于验证设备的协议属性。
type DeviceValidator interface {
    // ValidateDevice 触发设备协议属性的验证，如果验证失败返回错误，
    // 传入的设备将不会添加到 EdgeX。
    ValidateDevice(device models.Device) error
}
```

通过实现 `DeviceValidator` 接口，每当添加或更新设备时，`ValidateDevice` 函数将被调用以验证传入设备的 `ProtocolProperties`，如果验证失败则拒绝请求。

---

#### 配置您的设备服务

现在更新新设备服务的配置。本文档提供了一个新的 `configuration.yaml` 文件。此配置文件：

- 更改服务运行的端口，以避免与其他设备服务冲突。

1. 下载 `configuration.yaml`，并将其保存到 `~/edgexfoundry/device-simple/cmd/device-simple/res` 文件夹（覆盖现有配置文件）。将设备服务的主机地址更改为您的系统 IP 地址。

   **警告**  
   在 `configuration.yaml` 中，将主机地址（大约第 14 行）更改为系统主机的 IP 地址。这允许核心元数据在创建新设备时回调到您的新设备服务。由于 EdgeX 的其余部分（包括核心元数据）将在 Docker 中运行，必须提供 Docker 网络上主机系统的 IP 地址，以便 Docker 中的元数据能够调用主机系统上运行的新设备服务。

---

#### 自定义结构化配置

Go 设备服务现在可以在 `configuration.yaml` 文件中定义自己的自定义结构化配置部分。SDK 解析文件时会忽略文件中未定义的额外部分。

此功能允许设备服务定义并监视其配置文件中的结构化部分。

SDK API 提供了以下接口以启用结构化自定义配置：

- `LoadCustomConfig(config UpdatableConfig, sectionName string) error`  
  从本地文件或配置提供者（如果启用）加载服务的自定义配置。如果服务首次启动时使用配置提供者，配置提供者将被植入自定义配置。从配置提供者加载配置时，将调用自定义配置上的 `UpdateFromRaw` 接口。

- `ListenForCustomConfigChanges(configToWatch interface{}, sectionName string, changedCallback func(interface{})) error`  
  在配置提供者上启动对指定自定义配置部分的更改监听。从配置提供者接收到更改时，将调用自定义配置上的 `UpdateWritableFromRaw` 接口应用更新，并通过 `changedCallback` 信号通知更改发生。

有关使用新的结构化自定义配置功能的示例，请参阅《设备 MQTT 服务》：

- 定义结构化自定义配置：见[此处](#)
- 配置文件的自定义部分：见[此处](#)
- 加载、验证和监视配置：见[此处](#)

---

#### 重新构建您的设备服务

如同《构建您的设备服务》步骤中一样，构建 `device-simple` 服务，创建可执行程序。在终端窗口中，确保您在 `device-simple` 文件夹（包含 `Makefile` 的文件夹）。使用以下命令构建服务：

```
cd ~/edgexfoundry/device-simple
make build
```

![image-20250324170904277](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250324170904277.png)

如果没有错误，您的服务将创建并放置在 `~/edgexfoundry/device-simple/cmd/device-simple` 文件夹中。查看该文件夹中的 `device-simple` 可执行文件。

---

#### 运行您的设备服务

让基于 Go SDK 创建的新设备服务生成模拟传感器数据并发送到 EdgeX：

1. 按照《使用 Docker 入门指南》启动所有 EdgeX 服务。从包含 `docker-compose` 文件的文件夹，使用以下命令启动 EdgeX（本例中使用非安全模式）：

   ```
   docker compose -f docker-compose-no-secty.yml up -d
   ```

2. 在终端窗口中，切换到 `device-simple` 的 `cmd/device-simple` 文件夹并运行新服务：

   ```
   cd ~/edgexfoundry/device-simple/cmd/device-simple
   ./device-simple -cp -d
   ```

   这将启动服务并立即在终端显示日志条目。

   **EdgeX 4.0**  
   在 EdgeX 4.0 中，服务必须提供一个标志，指示新通用配置的位置。通常使用 `-cp/--configProvider` 指定使用配置提供者进行配置。或者，可以使用 `-cc/--commonConfig` 标志指定包含通用配置的文件。此外，在混合模式下运行时，`-d/--dev` 标志告知服务它处于混合模式，并将依赖项的主机名覆盖为 `localhost`。详情见《命令行选项》。

3. 在浏览器中输入以下 URL，查看服务生成并发送到 EdgeX 的事件/读数数据：

   ```
   http://localhost:59880/api/v3/event/device/name/RandNum-Device01
   ```

   该请求要求核心数据提供与 `RandNum-Device01` 相关的事件。

---

#### 总结

本指南通过 Go SDK 创建并运行一个生成随机数的简单设备服务，帮助开发者熟悉 EdgeX 设备服务开发流程。主要步骤包括：

1. **准备环境**：安装依赖，拉取 v2.0.0 Go SDK，复制示例代码至新服务目录。
2. **定制服务**：修改导入路径、Makefile，添加随机数生成逻辑至 `HandleReadCommands`。
3. **配置文件和设备**：创建 `random-generator.yaml`（定义 RandomNumber 资源）和 `random-generator-devices.yaml`（定义设备）。
4. **构建与运行**：编译服务，配置主机 IP，结合 Docker 运行 EdgeX 并启动服务，验证数据输出。

新增功能如设备验证（`DeviceValidator` 接口）和自定义结构化配置（通过 SDK API）增强了服务的可扩展性。最终，服务通过 API（如 `http://localhost:59880/api/v3/event/device/name/RandNum-Device01`）输出模拟数据，展示了 SDK 的实用性与灵活性。

### [C SDK](https://docs.edgexfoundry.org/4.0/microservices/device/sdk/devicesdk-getting-started/GettingStartedSDK-C/)

coming soon



## APIs

### Go SDK API

[官方Go SDK参考文档](https://docs.edgexfoundry.org/4.0/microservices/device/sdk/api/GoDeviceSDK/GoDeviceSDKAPI/)

**DeviceServiceSDK API** 为设备服务开发者提供了以下 API。

#### **DeviceServiceSDK 接口**

```go
type DeviceServiceSDK interface {
    AddDevice(device models.Device) (string, error) // 添加设备
    Devices() []models.Device // 获取所有设备
    GetDeviceByName(name string) (models.Device, error) // 通过名称获取设备
    UpdateDevice(device models.Device) error // 更新设备信息
    RemoveDeviceByName(name string) error // 通过名称移除设备
    AddDeviceProfile(profile models.DeviceProfile) (string, error) // 添加设备配置文件
    DeviceProfiles() []models.DeviceProfile // 获取所有设备配置文件
    GetProfileByName(name string) (models.DeviceProfile, error) // 通过名称获取设备配置文件
    UpdateDeviceProfile(profile models.DeviceProfile) error // 更新设备配置文件
    RemoveDeviceProfileByName(name string) error // 通过名称移除设备配置文件
    AddProvisionWatcher(watcher models.ProvisionWatcher) (string, error) // 添加设备发现监视器
    ProvisionWatchers() []models.ProvisionWatcher // 获取所有设备发现监视器
    GetProvisionWatcherByName(name string) (models.ProvisionWatcher, error) // 通过名称获取设备发现监视器
    UpdateProvisionWatcher(watcher models.ProvisionWatcher) error // 更新设备发现监视器
    RemoveProvisionWatcher(name string) error // 移除设备发现监视器
    DeviceResource(deviceName string, deviceResource string) (models.DeviceResource, bool) // 获取设备资源
    DeviceCommand(deviceName string, commandName string) (models.DeviceCommand, bool) // 获取设备命令
    AddDeviceAutoEvent(deviceName string, event models.AutoEvent) error // 添加设备自动事件
    RemoveDeviceAutoEvent(deviceName string, event models.AutoEvent) error // 移除设备自动事件
    UpdateDeviceOperatingState(name string, state models.OperatingState) error // 更新设备的运行状态
    DeviceExistsForName(name string) bool // 检查设备是否存在
    PatchDevice(updateDevice dtos.UpdateDevice) error // 部分更新设备信息
    Run() error // 运行设备服务
    Name() string // 获取设备服务名称
    Version() string // 获取设备服务版本
    AsyncReadingsEnabled() bool // 是否启用异步读取
    AsyncValuesChannel() chan *sdkModels.AsyncValues // 获取异步读取通道
    DiscoveredDeviceChannel() chan []sdkModels.DiscoveredDevice // 获取设备发现通道
    DeviceDiscoveryEnabled() bool // 是否启用设备发现
    DriverConfigs() map[string]string // 获取驱动配置
    AddRoute(route string, handler func(http.ResponseWriter, *http.Request), methods ...string) error // （已弃用）添加自定义路由
    AddCustomRoute(route string, authenticated Authenticated, handler func(echo.Context) error, methods ...string) error // 添加自定义路由（支持身份验证）
    LoadCustomConfig(customConfig UpdatableConfig, sectionName string) error // 加载自定义配置
    ListenForCustomConfigChanges(configToWatch interface{}, sectionName string, changedCallback func(interface{})) error // 监听自定义配置变更
    LoggingClient() logger.LoggingClient // 获取日志客户端
    SecretProvider() interfaces.SecretProvider // 获取密钥管理服务
    MetricsManager() interfaces.MetricsManager // 获取指标管理器
    PublishDeviceDiscoveryProgressSystemEvent(progress, discoveredDeviceCount int, message string) // 发布设备发现进度事件
    PublishProfileScanProgressSystemEvent(reqId string, progress int, message string) // 发布配置文件扫描进度事件
    PublishGenericSystemEvent(eventType, action string, details any) // 发布通用系统事件
}
```

------

#### **API 说明**

##### **自动事件 (Auto Event)**

- **`AddDeviceAutoEvent(deviceName string, event models.AutoEvent) error`**
  添加一个新的 **AutoEvent** 到指定设备。失败时返回错误。
- **`RemoveDeviceAutoEvent(deviceName string, event models.AutoEvent) error`**
  从指定设备移除 **AutoEvent**，失败时返回错误。

##### **设备管理 (Device Management)**

- **`AddDevice(device models.Device) (string, error)`**
  向 **Core Metadata** 和设备服务缓存中添加新设备。返回设备 ID 或错误信息。

- **`UpdateDevice(device models.Device) error`**
  更新 **Core Metadata** 和设备服务缓存中的设备信息。失败时返回错误。

- **`UpdateDeviceOperatingState(deviceName string, state models.OperatingState) error`**
  更新指定设备的运行状态。失败时返回错误。

- **`RemoveDeviceByName(name string) error`**
  通过设备名称从 **Core Metadata** 和缓存中移除设备。失败时返回错误。

- **`Devices() []models.Device`**
  获取所有受管理的设备列表。

- **`GetDeviceByName(name string) (models.Device, error)`**
  通过设备名称获取设备信息，若设备不存在则返回错误。

- **`PatchDevice(updateDevice dtos.UpdateDevice) error`**
  部分更新设备信息，更新对象中的 **`nil` 值不会修改设备数据**。

  **示例代码：**

  ```go
  service := interfaces.Service()
  locked := models.Locked
  return service.PatchDevice(dtos.UpdateDevice{
      Name:       &name,
      AdminState: &locked,
  })
  ```

- **`DeviceExistsForName(name string) bool`**
  判断设备是否存在，存在返回 `true`，否则返回 `false`。

##### **设备配置文件 (Device Profile Management)**

- **`AddDeviceProfile(profile models.DeviceProfile) (string, error)`**
  添加新的设备配置文件到 **Core Metadata** 和缓存中，返回配置文件 ID 或错误信息。
- **`UpdateDeviceProfile(profile models.DeviceProfile) error`**
  更新设备配置文件信息。失败时返回错误。
- **`RemoveDeviceProfileByName(name string) error`**
  通过名称移除设备配置文件。失败时返回错误。
- **`DeviceProfiles() []models.DeviceProfile`**
  获取所有受管理的设备配置文件。
- **`GetProfileByName(name string) (models.DeviceProfile, error)`**
  通过名称获取设备配置文件，若不存在则返回错误。

##### **设备发现监视 (Provision Watcher)**

- **`AddProvisionWatcher(watcher models.ProvisionWatcher) (string, error)`**
  添加设备发现监视器到 **Core Metadata** 和缓存中，返回监视器 ID 或错误信息。
- **`UpdateProvisionWatcher(watcher models.ProvisionWatcher) error`**
  更新设备发现监视器信息。失败时返回错误。
- **`RemoveProvisionWatcher(name string) error`**C:\Program Files\Pandoc
  通过名称移除设备发现监视器。失败时返回错误。
- **`ProvisionWatchers() []models.ProvisionWatcher`**
  获取所有受管理的设备发现监视器。
- **`GetProvisionWatcherByName(name string) (models.ProvisionWatcher, error)`**
  通过名称获取设备发现监视器，若不存在则返回错误。

##### **资源 & 命令 (Resource & Command)**

- **`DeviceResource(deviceName string, deviceResource string) (models.DeviceResource, bool)`**
  获取设备资源信息，成功返回资源对象和 `true`，否则返回 `false`。
- **`DeviceCommand(deviceName string, commandName string) (models.DeviceCommand, bool)`**
  获取设备命令信息，成功返回命令对象和 `true`，否则返回 `false`。

##### **日志 & 安全 & 配置管理**

- **`LoggingClient() logger.LoggingClient`**
  获取日志客户端。
- **`SecretProvider() interfaces.SecretProvider`**
  获取密钥管理服务。
- **`MetricsManager() interfaces.MetricsManager`**
  获取指标管理器。
- **`LoadCustomConfig(customConfig UpdatableConfig, sectionName string) error`**
  加载自定义配置。
- **`ListenForCustomConfigChanges(configToWatch interface{}, sectionName string, changedCallback func(interface{})) error`**
  监听自定义配置变更。

##### **系统事件发布**

- **`PublishDeviceDiscoveryProgressSystemEvent(progress, discoveredDeviceCount int, message string)`**
  通过 **EdgeX 消息总线** 发布设备发现进度事件。
- **`PublishGenericSystemEvent(eventType, action string, details any)`**
  通过 **EdgeX 消息总线** 发布通用系统事件。





### Go SDK [ProtocolDriver](https://docs.edgexfoundry.org/4.0/microservices/device/sdk/api/GoDeviceSDK/GoProtocolDriverAPI/)

-协议驱动 API

协议驱动 API 是所有设备服务必须实现的接口。该接口为设备 SDK 提供了调用自定义设备服务驱动代码的入口点。实现此接口是所有设备服务的核心，因为设备 SDK 处理了成为设备服务的其他部分。

---

#### ProtocolDriver 接口

```go
type ProtocolDriver interface {
    Initialize(sdk DeviceServiceSDK) error
    Start() error
    Stop(force bool) error
    Discover() error
    AddDevice(deviceName string, protocols map[string]models.ProtocolProperties, adminState models.AdminState) error
    UpdateDevice(deviceName string, protocols map[string]models.ProtocolProperties, adminState models.AdminState) error
    RemoveDevice(deviceName string, protocols map[string]models.ProtocolProperties) error
    ValidateDevice(device models.Device) error
    HandleReadCommands(deviceName string, protocols map[string]models.ProtocolProperties, reqs []sdkModels.CommandRequest) ([]*sdkModels.CommandValue, error)
    HandleWriteCommands(deviceName string, protocols map[string]models.ProtocolProperties, reqs []sdkModels.CommandRequest, params []*sdkModels.CommandValue) error
}
```

---

#### 驱动（Driver）

本节中的接口涉及设备服务实现的驱动程序。

###### Initialize

```go
Initialize(sdk DeviceServiceSDK) error
```

此接口为设备服务执行特定协议的初始化。`sdk` 参数提供了访问设备服务 SDK API 的能力，用于执行初始化任务。此处可以加载自定义配置并设置观察者。详情见《自定义配置》部分。

示例实现可在设备 SDK 的示例《简单驱动》中找到。

###### Start

```go
Start() error
```

此接口在 SDK 和驱动完全初始化后运行设备服务的启动任务。这允许设备服务在此函数调用中安全使用所有 `DeviceServiceSDK` 接口功能。

###### Stop

```go
Stop(force bool) error
```

此接口指示特定协议代码优雅关闭，如果 `force` 参数为 `true`，则立即关闭。驱动程序负责关闭所有正在使用的通道，包括用于发送异步读数的通道（如果支持）。

---

#### 设备（Device）

本节中的接口涉及设备服务管理的设备。

###### Discover

```go
Discover() error
```

此接口触发特定协议的设备发现，异步将结果写入通过 `DeviceServiceSDK.DiscoveredDeviceChannel()` API 返回的通道。根据一组接受标准（即预配置观察者），发现的设备可能会被添加到设备服务中。详情见《设备发现》部分。

如果设备服务不支持特定协议的设备发现，应返回错误，因为设备发现不应在服务配置中启用。详情见《配置》部分的《设备》选项卡。

示例实现可在设备 SDK 的示例《简单驱动》中找到。

###### ValidateDevice

```go
ValidateDevice(device models.Device) error
```

此接口触发设备协议属性的验证。如果验证失败，返回错误，将阻止传入的设备被添加到 EdgeX 中。

示例实现可在设备 SDK 的示例《简单驱动》中找到。

###### AddDevice

```go
AddDevice(deviceName string, protocols map[string]models.ProtocolProperties, adminState models.AdminState) error
```

此接口在为设备服务添加新设备时调用。此处设备服务可以执行特定协议的操作，以初始化与设备实例的通信。

###### UpdateDevice

```go
UpdateDevice(deviceName string, protocols map[string]models.ProtocolProperties, adminState models.AdminState) error
```

此接口在设备服务已管理的设备更新时调用。由于更改，可能需要重新建立与设备实例的通信。

###### RemoveDevice

```go
RemoveDevice(deviceName string, protocols map[string]models.ProtocolProperties) error
```

此接口在设备服务管理的设备从 EdgeX 中移除时调用。可能需要设备服务采取行动关闭与设备实例的通信。

---

#### 命令（Commands）

本节中的接口处理设备服务接收的命令。有关命令的更多详情，见《设备命令》。

###### HandleReadCommands

```go
HandleReadCommands(deviceName string, protocols map[string]models.ProtocolProperties, reqs []sdkModels.CommandRequest) ([]*sdkModels.CommandValue, error)
```

此接口处理为指定设备 `deviceName` 传入的读请求集合 `reqs`。它返回一组 `CommandValues`，包含为每个读请求收集的设备读取详情。这些 `CommandValues` 由设备 SDK 转换为事件/读数并发布到 EdgeX 消息总线。

示例实现可在设备 SDK 的示例《简单驱动》中找到。

###### HandleWriteCommands

```go
HandleWriteCommands(deviceName string, protocols map[string]models.ProtocolProperties, reqs []sdkModels.CommandRequest, params []*sdkModels.CommandValue) error
```

此接口处理为指定设备 `deviceName` 传入的写请求集合 `reqs`。它将 `params` 中的数据写入 `reqs` 中指定的设备资源。

示例实现可在设备 SDK 的示例《简单驱动》中找到。

---

#### 总结

协议驱动 API（`ProtocolDriver` 接口）是设备服务开发的核心，所有设备服务必须实现该接口以与 EdgeX SDK 交互。它定义了设备服务的生命周期管理（`Initialize`、`Start`、`Stop`）、设备管理（`AddDevice`、`UpdateDevice`、`RemoveDevice`、`Discover`、`ValidateDevice`）和命令处理（`HandleReadCommands`、`HandleWriteCommands`）。

- **驱动相关**：`Initialize` 初始化服务并加载配置，`Start` 执行启动任务，`Stop` 管理关闭。
- **设备相关**：支持设备发现（`Discover`）、验证（`ValidateDevice`）和增删改操作。
- **命令相关**：处理读写请求，生成并发送数据至消息总线。

实现该接口是设备服务的核心工作，SDK 则负责其他通用功能，示例代码可在《简单驱动》中找到，为开发者提供参考。

### C SDK

come soon

## [Source Code](https://docs.edgexfoundry.org/4.0/microservices/device/sdk/SourceCode/)



## Addiction Details



### [Custom Configuration](https://docs.edgexfoundry.org/4.0/microservices/device/sdk/details/CustomConfiguration/)



### [Custom Rest Apis](https://docs.edgexfoundry.org/4.0/microservices/device/sdk/details/CustomRestApis/)



### [Custom Service Metrics](https://docs.edgexfoundry.org/4.0/microservices/device/sdk/details/CustomServiceMetrics/)



##### [Secrets](https://docs.edgexfoundry.org/4.0/microservices/device/sdk/details/Secrets/)
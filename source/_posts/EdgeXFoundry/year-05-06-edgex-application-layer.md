---
title: edgex-application-layer
date: 2025-05-06 09:26:39
categories: [EdgeXFoundry]
tags: application-layer
---
# Application Service - Overview

![image-20250420212652028](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/image-20250420212652028.png)

应用服务是处理边缘传感器数据并将其发送到外部系统（无论是分析包、企业本地应用、云系统)的一种方式。应用服务提供了数据准备（转换、丰富、过滤等）和整理（格式化、压缩、加密等）的手段，以便将其发送到选择的端点或发布回其他应用服务以供消费）。目前支持的标准导出端点包括HTTP和MQTT端点，但可以在现有功能的基础上实现自定义端点。

应用服务基于“函数管道”的感念。函数管道是一组按指定顺序处理消息（默认为EdgeX event / readings）的函数集合。触发器将数据通过应用服务接收并初始化定义好管道中第一个（或多个）函数。触发器类似于消息掉落在正在监视的消息队列中。最常用的触发器是消息总线触发器。有关详细信息，参阅[Triggers](https://docs.edgexfoundry.org/3.1/microservices/application/details/Triggers/)部分。

![](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/TriggersFunctions.png)

一个应用程序功能软件开发工具包（App Function SDK）可以用于帮助创建自定义应用程序服务。目前，唯一支持的SDK语言是Golang，未来社区可能会开发并支持其他语言的SDK。SDK作为Golang模块体用，以保持操作系统无关性，并符合最新的EdgeX开发指南的依赖管理。

基于应用程序功能SDK构建的任何应用程序都将被视为应用程序服务。此SDK帮助您组装触发器、现有函数和您自定的函数，将他们组合成一个或多个函数管道来构建自定义应用程序服务。

---

## Standard Functions

如前所述，应用程序是围绕函数管道概念构建的。SDK提供了许多标准函数，可以在函数管道中使用它。此外，开发者可以实施自己的自定义管道函数，并将这些函数添加到他们的应用程序服务函数管道中。

> [!TIp]
>
> 示例管道函数
>
> ![](https://raw.githubusercontent.com/clint456/PicGo/main/edgex/SDKFunctions.png)
>
> 处理了MessageBus的数据时，最常见的用例之一就是将数据过滤到特定应用程序的相关内容，并对其进行格式化。为了帮助实现这一点，SDK中包含了六个主要的管道函数。
>
> - 第一个是`FilterByProfileName`函数，该函数将删除与配置`ProfileName`不匹配的事件，如果过滤后没有事件剩余，则管道将停止执行。
> - 第二个是`FilterByDeviceName`函数，该函数将删除与配置`DeviceName`不匹配的事件，如果过滤后没有事件剩余，则管道将停止执行。
> - 第三个是 `FilterBySourceName` 函数，该函数将删除与配置的 `SourceNames` 匹配或不匹配的事件，如果过滤后没有事件剩余，则管道执行将停止。 `SourceName` 是事件创建的源（command or resource）的名称。
> - 第四个是`FilterByResourceName`，其行为与`DeviceNameFilter`相同，但过滤事件在`ResourceName`上面的`Readings`，而不是`DeviceName`。如果过滤后没有读数剩余，则管道将停止执行。
> - SDK中提供的第五、六函数通过调用`XMLTranform`或`JSONTransform`将接受到的数据转化为XML或JSON格式。

通常，在过滤和转换所需的数据后，导出时管道的最后一步——将数据发送到需要的位置。SDK中包含三个主要函数来帮助实现这一点。第一个和第二个是`HTTPPost/HTTPPut`函数，将提供的数据POST/PUT到指定的端点，第三个是`MQTTSecretSend()`函数，将提供的数据发布到配置中指定的MQTT代理。

将参阅内置管道函数[Built-in Pipeline Functions](https://docs.edgexfoundry.org/3.1/microservices/application/sdk/api/BuiltInPipelineFunctions/)部分，以获取SDK提供的完整管道函数列表。

> [!Note]
>
> App SDK不仅提供过滤、格式化和导出等功能，还提供了更多功能。 上述简单示例旨在演示函数管道的工作方式。通过编写自己的自定义管道函数，您的自定义应用程序服务可以实现用例所要求的功能。

SDK中包含三个主要的触发器，用于启动函数管道：

1、 通过POST到`/api/v3/trigger`的HTTP触发器，并将消息（通常是EdgeX事件数据)body。

2、使用Edegx MessageBus连接，并在configuration中指定连接细节。

3、使用外部MQTT Trigger连接，并在configuration中指定连接细节。

请参阅[Triggers](https://docs.edgexfoundry.org/3.1/microservices/application/details/Triggers/) section，获取有关触发器使用的完整支持信息。



最后，可以通过在上下文中调用`.SetResponseData()`来将数据发送回触发器响应。

- 如果触发器是HTTP，则它将HTTP中响应。
- 如果触发器是EdgeX MessageBus，则它将被发布到EdgeX MessageBus中已配置的主题上。

----

# Getting Started

## Types of Application Services

应用服务有两种类型，分别是`configurable`和`custom`。本节将描述何时以及如何使用每种方法。

---

#### configurable

`App Function SDK`拥有一套完整的内置管道函数，这些函数在使用`App Service Configurable`服务时可通过配置访问。此服务使用`App Function SDK`构建，并使用配置文件来定义服务的不同独立实例。该服务包含一些内置配置文件，用与常见用例，但也可以使用自定义配置文件。如果您的用例需求可以通过内置功能满足，那么`App Service Configurable `服务就非常适合您。

有关更多详细信息，请参阅[App Service Configurable](https://docs.edgexfoundry.org/3.1/microservices/application/services/AppServiceConfigurable/Purpose/) section。

---

##### Custom

当用例需求无法仅通过内置功能满足时，需要自定义应用程序服务。此时，您必须使用App Functions SDK 无法提供的方式处理数据触发的。有关您自定义应用程序服务可以使用的所有功能的详细信息，请参阅[App Service Configurable](https://docs.edgexfoundry.org/3.1/microservices/application/services/AppServiceConfigurable/Purpose/) section。

---

### Template

为了帮助您加速创建新的自定义应用程序服务，App Function SDK包含一个用于创建新的自定义应用程序服务模板。此模板代码中包含`TODOs`和一个`README`文件，它们将引导您创建新的自定义应用程序服务。有关详细信息，请参阅README文件。

---

### Triggers

`Triggers`在`Configurable`和`Custom`应用程序服务中都是通用的。它们是下一个您最需要舒徐的逻辑。有关详细信息，参阅[Triggers](https://docs.edgexfoundry.org/3.1/microservices/application/details/Triggers/) .

---

### Configuration

对于可配置和自定义应用程序服务 ，了解服务配置非常重要。应用程序服务配置文档分为三个部分。首先是所有EdgeX服务通用的配置，其次是所有应用程序服务通用的配置，第三部分是App Service 可配置的配置。有关每个部分详细信息，请参阅以下章节。

- [EdgeX Common Configuration
  EdgeX 通用配置](https://docs.edgexfoundry.org/3.1/microservices/configuration/CommonConfiguration/)
- [Application Service Common Configuration
  应用服务通用配置](https://docs.edgexfoundry.org/3.1/microservices/application/Configuration/)
- [App Service Configurable Configuration
  应用服务可配置配置](https://docs.edgexfoundry.org/3.1/microservices/application/services/AppServiceConfigurable/Configuration/)

### Examples

有许多示例自定义应用程序服务，是开始熟悉应用程序的最好起点。请参阅应用程序服务[Application Service Examples](https://docs.edgexfoundry.org/3.1/examples/AppServiceExamples/) 以获取完整列表和链接。它们包括App Service Configuration的示例配置文件。

---

## Configuration

> [!Note]
>
>  Consul将在EdgeX 4.0中弃用，core-keeper将成为新的注册和配置提供者。

与其他EdgeX服务类似，应用服务程序首先由/res文件夹中的`configuration.yaml`确定。一旦加载，将应用任何环境覆盖。如果`-cp`在启动时传递给应用程序，SDK将利用特定的配置提供程序（即Consul）将配置推送到运行的服务程序并监控`Writeable`配置，任何环境覆盖都将应用于推送值之前。您将在Cousul的edgex/v3/key下找到配置。在重新启动服务时，服务将从提供者拉去配置。

本届描述了SDK提供的、仅适用于应用服务的配置元素。

首先请参考通用配置文档[Configuration documentation](https://docs.edgexfoundry.org/3.1/microservices/configuration/CommonConfiguration/)，了解所有EdgeX服务共有的配置属性。

>  [!Important]
>
> EdgeX3.1新增了文件URL，允许通过URL远程位置拉去私有配置文件，而不是从本地文件系统。有关详细信息，参阅配置文件命令行 [Config File Command-line](https://docs.edgexfoundry.org/3.1/microservices/configuration/CommonCommandLineOptions/#config-file)部分。

> [!Note]
>
> 下面的配置值名称中的`*`表示这些值是从应用程序服务通用配置中拉取的，因此它们不在各个应用程序的私有配置文件中，除非覆盖通用值。

> 下面的选项卡提供了可写部分中的附加条目，这些适用于应用程序服务。

> https://docs.edgexfoundry.org/3.1/microservices/application/Configuration/
>
> 详细请参考官方文档



----



# Additional Details

### Command-Line Options

---

### Environment Variables

---

### Seeding Secrets

播种密钥

---

### Triggers

----

#### Introduction

触发器决定了应用程序服务函数管道的执行方式。触发器由`configuration.yaml`配置部分确定。

App Function SDK支持的4中类型在本文档中进行了讨论：

1. EdgeX Message Bus - 作为App Services接受来自EdgeX核心数据/设备服务的Events的默认触发器，这是大多数用例的触发方式。
2. External MQTT -  当从外部/云MQTT代理接受命令时非常有用。
3. HTTP - 在开发测试自定义函数期间非常有用。
4. Custom - 允许自定义应用程序服务实现自己的自定义触发器。

#### EdgeX MessageBus Trigger

每次从配置的Edgex消息总线`SubscribeTopics`接受数据时，Edgex消息总线触发器将执行管道。EdgeX消息总线是EdgeX内部的消息总线，它有一个特定的消息封装，用于封装发布到该消息总线上的所有数据。

目前由四种EdgeX消息总线的实现可供使用。其中两种是开箱即用的：`Redis Pub/Sub`（默认）和`MQTT`。此外还可以通过上述构建标志提供NATS（包括核心和Jet Stream）选项。实现是通过以下[Trigger.EdgexMessageBus]配置选择的。

##### Type Configuration

类型配置

> [!Tip]
>
> 示例触发器
>
> ```yaml
> Trigger:
>   Type: "edgex-messagebus"
> ```

上述示例中，`Type`被设置为`edgex-messagebus`触发类型，因此数据将从EdgeX消息总线接手。并且如果配置了发布，还可以发布到数据EdgeX消息总线。

##### Subscribe/Publish Topics

###### SubscribeTopics

> 订阅主题配置指定了服务将订阅的主题都好分隔列表。

> [!Note]
>
> 默认`SubscribeTopics`配置在应用服务公共触发器配置中设置[App Services Common Trigger Configuration](https://docs.edgexfoundry.org/3.1/microservices/application/Configuration/#not-writable).

###### PublishTopics

发布主题配置指定了当`ctx.SetResponseData([]byte outputData)`API设置`ResponseData`时发布的主题。如果为设置发布主题或`ResponseData` 从未设置，则不会发布任何内容。

> [!Note]
>
> 默认`PublishTopic`配置在应用程序服务公共触发器配置中设置

##### MessageBus Connection Configuration

消息总线连接配置

请参阅[EdgeX MessageBus section](https://docs.edgexfoundry.org/3.1/microservices/general/messagebus/)获取完整详细信息。

> [!Important]
>
> 对于EdgeX3.0，消息总线配置设置在通用消息总线配置中。[Common MessageBus Configuration](https://docs.edgexfoundry.org/3.1/microservices/configuration/CommonConfiguration/#common-configuration-properties)

##### Filter By Topics 

应用服务现在可以按 EdgeX 消息总线主题进行筛选，而不是在函数管道中使用筛选函数。按主题筛选更高效，因为应用服务永远不会从消息总线接收数据。核心数据和/或设备服务现在发布到包含 `profilename` 、 `devicename` 和 `sourcename` 的多级主题。来源是生成事件的 `commandname` 或 `resourcename` 。发布主题现在看起来像这样：

```
# From Core Data
edgex/events/core/<device-service>/<profile-name>/<device-name>/<source-name>

# From Device Services
edgex/events/device/<device-service>/<profile-name>/<device-name>/<source-name>
```

此功能使应用服务能够拥有多个订阅，从而允许通过订阅进行多次筛选。 `SubscribeTopics` 设置接受以逗号分隔的订阅主题列表。

下面是一些配置 `SubscribeTopics` 设置的示例，该设置位于 `Trigger.EdgexMessageBus.SubscribeHost` 部分，以使用来自 [此处](https://github.com/edgexfoundry/device-snmp-go/tree/v3.1/cmd/res) SNMP 设备服务文件的 `profile` 、 `device` 和 `source` 名称进行订阅筛选：

- Filter for all Events (default in common Trigger configuration)
  筛选所有事件（在常见的触发器配置中为默认值）

```
Trigger:
  SubscribeTopics: "events/#"
```

- Filter for Events only from a single class of devices (device profile defines a class of device)
  仅过滤来自单个设备类别的事件（设备配置文件定义了设备类别）

```
Trigger:
  SubscribeTopics: "events/+/+/trendnet/#"
```

- Filter for Events only from a single actual device
  仅过滤来自单个实际设备的事件

```
Trigger:
  SubscribeTopics: "edgex/events/+/+/+/trendnet01/#"
```

- Filter for Events from two specific actual devices
  筛选来自两个特定实际设备的事件

```
Trigger:
  SubscribeTopics: "edgex/events/+/+/+/trendnet01/#, edgex/events/+/+/+/trendnet02/#"
```

- Filter for Events from two specific sources.
  筛选来自两个特定来源的事件。

```
Trigger:
  SubscribeTopics: "edgex/events/+/+/+/+/Uptime, edgex/events/+/+/+/+/MacAddress"
```




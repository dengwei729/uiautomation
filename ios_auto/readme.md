# iPhone - UI自动化测试框架

## 介绍
### 环境配置
- 安装xcode最新版本
- 安装xcode命令行工具

### 工程结构
- runScripts: 工程执行文件: 包括ipa安装,用例执行,报告生成 等

- src: 用例源码:
    - framework: 底层框架
        - 主要关注Finder, 提供了仿selenium的接口,findElementBy* 全局查找元素
    - business: 业务层 (framework层,并未对UIAutomation进行完全抽离,部分业务接口需直接调用UIAutomation接口进行实现)
    - cases: 用例case层
    - data: 用例使用到的数据

### case编写流程
#### 业务层封装
1. 在business业务层中,定义自己的业务封装
2. 在importall.js 中引入新增的js业务类

#### 用例编写
1. 在data文件夹中定义自己的用例数据
2. 在cases文件夹下,编写用例,只调用business层声明的方法

### 用例执行
1. 进入runScripts目录下: 执行 sh runFuntionsTest3.sh alltest(TestType) .
2. 根据入参会执行对应的用例
3. 用例执行完毕后,所有中间日志都在output目录中


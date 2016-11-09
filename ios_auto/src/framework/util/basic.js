/**
 * User: dengwei
 * Date: 16-7-18
 * Time: 下午4:14
 * Author: dw113073
 * Description: 基础类
 */

var basic = {

    init: function () {//唤起app，并打印测试信息
        var targetName = this.target().name();
        var appName = this.target().frontMostApp().name();
        var deviceModel = this.target().model();
        var osVersion = this.target().systemVersion();
        var osName = this.target().systemName();
        var appVersion = this.target().frontMostApp().bundleID();
        UIALogger.logStart("UI驱动开始...");
        UIALogger.logMessage("调试包名称：" + appName);
        UIALogger.logMessage("测试包版本：" + appVersion);
        UIALogger.logMessage("设备名称：" + targetName);
        UIALogger.logMessage("设备型号：" + deviceModel);
        UIALogger.logMessage("系统版本：" + osVersion);
        UIALogger.logMessage("操作系统类型：" + osName);
        UIALogger.logMessage("monkeyInfoLabel: " + UIATarget.localTarget().systemVersion() + " " + UIATarget.localTarget().name());
    },

    isNewMain:function(){
        return true;
    },

    appVersion: function(){
      return this.target().frontMostApp().bundleID();
    },

    screenRect: function () {//获取当前app的主window
        return this.target().rect();
    },

    body: function () {//获取当前app的主window
        return this.target().frontMostApp().mainWindow();
    },

    app: function () {//获取当前设备的frontMostApp
        return this.target().frontMostApp();
    },

    target: function () {//获取当前设备的localTargetjj
        return UIATarget.localTarget();
    },

    /**
     * 获取当前设备的mainWindow
     * @returns {*}
     */
    window: function () {//获取当前设备的localTargetjj
        return UIATarget.localTarget().frontMostApp().mainWindow();
    },

    /**
     * 调用shell，key是对应.sh文件的绝对路径。不能执行sudo权限的脚本。
     * @param key
     */
    shell: function (key) {
        var result = this.target().host().performTaskWithPathArgumentsTimeout("/bin/sh", [key], 5);
        // basic.say("exitCode: " + result.exitCode);
        basic.say("stdout: " + result.stdout);
        // basic.say("stderr: " + result.stderr);
    },

    wait: function (seconds) {//等待数秒。seconds是秒数。
        this.target().delay(seconds);
    },

    // tap: function(ele){//根据位置信息，强行点击一个控件.
    //     if(ele==null){
    //         this.warning('basic.tap()并没有受到合法参数！');
    //         return null;
    //     }
    //     var tapPointHorizontal =parseFloat(ele.rect().origin.x+(0.5*ele.rect().size.width));
    //     var tapPointVertical =parseFloat(ele.rect().origin.y+(0.5*ele.rect().size.height));
    //     // basic.say(''+ele.rect().origin.x);
    //     // basic.say(''+ele.rect().origin.y);
    //     // basic.say(''+ele.rect().size.width);
    //     // basic.say(''+ele.rect().size.height);
    //
    //     // this.say("the x is "+tapPointHorizontal+" and the y is "+tapPointVertical);
    //     this.target().tap({x:tapPointHorizontal,y:tapPointVertical});
    // },

    tree: function () {//在log中打印控件树.
        this.target().logElementTree();
    },

    longTap: function (tmpX, tmpY) {//长按某点。tmpX和tmpY分别是某点的xy坐标。
        this.target().tapWithOptions(
            {x: tmpX, y: tmpY},
            {
                duration: 2
            }
        );
        this.wait(miniSleep);
    },
    flickUp: function (element) {//向上滑动控件。rate滑动对比控件本身比例
        element.flickInsideWithOptions({startOffset: {x: 0.5, y: 0.8}, endOffset: {x: 0.5, y: 0.2}});
        this.wait(miniSleep);
    },
    flickDown: function (element) {//向下滑动控件。rate滑动对比控件本身比例
        element.flickInsideWithOptions({startOffset: {x: 0.5, y: 0.2}, endOffset: {x: 0.5, y: 0.8}});
        this.wait(miniSleep);
    },
    flickLeft: function (element) {//向左滑动控件。rate滑动对比控件本身比例
        element.flickInsideWithOptions({startOffset: {x: 0.8, y: 0.5}, endOffset: {x: 0.2, y: 0.5}});
        this.wait(miniSleep);
    },
    flickRight: function (element) {//向右滑动控件。rate滑动对比控件本身比例
        element.flickInsideWithOptions({startOffset: {x: 0.2, y: 0.5}, endOffset: {x: 0.8, y: 0.5}});
        this.wait(miniSleep);
    },
    rollUp: function (key) {//向上划动。key为空时，在屏幕中间向上划。key不为空时，则在数字key标定的横坐标向上划
        var position;

        if (key == null) {
            position = this.target().rect().size.width * 0.5;

        } else {
            position = key;
        }
        this.target().dragFromToForDuration(
            {x: position, y: this.target().rect().size.height * 0.7},
            {x: position, y: this.target().rect().size.height * 0.3},
            0.5
        );
        this.wait(miniSleep);
    },
    rollWithPosition: function (startX,startY,endX,endY) {
        this.target().dragFromToForDuration(
            {x: startX, y: startY},
            {x: endX, y: endY},
            0.5
        );
        this.wait(miniSleep);
    },

    rollDown: function (key) {//向下划动。key为空时，在屏幕中间向上划。key不为空时，则在数字key标定的横坐标向上划
        var position;

        if (key == null) {
            position = this.target().rect().size.width * 0.5;

        } else {
            position = key;
        }
        this.target().dragFromToForDuration(
            {x: position, y: this.target().rect().size.height * 0.3},
            {x: position, y: this.target().rect().size.height * 0.7},
            0.5
        );
        this.wait(miniSleep);
    },

    rollLeft: function (key) {//向左划动。key为空时，在屏幕中间向左划。key不为空时，则在数字key标定的纵坐标向左划
        var position;

        if (key == null) {
            position = this.target().rect().size.height * 0.5;

        } else {
            position = key;
        }
        this.target().dragFromToForDuration(
            {x: this.target().rect().size.width * 0.7, y: position},
            {x: this.target().rect().size.width * 0.3, y: position},
            0.5
        );
        this.wait(miniSleep);
    },
    longRollLeft: function (key) {//向左划动。key为空时，在屏幕中间向左划。key不为空时，则在数字key标定的纵坐标向左划
        var position;

        if (key == null) {
            position = this.target().rect().size.height * 0.5;

        } else {
            position = key;
        }
        this.target().dragFromToForDuration(
            {x: this.target().rect().size.width * 0.9, y: position},
            {x: this.target().rect().size.width * 0.1, y: position},
            0.5
        );
        this.wait(miniSleep);
    },
    rollRight: function (key) {//向右划动。key为空时，在屏幕中间向右划。key不为空时，则在数字key标定的纵坐标向右划
        var position;

        if (key == null) {
            position = this.target().rect().size.height * 0.5;

        } else {
            position = key;
        }
        this.target().dragFromToForDuration(
            {x: this.target().rect().size.width * 0.3, y: position},
            {x: this.target().rect().size.width * 0.7, y: position},
            0.5
        );
        this.wait(miniSleep);
    },

    rotate: function () {//旋转地图180度
        this.target().rotateWithOptions(
            {x: this.target().rect().size.width * 0.5, y: this.target().rect().size.height * 0.5},//手势中心点坐标
            {
                duration: 1, //手势时长
                radius: this.target().rect().size.width * 0.1, //半径
                rotation: Math.PI, //旋转角度
                touchCount: 2
            }//手势手指个数
        );
        this.wait(miniSleep);
    },

    photo: function (key) {//截图，key是图片名称
        this.target().captureRectWithName({
            origin: {x: 0, y: 20},
            size: {width: this.target().rect().size.width, height: this.target().rect().size.height - 20}
        }, key);
    },

    /**
     * 点击屏幕坐标
     * @param x
     * @param y
     */
    tap: function (x, y) {
        this.target().tap({x: x, y: y});
    },

    /**
     * 点击一个横向控件的一部分。key1是块数,key2是第几块
     * @param ele
     * @param key1
     * @param key2
     */
    tapPart: function (ele, key1, key2) {
        var step = (1 / key1) * ele.rect().size.width;
        var tapPointHorizontal = parseFloat(ele.rect().origin.x + (key2 - 0.5) * step);
        var tapPointVertical = parseFloat(ele.rect().origin.y + (0.5 * ele.rect().size.height));

        this.target().tap({x: tapPointHorizontal, y: tapPointVertical});
    },

    randomItem: function (arr) {//输入一个数组，返回数组中的随机一个成员
        var i = Math.round(Math.random() * (arr.length - 1));

        return arr[i];
    },

    randomNum: function (min, max) {//给出一个随机整数，取值范围是[min,max]
        return Math.round(Math.random() * (max - min)) + min;
    },

    /**
     * 锁屏
     * @param times : 单位为秒
     */
    lock: function (times) {//锁屏key秒后再解锁。若key为空则默认锁2秒。
        var seconds;
        if (key == null) {
            seconds = 2;
        } else {
            seconds = key;
        }
        basic.target().lockForDuration(seconds);
    },

    /**
     * app置后台
     * @param times: 单位为秒
     */
    home: function (times) {//点击home键把app切后台，key秒后再切回来。key为空则默认2秒后切回来。
        var seconds;
        if (key == null) {
            seconds = 2;
        } else {
            seconds = key;
        }
        basic.target().deactivateApp(seconds);
    },

    setDeviceOrientationUp: function () {//调整手机的重力感应，让手机以为自己是正向摆放的。
        basic.target().setDeviceOrientation(UIA_DEVICE_ORIENTATION_PORTRAIT);
    },

    setDeviceOrientationDown: function () {//调整手机的重力感应，让手机以为自己是倒立摆放的。
        basic.target().setDeviceOrientation(UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN);
    },

    setDeviceOrientationLeft: function () {//调整手机的重力感应，让手机以为自己是左边向下摆放的。
        basic.target().setDeviceOrientation(UIA_DEVICE_ORIENTATION_LANDSCAPELEFT);
    },

    setDeviceOrientationRight: function () {//调整手机的重力感应，让手机以为自己是右边向下摆放的。
        basic.target().setDeviceOrientation(UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT);
    },

    voiceUp: function (key) {//点击音量增大按钮。key是点击次数，key为空时默认点一下。
        var times;
        if (key == null) {
            times = 1;
        } else {
            times = key;
        }
        for (var i = 0; i < times; i++) {
            this.target().clickVolumeUp();
            this.wait(0.3);
        }
    },

    voiceDown: function (key) {//点击音量减小按钮。key是点击次数，key为空时默认点一下。
        var times;
        if (key == null) {
            times = 1;
        } else {
            times = key;
        }
        for (var i = 0; i < times; i++) {
            this.target().clickVolumeDown();
            this.wait(0.3);
        }
    },

    back: function () {//点击左上角返回按钮
        this.target().tap({x: 27, y: 45});
        this.wait(miniSleep);
    }

}

var eleObject = {
    info: {
        name: '未命名控件',
        part: 1,
    },
    name: function () {
        return this.info.name;
    },
    head: function () {
        basic.say("将要操作\"" + this.info.name + "\"控件了哦");

    },
    tail: function () {
        basic.say("已经操作过\"" + this.info.name + "\"控件了哦");

    },
    part: function () {
        return this.info.part;
    },
}
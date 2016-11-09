/**
 * Created with JetBrains WebStorm.
 * User: dengwei
 * Date: 13-8-3
 * Time: 下午4:08
 * To change this template use File | Settings | File Templates.
 */

/**
 * 等待网络加载取消，目前只支持验证“正在加载的这种情况”
 * 目前在iOS5.* 及 iOS6.* 验证通过。
 */
function waitForLoadingDisappear() {
    var index = 0;

    basic.wait(miniSleep);
    while (!isNil(Finder.findElementByName("正在加载...", basic.app()))) {
        basic.wait(maxSleep);
        index ++ ;

        if (index > 5) {
            fail("网络加载超时");
        }
    }
    // 给出一定时间等待网络加载完后，页面切过去
    UIATarget.localTarget().delay(midSleep);
}


/**
 * 重写onAlert方法，不做任何操作
 * @param alert
 * @returns {boolean}
 */
UIATarget.onAlert = function onAlert(alert) {
    var title = alert.name();
    // if (title == "将清空所有缓存，是否继续？") {
    //     basic.say("标题匹配成功");
    //     alert.buttons()["立即清空"].tap();
    //     return true;
    // }
    // if (title == "清空历史记录？") {
    //     basic.say("标题匹配成功");
    //     alert.buttons()["立即清空"].tap();
    //     return true;
    // }
    if (title == "大人，用着满意请打赏小德好评吧！") {
        basic.say("标题匹配成功");
        alert.buttons()["残忍拒绝"].tap();
        return true;
    }
    return true;
}

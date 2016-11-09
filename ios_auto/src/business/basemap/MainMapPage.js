/**
 * @description 主图页面
 */

var MainMapPage= {


    /**
     * @description 点击进入搜索页面
     */
    clickSearchBar: function () {
        Logger.debug("点击进入搜索页面 ");
        Finder.findElementByName("主图-搜索框").tap();
        basic.wait(miniSleep);
    },

}

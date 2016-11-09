/**
 * Created with JetBrains WebStorm.
 * User: dw113073
 * Date: 16-8-3
 * Time: 下午4:08
 * To change this template use File | Settings | File Templates.
 */

var Finder = {

    elementsArray: null,

    /**
     * 根据name来获取对应元素
     * @param name: 元素名称
     * @param parent: 开始获取的层级
     * @param isFuzzy: 是否模糊查找,默认模糊查找
     * @param isVisible: 是否只查找可见元素,默认只查找可见的
     * @returns {null}
     */
    findElementByName: function(name, parent, isFuzzy, isOnlyVisible) {

        if (isOnlyVisible == null) {
            isOnlyVisible = true;
        }

        if (isFuzzy == null) {
            isFuzzy = true;
        }

        if (!parent) {
            parent = UIATarget.localTarget().frontMostApp().mainWindow();
        }

        var element = null;
        var start = (new Date()).getTime();
        var timeout = UIATarget.localTarget().timeout();
        UIATarget.localTarget().setTimeout(0);

        while (((new Date()).getTime() - start) < (maxSleep * 1000) || timeout == 0) {

            element = this._searchElements(parent, name, "name", isFuzzy, isOnlyVisible);
            if (!isNil(element)) {
                break;
            }
            UIATarget.localTarget().delay(0.1);
        }
        UIATarget.localTarget().setTimeout(timeout);

        if (isNil(element)) {
            Logger.debug("没有找到对应元素-"+name+"-,返回null");
        }
        return element;
    },

    /**
     * 根据value来获取对应元素
     * @param name
     * @param parent
     * @param isFuzzy
     * @param isVisible
     * @returns {*}
     */
    findElementByValue: function(value, parent, isFuzzy, isOnlyVisible){

        if (isOnlyVisible == null) {
            isOnlyVisible = true;
        }

        if (isFuzzy == null) {
            isFuzzy = true;
        }


        if (!parent) {
            parent = UIATarget.localTarget().frontMostApp();
        }

        var start = (new Date()).getTime();
        var timeout = UIATarget.localTarget().timeout();
        var result;

        UIATarget.localTarget().setTimeout(0);
        while (((new Date()).getTime() - start) < (maxSleep * 1000) || timeout == 0) {
            result = this._searchElements(parent, value, "value", isFuzzy, isOnlyVisible);
            if (!isNil(result)) {
                break;
            }
            UIATarget.localTarget().delay(0.1);

        }
        UIATarget.localTarget().setTimeout(timeout);

        return result;
    },

    /**
     * 根据type 获取元素
     * @param root
     * @param type : TableView, ScrollView ……
     * @param index
     * @returns {*}
     */
    findElementByType:function(type, root, isOnlyVisible) {
        var _element = null;
        var timeout = UIATarget.localTarget().timeout();

        if (isOnlyVisible == null) {
            isOnlyVisible = true;
        }

        UIATarget.localTarget().setTimeout(0);
        eles = this._findElementsByClassType(type, root);

        if (isOnlyVisible) {
            for (var i=eles.length-1; i>=0; i--) {
                if (eles[i].isVisible()) {
                    _element = eles[i];
                    break;
                }
            }
        } else {
            if (eles.length >0) {
                _element = eles[0];
            }
        }
        UIATarget.localTarget().setTimeout(timeout);
        return _element;
    },

    _findElementsByClassType: function(classType, parent){
        var timeout = UIATarget.localTarget().timeout();
        UIATarget.localTarget().setTimeout(0);

        if (!parent) {
            parent = UIATarget.localTarget().frontMostApp();
        }
        var elementList = new Array();
        this.elementsArray = null;
        this.elementsArray = new Array();
        this._searchAllElements(parent);
        for(var i = 0;i < this.elementsArray.length;i++){
            if (this.elementsArray[i].toString() == "[object UIA"+classType+"]" ){
                elementList.push(this.elementsArray[i]);
            }
        }

        UIATarget.localTarget().setTimeout(timeout);
        return elementList;
    },

    findElementByNameAndClassType: function(name, classType, parent){
        if (!parent) {
            parent = UIATarget.localTarget().frontMostApp();
        }
        var result = null;
        var timeout = UIATarget.localTarget().timeout();
        try {

            UIATarget.localTarget().setTimeout(0);
            result = parent.withName(name);

            var elementList = this._findElementsByClassType(classType, parent);
            for(var i=0; i<elementList.length; i++){
                if (!this.isNil(elementList[i].withPredicate("name contains '"+name+"'")) ){
                    result = elementList[i];
                    break;
                }
            }
        }finally{
            UIATarget.localTarget().setTimeout(timeout);
        }

        return result;
    },

    /**
     * 获取列表中包含某元素的cell
     * @param tableview对象
     * @param name
     * @returns {*}
     */
    findListChild: function(name, tableview){

        var tableElements = tableview.elements();
        var ele = null;

        var timeout = UIATarget.localTarget().timeout();
        UIATarget.localTarget().setTimeout(0);
        for (var i = 0; i < tableElements.length; i++) {
            if (tableElements[i].name()!=null) {
                if (tableElements[i].name().indexOf(name)!=-1) {
                    ele = tableElements[i];
                    break;
                }
            }

            var element = this._searchElements(tableElements[i], name, "name", true, false);

            if (!this.isNil(element)) {
                ele = tableElements[i];
                break;
            }
        }
        UIATarget.localTarget().setTimeout(timeout);
        return ele;
    },

    /**
     * 判断元素是否为UIAElementNil
     * @param element
     * @returns {boolean}
     */
    isNil: function(element) {
        if (element==null || element.toString()== "[object UIAElementNil]") {
            return true;
        }
        return false;
    },

    isClassType:function(classType) {

    },

    /**
     * 获取列表包含某元素的cell,并将其滑至屏幕内
     * @param name
     * @param tableview
     * @returns {*}
     */
    scrollTo_And_Get: function(name, tableview){
        var cell = this.findListChild(name, tableview);
        if (isNil(cell)) {
            Logger.warn("没有找到对应cell");
            return null;
        } else {
            if (! cell.isVisible()) {
                cell.scrollTOVisible();
                basic.wait(miniSleep);
            }
            return cell;
        }
    },
    
    

    /**
     * 全局遍历查询特定元素
     * @param elem 查询的起始节点
     * @param value 对应属性值
     * @param key   对应元素属性
     * @param isFuzzy 是否模糊查询,默认是查询
     * @param isOnlyVisible 是否
     * @returns {*}
     * @private
     */
    _searchElements: function(elem, value, key, isFuzzy, isOnlyVisible) {

        var eles = elem.elements();

        if (eles.length>0) {

            var result=null;

            // 判断是否为模糊查询
            if (isFuzzy) {
                result = eles.withPredicate(key+" contains[c] '"+value+"'");
            } else {
                result = eles.withValueForKey(value, key);
            }

            // 判断是否只搜索可见元素
            if (isOnlyVisible) {
                for (var index=0; index<result.length; index++) {

                    if (result[index].name().indexOf("账号密码登录") != -1) {
                        Logger.debug(" "+result[index].name()+":"+result[index].isVisible());
                    }

                    if (result[index].isVisible()) {
                        return result[index];
                    }
                }
            } else {
                if (result.length > 0) {
                    return result[0];
                }
            }


            for (var index=0; index<eles.length; index++) {

                var search_result = this._searchElements(eles[index], value, key, isFuzzy, isOnlyVisible);
                if (!this.isNil(search_result)) {
                    return search_result;
                }
            }
        }

        return null;

    },

    _searchAllElements: function(root) {

        try {
            var elelist  = root.elements();
            for (var i =0; i<elelist.length; i++) {
                var ele = elelist[i];
                this.elementsArray.push(ele);

                if (ele.elements()!=null &&ele.elements().length!=0 )
                {
                    this._searchAllElements(ele);
                }
            }
        } finally {
        }
    },

}

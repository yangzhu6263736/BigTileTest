//累计登陆视图控制器
var display = require("Display");
var VO = {
    DragVO : {//扡动事件
        offset : {x:0, y:0},
        startPoint : {x:0, y:0},
        isDrag : false//是否是拖动
    }
};
cc.Class({
    name:"WorldMapMediator",
    extends: cc.Component,
    properties: {
    },
    onLoad: function () {
        // this._super()
        this.cityMap = {}
    },
    onExit:function(){
        cc.log("onexit")
    },
    preload:function(cb) {
         var list = [
            ['big', cc.TiledMapAsset],
        ];
        display.preload(list, function(is, per){
            if (is) cb();
        })
    },

    setNodePosition:function(x, y){
        this.node.setPosition(x - 480, y - 320)
    },
    getNodePosition:function (argument) {
        var _p = this.node.getPosition()
        _p.x += 480
        _p.y += 320
        return _p
    },
    getMapSize:function(){
        var size = this.node.getComponent(cc.TiledMap).getMapSize()
        var tieldSize = this.node.getComponent(cc.TiledMap).getTileSize()
        var mapSize = cc.size(size.width * tieldSize.width, size.height * tieldSize.height)
        // cc.log("getMapSize", mapSize)
        return mapSize
    },
    start:function(){
        var self = this
        // this.cityNode.setPosition(0, 0)
        this.preload(function(){
             cc.director.setDisplayStats(true)
            self.initTouchEvent()
            var tmxAsset = display.getTmxAsset('big')
            self.node.getComponent(cc.TiledMap).tmxAsset = tmxAsset
            //特效层
            self.showTilesAtDisplayPoint(cc.p(480, 320))
        })
    },

    //取得地图处于屏幕正中间的点
    //地图anchor 0, 0.5
    getDisplayCenterPoint:function(){
        var size = this.getMapSize()
        var anchor = this.node.getAnchorPoint()
        var point = this.getNodePosition()
        var scale = this.node.getScale()
        var p = cc.p((480 - point.x) / scale, (320 - point.y) / scale )
        p.x = parseInt(p.x)
        p.y = parseInt(p.y)
        // cc.log("getDisplayCenterPoint", size, anchor, point, scale, p.x, p.y)
        return p
    },

    getMapFullSize:function(){
        var size = this.node.getComponent(cc.TiledMap).getMapSize()
        var tieldSize = this.node.getComponent(cc.TiledMap).getTileSize()
        return cc.size(size.width * tieldSize.width, size.height * tieldSize.height)
    },

    //处理地图拖动相关
    initTouchEvent:function(){
        var self = this
        // 添加单点触摸事件监听器
        var listener = {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touches, event) {
                cc.log('Touch Began: ' , event);
                self.drag = cc.instantiate(VO.DragVO)
                var startPoint = cc.instantiate(touches.getLocation())
                var mapStartPoint = self.node.getPosition()
                self.drag.startPoint = startPoint
                self.drag.offset.x = mapStartPoint.x - startPoint.x;
                self.drag.offset.y = mapStartPoint.y - startPoint.y;
                return true; //这里必须要写 return true 
            },
            onTouchMoved: function (touches, event) {
                // cc.log('Touch Moved: ' + event);
                var point = touches.getLocation()
                if (cc.pDistance(point, self.drag.startPoint) > 2) {//是移动
                    self.drag.isDrag = true
                    var p = cc.p(point.x + self.drag.offset.x, point.y + self.drag.offset.y)
                    self.node.setPosition(p)
                }
            },
            onTouchEnded: function (touches, event) {
               // cc.log('Touch Ended: ' + event);
                if (self.drag.isDrag) {
                    self.onPositionChange(touches.getLocation())
                } else {
                    
                }
            },
            onTouchCancelled: function (touches, event) {
               // cc.log('Touch Cancelled: ' + event);
                if (self.drag.isDrag) {
                    self.onPositionChange(touches.getLocation())
                }
            }
        }
        // 绑定单点触摸事件
        cc.eventManager.addListener(listener, this.node);
    },

    onPositionChange:function(p){
         this.showTilesAtDisplayPoint(cc.p(480, 320))
    },

    //地图中心点0 0.5的坐标取对应点所在xy
    getTileXYByInMapPosition:function(p){
        var tieldSize = this.node.getComponent(cc.TiledMap).getTileSize()
        var mapSize = this.node.getComponent(cc.TiledMap).getMapSize()
        var TileW = tieldSize.width
        var TileH = tieldSize.height
        var N = p.x/TileW - p.y/TileH
        var M = p.x/TileW + p.y/TileH
        var x = N
        var y = mapSize.height - M
        // cc.log("getTileXYByInMapPosition", p, x, y)
        x = parseInt(x)
        y = parseInt(y)
        return cc.p(x, y)
    },

    //取得外部某点相对于地图0,0.5的距离
    getDisplayPointToMapZeroHalf:function(p)
    {
        var fullSize = this.getMapFullSize()
        var anchor = this.node.getAnchorPoint()
        var mp = this.getNodePosition()
        var scale = this.node.getScale()
        var _x = (fullSize.width * anchor.x - mp.x + p.x) / scale;
        var _y = (fullSize.height * anchor.y - mp.y + p.y - fullSize.height / 2) / scale;
        var off = cc.p(0, 0)//转换的坐标不知道为什么存在一点稳定的偏移 先添加常规偏移量解决
        _x += off.x/scale
        _y += off.y/scale
        return cc.p(_x, _y)
    },
    //根据屏幕坐标显示格子
    showTilesAtDisplayPoint:function (p) {
         var mapPosition = this.getDisplayPointToMapZeroHalf(p)
         var tileP = this.getTileXYByInMapPosition(mapPosition)
         this.showTilesAtMapPoint(tileP.x, tileP.y)
    },

    //显示指定xy的格子 即周围正负3的格子
    //移除超过x y 多少的格子
    showTilesAtMapPoint:function(x, y){
        // cc.log("showTilesAtMapPoint", x, y)
        var layers = this.node.getComponent(cc.TiledMap).allLayers()
        for (var i in layers) {
            layers[i].setupTilesBeyondPos(cc.p(x, y), 11)
        }
    },

    close:function(){
    }
});
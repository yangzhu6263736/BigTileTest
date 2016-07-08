require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Display":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'c8b87P+xhNIsoVPy2FtWh1o', 'Display');
// Script/Display.js

//加载资源枚举
var SourceTypeEnum = cc.Enum({
    'Asset': 1,
    'RawAsset': 2
});
var Display = cc.Class({
    properties: {
        //所有预置的引用
        perfabMaps: {
            'default': {}
        },
        //所有图片帧的引用
        spriteFrameMaps: {
            'default': {}
        },
        //所有图集的引用
        spriteAtlasMaps: {
            'default': {}
        },
        //所有地图引用
        tiledMapAssetMaps: {
            'default': {}
        }
    },
    ctor: function ctor() {
        // 声明实例变量并赋默认值
        cc.log("Display:ctor");
    },
    //添加精灵图集框架
    //如果plist和png资源均未预加载则会触发io
    //可理解为阻塞式加载
    addSpriteFrames: function addSpriteFrames(plist, png) {
        cc.spriteFrameCache.addSpriteFrames(plist, png);
    },
    //预加载
    //list array
    preload: function preload(list, cb) {
        var total = list.length;
        var _t = 0;
        var self = this;
        var type = '';
        var url = "";
        for (var i in list) {
            url = list[i][0];
            type = list[i][1];
            this.load(url, type, function (err, res) {
                _t++;
                if (_t == total) return cb(true, 100);
                cb(false, parseInt(100 * _t / total));
            });
        }
    },
    //加载预制资源
    //image.png/image, prefab, anim
    //url:View/UI/DarkMaskLayer 对应 /assert/resource/View/UI/DarkMaskLayer
    //如果有图集图片等包函在预制中则会被同步加载
    load: function load(url, type, cb) {
        // cc.log("loadAsset", url)
        var self = this;
        cc.loader.loadRes(url, type, function (err, res) {
            // cc.log("loadAsset cb", url, err, res)
            if (err) return cb(err, res);
            if (res instanceof cc.Prefab) {
                self.perfabMaps[res._name] = res;
            } else if (res instanceof cc.SpriteFrame) {
                self.spriteFrameMaps[res._name] = res;
            } else if (res instanceof cc.SpriteAtlas) {
                self.spriteAtlasMaps[res._name] = res;
            } else if (res instanceof cc.TiledMapAsset) {
                self.tiledMapAssetMaps[res._name] = res;
            }
            // cc.log(self.spriteFrameMaps)
            // cc.log(self.spriteAtlasMaps)
            cb(false, res);
        });
    },
    //加载图片图集等资源文件
    //加载plist会自动加载对应的Png
    //url 写法 textures/combat_enveffect_bosswarn.plist 对应 asset/resource/textures/combat_enveffect_bosswarn.plist
    loadRawAsset: function loadRawAsset(url, cb) {
        cc.loader.loadRes(url, function (err, spriteFrame) {
            cc.log("combat_enveffect_bosswarn done", err, spriteFrame);
            cb(err, spriteFrame);
        });
    },

    //在当前场影弹出一个tip提示
    tip: function tip(message) {
        cc.log("diaplay.tip", "message");
        var prefabNme = 'View/UI/tip';
        this.loadPerfab(prefabNme, function (err, prefab) {
            if (err) return cc.assert(err, prefabNme + '加载失败');
            var viewNode = cc.instantiate(prefab);
            var label = viewNode.getComponentInChildren(cc.Label);
            label.string = message;
            // require('GM').getRunningSceneMediator().node.addChild(viewNode, 30)
            // cc.director.getScene().addChild(viewNode)
            // self.node.addChild(viewNode)
            // self.pushView(viewNode);
        });
    },
    //UI锁定
    uiLock: function uiLock(message) {
        var self = this;
        if (!message) {
            message = "";
        }
        var prefabNme = 'View/UILock/UILock';
        this.loadPerfab(prefabNme, function (err, prefab) {
            if (err) return cc.assert(err, prefabNme + '加载失败');
            self.viewNode = cc.instantiate(prefab);
            var label = self.viewNode.getChildByName("message").getComponent(cc.Label);
            label.string = message;
            // require('GM').getRunningSceneMediator().node.addChild(self.viewNode, 30)
            // cc.director.getScene().addChild(viewNode)
            // self.node.addChild(viewNode)
            // self.pushView(viewNode);
        });
    },
    uiUnLock: function uiUnLock() {
        var self = this;
        if (!this.viewNode) {
            setTimeout(function () {
                self.uiUnLock();
            }, 200);

            return;
        }
        // require('GM').getRunningSceneMediator().node.removeChild(this.viewNode)
    },
    loadPerfab: function loadPerfab(perfabName, cb) {
        if (this.perfabMaps[perfabName]) return cb(false, this.perfabMaps[perfabName]);
        var self = this;
        this.load(perfabName, cc.Prefab, function (err, prefab) {
            if (err) return cb(err);
            self.perfabMaps[perfabName] = prefab;
            cb(false, prefab);
        });
    },
    getPrefab: function getPrefab(perfabName) {
        return this.perfabMaps[perfabName];
    },
    getSpriteFrame: function getSpriteFrame(frameName) {
        if (this.spriteFrameMaps[frameName]) return this.spriteFrameMaps[frameName];
        for (var atlasName in this.spriteAtlasMaps) {
            var atlas = this.spriteAtlasMaps[atlasName];
            if (atlas.getSpriteFrame(frameName)) return atlas.getSpriteFrame(frameName);
        }
        cc.assert(false, "frameName:" + frameName + '不存在');
    },
    getTmxAsset: function getTmxAsset(tmxName) {
        if (this.tiledMapAssetMaps[tmxName]) return this.tiledMapAssetMaps[tmxName];
        return false;
    }
});

module.exports = new Display();

cc._RFpop();
},{}],"HelloWorld":[function(require,module,exports){
"use strict";
cc._RFpush(module, '280c3rsZJJKnZ9RqbALVwtK', 'HelloWorld');
// Script/HelloWorld.js

cc.Class({
    'extends': cc.Component,

    properties: {
        label: {
            'default': null,
            type: cc.Label
        },
        text: 'Hello, World!'
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.label.string = this.text;
    },

    // called every frame
    update: function update(dt) {}
});

cc._RFpop();
},{}],"WorldMapMediator":[function(require,module,exports){
"use strict";
cc._RFpush(module, '32dd61+YtNGYLa7IqcbsQNF', 'WorldMapMediator');
// Script/WorldMapMediator.js

//累计登陆视图控制器
var display = require("Display");
var VO = {
    DragVO: { //扡动事件
        offset: { x: 0, y: 0 },
        startPoint: { x: 0, y: 0 },
        isDrag: false //是否是拖动
    }
};
cc.Class({
    name: "WorldMapMediator",
    "extends": cc.Component,
    properties: {},
    onLoad: function onLoad() {
        // this._super()
        this.cityMap = {};
    },
    onExit: function onExit() {
        cc.log("onexit");
    },
    preload: function preload(cb) {
        var list = [['big', cc.TiledMapAsset]];
        display.preload(list, function (is, per) {
            if (is) cb();
        });
    },

    setNodePosition: function setNodePosition(x, y) {
        this.node.setPosition(x - 480, y - 320);
    },
    getNodePosition: function getNodePosition(argument) {
        var _p = this.node.getPosition();
        _p.x += 480;
        _p.y += 320;
        return _p;
    },
    getMapSize: function getMapSize() {
        var size = this.node.getComponent(cc.TiledMap).getMapSize();
        var tieldSize = this.node.getComponent(cc.TiledMap).getTileSize();
        var mapSize = cc.size(size.width * tieldSize.width, size.height * tieldSize.height);
        // cc.log("getMapSize", mapSize)
        return mapSize;
    },
    start: function start() {
        var self = this;
        // this.cityNode.setPosition(0, 0)
        this.preload(function () {
            cc.director.setDisplayStats(true);
            self.initTouchEvent();
            var tmxAsset = display.getTmxAsset('big');
            self.node.getComponent(cc.TiledMap).tmxAsset = tmxAsset;
            //特效层
            self.showTilesAtDisplayPoint(cc.p(480, 320));
        });
    },

    //取得地图处于屏幕正中间的点
    //地图anchor 0, 0.5
    getDisplayCenterPoint: function getDisplayCenterPoint() {
        var size = this.getMapSize();
        var anchor = this.node.getAnchorPoint();
        var point = this.getNodePosition();
        var scale = this.node.getScale();
        var p = cc.p((480 - point.x) / scale, (320 - point.y) / scale);
        p.x = parseInt(p.x);
        p.y = parseInt(p.y);
        // cc.log("getDisplayCenterPoint", size, anchor, point, scale, p.x, p.y)
        return p;
    },

    getMapFullSize: function getMapFullSize() {
        var size = this.node.getComponent(cc.TiledMap).getMapSize();
        var tieldSize = this.node.getComponent(cc.TiledMap).getTileSize();
        return cc.size(size.width * tieldSize.width, size.height * tieldSize.height);
    },

    //处理地图拖动相关
    initTouchEvent: function initTouchEvent() {
        var self = this;
        // 添加单点触摸事件监听器
        var listener = {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function onTouchBegan(touches, event) {
                cc.log('Touch Began: ', event);
                self.drag = cc.instantiate(VO.DragVO);
                var startPoint = cc.instantiate(touches.getLocation());
                var mapStartPoint = self.node.getPosition();
                self.drag.startPoint = startPoint;
                self.drag.offset.x = mapStartPoint.x - startPoint.x;
                self.drag.offset.y = mapStartPoint.y - startPoint.y;
                return true; //这里必须要写 return true
            },
            onTouchMoved: function onTouchMoved(touches, event) {
                // cc.log('Touch Moved: ' + event);
                var point = touches.getLocation();
                if (cc.pDistance(point, self.drag.startPoint) > 2) {
                    //是移动
                    self.drag.isDrag = true;
                    var p = cc.p(point.x + self.drag.offset.x, point.y + self.drag.offset.y);
                    self.node.setPosition(p);
                }
            },
            onTouchEnded: function onTouchEnded(touches, event) {
                // cc.log('Touch Ended: ' + event);
                if (self.drag.isDrag) {
                    self.onPositionChange(touches.getLocation());
                } else {}
            },
            onTouchCancelled: function onTouchCancelled(touches, event) {
                // cc.log('Touch Cancelled: ' + event);
                if (self.drag.isDrag) {
                    self.onPositionChange(touches.getLocation());
                }
            }
        };
        // 绑定单点触摸事件
        cc.eventManager.addListener(listener, this.node);
    },

    onPositionChange: function onPositionChange(p) {
        this.showTilesAtDisplayPoint(cc.p(480, 320));
    },

    //地图中心点0 0.5的坐标取对应点所在xy
    getTileXYByInMapPosition: function getTileXYByInMapPosition(p) {
        var tieldSize = this.node.getComponent(cc.TiledMap).getTileSize();
        var mapSize = this.node.getComponent(cc.TiledMap).getMapSize();
        var TileW = tieldSize.width;
        var TileH = tieldSize.height;
        var N = p.x / TileW - p.y / TileH;
        var M = p.x / TileW + p.y / TileH;
        var x = N;
        var y = mapSize.height - M;
        // cc.log("getTileXYByInMapPosition", p, x, y)
        x = parseInt(x);
        y = parseInt(y);
        return cc.p(x, y);
    },

    //取得外部某点相对于地图0,0.5的距离
    getDisplayPointToMapZeroHalf: function getDisplayPointToMapZeroHalf(p) {
        var fullSize = this.getMapFullSize();
        var anchor = this.node.getAnchorPoint();
        var mp = this.getNodePosition();
        var scale = this.node.getScale();
        var _x = (fullSize.width * anchor.x - mp.x + p.x) / scale;
        var _y = (fullSize.height * anchor.y - mp.y + p.y - fullSize.height / 2) / scale;
        var off = cc.p(0, 0); //转换的坐标不知道为什么存在一点稳定的偏移 先添加常规偏移量解决
        _x += off.x / scale;
        _y += off.y / scale;
        return cc.p(_x, _y);
    },
    //根据屏幕坐标显示格子
    showTilesAtDisplayPoint: function showTilesAtDisplayPoint(p) {
        var mapPosition = this.getDisplayPointToMapZeroHalf(p);
        var tileP = this.getTileXYByInMapPosition(mapPosition);
        this.showTilesAtMapPoint(tileP.x, tileP.y);
    },

    //显示指定xy的格子 即周围正负3的格子
    //移除超过x y 多少的格子
    showTilesAtMapPoint: function showTilesAtMapPoint(x, y) {
        // cc.log("showTilesAtMapPoint", x, y)
        var layers = this.node.getComponent(cc.TiledMap).allLayers();
        for (var i in layers) {
            layers[i].setupTilesBeyondPos(cc.p(x, y), 11);
        }
    },

    close: function close() {}
});

cc._RFpop();
},{"Display":"Display"}]},{},["HelloWorld","WorldMapMediator","Display"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL0FwcGxpY2F0aW9ucy9Db2Nvc0NyZWF0b3IuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiYXNzZXRzL1NjcmlwdC9EaXNwbGF5LmpzIiwiYXNzZXRzL1NjcmlwdC9IZWxsb1dvcmxkLmpzIiwiYXNzZXRzL1NjcmlwdC9Xb3JsZE1hcE1lZGlhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJ2M4Yjg3UCt4aE5Jc29WUHkyRnRXaDFvJywgJ0Rpc3BsYXknKTtcbi8vIFNjcmlwdC9EaXNwbGF5LmpzXG5cbi8v5Yqg6L296LWE5rqQ5p6a5Li+XG52YXIgU291cmNlVHlwZUVudW0gPSBjYy5FbnVtKHtcbiAgICAnQXNzZXQnOiAxLFxuICAgICdSYXdBc3NldCc6IDJcbn0pO1xudmFyIERpc3BsYXkgPSBjYy5DbGFzcyh7XG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvL+aJgOaciemihOe9rueahOW8leeUqFxuICAgICAgICBwZXJmYWJNYXBzOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IHt9XG4gICAgICAgIH0sXG4gICAgICAgIC8v5omA5pyJ5Zu+54mH5bin55qE5byV55SoXG4gICAgICAgIHNwcml0ZUZyYW1lTWFwczoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAvL+aJgOacieWbvumbhueahOW8leeUqFxuICAgICAgICBzcHJpdGVBdGxhc01hcHM6IHtcbiAgICAgICAgICAgICdkZWZhdWx0Jzoge31cbiAgICAgICAgfSxcbiAgICAgICAgLy/miYDmnInlnLDlm77lvJXnlKhcbiAgICAgICAgdGlsZWRNYXBBc3NldE1hcHM6IHtcbiAgICAgICAgICAgICdkZWZhdWx0Jzoge31cbiAgICAgICAgfVxuICAgIH0sXG4gICAgY3RvcjogZnVuY3Rpb24gY3RvcigpIHtcbiAgICAgICAgLy8g5aOw5piO5a6e5L6L5Y+Y6YeP5bm26LWL6buY6K6k5YC8XG4gICAgICAgIGNjLmxvZyhcIkRpc3BsYXk6Y3RvclwiKTtcbiAgICB9LFxuICAgIC8v5re75Yqg57K+54G15Zu+6ZuG5qGG5p62XG4gICAgLy/lpoLmnpxwbGlzdOWSjHBuZ+i1hOa6kOWdh+acqumihOWKoOi9veWImeS8muinpuWPkWlvXG4gICAgLy/lj6/nkIbop6PkuLrpmLvloZ7lvI/liqDovb1cbiAgICBhZGRTcHJpdGVGcmFtZXM6IGZ1bmN0aW9uIGFkZFNwcml0ZUZyYW1lcyhwbGlzdCwgcG5nKSB7XG4gICAgICAgIGNjLnNwcml0ZUZyYW1lQ2FjaGUuYWRkU3ByaXRlRnJhbWVzKHBsaXN0LCBwbmcpO1xuICAgIH0sXG4gICAgLy/pooTliqDovb1cbiAgICAvL2xpc3QgYXJyYXlcbiAgICBwcmVsb2FkOiBmdW5jdGlvbiBwcmVsb2FkKGxpc3QsIGNiKSB7XG4gICAgICAgIHZhciB0b3RhbCA9IGxpc3QubGVuZ3RoO1xuICAgICAgICB2YXIgX3QgPSAwO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciB0eXBlID0gJyc7XG4gICAgICAgIHZhciB1cmwgPSBcIlwiO1xuICAgICAgICBmb3IgKHZhciBpIGluIGxpc3QpIHtcbiAgICAgICAgICAgIHVybCA9IGxpc3RbaV1bMF07XG4gICAgICAgICAgICB0eXBlID0gbGlzdFtpXVsxXTtcbiAgICAgICAgICAgIHRoaXMubG9hZCh1cmwsIHR5cGUsIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuICAgICAgICAgICAgICAgIF90Kys7XG4gICAgICAgICAgICAgICAgaWYgKF90ID09IHRvdGFsKSByZXR1cm4gY2IodHJ1ZSwgMTAwKTtcbiAgICAgICAgICAgICAgICBjYihmYWxzZSwgcGFyc2VJbnQoMTAwICogX3QgLyB0b3RhbCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8v5Yqg6L296aKE5Yi26LWE5rqQXG4gICAgLy9pbWFnZS5wbmcvaW1hZ2UsIHByZWZhYiwgYW5pbVxuICAgIC8vdXJsOlZpZXcvVUkvRGFya01hc2tMYXllciDlr7nlupQgL2Fzc2VydC9yZXNvdXJjZS9WaWV3L1VJL0RhcmtNYXNrTGF5ZXJcbiAgICAvL+WmguaenOacieWbvumbhuWbvueJh+etieWMheWHveWcqOmihOWItuS4reWImeS8muiiq+WQjOatpeWKoOi9vVxuICAgIGxvYWQ6IGZ1bmN0aW9uIGxvYWQodXJsLCB0eXBlLCBjYikge1xuICAgICAgICAvLyBjYy5sb2coXCJsb2FkQXNzZXRcIiwgdXJsKVxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGNjLmxvYWRlci5sb2FkUmVzKHVybCwgdHlwZSwgZnVuY3Rpb24gKGVyciwgcmVzKSB7XG4gICAgICAgICAgICAvLyBjYy5sb2coXCJsb2FkQXNzZXQgY2JcIiwgdXJsLCBlcnIsIHJlcylcbiAgICAgICAgICAgIGlmIChlcnIpIHJldHVybiBjYihlcnIsIHJlcyk7XG4gICAgICAgICAgICBpZiAocmVzIGluc3RhbmNlb2YgY2MuUHJlZmFiKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wZXJmYWJNYXBzW3Jlcy5fbmFtZV0gPSByZXM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlcyBpbnN0YW5jZW9mIGNjLlNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zcHJpdGVGcmFtZU1hcHNbcmVzLl9uYW1lXSA9IHJlcztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzIGluc3RhbmNlb2YgY2MuU3ByaXRlQXRsYXMpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnNwcml0ZUF0bGFzTWFwc1tyZXMuX25hbWVdID0gcmVzO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXMgaW5zdGFuY2VvZiBjYy5UaWxlZE1hcEFzc2V0KSB7XG4gICAgICAgICAgICAgICAgc2VsZi50aWxlZE1hcEFzc2V0TWFwc1tyZXMuX25hbWVdID0gcmVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY2MubG9nKHNlbGYuc3ByaXRlRnJhbWVNYXBzKVxuICAgICAgICAgICAgLy8gY2MubG9nKHNlbGYuc3ByaXRlQXRsYXNNYXBzKVxuICAgICAgICAgICAgY2IoZmFsc2UsIHJlcyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy/liqDovb3lm77niYflm77pm4bnrYnotYTmupDmlofku7ZcbiAgICAvL+WKoOi9vXBsaXN05Lya6Ieq5Yqo5Yqg6L295a+55bqU55qEUG5nXG4gICAgLy91cmwg5YaZ5rOVIHRleHR1cmVzL2NvbWJhdF9lbnZlZmZlY3RfYm9zc3dhcm4ucGxpc3Qg5a+55bqUIGFzc2V0L3Jlc291cmNlL3RleHR1cmVzL2NvbWJhdF9lbnZlZmZlY3RfYm9zc3dhcm4ucGxpc3RcbiAgICBsb2FkUmF3QXNzZXQ6IGZ1bmN0aW9uIGxvYWRSYXdBc3NldCh1cmwsIGNiKSB7XG4gICAgICAgIGNjLmxvYWRlci5sb2FkUmVzKHVybCwgZnVuY3Rpb24gKGVyciwgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgIGNjLmxvZyhcImNvbWJhdF9lbnZlZmZlY3RfYm9zc3dhcm4gZG9uZVwiLCBlcnIsIHNwcml0ZUZyYW1lKTtcbiAgICAgICAgICAgIGNiKGVyciwgc3ByaXRlRnJhbWUpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy/lnKjlvZPliY3lnLrlvbHlvLnlh7rkuIDkuKp0aXDmj5DnpLpcbiAgICB0aXA6IGZ1bmN0aW9uIHRpcChtZXNzYWdlKSB7XG4gICAgICAgIGNjLmxvZyhcImRpYXBsYXkudGlwXCIsIFwibWVzc2FnZVwiKTtcbiAgICAgICAgdmFyIHByZWZhYk5tZSA9ICdWaWV3L1VJL3RpcCc7XG4gICAgICAgIHRoaXMubG9hZFBlcmZhYihwcmVmYWJObWUsIGZ1bmN0aW9uIChlcnIsIHByZWZhYikge1xuICAgICAgICAgICAgaWYgKGVycikgcmV0dXJuIGNjLmFzc2VydChlcnIsIHByZWZhYk5tZSArICfliqDovb3lpLHotKUnKTtcbiAgICAgICAgICAgIHZhciB2aWV3Tm9kZSA9IGNjLmluc3RhbnRpYXRlKHByZWZhYik7XG4gICAgICAgICAgICB2YXIgbGFiZWwgPSB2aWV3Tm9kZS5nZXRDb21wb25lbnRJbkNoaWxkcmVuKGNjLkxhYmVsKTtcbiAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IG1lc3NhZ2U7XG4gICAgICAgICAgICAvLyByZXF1aXJlKCdHTScpLmdldFJ1bm5pbmdTY2VuZU1lZGlhdG9yKCkubm9kZS5hZGRDaGlsZCh2aWV3Tm9kZSwgMzApXG4gICAgICAgICAgICAvLyBjYy5kaXJlY3Rvci5nZXRTY2VuZSgpLmFkZENoaWxkKHZpZXdOb2RlKVxuICAgICAgICAgICAgLy8gc2VsZi5ub2RlLmFkZENoaWxkKHZpZXdOb2RlKVxuICAgICAgICAgICAgLy8gc2VsZi5wdXNoVmlldyh2aWV3Tm9kZSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy9VSemUgeWumlxuICAgIHVpTG9jazogZnVuY3Rpb24gdWlMb2NrKG1lc3NhZ2UpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoIW1lc3NhZ2UpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwcmVmYWJObWUgPSAnVmlldy9VSUxvY2svVUlMb2NrJztcbiAgICAgICAgdGhpcy5sb2FkUGVyZmFiKHByZWZhYk5tZSwgZnVuY3Rpb24gKGVyciwgcHJlZmFiKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSByZXR1cm4gY2MuYXNzZXJ0KGVyciwgcHJlZmFiTm1lICsgJ+WKoOi9veWksei0pScpO1xuICAgICAgICAgICAgc2VsZi52aWV3Tm9kZSA9IGNjLmluc3RhbnRpYXRlKHByZWZhYik7XG4gICAgICAgICAgICB2YXIgbGFiZWwgPSBzZWxmLnZpZXdOb2RlLmdldENoaWxkQnlOYW1lKFwibWVzc2FnZVwiKS5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gbWVzc2FnZTtcbiAgICAgICAgICAgIC8vIHJlcXVpcmUoJ0dNJykuZ2V0UnVubmluZ1NjZW5lTWVkaWF0b3IoKS5ub2RlLmFkZENoaWxkKHNlbGYudmlld05vZGUsIDMwKVxuICAgICAgICAgICAgLy8gY2MuZGlyZWN0b3IuZ2V0U2NlbmUoKS5hZGRDaGlsZCh2aWV3Tm9kZSlcbiAgICAgICAgICAgIC8vIHNlbGYubm9kZS5hZGRDaGlsZCh2aWV3Tm9kZSlcbiAgICAgICAgICAgIC8vIHNlbGYucHVzaFZpZXcodmlld05vZGUpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHVpVW5Mb2NrOiBmdW5jdGlvbiB1aVVuTG9jaygpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoIXRoaXMudmlld05vZGUpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNlbGYudWlVbkxvY2soKTtcbiAgICAgICAgICAgIH0sIDIwMCk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyByZXF1aXJlKCdHTScpLmdldFJ1bm5pbmdTY2VuZU1lZGlhdG9yKCkubm9kZS5yZW1vdmVDaGlsZCh0aGlzLnZpZXdOb2RlKVxuICAgIH0sXG4gICAgbG9hZFBlcmZhYjogZnVuY3Rpb24gbG9hZFBlcmZhYihwZXJmYWJOYW1lLCBjYikge1xuICAgICAgICBpZiAodGhpcy5wZXJmYWJNYXBzW3BlcmZhYk5hbWVdKSByZXR1cm4gY2IoZmFsc2UsIHRoaXMucGVyZmFiTWFwc1twZXJmYWJOYW1lXSk7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5sb2FkKHBlcmZhYk5hbWUsIGNjLlByZWZhYiwgZnVuY3Rpb24gKGVyciwgcHJlZmFiKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgICAgIHNlbGYucGVyZmFiTWFwc1twZXJmYWJOYW1lXSA9IHByZWZhYjtcbiAgICAgICAgICAgIGNiKGZhbHNlLCBwcmVmYWIpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGdldFByZWZhYjogZnVuY3Rpb24gZ2V0UHJlZmFiKHBlcmZhYk5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGVyZmFiTWFwc1twZXJmYWJOYW1lXTtcbiAgICB9LFxuICAgIGdldFNwcml0ZUZyYW1lOiBmdW5jdGlvbiBnZXRTcHJpdGVGcmFtZShmcmFtZU5hbWUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3ByaXRlRnJhbWVNYXBzW2ZyYW1lTmFtZV0pIHJldHVybiB0aGlzLnNwcml0ZUZyYW1lTWFwc1tmcmFtZU5hbWVdO1xuICAgICAgICBmb3IgKHZhciBhdGxhc05hbWUgaW4gdGhpcy5zcHJpdGVBdGxhc01hcHMpIHtcbiAgICAgICAgICAgIHZhciBhdGxhcyA9IHRoaXMuc3ByaXRlQXRsYXNNYXBzW2F0bGFzTmFtZV07XG4gICAgICAgICAgICBpZiAoYXRsYXMuZ2V0U3ByaXRlRnJhbWUoZnJhbWVOYW1lKSkgcmV0dXJuIGF0bGFzLmdldFNwcml0ZUZyYW1lKGZyYW1lTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2MuYXNzZXJ0KGZhbHNlLCBcImZyYW1lTmFtZTpcIiArIGZyYW1lTmFtZSArICfkuI3lrZjlnKgnKTtcbiAgICB9LFxuICAgIGdldFRteEFzc2V0OiBmdW5jdGlvbiBnZXRUbXhBc3NldCh0bXhOYW1lKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbGVkTWFwQXNzZXRNYXBzW3RteE5hbWVdKSByZXR1cm4gdGhpcy50aWxlZE1hcEFzc2V0TWFwc1t0bXhOYW1lXTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBEaXNwbGF5KCk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICcyODBjM3JzWkpKS25aOVJxYkFMVnd0SycsICdIZWxsb1dvcmxkJyk7XG4vLyBTY3JpcHQvSGVsbG9Xb3JsZC5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbFxuICAgICAgICB9LFxuICAgICAgICB0ZXh0OiAnSGVsbG8sIFdvcmxkISdcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMubGFiZWwuc3RyaW5nID0gdGhpcy50ZXh0O1xuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge31cbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnMzJkZDYxK1l0TkdZTGE3SXFjYnNRTkYnLCAnV29ybGRNYXBNZWRpYXRvcicpO1xuLy8gU2NyaXB0L1dvcmxkTWFwTWVkaWF0b3IuanNcblxuLy/ntK/orqHnmbvpmYbop4blm77mjqfliLblmahcbnZhciBkaXNwbGF5ID0gcmVxdWlyZShcIkRpc3BsYXlcIik7XG52YXIgVk8gPSB7XG4gICAgRHJhZ1ZPOiB7IC8v5omh5Yqo5LqL5Lu2XG4gICAgICAgIG9mZnNldDogeyB4OiAwLCB5OiAwIH0sXG4gICAgICAgIHN0YXJ0UG9pbnQ6IHsgeDogMCwgeTogMCB9LFxuICAgICAgICBpc0RyYWc6IGZhbHNlIC8v5piv5ZCm5piv5ouW5YqoXG4gICAgfVxufTtcbmNjLkNsYXNzKHtcbiAgICBuYW1lOiBcIldvcmxkTWFwTWVkaWF0b3JcIixcbiAgICBcImV4dGVuZHNcIjogY2MuQ29tcG9uZW50LFxuICAgIHByb3BlcnRpZXM6IHt9LFxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICAvLyB0aGlzLl9zdXBlcigpXG4gICAgICAgIHRoaXMuY2l0eU1hcCA9IHt9O1xuICAgIH0sXG4gICAgb25FeGl0OiBmdW5jdGlvbiBvbkV4aXQoKSB7XG4gICAgICAgIGNjLmxvZyhcIm9uZXhpdFwiKTtcbiAgICB9LFxuICAgIHByZWxvYWQ6IGZ1bmN0aW9uIHByZWxvYWQoY2IpIHtcbiAgICAgICAgdmFyIGxpc3QgPSBbWydiaWcnLCBjYy5UaWxlZE1hcEFzc2V0XV07XG4gICAgICAgIGRpc3BsYXkucHJlbG9hZChsaXN0LCBmdW5jdGlvbiAoaXMsIHBlcikge1xuICAgICAgICAgICAgaWYgKGlzKSBjYigpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgc2V0Tm9kZVBvc2l0aW9uOiBmdW5jdGlvbiBzZXROb2RlUG9zaXRpb24oeCwgeSkge1xuICAgICAgICB0aGlzLm5vZGUuc2V0UG9zaXRpb24oeCAtIDQ4MCwgeSAtIDMyMCk7XG4gICAgfSxcbiAgICBnZXROb2RlUG9zaXRpb246IGZ1bmN0aW9uIGdldE5vZGVQb3NpdGlvbihhcmd1bWVudCkge1xuICAgICAgICB2YXIgX3AgPSB0aGlzLm5vZGUuZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgX3AueCArPSA0ODA7XG4gICAgICAgIF9wLnkgKz0gMzIwO1xuICAgICAgICByZXR1cm4gX3A7XG4gICAgfSxcbiAgICBnZXRNYXBTaXplOiBmdW5jdGlvbiBnZXRNYXBTaXplKCkge1xuICAgICAgICB2YXIgc2l6ZSA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuVGlsZWRNYXApLmdldE1hcFNpemUoKTtcbiAgICAgICAgdmFyIHRpZWxkU2l6ZSA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuVGlsZWRNYXApLmdldFRpbGVTaXplKCk7XG4gICAgICAgIHZhciBtYXBTaXplID0gY2Muc2l6ZShzaXplLndpZHRoICogdGllbGRTaXplLndpZHRoLCBzaXplLmhlaWdodCAqIHRpZWxkU2l6ZS5oZWlnaHQpO1xuICAgICAgICAvLyBjYy5sb2coXCJnZXRNYXBTaXplXCIsIG1hcFNpemUpXG4gICAgICAgIHJldHVybiBtYXBTaXplO1xuICAgIH0sXG4gICAgc3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vIHRoaXMuY2l0eU5vZGUuc2V0UG9zaXRpb24oMCwgMClcbiAgICAgICAgdGhpcy5wcmVsb2FkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNjLmRpcmVjdG9yLnNldERpc3BsYXlTdGF0cyh0cnVlKTtcbiAgICAgICAgICAgIHNlbGYuaW5pdFRvdWNoRXZlbnQoKTtcbiAgICAgICAgICAgIHZhciB0bXhBc3NldCA9IGRpc3BsYXkuZ2V0VG14QXNzZXQoJ2JpZycpO1xuICAgICAgICAgICAgc2VsZi5ub2RlLmdldENvbXBvbmVudChjYy5UaWxlZE1hcCkudG14QXNzZXQgPSB0bXhBc3NldDtcbiAgICAgICAgICAgIC8v54m55pWI5bGCXG4gICAgICAgICAgICBzZWxmLnNob3dUaWxlc0F0RGlzcGxheVBvaW50KGNjLnAoNDgwLCAzMjApKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8v5Y+W5b6X5Zyw5Zu+5aSE5LqO5bGP5bmV5q2j5Lit6Ze055qE54K5XG4gICAgLy/lnLDlm75hbmNob3IgMCwgMC41XG4gICAgZ2V0RGlzcGxheUNlbnRlclBvaW50OiBmdW5jdGlvbiBnZXREaXNwbGF5Q2VudGVyUG9pbnQoKSB7XG4gICAgICAgIHZhciBzaXplID0gdGhpcy5nZXRNYXBTaXplKCk7XG4gICAgICAgIHZhciBhbmNob3IgPSB0aGlzLm5vZGUuZ2V0QW5jaG9yUG9pbnQoKTtcbiAgICAgICAgdmFyIHBvaW50ID0gdGhpcy5nZXROb2RlUG9zaXRpb24oKTtcbiAgICAgICAgdmFyIHNjYWxlID0gdGhpcy5ub2RlLmdldFNjYWxlKCk7XG4gICAgICAgIHZhciBwID0gY2MucCgoNDgwIC0gcG9pbnQueCkgLyBzY2FsZSwgKDMyMCAtIHBvaW50LnkpIC8gc2NhbGUpO1xuICAgICAgICBwLnggPSBwYXJzZUludChwLngpO1xuICAgICAgICBwLnkgPSBwYXJzZUludChwLnkpO1xuICAgICAgICAvLyBjYy5sb2coXCJnZXREaXNwbGF5Q2VudGVyUG9pbnRcIiwgc2l6ZSwgYW5jaG9yLCBwb2ludCwgc2NhbGUsIHAueCwgcC55KVxuICAgICAgICByZXR1cm4gcDtcbiAgICB9LFxuXG4gICAgZ2V0TWFwRnVsbFNpemU6IGZ1bmN0aW9uIGdldE1hcEZ1bGxTaXplKCkge1xuICAgICAgICB2YXIgc2l6ZSA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuVGlsZWRNYXApLmdldE1hcFNpemUoKTtcbiAgICAgICAgdmFyIHRpZWxkU2l6ZSA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuVGlsZWRNYXApLmdldFRpbGVTaXplKCk7XG4gICAgICAgIHJldHVybiBjYy5zaXplKHNpemUud2lkdGggKiB0aWVsZFNpemUud2lkdGgsIHNpemUuaGVpZ2h0ICogdGllbGRTaXplLmhlaWdodCk7XG4gICAgfSxcblxuICAgIC8v5aSE55CG5Zyw5Zu+5ouW5Yqo55u45YWzXG4gICAgaW5pdFRvdWNoRXZlbnQ6IGZ1bmN0aW9uIGluaXRUb3VjaEV2ZW50KCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vIOa3u+WKoOWNleeCueinpuaRuOS6i+S7tuebkeWQrOWZqFxuICAgICAgICB2YXIgbGlzdGVuZXIgPSB7XG4gICAgICAgICAgICBldmVudDogY2MuRXZlbnRMaXN0ZW5lci5UT1VDSF9PTkVfQllfT05FLFxuICAgICAgICAgICAgb25Ub3VjaEJlZ2FuOiBmdW5jdGlvbiBvblRvdWNoQmVnYW4odG91Y2hlcywgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBjYy5sb2coJ1RvdWNoIEJlZ2FuOiAnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgc2VsZi5kcmFnID0gY2MuaW5zdGFudGlhdGUoVk8uRHJhZ1ZPKTtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRQb2ludCA9IGNjLmluc3RhbnRpYXRlKHRvdWNoZXMuZ2V0TG9jYXRpb24oKSk7XG4gICAgICAgICAgICAgICAgdmFyIG1hcFN0YXJ0UG9pbnQgPSBzZWxmLm5vZGUuZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICBzZWxmLmRyYWcuc3RhcnRQb2ludCA9IHN0YXJ0UG9pbnQ7XG4gICAgICAgICAgICAgICAgc2VsZi5kcmFnLm9mZnNldC54ID0gbWFwU3RhcnRQb2ludC54IC0gc3RhcnRQb2ludC54O1xuICAgICAgICAgICAgICAgIHNlbGYuZHJhZy5vZmZzZXQueSA9IG1hcFN0YXJ0UG9pbnQueSAtIHN0YXJ0UG9pbnQueTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy/ov5nph4zlv4XpobvopoHlhpkgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblRvdWNoTW92ZWQ6IGZ1bmN0aW9uIG9uVG91Y2hNb3ZlZCh0b3VjaGVzLCBldmVudCkge1xuICAgICAgICAgICAgICAgIC8vIGNjLmxvZygnVG91Y2ggTW92ZWQ6ICcgKyBldmVudCk7XG4gICAgICAgICAgICAgICAgdmFyIHBvaW50ID0gdG91Y2hlcy5nZXRMb2NhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChjYy5wRGlzdGFuY2UocG9pbnQsIHNlbGYuZHJhZy5zdGFydFBvaW50KSA+IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy/mmK/np7vliqhcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kcmFnLmlzRHJhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwID0gY2MucChwb2ludC54ICsgc2VsZi5kcmFnLm9mZnNldC54LCBwb2ludC55ICsgc2VsZi5kcmFnLm9mZnNldC55KTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5ub2RlLnNldFBvc2l0aW9uKHApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblRvdWNoRW5kZWQ6IGZ1bmN0aW9uIG9uVG91Y2hFbmRlZCh0b3VjaGVzLCBldmVudCkge1xuICAgICAgICAgICAgICAgIC8vIGNjLmxvZygnVG91Y2ggRW5kZWQ6ICcgKyBldmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuZHJhZy5pc0RyYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vblBvc2l0aW9uQ2hhbmdlKHRvdWNoZXMuZ2V0TG9jYXRpb24oKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25Ub3VjaENhbmNlbGxlZDogZnVuY3Rpb24gb25Ub3VjaENhbmNlbGxlZCh0b3VjaGVzLCBldmVudCkge1xuICAgICAgICAgICAgICAgIC8vIGNjLmxvZygnVG91Y2ggQ2FuY2VsbGVkOiAnICsgZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLmRyYWcuaXNEcmFnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub25Qb3NpdGlvbkNoYW5nZSh0b3VjaGVzLmdldExvY2F0aW9uKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8g57uR5a6a5Y2V54K56Kem5pG45LqL5Lu2XG4gICAgICAgIGNjLmV2ZW50TWFuYWdlci5hZGRMaXN0ZW5lcihsaXN0ZW5lciwgdGhpcy5ub2RlKTtcbiAgICB9LFxuXG4gICAgb25Qb3NpdGlvbkNoYW5nZTogZnVuY3Rpb24gb25Qb3NpdGlvbkNoYW5nZShwKSB7XG4gICAgICAgIHRoaXMuc2hvd1RpbGVzQXREaXNwbGF5UG9pbnQoY2MucCg0ODAsIDMyMCkpO1xuICAgIH0sXG5cbiAgICAvL+WcsOWbvuS4reW/g+eCuTAgMC4155qE5Z2Q5qCH5Y+W5a+55bqU54K55omA5ZyoeHlcbiAgICBnZXRUaWxlWFlCeUluTWFwUG9zaXRpb246IGZ1bmN0aW9uIGdldFRpbGVYWUJ5SW5NYXBQb3NpdGlvbihwKSB7XG4gICAgICAgIHZhciB0aWVsZFNpemUgPSB0aGlzLm5vZGUuZ2V0Q29tcG9uZW50KGNjLlRpbGVkTWFwKS5nZXRUaWxlU2l6ZSgpO1xuICAgICAgICB2YXIgbWFwU2l6ZSA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuVGlsZWRNYXApLmdldE1hcFNpemUoKTtcbiAgICAgICAgdmFyIFRpbGVXID0gdGllbGRTaXplLndpZHRoO1xuICAgICAgICB2YXIgVGlsZUggPSB0aWVsZFNpemUuaGVpZ2h0O1xuICAgICAgICB2YXIgTiA9IHAueCAvIFRpbGVXIC0gcC55IC8gVGlsZUg7XG4gICAgICAgIHZhciBNID0gcC54IC8gVGlsZVcgKyBwLnkgLyBUaWxlSDtcbiAgICAgICAgdmFyIHggPSBOO1xuICAgICAgICB2YXIgeSA9IG1hcFNpemUuaGVpZ2h0IC0gTTtcbiAgICAgICAgLy8gY2MubG9nKFwiZ2V0VGlsZVhZQnlJbk1hcFBvc2l0aW9uXCIsIHAsIHgsIHkpXG4gICAgICAgIHggPSBwYXJzZUludCh4KTtcbiAgICAgICAgeSA9IHBhcnNlSW50KHkpO1xuICAgICAgICByZXR1cm4gY2MucCh4LCB5KTtcbiAgICB9LFxuXG4gICAgLy/lj5blvpflpJbpg6jmn5Dngrnnm7jlr7nkuo7lnLDlm74wLDAuNeeahOi3neemu1xuICAgIGdldERpc3BsYXlQb2ludFRvTWFwWmVyb0hhbGY6IGZ1bmN0aW9uIGdldERpc3BsYXlQb2ludFRvTWFwWmVyb0hhbGYocCkge1xuICAgICAgICB2YXIgZnVsbFNpemUgPSB0aGlzLmdldE1hcEZ1bGxTaXplKCk7XG4gICAgICAgIHZhciBhbmNob3IgPSB0aGlzLm5vZGUuZ2V0QW5jaG9yUG9pbnQoKTtcbiAgICAgICAgdmFyIG1wID0gdGhpcy5nZXROb2RlUG9zaXRpb24oKTtcbiAgICAgICAgdmFyIHNjYWxlID0gdGhpcy5ub2RlLmdldFNjYWxlKCk7XG4gICAgICAgIHZhciBfeCA9IChmdWxsU2l6ZS53aWR0aCAqIGFuY2hvci54IC0gbXAueCArIHAueCkgLyBzY2FsZTtcbiAgICAgICAgdmFyIF95ID0gKGZ1bGxTaXplLmhlaWdodCAqIGFuY2hvci55IC0gbXAueSArIHAueSAtIGZ1bGxTaXplLmhlaWdodCAvIDIpIC8gc2NhbGU7XG4gICAgICAgIHZhciBvZmYgPSBjYy5wKDAsIDApOyAvL+i9rOaNoueahOWdkOagh+S4jeefpemBk+S4uuS7gOS5iOWtmOWcqOS4gOeCueeos+WumueahOWBj+enuyDlhYjmt7vliqDluLjop4TlgY/np7vph4/op6PlhrNcbiAgICAgICAgX3ggKz0gb2ZmLnggLyBzY2FsZTtcbiAgICAgICAgX3kgKz0gb2ZmLnkgLyBzY2FsZTtcbiAgICAgICAgcmV0dXJuIGNjLnAoX3gsIF95KTtcbiAgICB9LFxuICAgIC8v5qC55o2u5bGP5bmV5Z2Q5qCH5pi+56S65qC85a2QXG4gICAgc2hvd1RpbGVzQXREaXNwbGF5UG9pbnQ6IGZ1bmN0aW9uIHNob3dUaWxlc0F0RGlzcGxheVBvaW50KHApIHtcbiAgICAgICAgdmFyIG1hcFBvc2l0aW9uID0gdGhpcy5nZXREaXNwbGF5UG9pbnRUb01hcFplcm9IYWxmKHApO1xuICAgICAgICB2YXIgdGlsZVAgPSB0aGlzLmdldFRpbGVYWUJ5SW5NYXBQb3NpdGlvbihtYXBQb3NpdGlvbik7XG4gICAgICAgIHRoaXMuc2hvd1RpbGVzQXRNYXBQb2ludCh0aWxlUC54LCB0aWxlUC55KTtcbiAgICB9LFxuXG4gICAgLy/mmL7npLrmjIflrpp4eeeahOagvOWtkCDljbPlkajlm7TmraPotJ8z55qE5qC85a2QXG4gICAgLy/np7vpmaTotoXov4d4IHkg5aSa5bCR55qE5qC85a2QXG4gICAgc2hvd1RpbGVzQXRNYXBQb2ludDogZnVuY3Rpb24gc2hvd1RpbGVzQXRNYXBQb2ludCh4LCB5KSB7XG4gICAgICAgIC8vIGNjLmxvZyhcInNob3dUaWxlc0F0TWFwUG9pbnRcIiwgeCwgeSlcbiAgICAgICAgdmFyIGxheWVycyA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuVGlsZWRNYXApLmFsbExheWVycygpO1xuICAgICAgICBmb3IgKHZhciBpIGluIGxheWVycykge1xuICAgICAgICAgICAgbGF5ZXJzW2ldLnNldHVwVGlsZXNCZXlvbmRQb3MoY2MucCh4LCB5KSwgMTEpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGNsb3NlOiBmdW5jdGlvbiBjbG9zZSgpIHt9XG59KTtcblxuY2MuX1JGcG9wKCk7Il19

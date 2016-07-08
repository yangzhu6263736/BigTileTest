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
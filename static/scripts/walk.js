/*
* anim.
* */

(function () {
    window.CHILDS = window.CHILDS || {};
    // 
    var animType = "WebGL";
    if(!PIXI.utils.isWebGLSupported()){
        animType = "canvas";
    }
    PIXI.utils.sayHello(animType);
    // lloading 页
    var girlBox = new PIXI.Container();
    // login 页
    var sceneBox = new PIXI.Container();
    // main
    var mainBox = new PIXI.Container();
    // 
    function animLoadWalk (params, callback) {
        params = params || {};
        var wrap = params.wrap;
        if(!wrap || !wrap.length) {
            callback && callback();
            return;
        }
        var ww = wrap.width();
        var wh = wrap.height();
        var renderer = PIXI.autoDetectRenderer({
            width: ww,
            height: wh,
            transparent: true
        });
        wrap.append(renderer.view);
        // 
        PIXI.loader.add([
            'static/images/anim_cloud_1.png',
            'static/images/anim_cloud_2.png',
            'static/images/anim_flag_1.png',
            'static/images/anim_flag_2.png',
            'static/images/anim_flag_3.png',
            'static/images/anim_ball_1.png',
            'static/images/anim_ball_2.png',
            'static/images/anim_ball_3.png',
            'static/images/anim_ball_4.png',
            'static/images/main_scene.png',
            'static/images/anmi_archi.png',
            'static/images/anmi_login.png',
            'static/images/anmi_shadow_1.png',
            'static/images/anmi_shadow_2.png',
            'static/images/anmi_girl_1.png',
            'static/images/anmi_girl_2.png',
            'static/images/anmi_girl_3.png',
            'static/images/anmi_girl_4.png',
            'static/images/billboard_scenic.png',
            'static/images/billboard_family.png',
            'static/images/billboard_subway.png',
            'static/images/billboard_school.png'
        ]).on("progress", function(target, resource){
            
        }).load(dowalk);

        function dowalk () {
            var girlSprits = {};
            var girl_arr = [];
            for(let i=1;i<5;i++){
                girl_arr.push('static/images/anmi_girl_'+i+'.png');
            }
            var girl = new PIXI.extras.AnimatedSprite.fromImages(girl_arr);
            girl.animationSpeed = -0.06;
            girl.play();
            girl.position.set(100, 0);
            girl.scale.set(1.1, 1.1);
            girlBox.addChild(girl);

            girlBox.scale.set(ww/params.ww, wh/params.wh);//容器根据设计稿 计算缩放
            walk();

            if(callback) {
                callback();
            }
        }
        function walk () {
            renderer.render(girlBox);
            var animationFrame = requestAnimationFrame(walk);
        }
    }
    function animLoginScene (params, callback) {
        params = params || {};
        var wrap = params.wrap;
        var ww = wrap.width();
        var wh = wrap.height();
        var renderer = PIXI.autoDetectRenderer({
            width: ww,
            height: wh,
            backgroundColor:0xE3F9FF
        });
        wrap.append(renderer.view);

        var spriteBox = {};

        function setup () {
            // BG
            var bg = new PIXI.Sprite(PIXI.loader.resources['static/images/anmi_login.png'].texture);
            bg.position.set(0,0);
            spriteBox.bg = bg;

            var shadow_arr = [];
            for(let i=1;i<3;i++){
                shadow_arr.push('static/images/anmi_shadow_'+i+'.png');
            }
            spriteBox.shadow = new PIXI.extras.AnimatedSprite.fromImages(shadow_arr);
            spriteBox.shadow.animationSpeed = -0.05;
            spriteBox.shadow.play();

            var girl_arr = [];
            for(let i=1;i<5;i++){
                girl_arr.push('static/images/anmi_girl_'+i+'.png');
            }
            spriteBox.girl = new PIXI.extras.AnimatedSprite.fromImages(girl_arr);
            spriteBox.girl.animationSpeed = -0.06;
            spriteBox.girl.play();
            spriteBox.girl.scale.set(1.1, 1.1);

            var architecture = new PIXI.Sprite(PIXI.loader.resources['static/images/anmi_archi.png'].texture);
            spriteBox.architecture = architecture;

            for(let key in spriteBox){
                sceneBox.addChild(spriteBox[key]);//精灵 添加进 容器
            }
            spriteBox.bg.position.set(0, -100);
            spriteBox.shadow.position.set(160, 560);
            spriteBox.girl.position.set(420, 570);
            spriteBox.architecture.position.set(-30, 400);

            sceneBox.scale.set(ww/params.ww, wh/params.wh);//容器根据设计稿 计算缩放
            animate();

            if(callback) {
                callback();
            }
        }
        function animate(){
            renderer.render(sceneBox);
            var animationFrame = requestAnimationFrame(animate);
        }

        setup();
    }

    function animMainScene (params, callback) {
        params = params || {};
        var wrap = params.wrap;
        if(!wrap || !wrap.length) {
            callback && callback();
            return;
        }
        var ww = wrap.width();
        var wh = wrap.height();

        var renderer = PIXI.autoDetectRenderer({
            width: ww,
            height: wh,
            backgroundColor:0xE3F9FF
        });
        wrap.append(renderer.view);

        var _cloud;
        var spriteBox = {};
        var cloudx = 500, cloudy = 150, speedx = 2.5, speedy = 0.25;
        var cloudMx = cloudx, cloudMy = cloudy;
        var y = 1;

        var cloudEndX = -400, cloudEndY = -300;
        var ballEndX = -400, ballEndY = -300;

        // 名牌
        var bandlist = [
            {type: 'school'},
            {type: 'family'},
            {type: 'scenic'},
            {type: 'subway'}
        ];

        function setupMain () {
            // cloud
            for(var m=1; m<3; m++){
                spriteBox['cloud_'+m] = new PIXI.Sprite(PIXI.loader.resources['static/images/anim_cloud_'+m+'.png'].texture);
                var speed = randomCloudSpeed();
                spriteBox['cloud_'+m].vx = speed.vx;
                spriteBox['cloud_'+m].vy = speed.vy;
            }
            // ball
            for(var i=1; i<5; i++){
                spriteBox['balloon_'+i] = new PIXI.Sprite(PIXI.loader.resources['static/images/anim_ball_'+i+'.png'].texture);
                var speed = randomBallSpeed();
                spriteBox['balloon_'+i].vx = speed.vx;
                spriteBox['balloon_'+i].vy = speed.vy;
            }
            // 背景
            var bg = new PIXI.Sprite(PIXI.loader.resources['static/images/main_scene.png'].texture);
            bg.position.set(0,0);
            spriteBox.bg = bg;
            // redflag
            var flag_arr = [];
            for(let i=1;i<4;i++){
                flag_arr.push('static/images/anim_flag_'+i+'.png');
            }
            spriteBox.redflag = new PIXI.extras.AnimatedSprite.fromImages(flag_arr);
            spriteBox.redflag.animationSpeed = -0.04;
            spriteBox.redflag.play();
            // 名牌
            for(var n=0; n<bandlist.length; n++) {
                var item = bandlist[n];
                var container = new PIXI.Container();
                var board = new PIXI.Sprite(PIXI.loader.resources['static/images/billboard_'+ item.type +'.png'].texture);
                board.position.set(0, 0);
                board.anchor.set(0.5, 0.5);
                board.scale.set(1, 1);
                board.buttonMode = true;
                board.interactive = true;
                container.addChild(board);
                container._dir = 1;
                container._sx = 1;
                container._sy = 1;
                container._speed = randomScale();
                spriteBox['band_'+item.type] = container;
                params.rectBindEvent(board, item.type);
            }
            // 
            for(let key in spriteBox){
                mainBox.addChild(spriteBox[key]);//精灵 添加进 容器
            }
            for(var j = 1; j < 3; j++) {
                var pos = randomCloudPostion();
                spriteBox['cloud_'+j].position.set(pos.x, pos.y);
                spriteBox['cloud_'+j].rotation = randomRotate();
                spriteBox['cloud_'+j].position._startX = pos.x;
                spriteBox['cloud_'+j].position._startY = pos.y;
            }
            for(var k = 1; k < 5; k++) {
                var pos = randomBallPostion();
                spriteBox['balloon_'+k].position.set(pos.x, pos.y);
                spriteBox['balloon_'+k].rotation = randomRotate();
                spriteBox['balloon_'+k].position._startX = pos.x;
                spriteBox['balloon_'+k].position._startY = pos.y;
            }
            spriteBox.redflag.position.set(431, 57);
            // 
            spriteBox.band_school.position.set(670, 290);
            spriteBox.band_family.position.set(110, 406);
            spriteBox.band_scenic.position.set(706, 613);
            spriteBox.band_subway.position.set(494, 1148);
            // 
            mainBox.scale.set(ww/params.ww, wh/params.wh);//容器根据设计稿 计算缩放
            animate();
            // 
            callback && callback();
        }

        function textScale () {
            var itemAction = function(item) {
                var parents = spriteBox['band_'+item.type];
                var elm = parents.children[0];
                var dir = parents._dir;
                var _speed = parents._speed;
                var sx = parseFloat(elm.scale.x);
                var sy = parseFloat(elm.scale.y);

                if(dir > 0) {
                    sx = sx + _speed;
                    sy = sy + _speed;
                    if(sx >= 1.2) {
                        spriteBox['band_'+item.type]._dir = -1;
                    }
                }
                else if(dir < 0){
                    sx = sx - _speed;
                    sy = sy - _speed;
                    if(sx <= 0.9) {
                        spriteBox['band_'+item.type]._dir = 1;
                    }
                }
                elm.scale.set(sx, sy);
            };
            for(var i=0; i<4; i++) {
                var doact = (function (){
                    itemAction(bandlist[i]);
                })();
            }
        }

        function moveCloud () {
            for(var i=1; i<3; i++) {
                var ball = spriteBox['cloud_'+i];
                var x = ball.position.x + ball.vx;
                var y = ball.position.y + ball.vy;

                if(x < cloudEndX || y < cloudEndY) {
                    var speed = randomCloudSpeed();
                    ball.vx = speed.vx;
                    ball.vy = speed.vy;
                    x = ball.position._startX;
                    y = ball.position._startY;
                }
                ball.position.set(x, y);
            }
        }

        function moveBall () {
            for(var i=1; i<5; i++) {
                var ball = spriteBox['balloon_'+i];
                var x = ball.position.x + ball.vx;
                var y = ball.position.y + ball.vy;

                if(x < ballEndX || y < ballEndY) {
                    var speed = randomBallSpeed();
                    ball.vx = speed.vx;
                    ball.vy = speed.vy;
                    x = ball.position._startX;
                    y = ball.position._startY;
                }
                ball.position.set(x, y);
            }
        }

        function animate(){
            moveCloud();
            moveBall();
            textScale();
            
            renderer.render(mainBox);
            var animationFrame = requestAnimationFrame(animate);
        }

        setupMain();
    }

    function createTransparentPolygon(pointList) {
        var graphics = new PIXI.Graphics();
        graphics.beginFill(0xff6900);
        graphics.drawPolygon(pointList);
        graphics.endFill();
        graphics.alpha = 0;
        graphics.position.set(0, 0);
        graphics.buttonMode = true;
        graphics.interactive = true;           
        return graphics;
    }

    function randomScale () {
        return randomInt(0.002, 0.005);
    }

    function randomCloudPostion () {
        return {
            x: randomInt(760, 800),
            y: randomInt(100, 150)
        };
    }
    function randomCloudSpeed () {
        var vx = randomInt(0.3, 0.8);
        var vy = randomInt(0.08, 0.35);
        return {
            vx: -vx,
            vy: -vy
        }
    }
    function randomBallPostion () {
        return {
            x: randomInt(75, 610),
            y: randomInt(470, 720)
        };
    }
    function randomBallSpeed () {
        var vx = randomInt(0.1, 0.5);
        var vy = randomInt(0.5, 1);
        return {
            vx: -vx,
            vy: -vy
        }
    }
    function randomRotate () {
        return -((Math.random() * 0.1  + 0.01).toFixed(2));
    }

    function randomInt (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    window.CHILDS.animLoadWalk = animLoadWalk;
    window.CHILDS.animLoginScene = animLoginScene;
    window.CHILDS.animMainScene = animMainScene;

    window.CHILDS.pixiLoadScene = girlBox;
    window.CHILDS.pixiLoginScene = sceneBox;
    window.CHILDS.pixiMainScene = mainBox;
})();
/*
* child.
* */
var CHILDS = window.CHILDS || {};
var pubpath = window.CHILDS.publicPath || 'static/';
var STYLE_SELECTED = 'selected';
var STYPE_PAGE_CURT = 'page-current';
var STYPE_PAGE_SCREEN = 'page-screen-';
var STYLE_ANIM_TOP100 = 'page-enter-top-100';
var STYLE_ANIM_BOT0 = 'page-enter-bottom-0';
var STYPE_ICON_ERR = 'icon-error';
var STYPE_ICON_FAULT = 'icon-fault';
var STYPE_ICON_RIGHT = 'icon-correct';
var STYLE_QUEST_ACTIVE = 'qustion-active';
var STYLE_DOT_CURRENT = 'dot-current';
var STYLE_ANIM_ASK = 'qustion-animIn';
var btnUrlFire = 'http://t.cn/AijI5GT1';
// 
var LAYER_IS_SHOW = false;// 浮层是否显示
var radio = window.devicePixelRatio || 1;
// 浮层数据
var currentScene;// 当前场景
$(window).on('ready', function () {
    "use strict";
    // 
    var CHILD_CONFIG = window.CHILD_CONFIG = window.CHILD_CONFIG || {};
    var childData = CHILD_CONFIG.basic || {};
    var userInfo = {
        area: 'school',
    	question: {}
    };
    CHILDS.currentPage = 0; // 第0页==load页
    CHILDS.mbody = $('body');
    CHILDS.pageCont = $('.J_page_cont');
    CHILDS.pageMusic = $('.J_music_wrap');
    CHILDS.animLoad = $('.J_load_anim');
    // 背景音乐
    CHILDS.audioImg = $('.J_audioImg');
    CHILDS.audioElem = $('.J_audioMusic');
    // 
    CHILDS.activityBox = $('#J_activityBox');
    CHILDS.btnStart = $('.J_btn_login');
    CHILDS.inputUser = $('.J_input_user');
    
    CHILDS.pages = $('.J_pages');// 页面

    CHILDS.loadBox = $('.J_loadBg');
    CHILDS.loadtxt = $('.J_loadTxt');
    CHILDS.pageResult = $('#J_page_results');
    CHILDS.pageShare = $('#J_page_shareimg');

    CHILDS.layerCont = $('.J_layer_cont');
    CHILDS.layerIntros = $('.J_layer_intros');
    CHILDS.layerQrimg = $('.J_layer_qrimg');
    CHILDS.layerCover = $('.J_layerBg');
    CHILDS.qrcodeClose = $('.J_qrcode_close');

    var pageQuetsWrap = $('#J_page_qustion');
    var loginTips = $('.J_login_tips');
    var mainScene = $('#J_scene_main');

    // page-loading
    function handleLoad () {
        var y = 0;
        var id = setInterval(function () {
            y = y + 1;
            CHILDS.loadBox.css('width',  y + '%');
            CHILDS.loadtxt.text(y + "%");
            if (y >= 100) {
                clearInterval(id);
                pageSwitchTo(1);
            }
        }, 25);
    }
    if(CHILDS.loadBox && CHILDS.loadBox.length) {
        handleLoad();
    }
    // 
    CHILDS.musicIsPlay = false;
    CHILDS.audioImg.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        playMusic();
    });

    function playMusic () {
        try {
            if(CHILDS.musicIsPlay) {
                CHILDS.audioElem[0].pause();
                CHILDS.audioImg.removeClass('rotate');
            }
            else {
                CHILDS.audioElem[0].play();
                CHILDS.audioImg.addClass('rotate');
            }
        }catch(e) {}
        CHILDS.musicIsPlay = !CHILDS.musicIsPlay;
    }
    // page-login
    // btn-开始冒险
    if(CHILDS.btnStart && CHILDS.btnStart.length) {
        CHILDS.btnStart.on('click', function (e) {
        	if(!$(this).hasClass(STYLE_SELECTED)) {
                loginTips.addClass(STYPE_ICON_ERR);
                var timer = setTimeout(function () {
                    loginTips.removeClass(STYPE_ICON_ERR);
                    takeFocus();
                }, 3000);
        		return ;
        	}
        	userInfo.nickname = CHILDS.inputUser.val().trim();
        	pageSwitchTo(2);
        });
    }
	// 实时监听手机号码输入框变化
    CHILDS.inputUser.on('input', function(e) {
    	var txt = $(this).val();
    	if(checkNickname(txt)) {
    		CHILDS.btnStart.addClass(STYLE_SELECTED);
    	}
    	else {
    		CHILDS.btnStart.removeClass(STYLE_SELECTED);
    	}
    });

    // 禁止页面上下滑屏
    // CHILDS.activityBox.on("touchmove", function(e) {
    //      return false;
    // });
    // 选项
    // CHILDS.activityBox.delegate('.J_img_qrcode', 'click', function (e) {        
    // });
    CHILDS.activityBox.delegate('.J_question_ansItem', 'click', function (e) {
		var _data = $(this).data();
		// console.log('=========question-item', userInfo.area, userInfo.issueNum, _data.text);
		userInfo.question[userInfo.issueNum] = _data.text;
        // 
        var iconlist = $(this).parent().find('.J_ask_icon');
        iconlist.removeClass(STYPE_ICON_RIGHT);
        iconlist.removeClass(STYPE_ICON_FAULT);

        var icon = $(this).find('.J_ask_icon');
        var obj = getAnswer();
        if(obj.ans == _data.text) {
            icon.addClass(STYPE_ICON_RIGHT);
        }
        else {
            icon.addClass(STYPE_ICON_FAULT);
            $(iconlist[obj.idx]).addClass(STYPE_ICON_RIGHT);
        }
        // 
        var timer = setTimeout(function () {
            var checkIsAns = checkAllIssue();
            if(checkIsAns) {
                pageSwitchTo(4);
            }
            else {
                choiceQuestion(userInfo.issueNum + 1);
            } 
        }, 600);
	});
    // 点
	CHILDS.activityBox.delegate('.J_quest_dotItem', 'click', function (e) {
        var _data = $(this).data();
		// console.log('========= dot-idx= ', _data.idx);
        choiceQuestion(_data.idx);
	});
    // page-result
    CHILDS.activityBox.delegate('.J_btn_try', 'click', function (e) {
        pageSwitchTo(2);
    });
    // 分享
    CHILDS.activityBox.delegate('.J_btn_share', 'click', function (e) {
        // console.log('=========== 分享');
        var str = CHILDS.pageResult.html();
        CHILDS.pageShare.html(str);

        var html = shareHtml();
        CHILDS.pageShare.find('.J_share_wrap').html(html);
        CHILDS.shareImgWrap = $('#J_page_shareimg .J_result_item');
        CHILDS.shareImgWrap.addClass('result-outer');
        CHILDS.shareImgWrap.find('.J_result_qrcode').remove();

        pageSwitchTo(5, function () {
            var timer = setTimeout(function () {
                createImage();
            }, 100);
        });
    });

    function tapLayer () {
        if(CHILDS.tostIsShow) {
            return;
        }
        if(CHILDS.currentPage == 5) {
            pageSwitchTo(4);
            hideLayer();
        }
    }
    if(CHILDS.qrcodeClose && CHILDS.qrcodeClose.length) {
        CHILDS.qrcodeClose.on('tap', tapLayer);
    }
    // 
    if(CHILDS.animLoad && CHILDS.animLoad.length) {
        CHILDS.animLoadWalk({
            wrap: CHILDS.animLoad,
            ww: 240,
            wh: 300
        });
    }
    // 
    initWin();
    // 
    function initWin () {
        var w = $(window).width();
        var h = $(window).height();
        // if(w > 750) {
        //     w = 750;
        // }
        if(!isWideScreen()) {
            w = w + "px";
            h = h + "px";
            // $("html").height(h);
            // CHILDS.activityBox.height(h).width(w);
            mainScene.height(h).width(w);
            // CHILDS.pages.height(h);
        }
    }
    // 检测输入昵称
    function checkNickname (txt) {
    	if(!txt.trim().length) {
    		return false;
    	}
    	return true
    }
    //聚焦
    function takeFocus () {
        CHILDS.inputUser.trigger('focus');
    }
    // 页面跳转
    function pageSwitchTo (num, callback) {
        // console.log('============= page-switch-to= ', num);
        CHILDS.currentPage = num;// 当前页
        // 
        var sty = STYPE_PAGE_SCREEN + '3';
        if(num == 3 || num == 4  || num == 5) {
            if(!CHILDS.pageCont.hasClass(sty)) {
                CHILDS.pageCont.addClass(sty);
            }
        }
        else {
            if(CHILDS.pageCont.hasClass(sty)) {
                CHILDS.pageCont.removeClass(sty);
            }
        }
        if(num == 5) {
            CHILDS.pageMusic.css('zIndex', 99);
        }
        else {
            CHILDS.pageMusic.css('zIndex', 999);
        }
		if(num == 1) {
			if(userInfo.nickname) {
				CHILDS.inputUser.val(userInfo.nickname);
                CHILDS.inputUser.trigger('input');
			}
            pageMove(num, function () {
                // takeFocus();
                // CHILDS.mbody.removeClass(STYPE_PAGE_SCREEN+'0');
            });
            
            CHILDS.animLoginScene({
                wrap: $('.J_login_banner'),
                ww: 750,
                wh: 810
            });
		}
		else if(num == 2) {
			if(LAYER_IS_SHOW) {
				hideLayer();
			}
            else {
                if(userInfo.area) {
                    pageQuetsWrap.removeClass('qustion-'+userInfo.area);
                }
                pageMove(num);

                if(!CHILDS.isLoadMain) {
                    CHILDS.animMainScene({
                        wrap: mainScene,
                        ww: 750,
                        wh: 1334,
                        rectBindEvent: rectBindEvent
                    }, function () {
                        CHILDS.isLoadMain = true;
                    });
                }
            }
		}
		else if(num == 3) {
			if(LAYER_IS_SHOW) {
				hideLayer();
			}
            userInfo.issueNum = 0;
            userInfo.question = {};
            pageQuetsWrap.addClass('qustion-'+userInfo.area);
			renderQustions();
			choiceQuestion(userInfo.issueNum, true);
            pageMove(num);
		}
		else if(num == 4) {
			renderEvaluationResult();
            pageMove(num);
		}
        else {
            pageMove(num, callback);
        }
        
	}
    // 页面移动
    function pageMove (num, callback) {
        var high = $('#J_activityBox .page-current').height();
        high = -high + 'px';

        var prev = $('#J_activityBox .page-current');
        var curt = $($('.J_pages').get(num));
        prev.addClass(STYLE_ANIM_TOP100);
        curt.addClass(STYPE_PAGE_CURT).addClass(STYLE_ANIM_BOT0);
        var timer = setTimeout(function (){
            prev.removeClass(STYPE_PAGE_CURT).removeClass(STYLE_ANIM_TOP100).css('top', '')
            curt.removeClass(STYLE_ANIM_BOT0);
            // 窄屏
            patchNarrow();
            // 
            callback && callback();
        }, 705);
    }
    // 页面自动跳转
    function pageAutoJump(num, time) {
        var timer = setTimeout(function () {
            pageSwitchTo(num);
            hideLayer();
        }, time);
    }

    function rectBindEvent (target, type) {
        target.on('tap', function(data){
            toggleTapClick(type);
        });
        target.on('click', function(data){
            toggleTapClick(type);
        });
    }

    function patchNarrow () {
        if(isWideScreen()) {
            return;
        }
        if(CHILDS.currentPage == 2) {
            setScreen(mainScene.height()+'px');
        }
        else {
            setScreen(0);
        }
    }

    function toggleTapClick (type) {
        type = type || 'school';
        userInfo.area = type;
        // console.log('===============111--rectBindEvent-', type);
        var info = childData[type];
        currentScene = info;
        var tpl = createLayerTmpl();
        var artRender = template.compile(tpl);
        var artTxt = artRender(info);
        CHILDS.layerIntros.html(artTxt);
        // $('#J_layer_wrap').removeClass('dn');
        // 
        var starDoms = CHILDS.layerIntros.find('.J_stars');
        if(info.difficulty.value && starDoms.length) {
            var strs = '';
            for(var i=0; i<info.difficulty.value; i++) {
                strs += '<span class="icon-star"></span>'
            }
            starDoms.html(strs);
        }
        // 
        showLayer();
    }

	// 生成浮层模板
	function createLayerTmpl () {
		return ['',
			'<div class="modal-item modal-{{type}}">',
			'<div class="modal-box">',
			'<div class="modalTop">',
			'<div class="modalTitle modal-title-{{type}}">{{title}}</div>',
			'<div class="modalMore"><span class="modalStone modal-stone-{{type}}""></span></div>',
			'</div>',
			'<div class="modalMid">',
                '<div class="modalbanner modal-layer-{{type}}"></div>',
			'</div>',
			'<div class="modalBot">',
			'<ul class="detailList">',
			'{{ each details as item index}}',
			'<li>',
			'<p class="modalSectionTitle">【{{item.subtitle}}】</p>',
			'<p class="modalSectionCont">{{item.info}}</p>',
			'</li>',
			'{{/each}}',
			'<li class="itemDetail clearfix">',
			'<p class="modalSectionTitle pull-left">【{{difficulty.subtitle}}】</p>',
			'<div class="starWrap J_stars"></div>',
			'</li>',
			'</ul>',
			'<div class="modalBtnWrap clearfix">',
			'<span class="btnSwitch btnPrev J_btn_changePage" data-page="2">emmmm...</span>',
			'<span class="btnSwitch btnNext J_btn_changePage" data-page="3">“铤而走险”一下！</span>',
			'</div>',
			'</div>',
			'</div>',
			'</div>'].join('');
	};
    // 问答模板
    // '<div class="askTitleItem J_ask_anim">',
    //                     '<div class="askTopicOut"><span class="askTopic">{{index+1}}. {{item.ask}}</span></div>',
    //                 '</div>',
    function createAskTmpl () {
        return [
            '{{ each questions as item index}}',
                '<div class="ask-list J_ask_item">',
                    '<div class="askTitleItem J_ask_anim">',
                        '{{index+1}}. {{item.ask}}',
                    '</div>',
                    '<ul class="qustion-list J_ask_list">',
                        '{{ each item.list as ans idx}}',
                            '<li class="qustion-item J_ask_anim J_question_ansItem" data-text="{{ans.t}}">',
                                '<span class="questChar">{{ans.t}}</span>',
                                '<span class="questTitle">{{ans.v}}</span>',
                                '<span class="questRes J_ask_icon"></span>',
                            '</li>',
                        '{{/each}}',
                    '</ul>',
                '</div>',
            '{{/each}}',
            '<div class="qustion-foot">',
                '<div class="dot-list J_question_dot">',
                    '{{ each questions as item index}}',
                    '<span class="dot-item J_quest_dotItem" data-idx="{{index}}"></span>',
                    '{{/each}}',
                '</div>',
            '</div>'
        ].join('');
    }
	// 生成结果模板
	function createResultTmpl () {
		return ['',
		'<div class="page-results result-{{type}} J_result_item">',
            '<div class="results-content">',
                '<div class="results-top results-main-bg">',
                    '<span class="results-catimg results-code-{{type}} J_result_qrcode"><img src="'+pubpath+'images/sharechild.jpg" /></span>',
                '</div>',
                '<div class="results-mid results-subs-bg">',
                    '<div class="results-wrap">',
                        '<ul class="results-list">',
                            '<li class="results-item">',
                                '<span class="restCongrats">恭喜</span>',
                                '<span class="restUser">{{nickname}}</span>',
                                '<span class="restCongrats">同学</span>',
                            '</li>',
                            '<li class="results-item">',
                                '<span class="restCongrats">获得</span>',
                                '<span class="restUser">{{label}}</span>',
                                '<span class="restCongrats">称号</span>',
                            '</li>',
                            '<li class="results-item">',
                                '<span class="restTips">{{desc}}</span>',
                            '</li>',
                        '</ul>',
                    '</div>',
                '</div>',
                '<div class="results-bot J_share_wrap">',
                    '<div class="results-btnwrap clearfix">',
                        '<span class="btnTry J_btn_try">试试其他</span>',
                        '<span class="btnDeny">',
                            '<a href="' + btnUrlFire + '" class="btnFire"></a>',
                        '</span>',
                        '<span class="btnTry btnShare J_btn_share">分享</span>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>'].join('');
	}

    function shareHtml () {
        return ['<div class="results-qrcodewrap clearfix">',
            '<span class="qrimg-wrap"><img src="static/images/sharenet.png" width="100%" height="100%" /></span>',
            '<span class="qrimg-desc">长按测测<br />你的防骗level</span>',
            '<span class="movie-banner"></span>',
        '</div>'].join('');
    }
	// 渲染问题页
	function renderQustions () {
		var info = {
			questions: CHILD_CONFIG.questions[userInfo.area]
		};

        var _tpl = createAskTmpl();
        var _render = template.compile(_tpl);
        var _html = _render(info);
        $('.J_question_asklist').html(_html);

        CHILDS.questDot = $('.J_question_dot');
	}
	// 渲染评定结果页
	function renderEvaluationResult () {
		var _area = userInfo.area;
		var _data = {
			nickname: userInfo.nickname,
			type: _area
		};
		var reslist = CHILD_CONFIG.grade[_area];
		var correctNum = getCorrectNums();
		$.extend(_data, reslist[correctNum]);
		var _tpl = createResultTmpl();
		var _render = template.compile(_tpl);
		var _html = _render(_data);
		CHILDS.pageResult.html(_html);
	}
    // 获取答案
    function getAnswer(res) {
        var quest = CHILD_CONFIG.questions[userInfo.area];
        var items = quest[userInfo.issueNum];
        var flag;
        var ans;
        for(var i=0; i<items.list.length; i++) {
            if(items.list[i].t == items.ans) {
                flag = i;
                break;
            }
        }
        return {idx: flag, ans: items.ans};
    }
	// 获取正确数
	function getCorrectNums () {
		var ques = CHILD_CONFIG.questions[userInfo.area];
		var nums = ques.length;
		var res = 0;
		for (var i = 0; i<nums; i++) {
			var isAns = userInfo.question[i];
			if(isAns == ques[i].ans) {
				res += 1;
			}
		};
		return res;
	}
    /**
    * isSetTime是否要延迟
    */
	function choiceQuestion (num, isSetTime) {
		var len = CHILD_CONFIG.questions[userInfo.area].length;
		num = num> len-1 ? 0 : num;
		userInfo.issueNum = num;

        var askCurrent = pageQuetsWrap.find('.'+STYLE_QUEST_ACTIVE);
        var askNext = pageQuetsWrap.find('.J_ask_item').eq(num);

        var itemsCur = askCurrent.find('.J_ask_anim');
        var itemsNxt = askNext.find('.J_ask_anim');

        var dotItem = CHILDS.questDot.find('.J_quest_dotItem');

        askNext.addClass(STYLE_QUEST_ACTIVE);
        askCurrent.removeClass(STYLE_QUEST_ACTIVE);
        itemsCur.removeClass(STYLE_ANIM_ASK);

        var timeNum = isSetTime ? 400 : 10;
        var timer = setTimeout(function () {
            itemsNxt.addClass(STYLE_ANIM_ASK);
            CHILDS.questDot.addClass(STYLE_ANIM_ASK);
            dotItem.removeClass(STYLE_DOT_CURRENT).eq(num).addClass(STYLE_DOT_CURRENT);
        }, timeNum);

	}
	// 检测是否答完
	function checkAllIssue () {
		var nums = CHILD_CONFIG.questions[userInfo.area].length;
		var flag = 0;
		for (var i = 0; i<nums; i++) {
			var isAns = userInfo.question[i];
			if(!isAns) {
				flag += 1;
			}
		};
		if(!flag) {
			return true;
		}
		return false;
	}
    function showLayer (opt) {
        opt = opt || {};
        // 宽屏
        patchWide();

        if(CHILDS.currentPage == 2) {
            if(CHILDS.layerQrimg.css('display')!='none') {
                CHILDS.layerQrimg.hide();    
            }
            CHILDS.layerIntros.show();
        }
        if(CHILDS.currentPage == 5) {
            if(CHILDS.layerIntros.css('display')!='none') {
                CHILDS.layerIntros.hide();
            }
            CHILDS.layerQrimg.show();
        }
        opt.opacity = opt.opacity || '0.4'
        CHILDS.layerCont.css({
            'opacity' : 0,
            'visibility' : 'visible',
            'display': 'block',
            'zIndex': 101
        });
        CHILDS.layerCover.css('opacity', opt.opacity).fadeIn(150);
        var timer = setTimeout(function () {
            CHILDS.layerCont.animate({
                "opacity" : 1
            }, 300);
            LAYER_IS_SHOW = true;
        }, 0);
    }
    function hideLayer () {
        // 宽屏
        patchWide();
        // 
    	CHILDS.layerCover.fadeOut(150);
        CHILDS.layerCont.css({
            'zIndex': 5,
            'opacity' : 0,
            'visibility' : 'visible',
            'display': 'none'
        });
        LAYER_IS_SHOW = false;
    }

    function patchWide () {
        if(isWideScreen()) {
            if(CHILDS.currentPage == 5) {
                CHILDS.isPatched = true;
                setScreen('100%');
            }
            else if(CHILDS.isPatched) {
                CHILDS.isPatched = false;
                setScreen(0);
            }
        }
    }

    function setScreen (high) {
        if(high) {
            $('html').css({ 'height': high, 'overflow': 'hidden' });
            $('body').css({ 'height': high, 'overflow': 'hidden' });
        }
        else {
            $('html').css({ 'height': '', 'overflow': '' });
            $('body').css({ 'height': '', 'overflow': '' });
        }
    }

    function checkplat () {
        var ua = navigator.userAgent.toLowerCase();
        if(ua.match(/MicroMessenger/i)=="micromessenger") {
            return true;
        }
        return false;
    }

    function shareTost () {
        var tost = $('#J_share_tost');
        tost.show();
        
        var timer1 = setTimeout(function () {
            var thigh = tost.height();
            var twide = tost.width();
            var hhigh = $('html').height();
            var hwide = $('html').width();
            var _top = hhigh - thigh;
            _top = parseInt(_top * 2 / 5, 10);
            var _left = hwide - twide;
            _left = parseInt(_left/2);
            tost.css({
                'zIndex': '120',
                'top': _top + 'px',
                'left': _left + 'px'
            });
            tost.animate({ 'opacity' : '1' }, 300).fadeIn(150);
            CHILDS.tostIsShow = true;
            var timer2 = setTimeout(function() {
                tost.fadeOut(200).css({
                    'opacity': '0',
                    'zIndex': '0'
                });
                CHILDS.tostIsShow = false;
            }, 3000);
        }, 500);
    }

    $.fn.pops = function(){
        var element = $(this);
        element.delegate('.J_btn_changePage', 'click', function(e){
            var pageNum = $(this).data("page");
            // console.log('==============', pageNum);
            pageSwitchTo(pageNum);
        });
    };
    CHILDS.layerIntros.pops();

    function isWideScreen() {
        return window.innerWidth > 750;
    }

    function createImage () {
        var dom = $('#J_page_shareimg .J_result_item');
        var w = dom.width(), h = dom.height();
        html2canvas(dom[0], {
            width: w,
            height: h,
            dpi: window.devicePixelRatio
        }).then(function (canvas) {
            var dataUrl = canvas.toDataURL("image/png", 1.0);
            insertImage(dataUrl);
        });
    }

    function insertImage (imgUrl) {
        var newImg = $('#J_create_img')[0];
        newImg.src = imgUrl;
        CHILDS.shareData.imgUrl = imgUrl;
        // 
        shareTost();
        showLayer({opacity: '0.7'});
        var timer = setTimeout(function () {
            CHILDS.shareImgWrap.empty();
        }, 10);
    }

    function getConfig () {
        return $('#J_activityBox').data();
    }

    // share.
    CHILDS.shareData = {
        title: '来测测你的防骗level',
        desc: '生活无法“铤而走险”？这里试试',
        imgUrl: 'http://m.maite.online/static/images/atrisk.png',
        link: 'http://m.maite.online/',
        callback: function () {},
        success: function(){
            // alert('分享设置成功');
        }
    };

    CHILDS.initWxShare = function () {
        var parms = getConfig();
        CHILDS.wxConfig = parms;
        CHILDS.shareData.appId = parms.appId;
        wx.config({
            debug: false,
            appId: parms.appId,
            timestamp: parms.timestamp,
            nonceStr: parms.nonceStr,
            signature: parms.signature,
            jsApiList: [
                'checkJsApi',
                'updateAppMessageShareData',
                'updateTimelineShareData'
            ]
        });
        wx.ready(function() {
            wx.updateAppMessageShareData(CHILDS.shareData);
            wx.updateTimelineShareData(CHILDS.shareData);
        });
    }
    //微信
    CHILDS.shareInit_weixin = function(){
        var ua = CHILDS.parseUA();
        if(!ua.weixin) {
            return;
        }
        var onBridgeReady = function(){
            try {
                WeixinJSBridge.call('showOptionMenu');
                WeixinJSBridge.call('hideToolbar');
                // 发送给好友;
                WeixinJSBridge.on('menu:share:appmessage', function(argv){
                    WeixinJSBridge.invoke('sendAppMessage',{
                        "appid": CHILDS.shareData.appId,
                        "img_url": CHILDS.shareData.imgUrl,
                        "img_width": "120",
                        "img_height": "120",
                        "link": CHILDS.shareData.link,
                        "desc": CHILDS.shareData.desc,
                        "title": CHILDS.shareData.title
                    }, CHILDS.shareData.callback);
                });
                // 分享到朋友圈;
                WeixinJSBridge.on('menu:share:timeline', function(argv){
                    (CHILDS.shareData.callback)();
                    WeixinJSBridge.invoke('shareTimeline',{
                        "img_url": CHILDS.shareData.imgUrl,
                        "img_width":"120",
                        "img_height":"120",
                        "link": CHILDS.shareData.link,
                        "desc": CHILDS.shareData.desc,
                        "title": CHILDS.shareData.title
                    }, CHILDS.shareData.callback);
                });
            }catch(e) {}
        };
        if(document.addEventListener){
            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
        }else if(document.attachEvent){
            document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
            document.attachEvent('onWeixinJSBridgeReady' , onBridgeReady);
        }
    };

    CHILDS.parseUA = function(){
        var u = navigator.userAgent;
        var u2 = navigator.userAgent.toLowerCase();
        return { //移动终端版本信息
            mobile: !!u.match(/(iPhone|iPod|Android|ios|Mobile)/i), //是否为移动终端
            pc: !u.match(/(iPhone|iPod|Android|ios|Mobile)/i), //是否为pc终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //是否为ios终端
            android: u.indexOf('Android') > -1, //是否为android终端
            weixin: u2.match(/MicroMessenger/i) == "micromessenger" //是否为微信客户端
        };
    };

    var wxtimer = setTimeout(function () {
        CHILDS.initWxShare();
    }, 500);
    try {
        CHILDS.shareInit_weixin();
    }
    catch(e) {}

    // pageSwitchTo(2);
});

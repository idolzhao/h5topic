/*
* child.
* */
var CHILDS = window.CHILDS || {};
var STYLE_SELECTED = 'selected';
var STYPE_PAGE_CURT = 'page-current';
var STYPE_PAGE_SCREEN = 'page-screen-';
var STYLE_ANIM_TOP100 = 'page-enter-top-100';
var STYLE_ANIM_BOT0 = 'page-enter-bottom-0';
var STYPE_ICON_ERR = 'icon-error';
var STYPE_ICON_RIGHT = 'icon-correct';
var STYLE_QUEST_ACTIVE = 'qustion-active';
var STYLE_DOT_CURRENT = 'dot-current';
var STYLE_ANIM_ASK = 'qustion-animIn';
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
    CHILDS.mbody = $('body');
    CHILDS.activityBox = $('#J_activityBox');
    CHILDS.btnStart = $('.J_btn_login');
    CHILDS.inputUser = $('.J_input_user');

    CHILDS.pages = $('.J_pages');// 页面

    CHILDS.loadBox = $('.J_loadBg');
    CHILDS.loadtxt = $('.J_loadTxt');

    CHILDS.pageResult = $('#J_page_results');
    CHILDS.pageShare = $('#J_page_shareimg');

    CHILDS.layerCont = $('.J_layerCont');
    CHILDS.layerCover = $('.J_layerBg');
    CHILDS.questDot = $('.J_question_dot');

    var topMeasure  = parseInt(CHILDS.layerCont.css('top'));
    var topOffset = CHILDS.layerCont.height() + topMeasure;

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
    handleLoad();
	
    // 背景音乐
    CHILDS.audioImg = $('.J_audioImg');
    CHILDS.audioElem = $('.J_audioMusic');
    CHILDS.musicIsPlay = false;

    CHILDS.audioImg.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (CHILDS.musicIsPlay) {
            CHILDS.audioImg.removeClass('rotate');
            CHILDS.audioElem[0].pause();
        }
        else {
            CHILDS.audioImg.addClass('rotate');
            CHILDS.audioElem[0].play();
        }
        CHILDS.musicIsPlay = !CHILDS.musicIsPlay;
    });
    // page-login
    // btn-开始冒险
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
    CHILDS.activityBox.on("touchmove", function(e) {
         return false;
    });
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

        var icon = $(this).find('.J_ask_icon');
        var res = checkResults(_data.text);
        icon.addClass(STYPE_ICON_RIGHT);
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
    CHILDS.activityBox.delegate('.J_btn_share', 'click', function (e) {
        // console.log('=========== 分享');
        var str = CHILDS.pageResult.html();
        CHILDS.pageShare.html(str);

        var html = shareHtml();
        CHILDS.pageShare.find('.J_share_wrap').html(html);
        CHILDS.shareImgWrap = $('#J_page_shareimg .J_result_item');
        CHILDS.shareImgWrap.addClass('result-outer');
        // pageSwitchTo(5, createImage);
        pageSwitchTo(5);
    });
    // 
    CHILDS.animLoadWalk({
        wrap: $('.J_load_anim'),
        ww: 240,
        wh: 300
    });
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
            $("html").height(h);
            CHILDS.activityBox.height(h).width(w);
            mainScene.height(h).width(w);
            CHILDS.pages.height(h);
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
        if(num == 3 || num == 4) {
            var sty = STYPE_PAGE_SCREEN + '3';
            if(!CHILDS.mbody.hasClass(sty)) {
                CHILDS.mbody.addClass(sty);
            }
        }
        else {
            if(CHILDS.mbody.hasClass(sty)) {
                CHILDS.mbody.removeClass(sty);
            }
        }
		if(num == 1) {
			if(userInfo.nickname) {
				CHILDS.inputUser.val(userInfo.nickname);
			}
            pageMove(num, function () {
                takeFocus();
                CHILDS.mbody.removeClass(STYPE_PAGE_SCREEN+'0');
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
                CHILDS.animMainScene({
                    wrap: mainScene,
                    ww: 750,
                    wh: 1334,
                    rectBindEvent: rectBindEvent
                });
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

            callback && callback();
        }, 705);
    }
    function rectBindEvent (target, type) {
        target.on('tap', function(data){
            type = type || 'school';
            userInfo.area = type;
            // console.log('===============111--rectBindEvent-', type);
            var info = childData[type];
            currentScene = info;
            var tpl = createLayerTmpl();
            var artRender = template.compile(tpl);
            var artTxt = artRender(info);
            CHILDS.layerCont.html(artTxt);
            $('#J_layer_wrap').removeClass('dn');
            // 
            var starDoms = CHILDS.layerCont.find('.J_stars');
            if(info.difficulty.value && starDoms.length) {
                var strs = '';
                for(var i=0; i<info.difficulty.value; i++) {
                    strs += '<img src="static/images/icon_star.png" srcset="static/images/icon_star.png 375w, static/images/icon_star@2x.png 750w" alt="" />';
                }
                starDoms.html(strs);
            }
            // 
            showLayer();
        });
    }
	// 生成浮层模板
	function createLayerTmpl () {
		return ['',
			'<div class="modal-item modal-{{type}}">',
			'<div class="modal-box">',
			'<div class="modalTop">',
			'<div class="modalTitle modal-title-{{type}}">{{title}}</div>',
			'<div class="modalMore"><img src="static/images/icon_pop_adorn_{{type}}.png" srcset="static/images/icon_pop_adorn_{{type}}.png 375w, static/images/icon_pop_adorn_{{type}}@2x.png 750w" alt="" /></div>',
			'</div>',
			'<div class="modalMid">',
			'<img src="static/images/layer_{{type}}.png" srcset="static/images/layer_{{type}}.png 375w,static/images/layer_{{type}}@2x.png 750w" alt="" />',
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
			'<div class="modalBtnWrap">',
			'<span class="btnSwitch btnPrev J_btn_changePage" data-page="2">emmmm...</span>',
			'<span class="btnSwitch btnNext J_btn_changePage" data-page="3">“铤而走险”一下！</span>',
			'</div>',
			'</div>',
			'</div>',
			'</div>'].join('');
	};
    // 问答模板
    function createAskTmpl () {
        return [
            '{{ each questions as item index}}',
                '<div class="ask-list J_ask_item">',
                    '<div class="askTitleItem J_ask_anim">{{index+1}}. {{item.ask}}</div>',
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
            '{{/each}}'
        ].join('');
    }
	// 生成问题模板
	function createDotTmpl () {
		return ['{{ each questions as item index}}',
			'<li class="dot-item J_quest_dotItem" data-idx="{{index}}"><span class="dotIcon"></span></li>',
			'{{/each}}'].join('');
	}
	// 生成结果模板
	function createResultTmpl () {
		return ['',
		'<div class="page-results result-{{type}} J_result_item">',
            '<div class="results-content">',
                '<div class="results-top results-main-bg"></div>',
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
                            '<img src="static/images/but_fire.png" srcset="static/images/but_fire.png 375w, static/images/but_fire@2x.png 750w" alt=""/>',
                        '</span>',
                        '<span class="btnTry btnShare J_btn_share">分享</span>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>'].join('');
	}

    function shareHtml () {
        return ['<div class="results-qrcodewrap clearfix">',
            '<span class="qrimg-wrap"><img src="static/images/sharechild.jpg" width="100%" height="100%" /></span>',
            '<span class="qrimg-desc">长按测测<br />你的防骗level</span>',
            '<span class="movie-banner"><img src="static/images/movietext.png" srcset="static/images/movietext.png 375w, static/images/movietext@2x.png 750w" alt=""/></span>',
        '</div>'].join('');
    }

    function shareTipsHtml () {
        return ['<div class="sharetips-wrap">',
            '<img src="static/images/icon_sharetip.png" srcset="static/images/icon_sharetip.png 375w, static/images/icon_sharetip@2x.png 750w" width="100%" height="100%" />',
            '<div class="sharetips-arrow">',
                '<img src="static/images/icon_arrow.png" srcset="static/images/icon_arrow.png 375w, static/images/icon_arrow@2x.png 750w" width="100%" height="100%" />',
            '</div>',
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

        var _dottpl = createDotTmpl();
        var _dotrender = template.compile(_dottpl);
        var _dothtml = _dotrender(info);
        CHILDS.questDot.html(_dothtml);
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
    // 检查结果
    function checkResults(res) {
        var quest = CHILD_CONFIG.questions[userInfo.area];
        if(quest[userInfo.issueNum] == res) {
            return true;
        }
        return false;
    }
	// 获取正确数
	function getCorrectNums () {
		var ques = CHILD_CONFIG.questions[userInfo.area];
		var nums = ques.length;
		var res = 0;
		for (var i = 0; i<nums; i++) {
			var isAns = userInfo.question[i+1];
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
    function showLayer () {
        var _top = CHILDS.mbody.scrollTop()-topOffset;
        CHILDS.layerCont.css({
            // 'top': _top,
            'opacity' : 0,
            'visibility' : 'visible',
            'display': 'block',
            'zIndex': 101
        });
        CHILDS.layerCover.css('opacity', '0.4').fadeIn(150);
        var timer = setTimeout(function () {
            CHILDS.layerCont.animate({
                // "top": CHILDS.mbody.scrollTop()+topMeasure + 'px',
                "opacity" : 1
            }, 300);
            LAYER_IS_SHOW = true;
        }, 0);
        // 
        $("body").on('touchmove',function(event) { event.preventDefault(); }, false);
    }
    function hideLayer () {
        CHILDS.layerCont.css('zIndex', 5);
    	CHILDS.layerCover.fadeOut(150);
    	var _top = CHILDS.mbody.scrollTop()-topOffset;
        CHILDS.layerCont.css({
            // 'top': _top,
            'opacity' : 0,
            'visibility' : 'visible',
            'display': 'none'
        });
        LAYER_IS_SHOW = false;
        // 
        $("body").unbind('touchmove');
    }
    $.fn.pops = function(){
        var element = $(this);
        element.delegate('.J_btn_changePage', 'click', function(e){
            var pageNum = $(this).data("page");
            // console.log('==============', pageNum);
            pageSwitchTo(pageNum);
        });
    };
    CHILDS.layerCont.pops();

    function isWideScreen() {
        return window.innerWidth > 750;
    }
    function createImage () {
        //要转换为图片的dom对象
        var element = CHILDS.shareImgWrap[0];
        //要显示图片的img标签
        var image = $('#J_create_img')[0];
        //调用html2image方法
        html2image(element, image, function (data) {
            $('.J_qrimg_wrap').css('zIndex', 101).show();
            CHILDS.layerCover.css('opacity', '0.7').fadeIn(150);
            // console.log('============', data);
            var timer = setTimeout(function () {
                $('.J_qrimg_wrap').append(shareTipsHtml());

                initWxShare();
            }, 10);
        });
    }
    function html2image(source, image, callback) {
        html2canvas(source, {
            onrendered: function(canvas) {
                var imageData = canvas.toDataURL(1);
                image.src = imageData;
                CHILDS.shareData = imageData;
                if(callback) {
                    callback(imageData);
                }
            },
            width: 360,
            height: 600
        });
    }
    // share.
    CHILDS.shareData = {
        title: '来测测你的防骗level',
        desc: '生活无法“铤而走险”？这里试试',
        imgUrl: '',
        link: 'http://byu6990690001.my3w.com/index.html',
        callback: function(){
            // share_survey(true);
        }
    };

    function initWxShare () {
        $.ajax({
            type: "POST", 
            url: "/membervideo/share.ashx",//后台接口
            data: parms, //可选参数
            dataType: "json",
            success: function(data){ 
                timestamp = data.timestamp;
                signature = data.signature;
                wxShareConf(timestamp, signature);
            } //可选参数
        });
    }

    function wxShareConf (timestamp, signature) {
        var appId = '';
        var nonceStr = Math.floor(Math.random() * 2147483648).toString(36);
        wx.config({
            debug: true,
            appId: appId,
            timestamp: timestamp,
            nonceStr: nonceStr,
            signature: signature,
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

    // pageSwitchTo(2);
});
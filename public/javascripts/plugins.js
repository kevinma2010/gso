// Avoid `console` errors in browsers that lack a console.
var plugin = plugin || {};
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

(function () {
    plugin.common = {
        /**
         * 切换元素显示
         * @param ele 元素id
         * @param val 指定的display属性值
         */
        swithDisplay: function (ele,val) {
            if (!ele) {
                return;
            }
            ele = $(ele);
            if (!ele.css('display') && val) {
                ele.css('display') = val;
            } else if (ele.css('display') === 'block') {
                ele.css('display', val || "none");
            } else if (ele.css('display') === 'none') {
                ele.css('display',val || "block");
            }
        }
    };
})();
// Place any jQuery/helper plugins in here.
// autocomplate
(function () {
    var keys = {
        UP : 38,
        DOWN : 40,
        LEFT : 37,
        RIGHT : 39,
        ENTER : 13,
        ESC : 27,
        BACKSPACE : 8,
        TAB : 9,
        SHIFT : 16,
        CTRL : 17,
        ALT : 18,
        INSERT : 45,
        DELETE : 46,
        PAGEUP : 33,
        PAGEDOWN : 34
    };

    plugin.autocomplate = function () {
        if (arguments[1]) {
            _ac.url_prefix = arguments[1];
        }
        var e = arguments[0] || event;
        var keyCode = e.keyCode;
        if (keyCode === keys.DOWN) {
            _ac.swithFocus('DOWN');
            return false;
        } else if (keyCode === keys.UP) {
            _ac.swithFocus('UP');
            return false;
        } else if (keyCode === keys.ESC) {
            plugin.common.swithDisplay(".search__autocomplete");
        } else if (keyCode === keys.ENTER) {
            _ac.entered = true;
            plugin.common.swithDisplay(".search__autocomplete", "none");
        }
        setTimeout(_ac.request, 100);
        // _ac.request();
    };

    var _ac = {
        wrap: $(".acp-wrap"),
        req: null,
        url_prefix: '//awk.so',
        lastTime: null,
        entered: false,
        cache: {},
        request: function () {
            if (_ac.req) {
                _ac.req.abort();
            }
            if (_ac.entered) {
                return;
            }
            var q = $("#id_s_text").val();
            if (!q) {
                plugin.common.swithDisplay(".search__autocomplete", "none");
                return;
            }
            /*
            使用内存缓存
             */
            if (_ac.cache[q]) {
                _ac.render(_ac.cache[q]);
                return;
            }
            _ac.req = $.ajax({
                url: _ac.url_prefix+'/complete/search?client=firefox&q='+q,
                type: 'post',
                contentType: "application/json; charset=utf-8",
                dataType: 'jsonp',
                success: function (resD) {
                    if (resD && resD.length >= 2) {
                        _ac.cache[resD[0]] = resD[1];
                        _ac.render(resD[1]);
                    }
                }
            });/*
            _ac.req = $.getJSON(_ac.url_prefix+'/complete/search?client=firefox&q='+q+'&callback=?', function (resD) {
                if (resD && resD.length >= 2) {
                    _ac.cache[resD[0]] = resD[1];
                    _ac.render(resD[1]);
                }
            });*/
        },
        render: function (arr) {
            var r = [];
            if (arr.length === 0) {
                return;
            }
            for (var i = 0; i < arr.length; i++) {
                r.push('<div class="acp" data-index="'+i+'">'+arr[i]+'</div>');
            };
            r = r.join('');
            $('div.acp-wrap').html(r)
            _ac.bindMou();
            _ac.bindMov();
            _ac.bindClick();
            plugin.common.swithDisplay(".search__autocomplete", "block");
        },
        /**
         * 使指定项选中焦点
         **/
        focusItem: function (index) {
            _ac.wrap.find(".acp.hover").removeClass("hover");
            var currVal = _ac.wrap.find(".acp").eq(index).addClass("hover").text();
            $("#id_s_text").val(currVal);
        },
        /**
         * 切换焦点
         **/
        swithFocus: function (type) {
            var isUp = type === 'UP';
            var hoverItem = _ac.wrap.find(".acp.hover");
            var listSize = _ac.wrap.find(".acp").length;
            if (hoverItem && hoverItem.length !== 0) {
                var currIndex = hoverItem.eq(0).attr("data-index");
                hoverItem.removeClass("hover");
                currIndex = parseInt(currIndex);
                if ((isUp? --currIndex : ++currIndex) === (isUp? -1 : listSize)) {
                    _ac.focusItem(isUp? listSize-1 : 0);
                } else {
                    _ac.focusItem(currIndex);
                }
            } else {
                _ac.focusItem(isUp? listSize-1:0);
            }
        },
        bindMov: function () {
            _ac.wrap.find(".acp").bind("mouseover",function () {
                _ac.wrap.find(".acp.hover").removeClass("hover");
                $(this).addClass("hover");
            });
        },
        bindMou: function () {
            _ac.wrap.find(".acp").bind("mouseout",function () {
                $(this).removeClass("hover");
            });
        },
        bindClick: function () {
            _ac.wrap.find(".acp").bind("click",function () {
                var text = _ac.wrap.find(".acp.hover").eq(0).text();
                plugin.common.swithDisplay(".search__autocomplete");
                $("#id_s_text").val(text).focus();
            });
        }
    };
})();

(function () {
    plugin.headroom = function (selector) {
        var myElement = document.querySelector(selector);
        // 创建 Headroom 对象，将页面元素传递进去
        var headroom  = new Headroom(myElement, {
            classes : {
              pinned : 'headroom-pinned',
              unpinned : 'headroom-unpinned'
            },
            onUnpin: function () {
                plugin.common.swithDisplay(".search__autocomplete",'none');
                plugin.common.swithDisplay('.dropdown-menu.lang', 'none');
                plugin.common.swithDisplay('.dropdown-menu.qdr', 'none');
            }
        });
        // 初始化
        headroom.init(); 
    };
})();

(function () {
    var tool = plugin.toolbar = {};

    tool.lang = {
        swithDropMenu: function () {
            plugin.common.swithDisplay('.dropdown-menu:not(\'.lang\')','none');
            plugin.common.swithDisplay('.dropdown-menu.lang');
        },
        bindClick: function () {
            $('.dropdown-menu.lang').find('a').on('click', function () {
                plugin.common.swithDisplay('.dropdown-menu.lang');
                var curr_index = $(this).attr('data-index');
                var input_index = $("#opt_lang").val();
                if (curr_index == input_index) {
                    return false;
                }
                $("#opt_lang").val(curr_index);
                document.forms[0].submit();
            });
        }
    };

    tool.qdr = {
        swithDropMenu: function () {
            plugin.common.swithDisplay('.dropdown-menu:not(\'.qdr\')','none');
            plugin.common.swithDisplay('.dropdown-menu.qdr');
        },
        bindClick: function () {
            $('.dropdown-menu.qdr').find('a').on('click', function () {
                plugin.common.swithDisplay('.dropdown-menu.qdr');
                var curr_index = $(this).attr('data-index');
                var input_index = $("#opt_qdr").val();
                if (curr_index == input_index) {
                    return false;
                }
                $("#opt_qdr").val(curr_index);
                document.forms[0].submit();
            });
        }
    };
})();

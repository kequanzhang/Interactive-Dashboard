(function() {
    function getInternetExplorerVersion() {
        var rv = 100;
        if (navigator.appName == 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null)
                rv = parseFloat(RegExp.$1);
        } else if (navigator.userAgent.indexOf('Trident') > -1) {
            return 11;
        }
        return rv;
    }

    function popUpdateConfirm() {
        if (confirm('您使用的浏览器版本过低, 无法正常使用本网站\n建议更新浏览器')) {
            location.href = '/static/update_browsers.html';
        }
    }

    function insertNoticeBanner() {
        var el = document.createElement('div');
        el.id = 'browsers-notice';
        el.innerHTML = '<div style="z-index:10000;text-align:center;font-size:16px;position:fixed;width:100%;bottom:0;left:0;background:rgba(41, 141, 255, 0.9);color:#fff;padding:18px;">当前浏览器版本过低, 某些功能无法使用 <a href="/static/update_browsers.html" style="text-decoration:underline;color:#fff;margin-left:6px">去更新</a></div>';
        document.body.appendChild(el);
    }

    var version = getInternetExplorerVersion();
    var featuresMissing =
    !window.Promise ||
    !window.WebSocket ||
    !window.localStorage ||
    !window.requestAnimationFrame ||
    !window.postMessage ||
    !window.Worker;

    if (version < 11) {
        popUpdateConfirm();
    } else if (version <= 11 || featuresMissing) {
        insertNoticeBanner();
    }
})();

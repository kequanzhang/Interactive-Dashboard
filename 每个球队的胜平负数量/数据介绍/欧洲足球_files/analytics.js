(function () {
  if (navigator.userAgent.match(/sparender/i)) {
    return;
  }

  // 所有埋点行为共享入口
  const heywhaleTrack = {
    _handlers: {
      event: [],
      pageview: [],
      setUser: []
    },
    event(action = '', category = '', label = '', value = '') {
      this._handlers.event.forEach(fn => {
        try {
          fn(action, category, label, value);
        } catch (e) {
          console.error(e);
        }
      });
    },
    pageview(path) {
      if (!path) {
        return;
      }
      this._handlers.pageview.forEach(fn => {
        try {
          fn(path);
        } catch (e) {
          console.error(e);
        }
      });
    },
    setUser(user = '', organization = '') {
      this._handlers.setUser.forEach(fn => {
        try {
          fn(user, organization);
        } catch (e) {
          console.error(e);
        }
      });
    },
    registerHandler(name, fn) {
      if (!this._handlers[name]) {
        return;
      }
      if (this._handlers[name].indexOf(fn) < 0) {
        this._handlers[name].push(fn);
      }
    }
  };

  window.heywhaleTrack = heywhaleTrack;

  const utils = {
    getRandomStr() {
      return [
        Math.ceil(Date.now()).toString(36),
        Math.ceil(268435456 * Math.random()).toString(36)
      ].join('_').toUpperCase();
    },
    getClientId() {
      const k = 'x_hw_client_id';
      let v = localStorage.getItem(k);
      if (!v) {
        v = utils.getRandomStr();
        localStorage.setItem(k, v);
      }
      return v;
    },
    appendScript(src) {
      var mountEl = document.getElementsByTagName('script')[0];
      var el = document.createElement('script');
      el.src = src;
      el.async = true;
      mountEl.parentNode.insertBefore(el, mountEl);
    },
    bufferStorage(action, data) {
      const key = 'x_hw_analytics_store';
      switch (action) {
        case 'read':
          const item = localStorage.getItem(key);
          localStorage.removeItem(key);
          return item ? JSON.parse(item) : [];
        case 'write':
          localStorage.setItem(key, JSON.stringify(data));
          break;
      }
    },
    flatValue(value, ret) {
      if (typeof value === 'object' && !value.forEach) {
        Object.keys(value).forEach(key => {
          ret['value_' + utils.fixName(key)] = value[key];
        });
      }
      else {
        ret.value = value;
      }
    },
    fixName(name) {
      return name.replace(/-/g, '_');
    }
  };

  function setupGA() {
    const GA_KEY = 'UA-102945565-2';
    utils.appendScript('https://www.googletagmanager.com/gtag/js?' + GA_KEY);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      dataLayer.push(arguments)
    };
    gtag('js', new Date());
    gtag('config', GA_KEY);

    heywhaleTrack.registerHandler('pageview', function (path) {
      gtag('config', GA_KEY, {
        page_path: path
      });
    });

    heywhaleTrack.registerHandler('event', function (action, category, label, value) {
      gtag('event', action, {
        event_category: category,
        event_label: label
      });
    });

    heywhaleTrack.registerHandler('setUser', function (user, organization) {
      gtag('set', {
        'user_id': user
      });
    });
  }

  function setupBaidu() {
    const BAIDU_KEY = 'e271fea39e19da790199f2c36b18b6b6';
    utils.appendScript('https://hm.baidu.com/hm.js?' + BAIDU_KEY);
    window._hmt = window._hmt || [];

    heywhaleTrack.registerHandler('pageview', function (path) {
      _hmt.push(['_trackPageview', path]);
    });

    heywhaleTrack.registerHandler('event', function (action, category, label, value) {
      _hmt.push(['_trackEvent', category, action, label]);
    });

    // heywhaleTrack.registerHandler('setUser', function (user, organization) {});
  }

  function setupSensorData() {
    (function (para) {
      var p = para.sdk_url, n = para.name, w = window, d = document, s = 'script', x = null, y = null;
      if (typeof (w['sensorsDataAnalytic201505']) !== 'undefined') {
        return false;
      }
      w['sensorsDataAnalytic201505'] = n;
      w[n] = w[n] || function (a) { return function () { (w[n]._q = w[n]._q || []).push([a, arguments]); } };
      var ifs = ['use', 'track', 'quick', 'register', 'registerPage', 'registerOnce', 'trackSignup', 'trackAbtest', 'setProfile', 'setOnceProfile', 'appendProfile', 'incrementProfile', 'deleteProfile', 'unsetProfile', 'identify', 'login', 'logout', 'trackLink', 'clearAllRegister', 'getAppStatus', 'setItem', 'deleteItem'];
      for (var i = 0; i < ifs.length; i++) {
        w[n][ifs[i]] = w[n].call(null, ifs[i]);
      }
      if (!w[n]._t) {
        w[n].para = para;
        utils.appendScript(p);
      }
    })({
      sdk_url: 'https://cdn.kesci.com/lib/sensorsdata.1.21.13.min.js',
      name: 'sensorsdata',
      server_url: 'https://shence-push.heywhale.com/sa?project=production',
      heatmap: {
        scroll_notice_map: 'default'
      },
      show_log: location.host === 'test-vnrklpqeut.heywhale.com',
      is_track_single_page: true,
      send_type: 'beacon',
      batch_send: true
    });
    sensorsdata.quick('useModulePlugin','SiteLinker',
      {
        linker: [
          {
            part_url: 'modelwhale.com', 
            after_hash: false
          }
      	]
      }
  	);
    sensorsdata.quick('autoTrack');
    sensorsdata.use('PageLoad');
    sensorsdata.use('PageLeave', { heartbeat_interval_time: 5 });


    // 神策使用SDK自带的pageview方法
    // heywhaleTrack.registerHandler('pageview', function(path) {});

    heywhaleTrack.registerHandler('event', function (action, category, label, value) {
      const body = {
        originalName: action,
        category: category,
        label: label,
        referrer: document.referrer || ''
      };
      if (value) {
        utils.flatValue(value, body);
      }
      sensorsdata.track(utils.fixName(action), body);
    });

    heywhaleTrack.registerHandler('setUser', function (user, organization) {
      sensorsdata.login(user);
      if (organization) {
        sensorsdata.registerPage({
          organization: organization
        });
      }
    });
  }

  function setupCustomLogger() {
    const myLogger = {
      buffer: [],
      logIndex: 0,
      windowId: utils.getRandomStr(),
      user: '',
      organization: '',
      client: utils.getClientId(),
      timer: null,
      _flush() {
        const items = utils.bufferStorage('read').concat(this.buffer);
        if (items.length > 0) {
          fetch('https://statistics.heywhale.com/logs', {
            method: 'POST',
            body: JSON.stringify({
              data: items,
            }),
            headers: {
              'content-type': 'application/json',
              'x-app': 'heywhale-statistics'
            }
          });
          this.buffer = [];
        }
      },
      _append(data) {
        const payload = Object.assign(data, {
          WindowId: this.windowId,
          Index: this.logIndex,
          Timestamp: Date.now(),
          Origin: location.origin,
          User: this.user,
          Organization: this.organization,
          Client: this.client
        });

        this.buffer.push(payload);
        this.logIndex += 1;
      },
      init() {
        if (this.timer) {
          return;
        }

        // 每隔十秒发送 buffer 中的数据
        this.timer = window.setInterval(() => {
          this._flush();
        }, 10000);

        // 如果页面打开 5s 后还未通过 API 触发 pageview，则自动生成一条记录
        // 用于没有前端 router 的简单页面
        window.setTimeout(() => {
          if (!this.buffer.some(i => i.Type === 'pageview')) {
            this.onPageview(location.pathname);
          }
        }, 5000);

        // 页面关闭时将未发送的埋点数据存入 LocalStorage
        window.addEventListener('beforeunload', () => {
          this.saveBuffer();
        });
      },
      saveBuffer() {
        if (this.buffer.length > 0) {
          utils.bufferStorage('write', this.buffer);
        }
      },
      setUser(user, organization) {
        this.user = user;
        this.organization = organization;
        this.buffer.forEach(function (item) {
          item.User = user;
          item.Organization = organization;
        });
      },
      onPageview(url) {
        this._append({
          Type: 'pageview',
          Url: url,
          Referrer: document.referrer
        });
      },
      onEvent(action, category, label, value) {
        const evt = {
          Type: 'event',
          Context: location.pathname + location.search,
          EventBody: {
            Action: action,
            Category: category,
            Label: label,
            Value: value
          }
        };
        this._append(evt);
      }
    };

    myLogger.init();

    heywhaleTrack.registerHandler('pageview', function (path) {
      myLogger.onPageview(path);
    });

    heywhaleTrack.registerHandler('event', function (action, category, label, value) {
      myLogger.onEvent(action, category, label, value)
    });

    heywhaleTrack.registerHandler('setUser', function (user, organization) {
      myLogger.setUser(user, organization);
    });

  }


  setupGA();
  setupBaidu();
  setupSensorData();
  setupCustomLogger();

})();

(function () {
  sourceStr = '░░\\   ░░\\  ░░░░░░░░\\   ░░░░░░\\    ░░░░░░\\   ░░░░░░\\\n░░ | ░░  | ░░  _____| ░░  __░░\\  ░░  __░░\\  \\_░░  _|\n░░ |░░  /  ░░ |       ░░ /  \\__| ░░ /  \\__|   ░░ |\n░░░░░  /   ░░░░░\\     \\░░░░░░\\   ░░ |         ░░ |\n░░  ░░<    ░░  __|     \\____░░\\  ░░ |         ░░ |\n░░ |\\░░\\   ░░ |       ░░\\   ░░ | ░░ |  ░░\\    ░░ |\n░░ | \\░░\\  ░░░░░░░░\\  \\░░░░░░  | \\░░░░░░  | ░░░░░░\\\n\\__|  \\__| \\________|  \\______/   \\______/  \\______|';
  console.log('%c\n' + sourceStr + '\n\n', 'color: #359eff');
})();

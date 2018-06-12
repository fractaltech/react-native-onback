'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('react-native');

var BackAndroid = _require.BackAndroid;
var BackHandler = _require.BackHandler;

var _require2 = require('lodash');

var isFunction = _require2.isFunction;
/*
onBack((ev) => {...}, this);
onBack.unmount(this);

onBack((ev) => {...}, this);
*/

var BackButton = BackHandler || BackAndroid;

var BackButtonHandler = function () {
  function BackButtonHandler() {
    var _this = this;

    _classCallCheck(this, BackButtonHandler);

    this.handlers = new Map();
    this.contexts = new Set();

    this.handleBack = function () {
      return _this.onBack();
    };
  }

  _createClass(BackButtonHandler, [{
    key: 'onBack',
    value: function onBack() {
      var ev = new BackEvent();
      var contexts = Array.from(this.contexts).reverse();

      for (var i in contexts) {
        var ctx = contexts[i];
        var handlers = Array.from(this.handlers.get(ctx)).reverse();
        for (var _i in handlers) {
          var handler = handlers[_i];
          handler.bind(ctx)(ev);

          if (!ev.propagate) {
            return true;
          }
        }
      }

      return true;
    }
  }, {
    key: 'mount',
    value: function mount() {
      var handler = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];
      var ctx = arguments[1];

      if (!this.handlers.has(ctx)) {
        this.handlers.set(ctx, new Set());
      }

      if (!this.contexts.has(ctx)) {
        this.contexts.add(ctx);
      }

      if (!this.handlers.get(ctx).has(handler)) {
        this.handlers.get(ctx).add(handler);
      }

      return this;
    }
  }, {
    key: 'unmount',
    value: function unmount() {
      switch (arguments.length) {
        case 0:
          throw new Error('invalid args');
        case 1:
          return this.unmountContext(arguments.length <= 0 ? undefined : arguments[0]);
        default:
          return this.unmountHandler(arguments.length <= 0 ? undefined : arguments[0], arguments.length <= 1 ? undefined : arguments[1]);
      }
    }
  }, {
    key: 'unmountContext',
    value: function unmountContext(ctx) {
      if (this.handlers.has(ctx) && this.contexts.has(ctx)) {
        this.handlers.delete(ctx);
        this.contexts.delete(ctx);
      }

      return this;
    }
  }, {
    key: 'unmountHandler',
    value: function unmountHandler(handler, ctx) {
      if (this.handlers.has(ctx) && this.handlers.get(ctx).has(handler)) {
        this.handlers.get(ctx).delete(handler);

        if (this.handlers.get(ctx).size === 0 && this.contexts.has(ctx)) {
          this.handlers.delete(ctx);
          this.contexts.delete(ctx);
        }
      }

      return this;
    }
  }, {
    key: 'hook',
    value: function hook() {
      BackButton.addEventListener('hardwareBackPress', this.handleBack);
    }
  }, {
    key: 'unhook',
    value: function unhook() {
      BackButton.removeEventListener('hardwareBackPress');
    }
  }]);

  return BackButtonHandler;
}();

var BackEvent = function () {
  function BackEvent() {
    _classCallCheck(this, BackEvent);

    this.propagate = true;
  }

  _createClass(BackEvent, [{
    key: 'stopPropagation',
    value: function stopPropagation() {
      this.propagate = false;
    }
  }]);

  return BackEvent;
}();

var backButtonHandler = new BackButtonHandler();
var defaultContext = {};

function onBack() {
  var handler = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];
  var ctx = arguments.length <= 1 || arguments[1] === undefined ? defaultContext : arguments[1];

  backButtonHandler.mount(handler, ctx);
}

onBack.unmount = function () {
  return arguments.length === 1 && isFunction(arguments.length <= 0 ? undefined : arguments[0]) ? backButtonHandler.unmount(arguments.length <= 0 ? undefined : arguments[0], defaultContext) : backButtonHandler.unmount.apply(backButtonHandler, arguments);
};

onBack.hook = function () {
  return backButtonHandler.hook();
};
onBack.unhook = function () {
  return backButtonHandler.unhook();
};

onBack._handler = backButtonHandler;

module.exports = onBack;
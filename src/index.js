const {
  BackAndroid,
  BackHandler
} = require('react-native');
const {isFunction} = require('lodash');
/*
onBack((ev) => {...}, this);
onBack.unmount(this);

onBack((ev) => {...}, this);
*/

const BackButton = BackHandler || BackAndroid;

class BackButtonHandler {
  constructor() {
    this.handlers = new Map();
    this.contexts = new Set();

    this.handleBack = () => this.onBack();
  }

  onBack() {
    const ev = new BackEvent();
    const contexts = Array.from(this.contexts).reverse();

    for (const i in contexts) {
      const ctx = contexts[i];
      const handlers = Array.from(this.handlers.get(ctx)).reverse();
      for (const i in handlers) {
        const handler = handlers[i];
        handler.bind(ctx)(ev);

        if (!ev.propagate) {
          return true;
        }
      }
    }

    return true;
  }

  mount(handler=(()=>{}), ctx) {
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

  unmount(...args) {
    switch (args.length) {
      case 0: throw new Error('invalid args');
      case 1: return this.unmountContext(args[0]);
      default: return this.unmountHandler(args[0], args[1]);
    }
  }

  unmountContext(ctx) {
    if (this.handlers.has(ctx) && this.contexts.has(ctx)) {
      this.handlers.delete(ctx);
      this.contexts.delete(ctx);
    }

    return this;
  }

  unmountHandler(handler, ctx) {
    if (this.handlers.has(ctx) && this.handlers.get(ctx).has(handler)) {
      this.handlers.get(ctx).delete(handler);

      if (this.handlers.get(ctx).size === 0 && this.contexts.has(ctx)) {
        this.handlers.delete(ctx);
        this.contexts.delete(ctx);
      }
    }

    return this;
  }

  hook() {
    BackButton.addEventListener('hardwareBackPress', this.handleBack);
  }

  unhook() {
    BackButton.removeEventListener('hardwareBackPress');
  }
}

class BackEvent {
  constructor() {
    this.propagate = true;
  }

  stopPropagation() {
    this.propagate = false;
  }
}

const backButtonHandler = new BackButtonHandler();
const defaultContext = {};

function onBack(handler=(()=>{}), ctx=defaultContext) {
  backButtonHandler.mount(handler, ctx);
}

onBack.unmount = (...args) => args.length === 1 && isFunction(args[0]) ?
  backButtonHandler.unmount(args[0], defaultContext) :
  backButtonHandler.unmount(...args)
;

onBack.hook = () => backButtonHandler.hook();
onBack.unhook = () => backButtonHandler.unhook();

onBack._handler = backButtonHandler;

module.exports = onBack;

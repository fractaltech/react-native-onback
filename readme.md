# react-native-onback

## Handle complex back button flows on android

### Version 1.0.0 (breaking.feature.fix)

#### Usage:

- In **index.android.js**
```js
const React = require('react');

const onBack = require('react-native-onback');

class App extends React.Component {
  componentDidMount() {
    // start handling backButton via onBack
    onBack.hook();
  }

  componentWillUnmount() {
    // stop handling backButton via onBack
    onBack.unhook();
  }

  render() {
    return (
      ...
    );
  }
}
```

- Inside a **component** with a `Navigator`
```js
const React = require('react');

const onBack = require('react-native-onback');

class SomeScreen extends React.Component {
  componentDidMount() {
    onBack(() => {
      // onBack maintains a stack of listeners.
      // This listener will be at the bottom of the stack and
      // will be called if no other listeners registered after
      // it stop the propagation of back event
      BackHandler.exitApp();
    }, this); // <----- NOTICE THE `this`. This lets onBack know the context of the listener

    onBack((ev) => {
      // This listener is one level above the previous listener,
      // as it is registered after it. It can call ev.stopPropagation
      // on the backButton event to stop any listeners registered before it
      // from responding to backButton
      if (this.refs.navigator.getCurrentRoutes().length > 1) {
        requestAnimationFrame(() => this.refs.navigator.pop());
        // this is how you stop the propagation of back button event
        // at a particular listener
        ev.stopPropagation()
      }
    }, this);
  }

  componentWillUnmount() {
    // removes all listeners registered inside this particular component
    onBack.unmount(this);
  }

  render() {
    return (
      ...
    );
  }
}
```


- Inside __any__ other random **Component** loaded via `navigator`
```js
class SomeOtherComponent extends React.Component {
  onSomeUserActionRegisterOnBackListener() {
    onBack((ev) => {
      if (this.state.someCondition) {
        this.doSomethingOnBack();
        ev.stopPropagation();
      }
    }, this);
  }

  componentWillUnmount() {
    onBack.unmount(this);
  }

  render() {
    return (
      ...
    );
  }
}

```

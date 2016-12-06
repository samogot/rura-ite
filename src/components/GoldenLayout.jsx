import './GoldenLayout.styl';
import React, {PropTypes} from 'react';
import {pacomoDecorator} from '../utils/pacomo';
import GoldenLayoutItemComponentReduxWrapper from './GoldenLayoutItemComponentReduxWrapper';
import MainTextContainer from '../containers/MainTextContainer';
import OrigTextContainer from '../containers/OrigTextContainer';
import TestItem from './TestItem';
import GoldenLayoutLib from 'golden-layout';
import {connect} from 'react-redux';
import storeShape from 'react-redux/lib/utils/storeShape';


class GoldenLayout extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.store = props.store || context.store;
    this.disconnectFakeStore = () => {};
    this.unsubscribeChanges = () => {};
    this.changeListnerTimeout = false;
    this.onResize = this.onResize.bind(this)
  }

  componentDidMount() {
    this.gl = new GoldenLayoutLib(this.props.config, this.refs.container);
    this.gl.registerComponent('redux-component', GoldenLayoutItemComponentReduxWrapper(TestItem));
    this.gl.registerComponent('text-main-component', GoldenLayoutItemComponentReduxWrapper(MainTextContainer));
    this.gl.registerComponent('text-orig-component', GoldenLayoutItemComponentReduxWrapper(OrigTextContainer));
    if (!this.gl.isSubWindow) {
      this.connectFakeStore();
      this.subscribeChanges();
      window.addEventListener('resize', this.onResize);
    }
    this.gl.init();

  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    this.unsubscribeChanges();
    this.disconnectFakeStore();
    this.gl.destroy();
  }

  connectFakeStore() {
    const subscribeFakeListener = () => {
      window['$$gl-redux-bridge-state'] = this.store.getState();
      // window.localStorage.setItem("redux-store", JSON.stringify(this.store.getState()));
      setTimeout(() => this.gl.eventHub.emit('redux-subscribe'), 0);
    };

    const dispatchFromFake = (action) => {
      this.store.dispatch(action);
    };

    window['$$gl-redux-bridge-state'] = this.store.getState();
    // window.localStorage.setItem("redux-store", JSON.stringify(this.store.getState()));
    const unsubscribe = this.store.subscribe(subscribeFakeListener);
    this.gl.eventHub.on('redux-dispatch', dispatchFromFake);

    this.disconnectFakeStore = () => {
      unsubscribe();
      this.gl.eventHub.off('redux-dispatch', dispatchFromFake);
    };
  }

  subscribeChanges() {
    // let alreadySaving = false;
    // const saveState = () => {
    //   if (!alreadySaving && this.gl.isInitialised && this.gl.openPopouts.every((w) => w.isInitialised)) {
    //     alreadySaving = true;
    //     this.props.saveLayout(this.gl.toConfig());
    //     alreadySaving = false;
    //   }
    //   else {
    //     this.changeListnerTimeout = setTimeout(changeListner, 10);
    //   }
    // };

    const changeListner = () => {
      if (this.changeListnerTimeout) {
        clearTimeout(this.changeListnerTimeout);
        this.changeListnerTimeout = false;
      }
      this.changeListnerTimeout = setTimeout(() => this.props.saveLayout(this.gl.toConfig()), 1000);
    };

    this.gl.on('stateChanged', changeListner);
    this.unsubscribeChanges = () => this.gl.off('stateChanged', changeListner);
  }

  onResize() {
    this.gl.updateSize();
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.actions && nextProps.actions != this.props.actions;
  }

  render() {
    return <div ref="container"/>;
  }

  static propTypes = {
    config: React.PropTypes.object.isRequired,
    actions: React.PropTypes.array.isRequired,
    saveLayout: React.PropTypes.func.isRequired,
    store: storeShape,
  };

}
export default pacomoDecorator(GoldenLayout)


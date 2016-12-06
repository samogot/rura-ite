import React from 'react';
import {Provider} from 'react-redux';


export default (container) => class ReduxGoldenLayoutComponent extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.store = {
      // getState: () => JSON.parse(window.localStorage.getItem("redux-store")),
      getState: () => (window.opener || window)['$$gl-redux-bridge-state'],
      dispatch: (action) => {
        this.props.glEventHub.emit('redux-dispatch', action);
        return action;
      },
      subscribe: (listner) => {
        this.props.glEventHub.on('redux-subscribe', listner);
        return () => this.props.glEventHub.off('redux-subscribe', listner);
      }
    };
  }

  render() {
    return (
      <Provider store={this.store}>
        {React.createElement(container, this.props)}
      </Provider>
    );
  }

  static propTypes = {
    glEventHub: React.PropTypes.shape({
      on: React.PropTypes.func.isRequired,
      off: React.PropTypes.func.isRequired,
      emit: React.PropTypes.func.isRequired
    }).isRequired,
    glContainer: React.PropTypes.object.isRequired
  };
};


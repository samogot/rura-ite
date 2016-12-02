import {createStore, applyMiddleware} from 'redux';
import reduxThunk from 'redux-thunk';
import reduxMulti from 'redux-multi';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {batchedSubscribe} from 'redux-batched-subscribe';
import actors from './actors';
import rootReducer from './reducers';
import Application from './Application';
import 'golden-layout/src/css/goldenlayout-base.css';
import 'golden-layout/src/css/goldenlayout-light-theme.css';
import createLogger from 'redux-logger';

const reduxLog = createLogger();

// Add middleware to allow our action creators to return functions and arrays
const createStoreWithMiddleware = applyMiddleware(
  reduxThunk,
  reduxMulti,
  reduxLog,
)(createStore);

// Ensure our listeners are only called once, even when one of the above
// middleware call the underlying store's `dispatch` multiple times
const createStoreWithBatching = batchedSubscribe(
  fn => fn()
)(createStoreWithMiddleware);

// Create a store with our application reducer
const preloadedState = JSON.parse(window.localStorage.getItem("redux-store")) || undefined;
const store = createStoreWithBatching(rootReducer, preloadedState);

// Handle changes to our store with a list of actor functions, but ensure
// that the actor sequence cannot be started by a dispatch from an actor
let acting = false;
store.subscribe(function () {
  if (!acting) {
    acting = true;

    for (let actor of actors) {
      actor(store.getState(), store.dispatch);
    }

    acting = false;
  }
});

const APP_NODE = document.getElementById('react-app');
ReactDOM.render(
  <Provider store={store}>
    <Application store={store}/>
  </Provider>,
  APP_NODE
);
//
// var config = {
//   content: [{
//     type: 'row',
//     content: [
//       {
//         type:'component',
//         componentName: 'example',
//         componentState: { text: 'Component 1' }
//       },
//       {
//         type:'component',
//         componentName: 'example',
//         componentState: { text: 'Component 3' }
//       }
//     ]
//   }]
// };
//
//
// let myLayout = new GoldenLayout( config ,document.getElementById('react-app'));
//
// myLayout.registerComponent( 'example', function( container, state ){
//   container.getElement().html( '<h2>' + state.text + '</h2>');
// });
// myLayout.init();
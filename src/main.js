import {createStore, applyMiddleware} from 'redux';
import reduxThunk from 'redux-thunk';
import reduxMulti from 'redux-multi';
import createLogger from 'redux-logger';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {batchedSubscribe} from 'redux-batched-subscribe';
import actors from './actors';
import rootReducer from './reducers';
import Application from './Application';
import 'golden-layout/src/css/goldenlayout-base.css';
import 'golden-layout/src/css/goldenlayout-light-theme.css';
import * as layoutViewActions from './actions/layoutView';
import * as textsDataActions from './actions/textsData';
import * as chaptersDataActions from './actions/chaptersData';
import * as textsViewActions from './actions/textsView';
import lorem from 'lorem-ipsum';

const reduxLog = createLogger({collapsed: true});

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
const store = createStoreWithBatching(rootReducer, preloadedState, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

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


if (!preloadedState) {
  for (let i = 1; i < 7; ++i) {
    store.dispatch(textsDataActions.addText({
      id: i,
      wiki: lorem({count: 20 + i, units: 'paragraphs'}).replace(/\n\n/g, '\n')
    }));
  }
  for (let i = 1; i < 3; ++i) {
    store.dispatch(chaptersDataActions.addChapter({
      id: i,
      text: 1 + (i - 1) * 3,
      langs: {
        jp: 2 + (i - 1) * 3,
        en: 3 + (i - 1) * 3,
      }
    }));
  }
  store.dispatch(textsViewActions.selectActiveChapter(1));
  store.dispatch(layoutViewActions.saveLayout({
    content: [{
      type: 'row',
      content: [
        {
          title: 'English',
          type: 'react-component',
          component: 'text-orig-component',
          id: 'orig-text-en',
          props: {lang: 'en'}
        },
        {
          title: 'Japan',
          type: 'react-component',
          component: 'text-orig-component',
          id: 'orig-text-jp',
          props: {lang: 'jp'}
        },
        {
          type: 'stack',
          content: [
            {
              title: 'Chapter 1',
              type: 'react-component',
              component: 'text-main-component',
              id: 'main-text-1',
              props: {chapter: 1}
            },
            {
              title: 'Chapter 2',
              type: 'react-component',
              component: 'text-main-component',
              id: 'main-text-2',
              props: {chapter: 2}
            },
          ]
        }
      ]
    }]
  }));
}
window.store = store


const APP_NODE = document.getElementById('react-app');
ReactDOM.render(
  <Provider store={store}>
    <Application store={store}/>
  </Provider>,
  APP_NODE
);

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
// } ;
//
//
// let myLayout = new GoldenLayout( config ,document.getElementById('react-app'));
//
// myLayout.registerComponent( 'example', function( container, state ){
//   container.getElement().html( '<h2>' + state.text + '</h2>');
// });
// myLayout.init();
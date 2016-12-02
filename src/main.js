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


if (!preloadedState) {
  store.dispatch(textsDataActions.addText({
    id: 1,
    wiki: lorem({count: 20, units: 'paragraphs'})
  }));
  store.dispatch(textsDataActions.addText({
    id: 2,
    wiki: lorem({count: 20, units: 'paragraphs'})
  }));
  store.dispatch(textsDataActions.addText({
    id: 3,
    wiki: lorem({count: 20, units: 'paragraphs'})
  }));
  store.dispatch(chaptersDataActions.addChapter({
    id: 1,
    text: 1,
    langs: {
      en: 3,
      jp: 2
    }
  }));
  store.dispatch(chaptersDataActions.selectActiveChapter(1));
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
          title: 'Chapter 1',
          type: 'react-component',
          component: 'text-main-component',
          id: 'main-text-1',
          props: {chapter: 1}
        }
      ]
    }]
  }));
}


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
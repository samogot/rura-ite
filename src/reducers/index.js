import {combineReducers} from 'redux';
import layoutView from './view/layoutViewReducer';
import textsData from './data/textsDataReducer';
import chaptersData from './data/chaptersDataReducer';


export default combineReducers({
  view: combineReducers({
    layout: layoutView,
  }),
  data: combineReducers({
    texts: textsData,
    chapters: chaptersData,
  }),
})

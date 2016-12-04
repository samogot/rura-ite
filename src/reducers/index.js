import {combineReducers} from 'redux';
import layoutView from './view/layoutViewReducer';
import textsView from './view/textsViewReducer';
import textsData from './data/textsDataReducer';
import chaptersData from './data/chaptersDataReducer';


export default combineReducers({
  view: (state, action) => {
    action.curLayoutState = state && state.layout;
    return combineReducers({
      layout: layoutView,
      texts: textsView,
    })(state, action)
  },
  data: combineReducers({
    texts: textsData,
    chapters: chaptersData,
  }),
})

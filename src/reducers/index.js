import combineReducers from '../utils/combineReducersFull';
import layoutView from './view/layoutViewReducer';
import textsView from './view/textsViewReducer';
import textsData from './data/textsDataReducer';
import configData from './data/configDataReducer';
import chaptersData from './data/chaptersDataReducer';


export default combineReducers({
  view: combineReducers({
    layout: layoutView,
    texts: textsView,
  }),
  data: combineReducers({
    texts: textsData,
    chapters: chaptersData,
    config: configData,
  }),
  lastAction: (state, action) => action,
})

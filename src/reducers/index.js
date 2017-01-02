import combineReducers from '../utils/combineReducersFull';
import layoutView from './view/layoutViewReducer';
import textsView from './view/textsViewReducer';
import * as textsViewSelectors from './view/textsViewReducer';
import textsData from './data/textsDataReducer';
import * as textsDataSelectors from './data/textsDataReducer';
import configData from './data/configDataReducer';
import * as configDataSelectors from './data/configDataReducer';
import chaptersData from './data/chaptersDataReducer';
import * as chaptersDataSelectors from './data/chaptersDataReducer';


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

export const getMainTextId = (state, props) => chaptersDataSelectors.getChapterMainTextId(state.data.chapters, props.chapter);
export const getOrigTextId = (state, props) => chaptersDataSelectors.getChapterLangTextId(state.data.chapters, {
  id: textsViewSelectors.getActiveChapterId(state.view.texts),
  lang: props.lang
});

export const getTextWiki = (state, id) => textsDataSelectors.getTextWiki(state.data.texts, id);
export const getTextOperationToApply = (state, id) => textsDataSelectors.getTextOperationToApply(state.data.texts, id);

export const getTextScrollTop = (state, id) => textsViewSelectors.getTextScrollTop(state.view.texts, id);
export const getTextSelection = (state, id) => textsViewSelectors.getTextSelection(state.view.texts, id);
export const getTextOffsets = (state, id) => textsViewSelectors.getTextOffsets(state.view.texts, id);

export const getConfigScrollWheelBehaviour = (state) => configDataSelectors.getConfigScrollWheelBehaviour(state.data.config);
export const getConfigScrollWheelAmount = (state) => configDataSelectors.getConfigScrollWheelAmount(state.data.config);
export const getConfigScrollAnchorSelection = (state) => configDataSelectors.getConfigScrollAnchorSelection(state.data.config);
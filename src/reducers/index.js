import combineReducers from '../utils/combineReducersFull';
import layoutView from './view/layoutViewReducer';
import * as layoutViewSelectors from './view/layoutViewReducer';
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

export const getChapterMainTextId = (state, id) => chaptersDataSelectors.getChapterMainTextId(state.data.chapters, id);
export const getChapterLangTextId = (state, props) => chaptersDataSelectors.getChapterLangTextId(state.data.chapters, props);
export const getChapterLangs = (state, id) => chaptersDataSelectors.getChapterLangs(state.data.chapters, id);
export const getChapterMainLang = (state, id) => chaptersDataSelectors.getChapterMainLang(state.data.chapters, id);


export const getTextWiki = (state, id) => textsDataSelectors.getTextWiki(state.data.texts, id);
export const getTextSourceMerges = (state, id) => textsDataSelectors.getTextSourceMerges(state.data.texts, id);
export const getTextOperationToApply = (state, id) => textsDataSelectors.getTextOperationToApply(state.data.texts, id);


export const getAlignedTextSets = (state) => layoutViewSelectors.getAlignedTextSets(state.view.layout);


export const getActiveChapterId = (state) => textsViewSelectors.getActiveChapterId(state.view.texts);
export const getFocusedTextId = (state) => textsViewSelectors.getFocusedTextId(state.view.texts);
export const getSyncedTexts = (state) => textsViewSelectors.getSyncedTexts(state.view.texts);
export const getSyncedTextsList = (state) => textsViewSelectors.getSyncedTextsList(state.view.texts);
export const getFilteredAlignedTextSets = (state) => textsViewSelectors.getFilteredAlignedTextSets(state.view.texts);
export const getLineMerges = (state) => textsViewSelectors.getLineMerges(state.view.texts);

export const getTextScrollTop = (state, id) => textsViewSelectors.getTextScrollTop(state.view.texts, id);
export const getTextSelection = (state, id) => textsViewSelectors.getTextSelection(state.view.texts, id);
export const getTextOffsets = (state, id) => textsViewSelectors.getTextOffsets(state.view.texts, id);
export const getTextHeights = (state, id) => textsViewSelectors.getTextHeights(state.view.texts, id);


export const getConfigScrollSyncTexts = (state) => configDataSelectors.getConfigScrollSyncTexts(state.data.config);
export const getConfigScrollAlignLines = (state) => configDataSelectors.getConfigScrollAlignLines(state.data.config);
export const getConfigScrollScrollAnchor = (state) => configDataSelectors.getConfigScrollScrollAnchor(state.data.config);
export const getConfigScrollSyncTextEdges = (state) => configDataSelectors.getConfigScrollSyncTextEdges(state.data.config);
export const getConfigScrollWheelBehaviour = (state) => configDataSelectors.getConfigScrollWheelBehaviour(state.data.config);
export const getConfigScrollWheelAmount = (state) => configDataSelectors.getConfigScrollWheelAmount(state.data.config);
export const getConfigScrollAnchorSelection = (state) => configDataSelectors.getConfigScrollAnchorSelection(state.data.config);
export const getConfigScrollExtraBottomHeight = (state) => configDataSelectors.getConfigScrollExtraBottomHeight(state.data.config);

export const getConfigSrcForLang = (state, lang) => configDataSelectors.getConfigSrcForLang(state.data.config, lang);


export const getMainTextId = (state, props) => getChapterMainTextId(state, props.chapter);
export const getOrigTextId = (state, props) => getChapterLangTextId(state, {
  id: getActiveChapterId(state),
  lang: props.lang
});
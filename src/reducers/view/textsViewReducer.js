import typeReducers from '../../utils/typeReducers';
import delegateReducerById from '../../utils/delegateReducerById';
import ACTION_TYPES from '../../constants/ACTION_TYPES';

const defaultItem = {
  heights: [],
  offsets: [],
  scrollTop: 0,
  scrollSetAt: 0,
  scrollSetSource: 0,
};

const oneItemReducer = typeReducers(ACTION_TYPES.TEXTS_VIEW, defaultItem, {
  UPDATE_LINES_HEIGHTS: (state, {heights}) => ({
    ...state,
    heights,
  }),
  SET_SCROLL: (state, {sourceId, scrollTop, scrollAt}) => ({
    ...state,
    scrollTop,
    scrollSetAt: scrollAt,
    scrollSetSource: sourceId,
  }),
});


const defaultState = {
  activeChapter: 0,
  scrollSync: {
    sourceId: 0,
    scrollAt: 0,
    scrollInfo: {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      clientWidth: 0,
      clientHeight: 0,
    },
    viewport: {
      from: 0,
      to: 0,
    },
    midLine: 0
  }
};


export default typeReducers(ACTION_TYPES.TEXTS_VIEW, defaultState, {
  SELECT_CHAPTER: (state, {chapter}) => ({
    ...state,
    activeChapter: chapter,
  }),
  SYNC_SCROLL: (state, {sourceId, scrollInfo, viewport, scrollAt}) => ({
    ...state,
    scrollSync: {sourceId, scrollInfo, viewport, scrollAt},
  }),
  UPDATE_LINES_HEIGHTS: delegateReducerById(oneItemReducer),
  SET_SCROLL: delegateReducerById(oneItemReducer),
})

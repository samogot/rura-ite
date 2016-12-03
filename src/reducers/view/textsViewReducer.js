import typeReducers from '../../utils/typeReducers';
import ACTION_TYPES from '../../constants/ACTION_TYPES';


const defaultState = {
  activeChapter: 0,
  scrollPosition: {
    top: 0,
    left: 0
  }
};


export default typeReducers(ACTION_TYPES.TEXTS_VIEW, defaultState, {
  SELECT_CHAPTER: (state, {chapter}) => ({
    ...state,
    activeChapter: chapter,
  }),
  SYNC_SCROLL: (state, {position}) => ({
    ...state,
    scrollPosition: position,
  }),
})

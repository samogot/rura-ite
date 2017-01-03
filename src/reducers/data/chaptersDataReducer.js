import typeReducers from '../../utils/typeReducers';
import delegateReducerById from '../../utils/delegateReducerById';
import ACTION_TYPES from '../../constants/ACTION_TYPES';

const defaultItem = {
  id: 0,
  text: 0,
  mainLang: '',
  langs: {}
};

const oneItemReducer = typeReducers(ACTION_TYPES.CHAPTERS_DATA, defaultItem, {
  UPDATE: (state, {data}) => ({
    ...state,
    ...data,
  }),
  ADD: (state, {data}) => (data),
  REMOVE: () => null
});

const defaultState = {};

export default typeReducers(ACTION_TYPES.CHAPTERS_DATA, defaultState, {
  UPDATE: delegateReducerById(oneItemReducer),
  ADD: delegateReducerById(oneItemReducer),
  REMOVE: delegateReducerById(oneItemReducer),
});

export const getChapter = (state, id) => state[id] || defaultItem;
export const getChapterMainTextId = (state, id) => getChapter(state, id).text;
export const getChapterLangTextId = (state, {id, lang}) => getChapter(state, id).langs[lang];
export const getChapterLangs = (state, id) => getChapter(state, id).langs;
export const getChapterMainLang = (state, id) => getChapter(state, id).mainLang;
import typeReducers from '../../utils/typeReducers';
import delegateReducerById from '../../utils/delegateReducerById';
import ACTION_TYPES from '../../constants/ACTION_TYPES';


const defaultItem = {
  id: 0,
  wiki: '',
  sourceMerges: [],
};


const oneItemReducer = typeReducers(ACTION_TYPES.TEXTS_DATA, defaultItem, {
  UPDATE: (state, {data}) => ({
    ...state,
    ...data,
  }),
  ADD: (state, {data}) => ({
    ...defaultItem,
    ...data,
  }),
  REMOVE: () => null,
  ADD_MERGE: (state, {merge}) => ({
    ...state,
    sourceMerges: [...state.sourceMerges, merge].sort((a, b) => b.srcFrom - a.srcFrom),
  }),
});

const defaultState = {};

export default typeReducers(ACTION_TYPES.TEXTS_DATA, defaultState, {
  UPDATE: delegateReducerById(oneItemReducer),
  ADD: delegateReducerById(oneItemReducer),
  REMOVE: delegateReducerById(oneItemReducer),
});

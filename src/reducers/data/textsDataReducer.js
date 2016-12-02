import typeReducers from '../../utils/typeReducers';
import ACTION_TYPES from '../../constants/ACTION_TYPES';


const defaultState = {'0': {text: ''}};


export default typeReducers(ACTION_TYPES.TEXTS_DATA, defaultState, {
  UPDATE: (state, {id, data}) => ({
    ...state,
    [id]: {...state[id], ...data},
  })
})

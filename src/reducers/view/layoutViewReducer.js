import typeReducers from '../../utils/typeReducers';
import ACTION_TYPES from '../../constants/ACTION_TYPES';


const defaultState = {
  config: {
    content: []
  },
  actions: []
};


export default typeReducers(ACTION_TYPES.LAYOUT_VIEW, defaultState, {
  SAVE_LAYOUT: (state, {config}) => ({
    config,
    actions: []
  }),
})

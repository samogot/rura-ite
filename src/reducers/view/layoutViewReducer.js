import typeReducers from '../../utils/typeReducers';
import ACTION_TYPES from '../../constants/ACTION_TYPES';


const defaultState = {
  config: {
    content: [{
      type: 'row',
      content: [
        {
          title: 'A react component',
          type: 'react-component',
          component: 'redux-component'
        },
        {
          title: 'Another react component',
          type: 'react-component',
          component: 'redux-component'
        }
      ]
    }]
  },
  actions: []
};


export default typeReducers(ACTION_TYPES.LAYOUT_VIEW, defaultState, {
  SAVE_LAYOUT: (state, {config}) => ({
    config,
    actions: []
  }),
})

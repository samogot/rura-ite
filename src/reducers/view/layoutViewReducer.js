import typeReducers from '../../utils/typeReducers';
import ACTION_TYPES from '../../constants/ACTION_TYPES';
import {getMainTextId, getOrigTextId, getActiveChapterId} from '../../reducers';


const defaultState = {
  config: {
    content: []
  },
  actions: [],
  alignedTextSets: [],
};

function getAlignedTextSets_(config, fullState) {
  const textSets = [];
  config.content.forEach(function recursiveAll(item) {
    switch (item.type) {
      case 'column':
        item.content.forEach(recursiveAll);
        break;
      case 'row':
        const columns = [];
        item.content.forEach(function recursiveColumns(column) {
          switch (column.type) {
            case 'row':
              column.content.forEach(recursiveColumns);
              break;
            case 'stack':
              recursiveColumns(column.content[column.activeItemIndex || 0]);
              break;
            case 'react-component':
            case 'component':
              columns.push(column);
              break;
            default:
              column.content && column.content.forEach(recursiveAll);
          }
        });
        columns.filter((item) => {
          return item.component == 'text-orig-component' || item.component == 'text-main-component' && item.props.chapter == getActiveChapterId(fullState);
        });
        if (columns.length > 1) {
          textSets.push(columns.map((item) => {
            if (item.component == 'text-orig-component') {
              return getOrigTextId(fullState, item.props);
            }
            else if (item.component == 'text-main-component') {
              return getMainTextId(fullState, item.props);
            }
          }));
        }
        break;
    }
  });
  return textSets;
}


export default typeReducers(ACTION_TYPES.LAYOUT_VIEW, defaultState, {
  SAVE_LAYOUT: (state, {config}, fullState) => ({
    config,
    actions: [],
    alignedTextSets: getAlignedTextSets_(config, fullState),
  }),
});

export const getAlignedTextSets = (state) => state.alignedTextSets;
import {createSelector} from 'reselect';

export default function createSelectorById(...args) {
  const idSelectorsMap = {};
  return (state, props) => {
    const id = props.id || props;
    if (!idSelectorsMap[id]) {
      idSelectorsMap[id] = createSelector(...args);
    }
    return idSelectorsMap[id](state, props);
  };
}
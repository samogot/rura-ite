import debounce from 'lodash.debounce';
export default function makeDebouncedActionCreator(actionCreator, delay = 0, options) {
  const debounced = debounce((params, dispatch) => dispatch(actionCreator(...params)), delay, options);
  return (...params) => debounced.bind(undefined, params);
}
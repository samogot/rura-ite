import T from '../constants/ACTION_TYPES';


export function saveLayout(config) {
  return {
    type: T.LAYOUT_VIEW.SAVE_LAYOUT,
    config,
  }
}

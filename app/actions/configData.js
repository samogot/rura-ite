import T from '../constants/ACTION_TYPES';


export function saveScrollConfig(config) {
  return {
    type: T.CONFIG_DATA.SAVE_SCROLL_CONFIG,
    config,
  }
}

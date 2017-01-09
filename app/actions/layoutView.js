import T from '../constants/ACTION_TYPES';
import {recalcOffsetsDebounce} from './textsView';


export function saveLayout(config) {
  return [
    {
      type: T.LAYOUT_VIEW.SAVE_LAYOUT,
      config,
    },
		recalcOffsetsDebounce(),
  ];
}

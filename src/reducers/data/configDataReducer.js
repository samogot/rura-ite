import typeReducers from '../../utils/typeReducers';
import ACTION_TYPES from '../../constants/ACTION_TYPES';
import SCROLL_CONFIG from '../../constants/SCROLL_CONFIG';


const defaultState = {
  scroll: {
    syncTexts: true,
    alignLines: SCROLL_CONFIG.ALIGN_LINES.ROW,
    scrollAnchor: .5,
    syncTextEdges: false,
    wheelBehaviour: SCROLL_CONFIG.WHEEL_BEHAVIOUR.DEFAULT,
    wheelAmount: 1,
    anchorSelection: false,
    extraBottomHeight: false,
  },
  srcLang: {
    jp: null,
    en: 'jp',
    cn: 'jp',
    ru: 'en',
  },
};


export default typeReducers(ACTION_TYPES.CONFIG_DATA, defaultState, {
  SAVE_SCROLL_CONFIG: (state, {config}) => ({
    ...state,
    scroll: {
      ...state.scroll,
      ...config,
    },
  }),
})

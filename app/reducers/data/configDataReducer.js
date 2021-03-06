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

export const getConfigScrollSyncTexts = (state) => state.scroll.syncTexts;
export const getConfigScrollAlignLines = (state) => state.scroll.alignLines;
export const getConfigScrollScrollAnchor = (state) => state.scroll.scrollAnchor;
export const getConfigScrollSyncTextEdges = (state) => state.scroll.syncTextEdges;
export const getConfigScrollWheelBehaviour = (state) => state.scroll.wheelBehaviour;
export const getConfigScrollWheelAmount = (state) => state.scroll.wheelAmount;
export const getConfigScrollAnchorSelection = (state) => state.scroll.anchorSelection;
export const getConfigScrollExtraBottomHeight = (state) => state.scroll.extraBottomHeight;

export const getConfigSrcLangs = (state) => state.srcLang;

export const getConfigSrcForLang = (state, lang) => state.srcLang[lang];
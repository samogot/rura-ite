import {bindActionCreators} from 'redux';
import * as actions from '../actions/textsView';


export function mapStateToProps(state, ownProps, textId) {
  const textView = state.view.texts[textId] || {};
  return {
    textId: textId,
    text: state.data.texts[textId].wiki,
    scrollTop: textView.scrollTop || 0,
    scrollSetAt: textView.scrollSetAt || 0,
    scrollSetSource: textView.scrollSetSource || 0,
    scrollSync: {
      ...state.view.texts.scrollSync,
      sourceHeights: (state.view.texts[state.view.texts.scrollSync.sourceId] || {}).heights || [],
      destHeights: textView.heights || [],
    },
    glContainer: ownProps.glContainer,
  };
}

export function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    updateLinesHeights: actions.updateLinesHeights,
    setScroll: actions.setScroll,
    syncScroll: actions.syncScroll,
  }, dispatch);
}


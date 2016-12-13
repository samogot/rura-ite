import {bindActionCreators} from 'redux';
import * as actions from '../actions/textsView';
import * as dataActions from '../actions/textsData';
import {defaultItem} from '../reducers/view/textsViewReducer';


export function mapStateToProps(state, ownProps, textId) {
  const textView = state.view.texts[textId] || defaultItem;
  return {
    textId: textId,
    text: state.data.texts[textId].wiki,
    scrollTop: textView.scrollInfo.top,
    offsets: textView.offsets,
    selections: textView.selections,
    glContainer: ownProps.glContainer,
    wheelBehaviour: state.data.config.scroll.wheelBehaviour,
    wheelAmount: state.data.config.scroll.wheelAmount,
    anchorSelection: state.data.config.scroll.anchorSelection,
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(actions, dispatch),
    ...bindActionCreators(dataActions, dispatch),
    updateLinesHeightsAndText: (id, heights, fullHeight, text) => dispatch([
      actions.updateLinesHeights(id, heights, fullHeight),
      dataActions.saveText(id, text),
    ]),
  };
}


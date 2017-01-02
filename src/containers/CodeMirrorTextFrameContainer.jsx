import {bindActionCreators} from 'redux';
import * as actions from '../actions/textsView';
import * as dataActions from '../actions/textsData';
import {defaultItem} from '../reducers/view/textsViewReducer';
import TextOperation from 'ot/lib/text-operation';
import {connect} from 'react-redux';
import CodeMirrorTextFrame from '../components/CodeMirrorTextFrame';

export function mapStateToProps(state, ownProps, textId) {
  const textView = state.view.texts[textId] || defaultItem;
  return {
    textId: textId,
    text: state.data.texts[textId].wiki,
    scrollTop: textView.scrollInfo.top,
    offsets: textView.offsets,
    selection: textView.selection,
    glContainer: ownProps.glContainer,
    wheelBehaviour: state.data.config.scroll.wheelBehaviour,
    wheelAmount: state.data.config.scroll.wheelAmount,
    anchorSelection: state.data.config.scroll.anchorSelection,
    operationToApply: TextOperation.fromJSON(textView.operationToApply),
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


export const MainTextContainer = connect((state, ownProps) => {
  const textId = state.data.chapters[ownProps.chapter].text;
  return {
    ...mapStateToProps(state, ownProps, textId),
    chapter: state.data.chapters[ownProps.chapter],
  };
}, mapDispatchToProps)(CodeMirrorTextFrame);


export const OrigTextContainer = connect((state, ownProps) => {
  const textId = state.data.chapters[state.view.texts.activeChapter].langs[ownProps.lang];
  return {
    ...mapStateToProps(state, ownProps, textId),
    chapter: state.data.chapters[state.view.texts.activeChapter],
  };
}, mapDispatchToProps)(CodeMirrorTextFrame);

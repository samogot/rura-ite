import {bindActionCreators} from 'redux';
import * as actions from '../actions/textsView';
import * as dataActions from '../actions/textsData';
import {connect} from 'react-redux';
import CodeMirrorTextFrame from '../components/CodeMirrorTextFrame';
import {
  getMainTextId,
  getOrigTextId,
  getTextWiki,
  getTextScrollTop,
  getTextSelection,
  getTextOffsets,
  getTextOperationToApply
} from '../reducers';

function mapStateToProps(state, ownProps, textId) {
  return {
    textId: textId,
    text: getTextWiki(state, textId),
    scrollTop: getTextScrollTop(state, textId),
    offsets: getTextOffsets(state, textId),
    selection: getTextSelection(state, textId),
    operationToApply: getTextOperationToApply(state, textId),
    glContainer: ownProps.glContainer,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(actions, dispatch),
    ...bindActionCreators(dataActions, dispatch),
    onFocus: (textId, chapterId) => {
      if (chapterId) {
        dispatch(actions.selectActiveChapterDebounce(chapterId));
      }
      dispatch(actions.selectActiveTextDebounce(textId));
    },
    onPaste: (textId, _, event) => {
      const html = event.clipboardData.getData('text/html');
      if (html) {
        dataActions.pasteHtml(textId, html);
        event.preventDefault();
      }
    },
    onWheel: (textId, scrollTop, event, lineHeight) => {
      const direction = Math.sign(event.deltaY);
      actions.scrollWheel(textId, direction, scrollTop, lineHeight, () => {
        event.stopPropagation();
        event.preventDefault();
      });
    }
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  const newProps = stateProps;
  for (let prop in dispatchProps) {
    if (dispatchProps.hasOwnProperty(prop)) {
      newProps[prop] = dispatchProps[prop].bind(null, stateProps.textId);
    }
  }
  newProps.onFocus = dispatchProps.onFocus.bind(null, stateProps.textId, ownProps.chapter);
  newProps.onWheel = dispatchProps.onWheel.bind(null, stateProps.textId, stateProps.scrollTop);
  return newProps;
}

function makeTextContainer(idSelector) {
  return connect((state, ownProps) => mapStateToProps(state, ownProps, idSelector(state, ownProps)), mapDispatchToProps, mergeProps)(CodeMirrorTextFrame)
}

export const MainTextContainer = makeTextContainer(getMainTextId);
export const OrigTextContainer = makeTextContainer(getOrigTextId);
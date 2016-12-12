import {connect} from 'react-redux';
import CodeMirrorTextFrame from '../components/CodeMirrorTextFrame';
import * as commons from './TextContainerCommons';


function mapStateToProps(state, ownProps) {
  const textId = state.data.chapters[state.view.texts.activeChapter].langs[ownProps.lang];
  return {
    ...commons.mapStateToProps(state, ownProps, textId),
    chapter: state.data.chapters[state.view.texts.activeChapter],
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return commons.mapDispatchToProps(dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(CodeMirrorTextFrame);

import {connect} from 'react-redux';
import * as commons from './TextContainerCommons';
import CodeMirrorTextFrame from '../components/CodeMirrorTextFrame';


function mapStateToProps(state, ownProps) {
  const textId = state.data.chapters[ownProps.chapter].text;
  return {
    ...commons.mapStateToProps(state, ownProps, textId),
    chapter: state.data.chapters[ownProps.chapter],
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return commons.mapDispatchToProps(dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(CodeMirrorTextFrame);

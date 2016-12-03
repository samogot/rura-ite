import {connect} from 'react-redux';
import * as actions from '../actions/textsView';
import CodeMirrorTextFrame from '../components/CodeMirrorTextFrame';


function mapStateToProps(state, ownProps) {
  return {
    text: state.data.texts[state.data.chapters[ownProps.chapter].text].wiki,
    glContainer: ownProps.glContainer,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onFocus: () => {
      setTimeout(() => dispatch(actions.selectActiveChapter(ownProps.chapter)), 0)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CodeMirrorTextFrame);

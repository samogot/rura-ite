import {connect} from 'react-redux';
// import * as actions from '../actions/layoutView';
import CodeMirrorTextFrame from '../components/CodeMirrorTextFrame';


function mapStateToProps(state, ownProps) {
  return {
    text: state.data.texts[state.data.chapters[state.view.texts.activeChapter].langs[ownProps.lang]].wiki,
    glContainer: ownProps.glContainer,
  };
}

export default connect(mapStateToProps)(CodeMirrorTextFrame);

import {connect} from 'react-redux';
// import * as actions from '../actions/layoutView';
import CodeMirrorTextFrame from '../components/CodeMirrorTextFrame';


function mapStateToProps(state, ownProps) {
  return {
    text: state.data.texts[state.data.chapters[state.data.chapters.activeChapter].langs[ownProps.lang]].wiki,
  };
}

export default connect(mapStateToProps)(CodeMirrorTextFrame);

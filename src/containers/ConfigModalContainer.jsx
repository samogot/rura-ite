import {connect} from 'react-redux';
import ConfigModal from '../components/ConfigModal';
import * as actions from '../actions/configData';
import {updateOffsets} from '../actions/textsView';

export default connect((state, ownProps) => ({
  ...state.data.config.scroll,
  ...ownProps
}), {...actions, updateOffsets})(ConfigModal)
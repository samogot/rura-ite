import {connect} from 'react-redux';
import * as actions from '../actions/layoutView';
import GoldenLayout from '../components/GoldenLayout';


function mapStateToProps(state, ownProps) {
  return {
    config: state.view.layout.config,
    actions: state.view.layout.actions,
    store: ownProps.store
  };
}

export default connect(mapStateToProps, actions)(GoldenLayout);

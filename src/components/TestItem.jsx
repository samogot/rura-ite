import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions/textsData';

const testitem = React.createClass({
  getInitialState: function () {
    console.log('getInitialState', this.props);
    return {value: this.props.value || 'bla'};
  },
  setValue: function (e) {
    this.setState({value: e.target.value});
  },
  setContainerTitle: function () {
    this.props.glContainer.setTitle(this.state.value);
    this.props.saveText(this.state.value);
  },
  render: function () {
    return (
      <div>
        <input type="text" value={this.state.value} onChange={this.setValue}/>
        <button onClick={this.setContainerTitle}>set title</button>
        Query: {this.props.text}
      </div>
    )
  }
});

const testitem2 = connect((state, ownProps) => ({
  text: state.data.texts[0].text,
  ...ownProps
}), actions)(testitem);

export default testitem2;
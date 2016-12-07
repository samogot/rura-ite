import ConfigModalContainer from '../containers/ConfigModalContainer';
class ConfigModalLink extends React.Component {
  state = {
    open: false,
  };

  constructor(props, context) {
    super(props, context);
    this.onClick = this.onClick.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  onClick() {
    this.setState({open: true});
    return false;
  }

  onClose() {
    this.setState({open: false});
  }

  render() {
    return <a href="#" onClick={this.onClick}>
      {this.props.children}
      <ConfigModalContainer isOpen={this.state.open} onClose={this.onClose}/>
    </a>
  }

}
export default ConfigModalLink;
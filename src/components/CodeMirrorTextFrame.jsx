import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import './CodeMirrorTextFrame.styl';
import {pacomoDecorator} from '../utils/pacomo';

// const CodeMirrorTextFrame = ({text}) =>
class CodeMirrorTextFrame extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.refreshCM = this.refreshCM.bind(this);
  }

  componentDidMount() {
    this.props.glContainer.on('open', this.refreshCM);
    this.props.glContainer.on('show', this.refreshCM);
    if (this.props.onFocus) {
      this.props.glContainer.on('show', this.props.onFocus);
      this.refs.editor.codeMirror.on('focus', this.props.onFocus);
    }
  }

  componentWillUnmount() {
    this.props.glContainer.off('open', this.refreshCM);
    this.props.glContainer.off('show', this.refreshCM);
    if (this.props.onFocus) {
      this.props.glContainer.off('show', this.props.onFocus);
      this.refs.editor.codeMirror.off('focus', this.props.onFocus);
    }
  }

  refreshCM() {
    setTimeout(() => this.refs.editor.codeMirror.refresh(), 0);
  }

  render() {
    const options = {
      lineNumbers: true,
      matchBrackets: true,
      lineWrapping: true,
      styleActiveLine: true,
      scrollbarStyle: 'native',
      // mwextUrlProtocols: mwextUrlProtocolsVAL,
      // mwextTags: mwextTagsVAL,
      // mwextFunctionSynonyms: mwextFunctionSynonymsVAL,
      // mode: "mediawiki",
    };
    return <CodeMirror value={this.props.text} options={options} ref="editor"/>
  }

  static propTypes = {
    text: React.PropTypes.string.isRequired,
    glContainer: React.PropTypes.shape({
      on: React.PropTypes.func.isRequired,
      off: React.PropTypes.func.isRequired
    }).isRequired,
    onFocus: React.PropTypes.func,
  };
}


export default pacomoDecorator(CodeMirrorTextFrame);

//TODO CM scroll sync
//TODO CM height fix on viewport load
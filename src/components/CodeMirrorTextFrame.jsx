import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import './CodeMirrorTextFrame.styl';
import {pacomoDecorator} from '../utils/pacomo';
const throttle = require('lodash.throttle');
const debounce = require('lodash.debounce');

function normalizeLineEndings(str) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, '\n');
}

class CodeMirrorTextFrame extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.refreshCM = this.refreshCM.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onShow = this.onShow.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onHeightChange = debounce(this.onHeightChange.bind(this), 200);
    this.onScroll = throttle(this.onScroll.bind(this), 16);
    this.onResize = this.onResize.bind(this);
    this.onViewportChange = this.onViewportChange.bind(this);
    this.lastScrollSet = 0;
    this.lastTextSet = 0;
  }

  componentDidMount() {
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

    this.cm = CodeMirror.fromTextArea(this.refs.textarea, options);
    this.props.glContainer.on('open', this.refreshCM);
    this.props.glContainer.on('show', this.refreshCM);
    this.props.glContainer.on('show', this.onShow);
    this.props.glContainer.on('resize', this.onResize);
    this.cm.on('focus', this.onFocus);
    this.cm.on("change", this.onChange);
    this.cm.on("change", this.onHeightChange);
    this.cm.on("scroll", this.onScroll);
    this.cm.on("viewportChange", this.onViewportChange);
    this.componentDidUpdate({scrollTop: 0, text: ''});
    if (!this.props.glContainer.isHidden && this.props.chapter.text == this.props.textId) {
      window.cm = this.cm;
    }
  }

  componentWillUnmount() {
    this.props.glContainer.off('open', this.refreshCM);
    this.props.glContainer.off('show', this.refreshCM);
    this.props.glContainer.off('show', this.onShow);
    this.props.glContainer.off('resize', this.onResize);
    this.cm.off('focus', this.onFocus);
    this.cm.off("change", this.onChange);
    this.cm.off("change", this.onHeightChange);
    this.cm.off("scroll", this.onScroll);
    this.cm.toTextArea();
  }

  onShow() {
    if (this.props.chapter.text == this.props.textId) {
      this.props.selectActiveChapterWithDelay(this.props.chapter.id);
    }
  }

  onFocus(id) {
    if (this.props.chapter.text == this.props.textId) {
      this.props.selectActiveChapter(this.props.chapter.id);
    }
  }

  onChange() {
    if (this.lastTextSet + 50 <= +new Date) {
      this.props.saveText(this.props.textId, this.cm.getValue());
    }
  }

  onHeightChange() {
    const heights = [];
    this.cm.eachLine(line => {
      heights.push(this.cm.heightAtLine(line, 'local'));
    });

    const fullHeight = this.cm.getScrollInfo().height;
    this.props.updateLinesHeights(this.props.textId, heights, fullHeight);
  }

  onScroll() {
    if (this.lastScrollSet + 50 > +new Date) return false;
    const targets = new Set;
    targets.add(this.props.chapter.text);
    for (let [,text] of Object.entries(this.props.chapter.langs)) {
      targets.add(text);
    }
    targets.delete(this.props.textId);
    this.props.syncScroll(this.props.textId, this.cm.getScrollInfo().top, Array.from(targets));
  }

  onResize() {
    if (!this.props.glContainer.isHidden) {
      this.props.updateClientHeight(this.props.textId, this.cm.getScrollInfo().clientHeight);
    }
  }

  onViewportChange() {
    const {from, to} = this.cm.getViewport();
    const fullHeight = this.cm.getScrollInfo().height;
    this.props.updateFullHeight(this.props.textId, fullHeight);
    this.props.updateViewport(this.props.textId, from, to);
  }

  refreshCM() {
    setTimeout(() => this.cm.refresh(), 0);
    this.onResize();
  }

  render() {
    return <div><textarea ref="textarea" autoComplete="off"/></div>;
  }


  componentDidUpdate(prevProps) {
    if (this.props.text != prevProps.text && this.cm.getValue() != this.props.text) {
      this.lastTextSet = +new Date;
      this.cm.setValue(this.props.text);
      this.onViewportChange();
    }
    if (this.props.scrollTop != prevProps.scrollTop && this.cm.getScrollInfo().top != this.props.scrollTop) {
      this.lastScrollSet = +new Date;
      this.cm.scrollTo(null, this.props.scrollTop);
    }
  }

  static propTypes = {
    glContainer: React.PropTypes.shape({
      on: React.PropTypes.func.isRequired,
      off: React.PropTypes.func.isRequired,
    }).isRequired,
    text: React.PropTypes.string.isRequired,
    textId: React.PropTypes.number.isRequired,
    scrollTop: React.PropTypes.number.isRequired,
    // scrollSetAt: React.PropTypes.number.isRequired,
    // onFocus: React.PropTypes.func,
    // updateLinesHeights: React.PropTypes.func.isRequired,
  };
}


export default pacomoDecorator(CodeMirrorTextFrame);

//TODO CM height fix on viewport load
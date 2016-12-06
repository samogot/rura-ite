import 'codemirror/addon/selection/active-line';
import 'codemirror/mode/mediawiki/mediawiki';
import 'codemirror/lib/codemirror.css';
import './CodeMirrorTextFrame.styl';
import CodeMirror from 'codemirror';
import {pacomoDecorator} from '../utils/pacomo';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';

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
    this.onScroll = throttle(this.onScroll.bind(this), 16, {leading: true});
    this.onResize = debounce(this.onResize.bind(this), 50);
    this.lastScrollSet = 0;
    this.lastTextSet = 0;
    this.alignMarks = [];
  }

  componentDidMount() {
    const options = {
      lineNumbers: true,
      matchBrackets: true,
      lineWrapping: true,
      styleActiveLine: true,
      scrollbarStyle: 'native',
      mode: "mediawiki",
    };

    this.cm = CodeMirror.fromTextArea(this.refs.textarea, options);
    this.props.glContainer.on('open', this.refreshCM);
    this.props.glContainer.on('show', this.refreshCM);
    this.props.glContainer.on('resize', this.refreshCM);
    this.props.glContainer.on('resize', this.onResize);
    this.props.glContainer.on('show', this.onShow);
    this.cm.on('focus', this.onFocus);
    this.cm.on("change", this.onChange);
    this.cm.on("change", this.onHeightChange);
    this.cm.on("scroll", this.onScroll);
    this.cm.on("viewportChange", this.onHeightChange);
    this.componentDidUpdate({scrollTop: 0, text: '', offsets: []});
    if (!this.props.glContainer.isHidden && this.props.chapter.text == this.props.textId) {
      window.cm = this.cm;
    }
  }

  componentWillUnmount() {
    this.props.glContainer.off('open', this.refreshCM);
    this.props.glContainer.off('show', this.refreshCM);
    this.props.glContainer.off('resize', this.refreshCM);
    this.props.glContainer.off('resize', this.onResize);
    this.props.glContainer.off('show', this.onShow);
    this.cm.off('focus', this.onFocus);
    this.cm.off("change", this.onChange);
    this.cm.off("change", this.onHeightChange);
    this.cm.off("scroll", this.onScroll);
    this.cm.off("viewportChange", this.onHeightChange);
    this.cm.toTextArea();
  }

  render() {
    return <div><textarea ref="textarea" autoComplete="off"/></div>;
  }

  componentDidUpdate(prevProps) {
    if (this.props.text != prevProps.text && this.cm.getValue() != this.props.text) {
      this.lastTextSet = +new Date;
      this.cm.setValue(this.props.text);
    }
    if (this.props.scrollTop != prevProps.scrollTop && this.cm.getScrollInfo().top != this.props.scrollTop) {
      this.lastScrollSet = +new Date;
      this.cm.scrollTo(null, this.props.scrollTop);
    }
    if (this.props.offsets != prevProps.offsets) {
      // console.log(this.alignMarks);
      const length = Math.min(this.props.offsets.length, this.cm.lineCount());
      this.cm.operation(() => {
        for (let i = 0; i < length; ++i) {
          if (!this.alignMarks[i]) {
            const elt = document.createElement("div");
            elt.className = "CodeMirror-align-spacer";
            elt.style.height = this.props.offsets[i] + "px";
            elt.style.minWidth = "1px";
            this.alignMarks[i] = this.cm.addLineWidget(i, elt);
          }
          else if (this.props.offsets[i] != prevProps.offsets[i] && this.props.offsets[i] != this.alignMarks[i].height) {
            this.alignMarks[i].node.style.height = this.props.offsets[i] + "px";
            this.alignMarks[i].changed();
          }
        }
        for (let i = length; i < this.alignMarks.length; ++i) {
          if (this.alignMarks[i]) {
            this.alignMarks[i].clear();
            this.alignMarks[i] = null;
          }
        }
      });
    }
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
    if (this.lastTextSet + 150 <= +new Date) {
      this.props.saveText(this.props.textId, this.cm.getValue());
    }
  }

  getViewportLinesHeights() {
    const viewport = this.cm.getViewport();
    const heights = [];
    if (viewport.from < viewport.to) {
      this.cm.eachLine(viewport.from, viewport.to, line => {
        heights.push(this.cm.heightAtLine(line, 'local'));
      });
    }
    heights.push(this.cm.heightAtLine(viewport.to, 'local'));
    return {viewport, heights};
  }

  onHeightChange() {
    const {viewport, heights} = this.getViewportLinesHeights();
    const scrollInfo = this.cm.getScrollInfo();
    this.props.updateLinesHeights(this.props.textId, viewport, heights, scrollInfo.height);
  }

  onScroll() {
    if (this.lastScrollSet + 150 > +new Date) return false;
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
      const {viewport, heights} = this.getViewportLinesHeights();
      const scrollInfo = this.cm.getScrollInfo();
      this.props.updateAllHeights(this.props.textId, viewport, heights, scrollInfo);
    }
  }

  refreshCM() {
    setTimeout(() => this.cm.refresh(), 0);
    this.onResize();
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

//TODO copy handler
//TODO menu, toolbar, options
//TODO react-intl
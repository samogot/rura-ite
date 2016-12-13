import 'codemirror/addon/selection/active-line';
import 'codemirror/mode/mediawiki/mediawiki';
import 'codemirror/lib/codemirror.css';
import './CodeMirrorTextFrame.styl';
import CodeMirror from 'codemirror';
import {pacomoDecorator} from '../utils/pacomo';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
import SCROLL_CONFIG from '../constants/SCROLL_CONFIG';

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
    this.onResize = debounce(this.onResize.bind(this), 50);
    this.onWheel = this.onWheel.bind(this);
    this.onCursorActivity = this.onCursorActivity.bind(this);
    // this.onGutterDragStart = this.onGutterDragStart.bind(this);
    // this.onGutterDragOver = this.onGutterDragOver.bind(this);
    // this.onGutterDrop = this.onGutterDrop.bind(this);
    this.lastScrollSet = 0;
    this.lastTextSet = 0;
    this.lastSelectionsSet = 0;
    this.alignMarks = [];
  }

  componentDidMount() {
    const options = {
      lineNumbers: true,
      matchBrackets: true,
      lineWrapping: true,
      styleActiveLine: true,
      lineWiseCopyCut: false,
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
    this.cm.on("cursorActivity", this.onCursorActivity);
    this.cm.display.wrapper.addEventListener("wheel", this.onWheel);
    // this.cm.display.gutters.draggable = true;
    // this.cm.on('dragover', this.onCMDragOver);
    // this.cm.display.gutters.addEventListener('dragstart', this.onGutterDragStart);
    // this.cm.display.gutters.addEventListener('dragover', this.onGutterDragOver);
    // this.cm.display.gutters.addEventListener('drop', this.onGutterDrop);
    // this.cm.display.gutters.addEventListener('mousedown', this.onGutterMouseDown);
    this.componentDidUpdate({scrollTop: 0, text: '', offsets: [], selections: []});
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
    this.cm.off("cursorActivity", this.onCursorActivity);
    this.cm.display.wrapper.removeEventListener("wheel", this.onWheel);
    this.cm.toTextArea();
  }

  // onGutterDragStart(e) {
  //   const line = this.cm.lineAtHeight(e.screenY, 'window');
  //   e.dataTransfer.setData("application/x-ite-line-number+plain", line);
  //   e.stopPropagation();
  // }
  //
  // onGutterDragOver(e) {
  //   try {
  //     if (e.dataTransfer.getData("application/x-ite-line-number+plain")) {
  //       e.preventDefault();
  //       e.stopPropagation();
  //     }
  //   }
  //   catch (er) {}
  // }
  //
  // onCMDragOver(e) {
  //   try {
  //     if (e.dataTransfer.getData("application/x-ite-line-number+plain")) {
  //       e.codemirrorIgnore = true;
  //     }
  //   }
  //   catch (er) {}
  // }
  //
  // onGutterMouseDown(e) {
  //   e.stopPropagation();
  // }
  //
  // onGutterDrop(e) {
  //   const data = e.dataTransfer.getData("application/x-ite-line-number+plain");
  //   if (data) {
  //     const line = this.cm.lineAtHeight(e.screenY, 'window');
  //     console.log({current: line, source: data});
  //     e.preventDefault();
  //     e.stopPropagation();
  //   }
  //
  // }

  render() {
    return <div><textarea ref="textarea" autoComplete="off"/></div>;
  }

  componentDidUpdate(prevProps) {
    // console.log('componentDidUpdate', this.props.textId, prevProps.scrollTop, this.props.scrollTop, this.cm.getScrollInfo().top);
    if (this.cm.getValue() != this.props.text) {
      this.lastTextSet = +new Date;
      this.cm.setValue(this.props.text);
    }
    if (this.cm.getScrollInfo().top != this.props.scrollTop) {
      this.lastScrollSet = +new Date;
      this.cm.scrollTo(null, this.props.scrollTop);
    }
    if (this.props.selections != prevProps.selections) {
      const curSels = this.cm.listSelections();
      if (curSels.length != this.props.selections.length ||
          this.props.selections.some((s, i) => s.head.line != curSels[i].head.line || s.head.ch != curSels[i].head.ch || s.anchor.line != curSels[i].anchor.line || s.anchor.ch != curSels[i].anchor.ch)) {
        this.lastSelectionsSet = +new Date;
        this.cm.setSelections(this.props.selections);
      }
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
            this.alignMarks[i] = this.cm.addLineWidget(i, elt, {handleMouseEvents: true});
          }
          else if (this.props.offsets[i] != this.alignMarks[i].height) {
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
      this.props.selectActiveChapterDebounce(this.props.chapter.id);
    }
    this.props.selectActiveTextDebounce(this.props.textId);
  }

  onFocus() {
    this.onCursorActivity();
    if (this.props.chapter.text == this.props.textId) {
      this.props.selectActiveChapter(this.props.chapter.id);
    }
    this.props.selectActiveTextDebounce(this.props.textId);
  }

  onChange() {
    if (this.lastTextSet + 150 > +new Date) return;
    this.props.saveText(this.props.textId, this.cm.getValue());
    if (this.cm.lineCount() != this.props.offsets.length) {
      const offsets = [];
      const viewport = this.cm.getViewport();
      this.cm.eachLine(line => {
        const info = this.cm.lineInfo(line);
        let offset = 0;
        this.alignMarks[info.line] = null;
        if (info.widgets) {
          for (let widget of info.widgets) {
            if (widget.node.className == 'CodeMirror-align-spacer') {
              this.alignMarks[info.line] = widget;
              offset = widget.height;
            }
          }
        }
        offsets.push(offset);
      });
      for (let i = this.cm.lineCount(); i < this.alignMarks.length; ++i) {
        this.alignMarks[i] = null;
      }
      this.props.updateOffsets(this.props.textId, offsets);
      this.props.scrollToSelectionDebounced(this.props.textId);
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
    this.props.updateLinesHeights(this.props.textId, viewport, heights, scrollInfo.height, this.cm.lineCount());
  }

  onWheel(e) {
    const direction = Math.sign(e.deltaY);
    switch (this.props.wheelBehaviour) {
      case SCROLL_CONFIG.WHEEL_BEHAVIOUR.LINE:
        const cursorCoords = this.cm.cursorCoords('local');
        this.props.scrollLine(this.props.textId, this.props.wheelAmount * direction, cursorCoords.bottom - cursorCoords.top);
        break;
      case SCROLL_CONFIG.WHEEL_BEHAVIOUR.PARAGRAPH:
        this.props.scrollParagraph(this.props.textId, this.props.wheelAmount * direction);
        break;
      case SCROLL_CONFIG.WHEEL_BEHAVIOUR.PIXEL:
        this.props.setScroll(this.props.textId, this.props.scrollTop + this.props.wheelAmount * direction);
        break;
      default:
        return;
    }
    e.stopPropagation();
    e.preventDefault();
  }

  onScroll() {
    const now = +new Date;
    // console.log('onScroll', this.props.textId, this.lastScrollSet, now - this.lastScrollSet);
    if (this.lastScrollSet + 250 > now) return false;
    this.props.setScroll(this.props.textId, this.cm.getScrollInfo().top);
  }

  onCursorActivity() {
    const now = +new Date;
    if (this.lastSelectionsSet + 250 > now) return false;
    const selections = this.cm.listSelections();
    this.props.updateSelectionsOnly(this.props.textId, selections);
    if (selections[0].head.line != this.props.selections[0].head.line) {
      this.props.syncSelections(this.props.textId);
      if (this.props.anchorSelection) {
        this.props.scrollToSelection(this.props.textId);
      }
    }
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
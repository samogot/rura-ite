import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import './CodeMirrorTextFrame.styl';
import {pacomoDecorator} from '../utils/pacomo';

// const CodeMirrorTextFrame = ({text}) =>
class CodeMirrorTextFrame extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.refreshCM = this.refreshCM.bind(this);
    this.updateLinesHeights = this.updateLinesHeights.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.lastScrollSet = 0;
  }

  componentDidMount() {
    this.props.glContainer.on('open', this.refreshCM);
    this.props.glContainer.on('show', this.refreshCM);
    if (this.props.onFocus) {
      this.props.glContainer.on('show', this.onFocus);
      this.refs.editor.codeMirror.on('focus', this.onFocus);
    }
    this.refs.editor.codeMirror.on("change", this.updateLinesHeights);
    // this.refs.editor.codeMirror.on("swapDoc", updateLinesHeights);
    // this.refs.editor.codeMirror.on("markerAdded", updateLinesHeights);
    // this.refs.editor.codeMirror.on("markerCleared", updateLinesHeights);
    this.refs.editor.codeMirror.on("scroll", this.onScroll);
    this.updateLinesHeights();
  }

  componentWillUnmount() {
    this.props.glContainer.off('open', this.refreshCM);
    this.props.glContainer.off('show', this.refreshCM);
    if (this.props.onFocus) {
      this.props.glContainer.off('show', this.onFocus);
      this.refs.editor.codeMirror.off('focus', this.onFocus);
    }
    this.refs.editor.codeMirror.off("change", this.updateLinesHeights);
    this.refs.editor.codeMirror.off("scroll", this.onScroll);
  }

  updateLinesHeights() {
    const heights = [];
    this.refs.editor.codeMirror.eachLine(line => {
      heights.push(this.refs.editor.codeMirror.heightAtLine(line, 'local'));
    });
    heights.push(this.refs.editor.codeMirror.getDoc().height);
    this.props.updateLinesHeights(this.props.textId, heights);
  }

  onFocus() {
    this.props.onFocus();
    const now = +new Date;
    const viewport = this.refs.editor.codeMirror.getViewport();
    const sInfo = this.refs.editor.codeMirror.getScrollInfo();
    this.props.syncScroll(this.props.textId, sInfo, viewport, now);
  }

  onScroll() {
    const now = +new Date;
    if (this.lastScrollSet + 50 > now) return false;
    const viewport = this.refs.editor.codeMirror.getViewport();
    const sInfo = this.refs.editor.codeMirror.getScrollInfo();
    this.props.setScroll(this.props.textId, this.props.textId, sInfo.top, now);
    this.props.syncScroll(this.props.textId, sInfo, viewport, now);
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

  componentDidUpdate(prevProps) {
    // console.log(this.props);
    if (this.props.scrollSync.scrollAt != prevProps.scrollSync.scrollAt
        && this.props.scrollSync.sourceId != this.props.textId
        && (this.props.chapter.text == this.props.scrollSync.sourceId
            || Object.entries(this.props.chapter.langs).some(([,text]) => text == this.props.scrollSync.sourceId))) {
      const {sourceId, scrollInfo, viewport, scrollAt, sourceHeights, destHeights} = this.props.scrollSync;
      const halfScreen = .5 * scrollInfo.clientHeight,
        midY = scrollInfo.top + halfScreen;
      let midLine = 0;
      for (let i = viewport.from; i < viewport.to; ++i) {
        if (midY < sourceHeights[i]) {
          midLine = i - 1;
          break;
        }
      }
      const sourceOffset = {top: sourceHeights[midLine], bot: sourceHeights[midLine + 1]};
      const destMax = destHeights[destHeights.length - 1];
      const destOffset = {top: destHeights[midLine] || destMax, bot: destHeights[midLine + 1] || destMax};
      const ratio = (midY - sourceOffset.top) / (sourceOffset.bot - sourceOffset.top);
      const destScrollInfo = this.refs.editor.codeMirror.getScrollInfo();
      let targetPos = (destOffset.top - .5 * destScrollInfo.clientHeight) + ratio * (destOffset.bot - destOffset.top);

      let botDist, mix;
      // Some careful tweaking to make sure no space is left out of view
      // when scrolling to top or bottom.
      if (targetPos > scrollInfo.top && (mix = scrollInfo.top / halfScreen) < 1) {
        targetPos = targetPos * mix + scrollInfo.top * (1 - mix);
      }
      else if ((botDist = scrollInfo.height - scrollInfo.clientHeight - scrollInfo.top) < halfScreen) {
        const botDistOther = destScrollInfo.height - destScrollInfo.clientHeight - targetPos;
        if (botDistOther > botDist && (mix = botDist / halfScreen) < 1) {
          targetPos = targetPos * mix + (destScrollInfo.height - destScrollInfo.clientHeight - botDist) * (1 - mix);
        }
      }

      if (targetPos != this.props.scrollTop) {
        this.props.setScroll(this.props.textId, sourceId, targetPos, scrollAt)
      }
    }
    if (this.props.scrollTop != prevProps.scrollTop
        && this.refs.editor.codeMirror.getScrollInfo().top != this.props.scrollTop) {
      this.lastScrollSet = +new Date;
      this.refs.editor.codeMirror.scrollTo(null, this.props.scrollTop);
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
    scrollSetAt: React.PropTypes.number.isRequired,
    onFocus: React.PropTypes.func,
    updateLinesHeights: React.PropTypes.func.isRequired,
  };
}


export default pacomoDecorator(CodeMirrorTextFrame);

//TODO CM height fix on viewport load
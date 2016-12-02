import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import './CodeMirrorTextFrame.styl';
import {pacomoTransformer} from '../utils/pacomo';

const CodeMirrorTextFrame = ({text}) => {
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
  return <CodeMirror value={text} options={options}/>
};

export default pacomoTransformer(CodeMirrorTextFrame);
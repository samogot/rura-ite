import Model from 'react-modal';
import SCROLL_CONFIG from '../constants/SCROLL_CONFIG';

class ConfigModal extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.syncTextsChanged = this.syncTextsChanged.bind(this);
    this.alignLinesChanged = this.alignLinesChanged.bind(this);
    this.scrollAnchorChanged = this.scrollAnchorChanged.bind(this);
    this.syncTextEdgesChanged = this.syncTextEdgesChanged.bind(this);
    this.wheelBehaviourChanged = this.wheelBehaviourChanged.bind(this);
    this.wheelAmountChanged = this.wheelAmountChanged.bind(this);
    this.anchorSelectionChanged = this.anchorSelectionChanged.bind(this);
    this.extraBottomHeightChanged = this.extraBottomHeightChanged.bind(this);
  }

  syncTextsChanged() {
    let syncTexts = {
      en: this.refs.syncTextsEn.checked,
      jp: this.refs.syncTextsJp.checked,
      cn: this.refs.syncTextsCn.checked,
    };
    if (this.refs.syncTexts.value == SCROLL_CONFIG.SYNC_TEXTS.ALL) {
      syncTexts = true;
    }
    else if (this.refs.syncTexts.value == SCROLL_CONFIG.SYNC_TEXTS.NEVER) {
      syncTexts = false;
    }

    this.props.saveScrollConfig({syncTexts});
    this.props.recalcSyncedTexts();
  }

  alignLinesChanged() {
    this.props.saveScrollConfig({alignLines: this.refs.alignLines.value});
    this.props.recalcAlignedTextSets();
  }

  scrollAnchorChanged() {
    const select = this.refs.scrollAnchorSetect.value;
    let scrollAnchor = this.refs.scrollAnchor.value / 100;
    switch (select) {
      case SCROLL_CONFIG.SCROLL_ANCHOR.TOP:
        scrollAnchor = 0;
        break;
      case SCROLL_CONFIG.SCROLL_ANCHOR.CENTER:
        scrollAnchor = .5;
        break;
      case SCROLL_CONFIG.SCROLL_ANCHOR.BOTTOM:
        scrollAnchor = 1;
        break;
      default:
        if (scrollAnchor == 0 || scrollAnchor == 1 || scrollAnchor == .5) {
          scrollAnchor = .3;
        }
    }
    this.props.saveScrollConfig({scrollAnchor})
  }

  syncTextEdgesChanged() {
    this.props.saveScrollConfig({syncTextEdges: this.refs.syncTextEdges.checked})
  }

  wheelBehaviourChanged() {
    this.props.saveScrollConfig({wheelBehaviour: this.refs.wheelBehaviour.value})
  }

  wheelAmountChanged() {
    this.props.saveScrollConfig({wheelAmount: this.refs.wheelAmount.value})
  }

  anchorSelectionChanged() {
    this.props.saveScrollConfig({anchorSelection: this.refs.anchorSelection.checked})
  }

  extraBottomHeightChanged() {
    this.props.saveScrollConfig({extraBottomHeight: this.refs.extraBottomHeight.checked})
  }

  render() {

    let wheelBehaviour;
    const wheelAmount = <input type="number" onChange={this.wheelAmountChanged} value={this.props.wheelAmount}
                               ref="wheelAmount" style={{width: '50px'}}/>;
    switch (this.props.wheelBehaviour) {
      case SCROLL_CONFIG.WHEEL_BEHAVIOUR.PIXEL:
        wheelBehaviour = <span>Прокручивать {wheelAmount} пикселей</span>;
        break;

      case SCROLL_CONFIG.WHEEL_BEHAVIOUR.LINE:
        wheelBehaviour = <span>Прокручивать {wheelAmount} строк</span>;
        break;

      case SCROLL_CONFIG.WHEEL_BEHAVIOUR.PARAGRAPH:
        wheelBehaviour = <span>Прокручивать {wheelAmount} абзацев</span>;
        break;

      default:
        wheelBehaviour = <span></span>;
    }

    return (
      <Model isOpen={this.props.isOpen} onRequestClose={this.props.onClose}
             contentLabel="Scroll Config Modal">
        <div>
          Связывать панели:&nbsp;
          <select onChange={this.syncTextsChanged} ref="syncTexts"
                  value={typeof this.props.syncTexts == 'object' ? SCROLL_CONFIG.SYNC_TEXTS.SELECT : this.props.syncTexts ? SCROLL_CONFIG.SYNC_TEXTS.ALL : SCROLL_CONFIG.SYNC_TEXTS.NEVER}>
            <option value={SCROLL_CONFIG.SYNC_TEXTS.ALL}>Все</option>
            <option value={SCROLL_CONFIG.SYNC_TEXTS.SELECT}>Выбрать</option>
            <option value={SCROLL_CONFIG.SYNC_TEXTS.NEVER}>Никогда</option>
          </select>
          <div style={{display: typeof this.props.syncTexts == 'object' ? 'block' : 'none'}}>
            <label>
              <input type="checkbox" onChange={this.syncTextsChanged} checked={this.props.syncTexts.en}
                     ref="syncTextsEn"/>
              en
            </label>&nbsp;
            <label>
              <input type="checkbox" onChange={this.syncTextsChanged} checked={this.props.syncTexts.jp}
                     ref="syncTextsJp"/>
              jp
            </label>&nbsp;
            <label>
              <input type="checkbox" onChange={this.syncTextsChanged} checked={this.props.syncTexts.cn}
                     ref="syncTextsCn"/>
              cn
            </label>&nbsp;
          </div>
        </div>
        <div>
          Выравнивать абзацы связанных панелей:&nbsp;
          <select onChange={this.alignLinesChanged} ref="alignLines" value={this.props.alignLines}>
            <option value={SCROLL_CONFIG.ALIGN_LINES.ALL}>Всегда</option>
            <option value={SCROLL_CONFIG.ALIGN_LINES.ROW}>Если рядом</option>
            <option value={SCROLL_CONFIG.ALIGN_LINES.NEVER}>Никогда</option>
          </select>
        </div>
        <div>
          Cинхронизировать скролл:&nbsp;
          <select onChange={this.scrollAnchorChanged} ref="scrollAnchorSetect"
                  value={this.props.scrollAnchor == 0 ? SCROLL_CONFIG.SCROLL_ANCHOR.TOP
                    : this.props.scrollAnchor == 1 ? SCROLL_CONFIG.SCROLL_ANCHOR.BOTTOM
                           : this.props.scrollAnchor == .5 ? SCROLL_CONFIG.SCROLL_ANCHOR.CENTER : SCROLL_CONFIG.SCROLL_ANCHOR.OTHER}>
            <option value={SCROLL_CONFIG.SCROLL_ANCHOR.TOP}>по верхнему краю</option>
            <option value={SCROLL_CONFIG.SCROLL_ANCHOR.CENTER}>по цетру</option>
            <option value={SCROLL_CONFIG.SCROLL_ANCHOR.BOTTOM}>по нижнему краю</option>
            <option value={SCROLL_CONFIG.SCROLL_ANCHOR.OTHER}>другой процент</option>
          </select>&nbsp;
          <input type="number" onChange={this.scrollAnchorChanged} value={this.props.scrollAnchor * 100}
                 ref="scrollAnchor" style={{width: '50px'}}
                 disabled={this.props.scrollAnchor == 0 || this.props.scrollAnchor == 1 || this.props.scrollAnchor == .5}/>%
        </div>
        <div title="Если включено, то конец текста всегда будет достигнут одновременно во всех окнах">
          <label>
            <input type="checkbox" onChange={this.syncTextEdgesChanged} checked={this.props.syncTextEdges}
                   ref="syncTextEdges"/>&nbsp;
            Дополнительно синхронизировать начало-конец текста
          </label>&nbsp;
        </div>
        <div>
          Поведение колесика мыши:
          <select onChange={this.wheelBehaviourChanged} ref="wheelBehaviour"
                  value={this.props.wheelBehaviour}>
            <option value={SCROLL_CONFIG.WHEEL_BEHAVIOUR.DEFAULT}>по умолчанию</option>
            <option value={SCROLL_CONFIG.WHEEL_BEHAVIOUR.PIXEL}>по пикселам</option>
            <option value={SCROLL_CONFIG.WHEEL_BEHAVIOUR.LINE}>по строкам</option>
            <option value={SCROLL_CONFIG.WHEEL_BEHAVIOUR.PARAGRAPH}>по абзацам</option>
          </select>
          <br/>{wheelBehaviour}
        </div>
        <div>
          <label>
            <input type="checkbox" onChange={this.anchorSelectionChanged} checked={this.props.anchorSelection}
                   ref="anchorSelection"/>&nbsp;
            Всегда держать текущий абзац в закрепленной позиции
          </label>&nbsp;
        </div>
        <div>
          <label>
            <input type="checkbox" onChange={this.extraBottomHeightChanged} checked={this.props.extraBottomHeight}
                   ref="extraBottomHeight"/>&nbsp;
            Разрешать скролить ниже последних строк
          </label>&nbsp;
        </div>
        <button onClick={this.props.onClose}>OK</button>
      </Model>
    );
  }
}


export default ConfigModal;
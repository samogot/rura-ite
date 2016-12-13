import T from '../constants/ACTION_TYPES';
import debounce from 'lodash.debounce';


export function selectActiveChapter(id) {
  return [
    {
      type: T.TEXTS_VIEW.SELECT_CHAPTER,
      chapter: id
    },
    recalcSyncedTexts(),
  ]
}

const selectActiveChapterDebounced = debounce((id, dispatch) => dispatch(selectActiveChapter(id)), 0);

export function selectActiveChapterDebounce(id) {
  return selectActiveChapterDebounced.bind(undefined, id);
}

export function selectActiveText(id) {
  return {
    type: T.TEXTS_VIEW.SELECT_TEXT,
    text: id
  };
}

const selectActiveTextDebounced = debounce((id, dispatch) => dispatch(selectActiveText(id)), 0);

export function selectActiveTextDebounce(id) {
  return selectActiveTextDebounced.bind(undefined, id);
}

export function updateLinesHeightsOnly(id, viewport, heights, fullHeight) {
  return {
    type: T.TEXTS_VIEW.UPDATE_LINES_HEIGHTS,
    id,
    viewport,
    heights,
    fullHeight,
  }
}

export function updateClientHeight(id, clientHeight) {
  return {
    type: T.TEXTS_VIEW.UPDATE_CLIENT_HEIGHT,
    id,
    clientHeight,
  }
}

export function updateSelections(id, selections) {
  return [
    {
      type: T.TEXTS_VIEW.UPDATE_SELECTIONS,
      id,
      selections,
    },
    syncSelections(id),
  ]
}

export function recalcOffsets() {
  return {
    type: T.TEXTS_VIEW.RECALC_OFFSETS
  }
}

const recalcOffsetsDebounced = debounce(dispatch => dispatch(recalcOffsets()), 100);

export function recalcOffsetsDebounce() {
  return recalcOffsetsDebounced;
}

export function updateLinesHeights(id, viewport, heights, fullHeight) {
  return [
    updateLinesHeightsOnly(id, viewport, heights, fullHeight),
    recalcOffsetsDebounce(),
  ]
}

export function updateAllHeights(id, viewport, heights, scrollInfo) {
  return [
    updateClientHeight(id, scrollInfo.clientHeight),
    updateLinesHeightsOnly(id, viewport, heights, scrollInfo.height),
    recalcOffsetsDebounce(),
  ]
}

export function syncScroll(id) {
  return {
    type: T.TEXTS_VIEW.SYNC_SCROLL,
    id,
  }
}

export function syncSelections(id) {
  return {
    type: T.TEXTS_VIEW.SYNC_SELECTIONS,
    id,
  }
}

export function setScrollOnly(id, scrollTop) {
  return {
    type: T.TEXTS_VIEW.SCROLL_SET,
    id,
    scrollTop,
  }
}

export function setScroll(id, scrollTop) {
  return [
    setScrollOnly(id, scrollTop),
    syncScroll(id),
  ];
}

export function scrollLineOnly(id, ammount, lineHeight) {
  return {
    type: T.TEXTS_VIEW.SCROLL_LINE,
    id,
    ammount,
    lineHeight
  }
}

export function scrollLine(id, ammount, lineHeight) {
  return [
    scrollLineOnly(id, ammount, lineHeight),
    syncScroll(id),
  ];
}


export function scrollParagraphOnly(id, ammount) {
  return {
    type: T.TEXTS_VIEW.SCROLL_PARAGRAPH,
    id,
    ammount,
  }
}

export function scrollParagraph(id, ammount) {
  return [
    scrollParagraphOnly(id, ammount),
    syncScroll(id),
  ];
}

export function scrollToSellectionOnly(id) {
  return {
    type: T.TEXTS_VIEW.SCROLL_TO_SELECTION,
    id,
  }
}

export function scrollToSellection(id) {
  return [
    scrollToSellectionOnly(id),
    syncScroll(id),
  ];
}

export function recalcSyncedTexts() {
  return [
    {
      type: T.TEXTS_VIEW.RECALC_SYNCED_TEXTS
    },
    ...recalcAlignedTextSets(),
    ...recalcLineMerges(),
  ];

}
export function recalcAlignedTextSets() {
  return [
    {
      type: T.TEXTS_VIEW.RECALC_ALIGNED_TEXT_SETS
    },
    recalcOffsetsDebounce()
  ];
}
export function recalcLineMerges() {
  return [
    {
      type: T.TEXTS_VIEW.RECALC_LINE_MERGES
    },
    recalcOffsetsDebounce()
  ];
}
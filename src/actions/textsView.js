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

export function selectActiveChapterWithDelay(id) {
  return dispatch => setTimeout(() => dispatch(selectActiveChapter(id)), 0)
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

export function updateOffsets() {
  return {
    type: T.TEXTS_VIEW.UPDATE_OFFSETS
  }
}

export const updateOffsetsDebounce = debounce(dispatch => dispatch(updateOffsets()), 100);

export function updateLinesHeights(id, viewport, heights, fullHeight) {
  return [
    updateLinesHeightsOnly(id, viewport, heights, fullHeight),
    updateOffsetsDebounce,
  ]
}

export function updateAllHeights(id, viewport, heights, scrollInfo) {
  return [
    updateClientHeight(id, scrollInfo.clientHeight),
    updateLinesHeightsOnly(id, viewport, heights, scrollInfo.height),
    updateOffsetsDebounce,
  ]
}

export function syncScroll(id) {
  return {
    type: T.TEXTS_VIEW.SCROLL_SYNC,
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
    updateOffsetsDebounce
  ];
}
export function recalcLineMerges() {
  return [
    {
      type: T.TEXTS_VIEW.RECALC_LINE_MERGES
    },
    updateOffsetsDebounce
  ];
}
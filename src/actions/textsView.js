import T from '../constants/ACTION_TYPES';
import makeDebouncedActionCreator from '../utils/makeDebouncedActionCreator';

export function selectActiveChapter(id) {
  return [
    {
      type: T.TEXTS_VIEW.SELECT_CHAPTER,
      chapter: id
    },
    recalcSyncedTexts(),
  ]
}

export const selectActiveChapterDebounce = makeDebouncedActionCreator(selectActiveChapter);

export function selectActiveText(id) {
  return {
    type: T.TEXTS_VIEW.SELECT_TEXT,
    text: id
  };
}

export const selectActiveTextDebounce = makeDebouncedActionCreator(selectActiveText);

export function updateLinesHeightsOnly(id, viewport, heights, fullHeight, lineCount) {
  return {
    type: T.TEXTS_VIEW.UPDATE_LINES_HEIGHTS,
    id,
    viewport,
    heights,
    fullHeight,
    lineCount,
  }
}

export function updateClientHeight(id, clientHeight) {
  return {
    type: T.TEXTS_VIEW.UPDATE_CLIENT_HEIGHT,
    id,
    clientHeight,
  }
}

export function updateSelectionsOnly(id, selections) {
  return {
    type: T.TEXTS_VIEW.UPDATE_SELECTIONS,
    id,
    selections,
  };
}

export function updateSelections(id, selections) {
  return [
    updateSelectionsOnly(id, selections),
    syncSelections(id),
  ]
}

export function recalcOffsets() {
  return {
    type: T.TEXTS_VIEW.RECALC_OFFSETS
  }
}

export const recalcOffsetsDebounce = makeDebouncedActionCreator(recalcOffsets, 100);

export function updateOffsets(id, offsets) {
  return {
    type: T.TEXTS_VIEW.UPDATE_OFFSETS,
    id,
    offsets,
  }
}

export function updateLinesHeights(id, viewport, heights, fullHeight, lineCount) {
  return [
    updateLinesHeightsOnly(id, viewport, heights, fullHeight, lineCount),
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

export function scrollToSelectionOnly(id) {
  return {
    type: T.TEXTS_VIEW.SCROLL_TO_SELECTION,
    id,
  }
}

export function scrollToSelection(id) {
  return [
    scrollToSelectionOnly(id),
    syncScroll(id),
  ];
}

export const scrollToSelectionDebounced = makeDebouncedActionCreator(makeDebouncedActionCreator(scrollToSelection, 200), 300);

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
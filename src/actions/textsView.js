import T from '../constants/ACTION_TYPES';


export function selectActiveChapter(id) {
  return {
    type: T.TEXTS_VIEW.SELECT_CHAPTER,
    chapter: id
  }
}

export function updateLinesHeights(id, heights) {
  return {
    type: T.TEXTS_VIEW.UPDATE_LINES_HEIGHTS,
    id,
    heights,
  }
}


export function syncScroll(sourceId, scrollInfo, viewport, scrollAt) {
  return {
    type: T.TEXTS_VIEW.SYNC_SCROLL,
    sourceId,
    scrollInfo,
    viewport,
    scrollAt
  }
}

export function setScroll(id, sourceId, scrollTop, scrollAt) {
  return {
    type: T.TEXTS_VIEW.SET_SCROLL,
    id, sourceId,
    scrollTop: Math.round(scrollTop),
    scrollAt,
  }
}
import T from '../constants/ACTION_TYPES';


export function selectActiveChapter(id) {
  return {
    type: T.TEXTS_VIEW.SELECT_CHAPTER,
    chapter: id
  }
}

export function selectActiveChapterWithDelay(id) {
  return dispatch => setTimeout(() => dispatch(selectActiveChapter(id)), 0)
}

export function updateLinesHeights(id, heights, fullHeight) {
  return [
    {
      type: T.TEXTS_VIEW.UPDATE_LINES_HEIGHTS,
      id,
      heights,
      fullHeight,
    },
    {
      type: T.TEXTS_VIEW.UPDATE_OFFSETS
    }
  ]
}
export function updateFullHeight(id, fullHeight) {
  return {
    type: T.TEXTS_VIEW.UPDATE_FULL_HEIGHT,
    id,
    fullHeight,
  }
}


export function syncScroll(id, scrollTop, targets) {
  return {
    type: T.TEXTS_VIEW.SYNC_SCROLL,
    id,
    scrollTop,
    targets
  }
}

export function updateClientHeight(id, clientHeight) {
  return {
    type: T.TEXTS_VIEW.UPDATE_CLIENT_HEIGHT,
    id,
    clientHeight,
  }
}

export function updateViewport(id, from, to) {
  return {
    type: T.TEXTS_VIEW.UPDATE_VIEWPORT,
    id,
    viewport: {from, to},
  }
}

import T from '../constants/ACTION_TYPES';
import debounce from 'lodash.debounce';


export function selectActiveChapter(id) {
  return {
    type: T.TEXTS_VIEW.SELECT_CHAPTER,
    chapter: id
  }
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

export function syncScroll(id, scrollTop, targets) {
  return {
    type: T.TEXTS_VIEW.SYNC_SCROLL,
    id,
    scrollTop,
    targets
  }
}


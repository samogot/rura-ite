import T from '../constants/ACTION_TYPES';
import makeDebouncedActionCreator from '../utils/makeDebouncedActionCreator';
import {
  getConfigScrollWheelBehaviour,
  getConfigScrollWheelAmount,
  getConfigScrollAnchorSelection,
  getTextSelection,
  getActiveChapterId,
  getFocusedTextId
} from '../reducers/selectors';
import SCROLL_CONFIG from '../constants/SCROLL_CONFIG';

export function selectActiveChapter(id) {
	return (dispatch, getState) => {
		if (getActiveChapterId(getState()) != id) {
			dispatch({
				type: T.TEXTS_VIEW.SELECT_CHAPTER,
				chapter: id
			});
			dispatch(recalcOffsetsDebounce);
		}
	};
}

export function selectActiveText(id) {
	return (dispatch, getState) => {
		if (getFocusedTextId(getState()) != id) {
			dispatch({
				type: T.TEXTS_VIEW.SELECT_TEXT,
				text: id
			});
		}
  };
}

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

export function updateSelectionOnly(id, selection) {
  return {
    type: T.TEXTS_VIEW.UPDATE_SELECTION,
    id,
    selection,
  };
}

export function updateSelection(id, selection) {
  return (dispatch, getState) => {
    const state = getState();
    dispatch(updateSelectionOnly(id, selection));
    if (selection.ranges[0].line != getTextSelection(state, id).ranges[0].line) {
      dispatch(scrollToSelectionConditional(id));
    }
  };
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

export function setScroll(id, scrollTop) {
  return {
    type: T.TEXTS_VIEW.SCROLL_SET,
    id,
    scrollTop,
  }
}

export function scrollLine(id, ammount, lineHeight) {
  return {
    type: T.TEXTS_VIEW.SCROLL_LINE,
    id,
    ammount,
    lineHeight
  }
}

export function scrollParagraph(id, ammount) {
  return {
    type: T.TEXTS_VIEW.SCROLL_PARAGRAPH,
    id,
    ammount,
  }
}

export function scrollWheel(textId, direction, scrollTop, lineHeight, onSuccess) {
  return (dispatch, getState) => {
    const state = getState();
    const wheelBehaviour = getConfigScrollWheelBehaviour(state);
    const wheelAmount = getConfigScrollWheelAmount(state);
    switch (wheelBehaviour) {
      case SCROLL_CONFIG.WHEEL_BEHAVIOUR.LINE:
        dispatch(scrollLine(textId, wheelAmount * direction, lineHeight));
        break;
      case SCROLL_CONFIG.WHEEL_BEHAVIOUR.PARAGRAPH:
        dispatch(scrollParagraph(textId, wheelAmount * direction));
        break;
      case SCROLL_CONFIG.WHEEL_BEHAVIOUR.PIXEL:
        dispatch(setScroll(textId, scrollTop + wheelAmount * direction));
        break;
      default:
        return;
    }
    onSuccess();
  };
}

export function scrollToSelection(id) {
  return {
    type: T.TEXTS_VIEW.SCROLL_TO_SELECTION,
    id,
  }
}

export function scrollToSelectionConditional(id) {
  return (dispatch, getState) => {
    if (getConfigScrollAnchorSelection(getState())) {
      dispatch(scrollToSelection(id));
    }
  };
}

export const scrollToSelectionConditionalDebounced = makeDebouncedActionCreator(makeDebouncedActionCreator(scrollToSelectionConditional, 200), 300);

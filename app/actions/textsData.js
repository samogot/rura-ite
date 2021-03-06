import T from '../constants/ACTION_TYPES';
import {recalcOffsetsDebounce} from './textsView';


export function saveText(id, text) {
  return {
    type: T.TEXTS_DATA.UPDATE,
    id: id,
    data: {wiki: text},
  };
}

export function addText(data) {
  return {
    type: T.TEXTS_DATA.ADD,
    id: data.id,
    data,
  };
}

export function saveSourceMerges(id, merges) {
  return {
    type: T.TEXTS_DATA.UPDATE,
    id: id,
    data: {sourceMerges: merges},
  };
}

export function mergeNextLine() {
  return [
    {
      type: T.TEXTS_DATA.MERGE_NEXT_LINE,
    },
		recalcOffsetsDebounce(),
  ];
}

export function unmergeNextLine() {
  return [
    {
      type: T.TEXTS_DATA.UNMERGE_NEXT_LINE,
    },
		recalcOffsetsDebounce(),
  ];
}

export function disuniteNextLine() {
  return [
    {
      type: T.TEXTS_DATA.DISUNITE_NEXT_LINE,
    },
		recalcOffsetsDebounce(),
  ];
}

export function unitNextLine() {
  return [
    {
      type: T.TEXTS_DATA.UNIT_NEXT_LINE,
    },
		recalcOffsetsDebounce(),
  ];
}

export function mergeNextSrcLine() {
  return [
    {
      type: T.TEXTS_DATA.MERGE_NEXT_SRC_LINE,
    },
		recalcOffsetsDebounce(),
  ];
}

export function unmergeNextSrcLine() {
  return [
    {
      type: T.TEXTS_DATA.UNMERGE_NEXT_SRC_LINE,
    },
		recalcOffsetsDebounce(),
  ];
}

export function disuniteNextSrcLine() {
  return [
    {
      type: T.TEXTS_DATA.DISUNITE_NEXT_SRC_LINE,
    },
		recalcOffsetsDebounce(),
  ];
}

export function unitNextSrcLine() {
  return [
    {
      type: T.TEXTS_DATA.UNIT_NEXT_SRC_LINE,
    },
		recalcOffsetsDebounce(),
  ];
}

export function applyOperationFromCM(id, operation) {
  return (dispatch, state) => {
    dispatch({
      type: T.TEXTS_DATA.APPLY_OPERATION_TO_STORE,
      id: id,
      operation: operation.toJSON(),
    });
  };
}

export function applyOperationFromCode(id, operation) {
  return [
    {
      type: T.TEXTS_DATA.APPLY_OPERATION_TO_CM,
      id: id,
      operation: operation.toJSON(),
    },
    applyOperationFromCM(id, operation),
  ];
}

export function pasteHtml(id, html) {
  return {
    type: T.TEXTS_DATA.PASTE_HTML,
    id,
    html
  };
}
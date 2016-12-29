import T from '../constants/ACTION_TYPES';
import {recalcLineMerges} from './textsView';


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
    recalcLineMerges(),
  ];
}

export function unmergeNextLine() {
  return [
    {
      type: T.TEXTS_DATA.UNMERGE_NEXT_LINE,
    },
    recalcLineMerges(),
  ];
}

export function disuniteNextLine() {
  return [
    {
      type: T.TEXTS_DATA.DISUNITE_NEXT_LINE,
    },
    recalcLineMerges(),
  ];
}

export function unitNextLine() {
  return [
    {
      type: T.TEXTS_DATA.UNIT_NEXT_LINE,
    },
    recalcLineMerges(),
  ];
}

export function mergeNextSrcLine() {
  return [
    {
      type: T.TEXTS_DATA.MERGE_NEXT_SRC_LINE,
    },
    recalcLineMerges(),
  ];
}

export function unmergeNextSrcLine() {
  return [
    {
      type: T.TEXTS_DATA.UNMERGE_NEXT_SRC_LINE,
    },
    recalcLineMerges(),
  ];
}

export function disuniteNextSrcLine() {
  return [
    {
      type: T.TEXTS_DATA.DISUNITE_NEXT_SRC_LINE,
    },
    recalcLineMerges(),
  ];
}

export function unitNextSrcLine() {
  return [
    {
      type: T.TEXTS_DATA.UNIT_NEXT_SRC_LINE,
    },
    recalcLineMerges(),
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
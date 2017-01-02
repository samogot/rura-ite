import typeReducers from '../../utils/typeReducers';
import delegateReducerById from '../../utils/delegateReducerById';
import ACTION_TYPES from '../../constants/ACTION_TYPES';
import TextOperation from 'ot/lib/text-operation';
import createSelectorById from '../../utils/createSelectorById';


const defaultItem = {
  id: 0,
  wiki: '',
  sourceMerges: [],
  client: {
    revision: 0,
    state: {
      type: 'synchronized',
    },
  },
  operationToApply: [],
};


const oneItemReducer = typeReducers(ACTION_TYPES.TEXTS_DATA, defaultItem, {
  UPDATE: (state, {data}) => ({
    ...state,
    ...data,
  }),
  ADD: (state, {data}) => ({
    ...defaultItem,
    ...data,
  }),
  REMOVE: () => null,
  APPLY_OPERATION_TO_STORE: (state, {operation}) => ({
    ...state,
    wiki: TextOperation.fromJSON(operation).apply(state.wiki),
  }),
  APPLY_OPERATION_TO_CM: (state, {operation}) => ({
    ...state,
    operationToApply: operation,
  }),
  SAVE_CLIENT_STATE: (state, {client}) => ({
    ...state,
    client
  }),
});

const defaultState = {};

function getCurTextId(fullState) {
  return fullState.view.texts.focusedText;
}

function getCurSrcTextId(fullState) {
  const curText = getCurTextId(fullState);
  for (let [l, id] of Object.entries(fullState.view.texts.syncData.syncedTexts)) {
    if (id == curText) {
      return fullState.view.texts.syncData.syncedTexts[fullState.data.config.srcLang[l]];
    }
  }
  return undefined
}

function getSourceMergesReducer(getId, getSourceMerges) {
  return (state, {}, fullState) => {
    const textId = getId(fullState);
    if (!textId) return state;
    return {
      ...state,
      [textId]: {
        ...state[textId],
        sourceMerges: getSourceMerges(state[textId].sourceMerges, fullState.view.texts[textId].selection.ranges[0].line),
      }
    };
  };
}

function mergeNextLine(sourceMerges, line) {
  const resultSourceMerges = [];
  let prevMerge = {dstTo: 0, srcTo: 0};
  for (let merge of sourceMerges) {
    if (prevMerge.dstTo <= line && merge.dstFrom > line) {
      resultSourceMerges.push({
        dstFrom: line,
        srcFrom: line - prevMerge.dstTo + prevMerge.srcTo,
        dstTo: line + 2,
        srcTo: line - prevMerge.dstTo + prevMerge.srcTo + 1,
      });
    }
    if (merge.dstTo <= line) {
      resultSourceMerges.push(merge);
    }
    else if (merge.dstFrom <= line && merge.dstTo > line) {
      resultSourceMerges.push({
        ...merge,
        dstTo: merge.dstTo + 1,
      });
    }
    else {
      resultSourceMerges.push({
        ...merge,
        dstFrom: merge.dstFrom + 1,
        dstTo: merge.dstTo + 1,
      });
    }
    prevMerge = merge;
  }
  if (prevMerge.dstTo <= line) {
    resultSourceMerges.push({
      dstFrom: line,
      srcFrom: line - prevMerge.dstTo + prevMerge.srcTo,
      dstTo: line + 2,
      srcTo: line - prevMerge.dstTo + prevMerge.srcTo + 1,
    });
  }
  return resultSourceMerges;
}

function unmergeNextLine(sourceMerges, line) {
  const resultSourceMerges = [];
  let triggered = false;
  for (let merge of sourceMerges) {
    if (merge.dstFrom <= line && merge.dstTo > line) {
      if (merge.srcTo == merge.srcFrom + 1 && merge.dstTo <= merge.dstFrom + 2) {
        triggered = true;
      }
      else if (merge.dstTo == merge.dstFrom + 1) {
        resultSourceMerges.push(merge);
      }
      else {
        triggered = true;
        resultSourceMerges.push({
          ...merge,
          dstTo: merge.dstTo - 1,
        });
      }
    }
    else if (triggered && merge.dstFrom > line) {
      resultSourceMerges.push({
        ...merge,
        dstFrom: merge.dstFrom - 1,
        dstTo: merge.dstTo - 1,
      });
    }
    else {
      resultSourceMerges.push(merge);
    }
  }
  return resultSourceMerges;
}

function disuniteNextLine(sourceMerges, line) {
  const resultSourceMerges = [];
  let prevMerge = {dstTo: 0, srcTo: 0};
  for (let merge of sourceMerges) {
    if (prevMerge.dstTo <= line && merge.dstFrom > line) {
      resultSourceMerges.push({
        dstFrom: line,
        srcFrom: line - prevMerge.dstTo + prevMerge.srcTo,
        dstTo: line + 1,
        srcTo: line - prevMerge.dstTo + prevMerge.srcTo + 2,
      });
    }
    if (merge.dstTo <= line) {
      resultSourceMerges.push(merge);
    }
    else if (merge.dstFrom <= line && merge.dstTo > line) {
      resultSourceMerges.push({
        ...merge,
        srcTo: merge.srcTo + 1,
      });
    }
    else {
      resultSourceMerges.push({
        ...merge,
        srcFrom: merge.srcFrom + 1,
        srcTo: merge.srcTo + 1,
      });
    }
    prevMerge = merge;
  }
  if (prevMerge.dstTo <= line) {
    resultSourceMerges.push({
      dstFrom: line,
      srcFrom: line - prevMerge.dstTo + prevMerge.srcTo,
      dstTo: line + 1,
      srcTo: line - prevMerge.dstTo + prevMerge.srcTo + 2,
    });
  }
  return resultSourceMerges;
}

function unitNextLine(sourceMerges, line) {
  const resultSourceMerges = [];
  let triggered = false;
  for (let merge of sourceMerges) {
    if (merge.dstFrom <= line && merge.dstTo > line) {
      if (merge.dstTo == merge.dstFrom + 1 && merge.srcTo <= merge.srcFrom + 2) {
        triggered = true;
      }
      else if (merge.srcTo == merge.srcFrom + 1) {
        resultSourceMerges.push(merge);
      }
      else {
        triggered = true;
        resultSourceMerges.push({
          ...merge,
          srcTo: merge.srcTo - 1,
        });
      }
    }
    else if (triggered && merge.dstFrom > line) {
      resultSourceMerges.push({
        ...merge,
        srcFrom: merge.srcFrom - 1,
        srcTo: merge.srcTo - 1,
      });
    }
    else {
      resultSourceMerges.push(merge);
    }
  }
  return resultSourceMerges;
}

export default typeReducers(ACTION_TYPES.TEXTS_DATA, defaultState, {
  MERGE_NEXT_LINE: getSourceMergesReducer(getCurTextId, mergeNextLine),
  UNMERGE_NEXT_LINE: getSourceMergesReducer(getCurTextId, unmergeNextLine),
  DISUNITE_NEXT_LINE: getSourceMergesReducer(getCurTextId, disuniteNextLine),
  UNIT_NEXT_LINE: getSourceMergesReducer(getCurTextId, unitNextLine),
  MERGE_NEXT_SRC_LINE: getSourceMergesReducer(getCurSrcTextId, mergeNextLine),
  UNMERGE_NEXT_SRC_LINE: getSourceMergesReducer(getCurSrcTextId, unmergeNextLine),
  DISUNITE_NEXT_SRC_LINE: getSourceMergesReducer(getCurSrcTextId, disuniteNextLine),
  UNIT_NEXT_SRC_LINE: getSourceMergesReducer(getCurSrcTextId, unitNextLine),
  UPDATE: delegateReducerById(oneItemReducer),
  ADD: delegateReducerById(oneItemReducer),
  REMOVE: delegateReducerById(oneItemReducer),
  APPLY_OPERATION_TO_STORE: delegateReducerById(oneItemReducer),
  APPLY_OPERATION_TO_CM: delegateReducerById(oneItemReducer),
  SAVE_CLIENT_STATE: delegateReducerById(oneItemReducer),
});

export const getText = (state, id) => state[id] || defaultItem;
export const getTextWiki = (state, id) => getText(state, id).wiki;
export const getTextOperation = (state, id) => getText(state, id).operationToApply;
export const getTextOperationToApply = createSelectorById(getTextOperation, operation => TextOperation.fromJSON(operation));
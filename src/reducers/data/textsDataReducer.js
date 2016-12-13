import typeReducers from '../../utils/typeReducers';
import delegateReducerById from '../../utils/delegateReducerById';
import ACTION_TYPES from '../../constants/ACTION_TYPES';


const defaultItem = {
  id: 0,
  wiki: '',
  sourceMerges: [],
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
  ADD_MERGE: (state, {merge}) => ({
    ...state,
    sourceMerges: [...state.sourceMerges, merge].sort((a, b) => b.srcFrom - a.srcFrom),
  }),
});

const defaultState = {};

function getCurTextId(fullState) {
  return fullState.view.texts.focusedText;
}

function getCurSrcTextId(fullState) {
  const curText = getCurTextId(fullState);
  for (let [l,id] of Object.entries(fullState.view.texts.syncData.syncedTexts)) {
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
        sourceMerges: getSourceMerges(state[textId].sourceMerges, fullState.view.texts[textId].selections[0].anchor.line),
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
});

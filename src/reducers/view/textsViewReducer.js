import typeReducers from '../../utils/typeReducers';
import delegateReducerById from '../../utils/delegateReducerById';
import ACTION_TYPES from '../../constants/ACTION_TYPES';

const defaultItem = {
  heights: [],
  offsets: [],
  scrollInfo: {
    top: 0,
    height: 0,
    clientHeight: 0,
  },
  viewport: {
    from: 0,
    to: 0,
  }
};

const oneItemReducer = typeReducers(ACTION_TYPES.TEXTS_VIEW, defaultItem, {
  UPDATE_LINES_HEIGHTS: (state, {viewport, heights, fullHeight}) => {
    const newHeights = state.heights.slice();
    newHeights[viewport.from] = null;
    newHeights.splice(viewport.from, viewport.to - viewport.from + 1, ...heights);
    return {
      ...state,
      viewport,
      heights: newHeights,
      scrollInfo: {
        ...state.scrollInfo,
        height: fullHeight,
      },
    }
  },
  UPDATE_CLIENT_HEIGHT: (state, {clientHeight}) => ({
    ...state,
    scrollInfo: {
      ...state.scrollInfo,
      clientHeight,
    },
  }),
});


const defaultState = {
  activeChapter: 0,
};


function computeTargetScrollPositions(state, sourceId, scrollTop, targets, alignedTextSets) {
  const targetScrollTop = {};
  targetScrollTop[sourceId] = scrollTop;
  const {scrollInfo, viewport, heights: sourceHeights} = state[sourceId];
  const sourceHalfScreen = .5 * scrollInfo.clientHeight,
    midY = scrollTop + sourceHalfScreen;
  let midLine = 0;
  for (let i = viewport.from; i < viewport.to; ++i) {
    if (midY < sourceHeights[i]) {
      midLine = i - 1;
      break;
    }
  }
  const sourceOffset = {top: sourceHeights[midLine], bot: sourceHeights[midLine + 1]};
  const ratio = (midY - sourceOffset.top) / (sourceOffset.bot - sourceOffset.top);
  // const log = []
  for (let targetId of targets) {
    let targetPos;
    const {scrollInfo: targetScrollInfo, heights: targetHeights} = state[targetId];

    //for aligned texts use simple computing
    if (alignedTextSets.some(set => set.includes(sourceId) && set.includes(targetId))) {
      targetPos = scrollTop;
      // log.push(targetPos)
    }
    else {
      const targetHalfScreen = .5 * targetScrollInfo.clientHeight;
      const targetMax = targetHeights[targetHeights.length - 1];
      const targetOffset = {top: targetHeights[midLine] || targetMax, bot: targetHeights[midLine + 1] || targetMax};
      targetPos = (targetOffset.top - targetHalfScreen) + ratio * (targetOffset.bot - targetOffset.top);
      // log.push(targetId)
      // log.push(targetPos)

      let botDist, mix;
      // Some careful tweaking to make sure no space is left out of view
      // when scrolling to top or bottom.
      if (targetPos > scrollInfo.top && (mix = scrollInfo.top / sourceHalfScreen) < 1) {
        targetPos = targetPos * mix + scrollInfo.top * (1 - mix);
      }
      else if ((botDist = scrollInfo.height - scrollInfo.clientHeight - scrollInfo.top) < sourceHalfScreen) {
        const botDistOther = targetScrollInfo.height - targetScrollInfo.clientHeight - targetPos;
        if (botDistOther > botDist && (mix = botDist / sourceHalfScreen) < 1) {
          targetPos = targetPos * mix + (targetScrollInfo.height - targetScrollInfo.clientHeight - botDist) * (1 - mix);
        }
      }
      // log.push(targetPos)
    }
    targetPos = Math.min(Math.max(targetPos, 0), targetScrollInfo.height - targetScrollInfo.clientHeight);
    // log.push(targetPos)
    targetScrollTop[targetId] = Math.round(targetPos);
  }
  // console.log(midY, midLine, ratio, ...log)
  return targetScrollTop;
}

function computeOffsets(state, textSets) {
  const resultOffsets = {};

  const prevState = (id) => state[id] || defaultItem;
  const prevOffset = (id, line) => prevState(id).offsets[line] || 0;
  const prevLineTop = (id, line) => prevState(id).heights[line];
  const prevLineBottom = (id, line) => prevLineTop(id, line + 1);
  const prevLineExists = prevLineBottom;
  const prevLineHeightWithOffset = (id, line) => prevLineBottom(id, line) - prevLineTop(id, line);
  const prevLineTrueHeight = (id, line) => prevLineHeightWithOffset(id, line) - prevOffset(id, line);
  const resultOffset = (id, line) => resultOffsets[id].offsets[line];
  const resultLineTop = (id, line) => resultOffsets[id].heights[line];


  for (const textSet of textSets) {
    let minViewport = Infinity, maxViewport = 0;
    const extraOffsets = {};
    for (let id of textSet) {
      minViewport = Math.min(maxViewport, prevState(id).viewport.from);
      maxViewport = Math.max(maxViewport, Math.min(prevState(id).heights.length - 1, prevState(id).viewport.to));
    }
    for (let id of textSet) {
      resultOffsets[id] = {offsets: prevState(id).offsets.slice(), minViewport, maxViewport};
      extraOffsets[id] = 0;
    }
    for (let line = minViewport; line < maxViewport; ++line) {
      let maxLineHeight = 0;
      for (let id of textSet) {
        if (prevLineExists(id, line)) {
          maxLineHeight = Math.max(maxLineHeight, prevLineTrueHeight(id, line));
        }
      }
      for (let id of textSet) {
        if (prevLineExists(id, line)) {
          //resultOffset
          resultOffsets[id].offsets[line] = maxLineHeight - prevLineTrueHeight(id, line);
        }
        else {
          extraOffsets[id] += maxLineHeight;
        }
      }
    }
    for (let id of textSet) {
      if (extraOffsets[id]) {
        resultOffsets[id].offsets[resultOffsets[id].offsets.length - 1] += extraOffsets[id];
      }
    }
  }
  for (let id in resultOffsets) {
    resultOffsets[id].heights = prevState(id).heights.slice();
    let totalOffsetsDiff = 0;
    for (let line = resultOffsets[id].minViewport; line < resultOffsets[id].maxViewport; ++line) {
      if (resultOffset(id, line) !== undefined) {
        //resultLineBottom
        resultOffsets[id].heights[line + 1] = resultLineTop(id, line) + prevLineTrueHeight(id, line) + resultOffset(id, line);
        totalOffsetsDiff += resultOffset(id, line) - prevOffset(id, line);
      }
    }
    resultOffsets[id] = {
      heights: resultOffsets[id].heights,
      offsets: resultOffsets[id].offsets,
      scrollInfo: {
        ...prevState(id).scrollInfo,
        height: prevState(id).scrollInfo.height + totalOffsetsDiff,
      },
    };
  }
  // console.log("computeOffsets", fullState, textSets, resultOffsets);
  return resultOffsets;
}

export default typeReducers(ACTION_TYPES.TEXTS_VIEW, defaultState, {
  SELECT_CHAPTER: (state, {chapter}) => ({
    ...state,
    activeChapter: chapter,
  }),
  SYNC_SCROLL: (state, {id, scrollTop, targets}, fullState) => {
    const targetScrollTop = computeTargetScrollPositions(state, id, scrollTop, targets, fullState.view.layout.alignedTextSets);
    return {
      ...state,
      ...Object.entries(targetScrollTop).reduce((texts, [id,top]) => ({
        ...texts,
        [id]: {
          ...state[id],
          scrollInfo: {
            ...state[id].scrollInfo,
            top,
          },
        },
      }), {}),
    }
  },
  UPDATE_OFFSETS: (state, {}, fullState) => {
    const newOffsets = computeOffsets(state, fullState.view.layout.alignedTextSets);
    for (let id in state) {
      if (state.hasOwnProperty(id) && typeof state[id] == 'object' && !newOffsets.hasOwnProperty(id)) {
        newOffsets[id] = {offsets: []};
      }
    }
    return {
      ...state,
      ...Object.entries(newOffsets).reduce((texts, [id,newTextState]) => ({
        ...texts,
        [id]: {
          ...state[id],
          ...newTextState,
        },
      }), {}),
    };
  },
  UPDATE_LINES_HEIGHTS: delegateReducerById(oneItemReducer),
  UPDATE_CLIENT_HEIGHT: delegateReducerById(oneItemReducer),
})

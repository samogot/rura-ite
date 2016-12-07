import typeReducers from '../../utils/typeReducers';
import delegateReducerById from '../../utils/delegateReducerById';
import ACTION_TYPES from '../../constants/ACTION_TYPES';
import SCROLL_CONFIG from '../../constants/SCROLL_CONFIG';

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
  SET_SCROLL: (state, {scrollTop}) => ({
    ...state,
    scrollInfo: {
      ...state.scrollInfo,
      top: scrollTop,
    },
  }),
  SCROLL_LINE: (state, {ammount, lineHeight}) => {
    const curTopLine = lineAtHeight(state.scrollInfo.top, state);
    const extra = (state.scrollInfo.top - state.heights[curTopLine]) % lineHeight;
    let newScrollTop = state.scrollInfo.top - extra + lineHeight * (ammount + (extra > 0 && ammount < 0));
    newScrollTop = Math.min(Math.max(newScrollTop, 0), state.scrollInfo.height - state.scrollInfo.clientHeight);
    return {
      ...state,
      scrollInfo: {
        ...state.scrollInfo,
        top: newScrollTop,
      },
    }
  },
  SCROLL_PARAGRAPH: (state, {ammount}) => {
    const curTopLine = lineAtHeight(state.scrollInfo.top, state);
    let destLine = curTopLine + ammount + (state.heights[curTopLine] != state.scrollInfo.top && ammount < 0);
    destLine = Math.max(0, Math.min(destLine, state.heights.length - 1));
    const newScrollTop = Math.min(Math.max(state.heights[destLine], 0), state.scrollInfo.height - state.scrollInfo.clientHeight);
    return {
      ...state,
      scrollInfo: {
        ...state.scrollInfo,
        top: newScrollTop,
      },
    }
  },
});


const defaultState = {
  activeChapter: 0,
};

function lineAtHeight(height, {viewport, heights}) {
  let line = 0;
  for (let i = viewport.from; i < viewport.to; ++i) {
    if (height < heights[i]) {
      line = i - 1;
      break;
    }
  }
  return Math.max(0, line);
}

function computeTargetScrollPositions(state, sourceId, scrollTop, targets, alignedTextSets, scrollConfig) {
  const targetScrollTop = {};
  targetScrollTop[sourceId] = scrollTop;
  const {scrollInfo, heights: sourceHeights} = state[sourceId];
  const sourceHalfScreen = .5 * scrollInfo.clientHeight,
    sourceAnchorPosition = scrollConfig.scrollAnchor * scrollInfo.clientHeight,
    midY = scrollTop + sourceAnchorPosition;
  const midLine = lineAtHeight(midY, state[sourceId]);
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
      const targetAnchorPosition = scrollConfig.scrollAnchor * targetScrollInfo.clientHeight;
      const targetMax = targetHeights[targetHeights.length - 1];
      const targetOffset = {top: targetHeights[midLine] || targetMax, bot: targetHeights[midLine + 1] || targetMax};
      targetPos = (targetOffset.top - targetAnchorPosition) + ratio * (targetOffset.bot - targetOffset.top);
      // log.push(targetId)
      // log.push(targetPos)

      // Some careful tweaking to make sure no space is left out of view
      // when scrolling to top or bottom.
      if (scrollConfig.syncTextEdges) {
        let botDist, mix;
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

function getAlignedTextSets(fullState) {
  const syncedTexts = getSyncedTexts(fullState);
  switch (fullState.data.config.scroll.alignLines) {
    case SCROLL_CONFIG.ALIGN_LINES.ROW:
      return fullState.view.layout.alignedTextSets.map(set => set.filter(text => syncedTexts.includes(text))).filter(set => set.length > 1);
    case SCROLL_CONFIG.ALIGN_LINES.NEVER:
      return [];
    case SCROLL_CONFIG.ALIGN_LINES.ALL:
      return [syncedTexts];
  }
}

function getSyncedTexts(fullState) {
  const targets = [];
  const chapter = fullState.data.chapters[fullState.view.texts.activeChapter];
  targets.push(chapter.text);
  for (let [lang,text] of Object.entries(chapter.langs)) {
    if (fullState.data.config.scroll.syncTexts === true || fullState.data.config.scroll.syncTexts[lang]) {
      targets.push(text);
    }
  }
  return targets;
}

export default typeReducers(ACTION_TYPES.TEXTS_VIEW, defaultState, {
  SELECT_CHAPTER: (state, {chapter}) => ({
    ...state,
    activeChapter: chapter,
  }),
  SYNC_SCROLL: (state, {id}, fullState) => {
    const scrollTop = state[id].scrollInfo.top;
    const targets = getSyncedTexts(fullState);
    if (!targets.includes(id))return state;
    targets.splice(targets.indexOf(id), 1);
    const alignedTextSets = getAlignedTextSets(fullState);
    const targetScrollTop = computeTargetScrollPositions(state, id, scrollTop, targets, alignedTextSets, fullState.data.config.scroll);
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
    const newOffsets = computeOffsets(state, getAlignedTextSets(fullState));
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
  SET_SCROLL: delegateReducerById(oneItemReducer),
  SCROLL_LINE: delegateReducerById(oneItemReducer),
  SCROLL_PARAGRAPH: delegateReducerById(oneItemReducer),
})

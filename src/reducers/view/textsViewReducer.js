import typeReducers from '../../utils/typeReducers';
import delegateReducerById from '../../utils/delegateReducerById';
import ACTION_TYPES from '../../constants/ACTION_TYPES';
import {
  getSyncedTextsList,
  getFilteredAlignedTextSets,
  getLineMerges,
  getTextHeights as getTextHeightsFull,
  getConfigScrollSyncTextEdges,
  getConfigScrollScrollAnchor,
  getConfigScrollExtraBottomHeight
} from '../selectors';

export const defaultItem = {
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
  },
  selection: {
    ranges: [{
      line: 0,
      head: 0,
      anchor: 0,
    }]
  },
};

const oneItemReducer = typeReducers(ACTION_TYPES.TEXTS_VIEW, defaultItem, {
  UPDATE_LINES_HEIGHTS: (state, {viewport, heights, fullHeight, lineCount}) => {
    const newHeights = state.heights.slice();
    newHeights[viewport.from] = null;
    if (viewport.to == lineCount) {
      newHeights.splice(viewport.from, newHeights.length - viewport.from, ...heights);
    }
    else {
      newHeights.splice(viewport.from, viewport.to - viewport.from, ...heights);
    }
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
  UPDATE_OFFSETS: (state, {offsets}) => {
    const newOffsets = state.offsets.slice();
    newOffsets[state.viewport.from] = null;
    newOffsets.splice(state.viewport.from, state.viewport.to - state.viewport.from, ...offsets);
    return {
      ...state,
      offsets: offsets,
    }
  },
  UPDATE_CLIENT_HEIGHT: (state, {clientHeight}) => ({
    ...state,
    scrollInfo: {
      ...state.scrollInfo,
      clientHeight,
    },
  }),
  UPDATE_SELECTION: (state, {selection}) => ({
    ...state,
    selection,
  }),
  SCROLL_SET: (state, {scrollTop}) => ({
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
  SCROLL_TO_SELECTION: (state, {}, fullState) => {
    const scrollAnchor = getConfigScrollScrollAnchor(fullState);
    const line = state.selection.ranges[0].line;
    const screenAnchor = scrollAnchor * state.scrollInfo.clientHeight;
    if (!state.heights[line + 1]) {
      return state;
    }
    let height = state.heights[line + 1] - state.heights[line];
    if (line == state.heights.length - 2) {
      height -= state.offsets[line];
      let anyTeaxtsHasMoreLines = false;
      for (let text of getSyncedTextsList(fullState)) {
        const heights = getTextHeightsFull(fullState, text);
        if (heights[line + 2]) {
          anyTeaxtsHasMoreLines = true;
          height = Math.max(height, heights[line + 1] - heights[line]);
        }
      }
      if (!anyTeaxtsHasMoreLines) {
        height += state.offsets[line];
      }
    }
    const lineAnchor = scrollAnchor * height + state.heights[line];
    let newScrollTop = Math.round(lineAnchor - screenAnchor);
    newScrollTop = Math.min(Math.max(newScrollTop, 0), state.scrollInfo.height - state.scrollInfo.clientHeight);
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
  focusedText: 0,
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

export function mergeAtLine(id, line, lineMerges, syncedTextsList, startFrom = 0) {
  let merge = lineMerges.length;
  for (let i = startFrom; i < lineMerges.length; ++i) {
    if (lineMerges[i][id].to > line) {
      merge = i;
      break;
    }
  }
  if (merge != lineMerges.length && lineMerges[merge][id].from <= line) {
    return [lineMerges[merge], merge];
  }
  else if (merge) {
    const res = {};
    for (let [text, m] of Object.entries(lineMerges[merge - 1])) {
      res[text] = {
        from: m.to + line - lineMerges[merge - 1][id].to,
        to: m.to + line - lineMerges[merge - 1][id].to + 1
      }
    }
    return [res, merge - 1];
  }
  else {
    const res = {};
    for (let text of syncedTextsList) {
      res[text] = {from: line, to: line + 1}
    }
    return [res, 0];
  }
}

function computeTargetScrollPositions(state, sourceId, scrollTop, targets, scrollAnchor, syncTextEdges, lineMerges, syncedTextsList, filteredAlignedTextSets) {
  const targetScrollTop = {};
  targetScrollTop[sourceId] = scrollTop;
  const {scrollInfo, heights: sourceHeights} = state[sourceId];
  const sourceHalfScreen = .5 * scrollInfo.clientHeight,
    sourceAnchorPosition = scrollAnchor * scrollInfo.clientHeight,
    midY = scrollTop + sourceAnchorPosition;
  const midLine = lineAtHeight(midY, state[sourceId]);
  const [merge] = mergeAtLine(sourceId, midLine, lineMerges, syncedTextsList);
  const sourceOffset = {top: sourceHeights[merge[sourceId].from], bot: sourceHeights[merge[sourceId].to]};
  const ratio = (midY - sourceOffset.top) / (sourceOffset.bot - sourceOffset.top);
  // const log = []
  for (let targetId of targets) {
    let targetPos;
    const {scrollInfo: targetScrollInfo, heights: targetHeights} = state[targetId] || defaultItem;

    //for aligned texts use simple computing
    if (filteredAlignedTextSets.some(set => set.includes(sourceId) && set.includes(targetId))) {
      targetPos = scrollTop;
      // log.push(targetPos)
    }
    else {
      const targetAnchorPosition = scrollAnchor * targetScrollInfo.clientHeight;
      const targetMax = targetHeights[targetHeights.length - 1];
      const targetOffset = {
        top: targetHeights[merge[targetId].from] || targetMax,
        bot: targetHeights[merge[targetId].to] || targetMax
      };
      targetPos = (targetOffset.top - targetAnchorPosition) + ratio * (targetOffset.bot - targetOffset.top);
      // log.push(targetId)
      // log.push(targetPos)

      // Some careful tweaking to make sure no space is left out of view
      // when scrolling to top or bottom.
      if (syncTextEdges) {
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

function computeOffsets(state, filteredAlignedTextSets, lineMerges, syncedTextsList) {
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


  for (const textSet of filteredAlignedTextSets) {
    let minViewport = Infinity, maxViewport = -Infinity;
    let minViewportId, maxViewportId;
    const extraOffsets = {};
    for (let id of textSet) {
      const minTemp = mergeAtLine(id, prevState(id).viewport.from, lineMerges, syncedTextsList)[0][id].from;
      if (minViewport > minTemp) {
        minViewport = minTemp;
        minViewportId = id;
      }
      const maxTemp = Math.min(prevState(id).heights.length - 1, mergeAtLine(id, prevState(id).viewport.to, lineMerges, syncedTextsList)[0][id].to - 1);
      if (maxViewport < maxTemp) {
        maxViewport = maxTemp;
        maxViewportId = id;
      }
    }
    if (maxViewportId != minViewportId) {
      minViewport = mergeAtLine(minViewportId, prevState(minViewportId).viewport.from, lineMerges, syncedTextsList)[0][maxViewportId].from;
      minViewportId = maxViewportId;
    }
    for (let id of textSet) {
      resultOffsets[id] = {offsets: prevState(id).offsets.slice(), minViewport, maxViewport};
      extraOffsets[id] = 0;
    }
    let line = minViewport;
    let contFrom = 0;
    let merge;
    while (line < maxViewport) {
      [merge, contFrom] = mergeAtLine(minViewportId, line, lineMerges, syncedTextsList, contFrom);
      const mergeHeights = {};
      for (let id of textSet) {
        mergeHeights[id] = 0;
      }
      let maxMergeHeight = 0;
      for (let id of textSet) {
        for (let l = merge[id].from; l < merge[id].to; ++l) {
          if (prevLineExists(id, l)) {
            mergeHeights[id] += prevLineTrueHeight(id, l);
          }
        }
        maxMergeHeight = Math.max(maxMergeHeight, mergeHeights[id]);
      }
      for (let id of textSet) {
        for (let l = merge[id].from; l < merge[id].to; ++l) {
          if (prevLineExists(id, l)) {
            resultOffsets[id].offsets[l] = (maxMergeHeight - mergeHeights[id]) / (merge[id].to - merge[id].from);
          }
          else {
            extraOffsets[id] += maxMergeHeight / (merge[id].to - merge[id].from);
          }
        }
      }
      line = merge[minViewportId].to;
    }
    for (let id of textSet) {
      if (extraOffsets[id] && Math.max(state[id].heights[state[id].heights.length - 1], state[id].scrollInfo.clientHeight) >= state[id].scrollInfo.height - 10) {
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
    const prevHeight = prevState(id).scrollInfo.height;
    let newHeight = prevHeight + totalOffsetsDiff;
    if (prevHeight == prevState(id).scrollInfo.clientHeight) {
      newHeight = resultOffsets[id].heights[resultOffsets[id].heights.length - 1] + resultOffsets[id].heights[0];
    }
    resultOffsets[id] = {
      heights: resultOffsets[id].heights,
      offsets: resultOffsets[id].offsets,
      scrollInfo: {
        ...prevState(id).scrollInfo,
        height: newHeight,
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
  SELECT_TEXT: (state, {text}) => ({
    ...state,
    focusedText: text,
  }),
  SYNC_SCROLL: (state, {id}, fullState) => {
    const scrollTop = state[id].scrollInfo.top;
    const targets = [...getSyncedTextsList(fullState)];
    if (!targets.includes(id)) return state;
    targets.splice(targets.indexOf(id), 1);
    const targetScrollTop = computeTargetScrollPositions(state, id, scrollTop, targets, getConfigScrollScrollAnchor(fullState), getConfigScrollSyncTextEdges(fullState), getLineMerges(fullState), getSyncedTextsList(fullState), getFilteredAlignedTextSets(fullState));
    return {
      ...state,
      ...Object.entries(targetScrollTop).reduce((texts, [id, top]) => ({
        ...texts,
        [id]: {
          ...defaultItem,
          ...state[id],
          scrollInfo: {
            ...state[id].scrollInfo,
            top,
          },
        },
      }), {}),
    }
  },
  SYNC_SELECTION: (state, {id}, fullState) => {
    if (state[id].selection.ranges.length > 1 || !getSyncedTextsList(fullState).includes(id)) {
      return state;
    }
    const [merge] = mergeAtLine(id, state[id].selection.ranges[0].line, getLineMerges(fullState), getSyncedTextsList(fullState));
    const ratio = (state[id].selection.ranges[0].line - merge[id].from) / (merge[id].to - merge[id].from);
    return {
      ...state,
      ...getSyncedTextsList(fullState).reduce((texts, targetId) => {
        let selection = {};
        const targetState = state[targetId] || defaultItem;
        if (id == targetId || targetState.selection.ranges.length > 1
            || targetState.selection.ranges[0].head != targetState.selection.ranges[0].anchor) {
          selection = targetState.selection;
        }
        else {
          const targetLine = merge[targetId].from + Math.floor(ratio * (merge[targetId].to - merge[targetId].from));
          selection = {ranges: [{line: targetLine}]};
        }
        return {
          ...texts,
          [targetId]: {
            ...targetState,
            selection,
          },
        }
      }, {}),
    };
  },
  RECALC_OFFSETS: (state, {}, fullState) => {
    const newOffsets = computeOffsets(state, getFilteredAlignedTextSets(fullState), getLineMerges(fullState), getSyncedTextsList(fullState));
    for (let id in state) {
      if (state.hasOwnProperty(id) && typeof state[id] == 'object' && Number.isInteger(+id) && !newOffsets.hasOwnProperty(id)) {
        newOffsets[id] = {offsets: []};
      }
    }
    return {
      ...state,
      ...Object.entries(newOffsets).reduce((texts, [id, newTextState]) => {
        if (getConfigScrollExtraBottomHeight(fullState) && state[id].heights[state[id].heights.length - 1] >= state[id].scrollInfo.height - 10) {
          newTextState.offsets[state[id].heights.length - 2] = newTextState.offsets[state[id].heights.length - 2] || 0;
          newTextState.offsets[state[id].heights.length - 2] += state[id].scrollInfo.clientHeight;
          newTextState.heights = newTextState.heights || [...state[id].heights.length];
          newTextState.heights[state[id].heights.length - 1] += state[id].scrollInfo.clientHeight;
          newTextState.scrollInfo = newTextState.scrollInfo || {...state[id].scrollInfo};
          newTextState.scrollInfo.height += state[id].scrollInfo.clientHeight;
        }
        return {
          ...texts,
          [id]: {
            ...defaultItem,
            ...state[id],
            ...newTextState,
          },
        }
      }, {}),
    };
  },
  UPDATE_LINES_HEIGHTS: delegateReducerById(oneItemReducer),
  UPDATE_OFFSETS: delegateReducerById(oneItemReducer),
  UPDATE_CLIENT_HEIGHT: delegateReducerById(oneItemReducer),
  UPDATE_SELECTION: delegateReducerById(oneItemReducer),
  SCROLL_SET: delegateReducerById(oneItemReducer),
  SCROLL_LINE: delegateReducerById(oneItemReducer),
  SCROLL_PARAGRAPH: delegateReducerById(oneItemReducer),
  SCROLL_TO_SELECTION: delegateReducerById(oneItemReducer),
})

export const getActiveChapterId = (state) => state.activeChapter;
export const getFocusedTextId = (state) => state.focusedText;

export const getText = (state, id) => state[id] || defaultItem;
export const getTextScrollTop = (state, id) => getText(state, id).scrollInfo.top;
export const getTextSelection = (state, id) => getText(state, id).selection;
export const getTextOffsets = (state, id) => getText(state, id).offsets;
export const getTextHeights = (state, id) => getText(state, id).heights;

import typeReducers from '../../utils/typeReducers';
import delegateReducerById from '../../utils/delegateReducerById';
import ACTION_TYPES from '../../constants/ACTION_TYPES';
import {
  getSyncedTextsList,
  getFilteredAlignedTextSets,
  getLineMerges,
  getNewTextOffsets,
  getTextHeights as getTextHeightsFull,
  getConfigScrollSyncTextEdges,
  getConfigScrollScrollAnchor,
  getConfigScrollExtraBottomHeight
} from '../selectors';
import reduceReducersFull from '../../utils/reduceReducersFull';

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

function syncScrollReducer(state, {id}, fullState) {
  const scrollTop = state[id].scrollInfo.top;
  const lineMerges = getLineMerges(fullState);
  const filteredAlignedTextSets = getFilteredAlignedTextSets(fullState);
  const syncedTextsList = getSyncedTextsList(fullState);
  const configScrollScrollAnchor = getConfigScrollScrollAnchor(fullState);
  const configScrollSyncTextEdges = getConfigScrollSyncTextEdges(fullState);
  const targets = [...syncedTextsList];
  if (!targets.includes(id)) return state;
  targets.splice(targets.indexOf(id), 1);
  const targetScrollTop = computeTargetScrollPositions(state, id, scrollTop, targets, configScrollScrollAnchor, configScrollSyncTextEdges, lineMerges, syncedTextsList, filteredAlignedTextSets);
  return {
    ...state,
    ...Object.entries(targetScrollTop).reduce((texts, [id, top]) => ({
      ...texts,
      [id]: {
        ...state[id] || defaultItem,
        scrollInfo: {
          ...state[id].scrollInfo,
          top,
        },
      },
    }), {}),
  }
}

function syncSelectionReducer(state, {id}, fullState) {
  const syncedTextsList = getSyncedTextsList(fullState);
  if (state[id].selection.ranges.length > 1 || !syncedTextsList.includes(id)) {
    return state;
  }
  const lineMerges = getLineMerges(fullState);
  const [merge] = mergeAtLine(id, state[id].selection.ranges[0].line, lineMerges, syncedTextsList);
  const ratio = (state[id].selection.ranges[0].line - merge[id].from) / (merge[id].to - merge[id].from);
  const lastLine = state[id].heights.length - 2;
  const isLastLine = state[id].selection.ranges[0].line == lastLine;
  return {
    ...state,
    ...syncedTextsList.reduce((texts, targetId) => {
      let selection = {};
      const targetState = state[targetId] || defaultItem;
      if (id == targetId || targetState.selection.ranges.length > 1
          || targetState.selection.ranges[0].head != targetState.selection.ranges[0].anchor
          || isLastLine && targetState.selection.ranges[0].line > lastLine
      ) {
        return texts;
      }
      else {
        const targetLine = merge[targetId].from + Math.floor(ratio * (merge[targetId].to - merge[targetId].from));
        if (targetLine == targetState.selection.ranges[0].line) {
          return texts;
        }
        else {
          return {
            ...texts,
            [targetId]: {
              ...targetState,
              selection: {ranges: [{line: targetLine}]},
            },
          }
        }
      }
    }, {}),
  };
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
  RECALC_OFFSETS: (state, {}, fullState) => {
    const newOffsets = getNewTextOffsets(fullState);
    return {
      ...state,
      ...getAllTextIds(state).reduce((texts, id) => {
        const prev = state[id] || defaultItem;
        const next = {
          ...texts,
          [id]: {
            ...prev,
            heights: newOffsets[id] ? newOffsets[id].heights : prev.heights,
            offsets: newOffsets[id] ? newOffsets[id].offsets : [],
            scrollInfo: {
              ...prev.scrollInfo,
              height: newOffsets[id] ? newOffsets[id].newHeight : prev.scrollInfo.height,
            },
          },
        };
        if (getConfigScrollExtraBottomHeight(fullState) && state[id].heights[state[id].heights.length - 1] >= state[id].scrollInfo.height - 10) {
          next[id].offsets[state[id].heights.length - 2] += state[id].scrollInfo.clientHeight;
          next[id].heights[state[id].heights.length - 1] += state[id].scrollInfo.clientHeight;
          next[id].scrollInfo.height += state[id].scrollInfo.clientHeight;
        }
        return next;
      }, {}),
    };
  },
  UPDATE_LINES_HEIGHTS: delegateReducerById(oneItemReducer),
  UPDATE_OFFSETS: delegateReducerById(oneItemReducer),
  UPDATE_CLIENT_HEIGHT: delegateReducerById(oneItemReducer),
  UPDATE_SELECTION: reduceReducersFull(delegateReducerById(oneItemReducer), syncSelectionReducer),
  SCROLL_SET: reduceReducersFull(delegateReducerById(oneItemReducer), syncScrollReducer),
  SCROLL_LINE: reduceReducersFull(delegateReducerById(oneItemReducer), syncScrollReducer),
  SCROLL_PARAGRAPH: reduceReducersFull(delegateReducerById(oneItemReducer), syncScrollReducer),
  SCROLL_TO_SELECTION: reduceReducersFull(delegateReducerById(oneItemReducer), syncScrollReducer),
})

export const getActiveChapterId = (state) => state.activeChapter;
export const getFocusedTextId = (state) => state.focusedText;
export const getAllTextIds = (state) => Object.keys(state).filter(id => typeof state[id] == 'object' && Number.isInteger(+id));

export const getText = (state, id) => state[id] || defaultItem;
export const getTextOffsets = (state, id) => getText(state, id).offsets;
export const getTextHeights = (state, id) => getText(state, id).heights;
export const getTextViewport = (state, id) => getText(state, id).viewport;
export const getTextSelection = (state, id) => getText(state, id).selection;
export const getTextScrollInfo = (state, id) => getText(state, id).scrollInfo;
export const getTextScrollTop = (state, id) => getTextScrollInfo(state, id).top;
export const getTextScrollHeight = (state, id) => getTextScrollInfo(state, id).height;
export const getTextClientHeight = (state, id) => getTextScrollInfo(state, id).clientHeight;

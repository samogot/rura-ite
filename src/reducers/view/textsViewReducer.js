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
  UPDATE_LINES_HEIGHTS: (state, {heights, fullHeight}) => ({
    ...state,
    heights: [...heights, fullHeight],
    scrollInfo: {
      ...state.scrollInfo,
      height: fullHeight,
    },
  }),
  UPDATE_FULL_HEIGHT: (state, {fullHeight}) => ({
    ...state,
    scrollInfo: {
      ...state.scrollInfo,
      height: fullHeight,
    },
  }),
  UPDATE_CLIENT_HEIGHT: (state, {clientHeight}) => ({
    ...state,
    scrollInfo: {
      ...state.scrollInfo,
      clientHeight,
    },
  }),
  UPDATE_VIEWPORT: (state, {viewport}) => ({
    ...state,
    viewport,
  }),
});


const defaultState = {
  activeChapter: 0,
};


function computeTargetScrollPositions(state, sourceId, scrollTop, targets) {
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
    const {scrollInfo: targetScrollInfo, heights: targetHeights} = state[targetId];
    const targetHalfScreen = .5 * targetScrollInfo.clientHeight;
    const targetMax = targetHeights[targetHeights.length - 1];
    const targetOffset = {top: targetHeights[midLine] || targetMax, bot: targetHeights[midLine + 1] || targetMax};
    let targetPos = (targetOffset.top - targetHalfScreen) + ratio * (targetOffset.bot - targetOffset.top);
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
    targetPos = Math.min(Math.max(targetPos, 0), targetScrollInfo.height - targetScrollInfo.clientHeight);
    // log.push(targetPos)

    targetScrollTop[targetId] = Math.round(targetPos);
  }
  // console.log(midY,midLine, ratio, ...log)
  return targetScrollTop;
}

export default typeReducers(ACTION_TYPES.TEXTS_VIEW, defaultState, {
  SELECT_CHAPTER: (state, {chapter}) => ({
    ...state,
    activeChapter: chapter,
  }),
  SYNC_SCROLL: (state, {id, scrollTop, targets}) => {
    const targetScrollTop = computeTargetScrollPositions(state, id, scrollTop, targets);
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
  UPDATE_FULL_HEIGHT: delegateReducerById(oneItemReducer),
  UPDATE_LINES_HEIGHTS: delegateReducerById(oneItemReducer),
  UPDATE_CLIENT_HEIGHT: delegateReducerById(oneItemReducer),
  UPDATE_VIEWPORT: delegateReducerById(oneItemReducer),
})

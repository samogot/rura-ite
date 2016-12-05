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
  // console.log(midY, midLine, ratio, ...log)
  return targetScrollTop;
}

function computeOffsets(fullState) {
  const textSets = [];
  fullState.view.layout.config.content.forEach(function recursiveAll(item) {
    switch (item.type) {
      case 'column':
        item.content.forEach(recursiveAll);
        break;
      case 'row':
        const columns = [];
        item.content.forEach(function recursiveColumns(column) {
          switch (column.type) {
            case 'row':
              column.content.forEach(recursiveColumns);
              break;
            case 'stack':
              recursiveColumns(column.content[column.activeItemIndex || 0]);
              break;
            case 'react-component':
            case 'component':
              columns.push(column);
              break;
            default:
              column.content && column.content.forEach(recursiveAll);
          }
        });
        columns.filter((item) => {
          return item.id == `main-text-$(fullState.view.texts.activeChapter)` || item.component == 'text-orig-component';
        });
        if (columns.length > 1) {
          textSets.push(columns.map((item) => {
            if (item.component == 'text-orig-component') {
              return fullState.data.chapters[fullState.view.texts.activeChapter].langs[item.props.lang];
            }
            else if (item.component == 'text-main-component') {
              return fullState.data.chapters[item.props.chapter].text;
            }
          }));
        }
        break;
    }
  });

  const resultOfsets = {}, state = fullState.view.texts;

  const prevOffset = (id, line) => state[id].offsets[line] || 0;
  const prevLineTop = (id, line) => state[id].heights[line];
  const prevLineBottom = (id, line) => prevLineTop(id, line + 1);
  const prevLineExists = prevLineBottom;
  const prevLineHeightWithOffset = (id, line) => prevLineBottom(id, line) - prevLineTop(id, line);
  const prevLineTrueHeight = (id, line) => prevLineHeightWithOffset(id, line) - prevOffset(id, line);
  const resultOffset = (id, line) => resultOfsets[id].offsets[line];
  const resultLineTop = (id, line) => resultOfsets[id].heights[line];


  for (const textSet of textSets) {
    for (let id of textSet) {
      resultOfsets[id] = {offsets: []};
    }
    const maxLines = textSet.reduce((max, textId) => Math.max(max, state[textId].heights.length), 0) - 1;
    for (let line = 0; line < maxLines; ++line) {
      let maxLineHeight = 0;
      for (let id of textSet) {
        if (prevLineExists(id, line)) {
          maxLineHeight = Math.max(maxLineHeight, prevLineTrueHeight(id, line));
        }
      }
      for (let id of textSet) {
        if (prevLineExists(id, line)) {
          //resultOffset
          resultOfsets[id].offsets[line] = maxLineHeight - prevLineTrueHeight(id, line);
        }
      }
    }
  }
  for (let id in resultOfsets) {
    resultOfsets[id].heights = [prevLineTop(id, 0)];
    for (let line = 0; line < resultOfsets[id].offsets.length; ++line) {
      //resultLineBottom
      resultOfsets[id].heights[line + 1] = resultLineTop(id, line) + prevLineTrueHeight(id, line) + resultOffset(id, line);
    }
    //restultFullHeight
    resultOfsets[id].heights[resultOfsets[id].heights.length - 1] += resultLineTop(id, 0);
  }
  // console.log("computeOffsets", fullState, textSets, resultOfsets);
  return resultOfsets;
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
  UPDATE_OFFSETS: (state, {}, fullState) => {
    const newOffsets = computeOffsets(fullState);
    return {
      ...state,
      ...Object.entries(newOffsets).reduce((texts, [id,newTextState]) => ({
        ...texts,
        [id]: {
          ...state[id],
          ...newTextState,
        },
      }), {}),
    }
  },
  UPDATE_FULL_HEIGHT: delegateReducerById(oneItemReducer),
  UPDATE_LINES_HEIGHTS: delegateReducerById(oneItemReducer),
  UPDATE_CLIENT_HEIGHT: delegateReducerById(oneItemReducer),
  UPDATE_VIEWPORT: delegateReducerById(oneItemReducer),
})

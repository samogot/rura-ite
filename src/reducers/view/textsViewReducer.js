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
});


const defaultState = {
  activeChapter: 0,
  syncData: {
    syncedTexts: [],
    alignedTextSets: [],
    lineMerges: [],
  }
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

function computeTargetScrollPositions(state, sourceId, scrollTop, targets, scrollConfig) {
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
    if (state.syncData.alignedTextSets.some(set => set.includes(sourceId) && set.includes(targetId))) {
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

function computeOffsets(state) {
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


  for (const textSet of state.syncData.alignedTextSets) {
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

function getAlignedTextSets(syncedTexts, fullState) {
  switch (fullState.data.config.scroll.alignLines) {
    case SCROLL_CONFIG.ALIGN_LINES.ROW:
      return fullState.view.layout.alignedTextSets.map(set => set.filter(text => syncedTexts.includes(text))).filter(set => set.length > 1);
    case SCROLL_CONFIG.ALIGN_LINES.NEVER:
      return [];
    case SCROLL_CONFIG.ALIGN_LINES.ALL:
      return [syncedTexts];
  }
}

function getLineMerges(syncedTexts, fullState) {
  const resultMerges = [];
  const mergesLists = []; //список всех бинарных точек синхронизации с айдишниками
  const syncedLinePosition = {}; //последняя известная позиция в которой все синхронно
  for (let [l,id] of Object.entries(syncedTexts)) {
    syncedLinePosition[id] = 0;
    // собераем mergesLists переводя из названи языков в айдишники текстов
    if (fullState.data.config.srcLang[l]) {
      const list = {
        src: syncedTexts[fullState.data.config.srcLang[l]],
        dst: id,
        merges: [],
        cur: 0,
      };
      // если мы можем объеденить бинарные точки синхронизации в приделах самих бинарных - объеденяем
      for (let m of fullState.data.texts[id].sourceMerges) {
        if (list.merges.length > 0 && (m.srcFrom < list.merges[list.merges.length - 1].srcTo ||
                                       m.dstFrom < list.merges[list.merges.length - 1].dstTo)) {
          list.merges[list.merges.length - 1].srcTo = m.srcTo;
          list.merges[list.merges.length - 1].dstTo = m.dstTo;
        }
        else {
          list.merges.push(m);
        }
      }
      mergesLists.push(list);
    }
  }
  let newFullMerge;
  // функция для пробрасывания начальной высоты по дереву связей в направлении языка источника
  const recursivePropagateSource = (fullMerge, attended, src) => {
    for (let list of mergesLists) {
      if (list.dst == src && !attended.includes(list.src)) {
        fullMerge[list.src] = {};
        fullMerge[list.src].from = fullMerge[list.dst].from - syncedLinePosition[list.dst] + syncedLinePosition[list.src];
        fullMerge[list.src].to = fullMerge[list.dst].to - fullMerge[list.dst].from + fullMerge[list.src].from;
        fullMerge[list.src].fixedDstHeight = fullMerge[list.src].to - fullMerge[list.src].from;
        fullMerge[list.src].fixedSrcHeight = 1;
        attended.push(list.src);
        recursivePropagateSource(fullMerge, attended, list.src);
        recursivePropagateDestination(fullMerge, attended, list.src);
      }
    }
  };
  // функция для пробрасывания начальной высоты по дереву связей в направлении языка перевода
  const recursivePropagateDestination = (fullMerge, attended, dst) => {
    for (let list of mergesLists) {
      if (list.src == dst && !attended.includes(list.dst)) {
        fullMerge[list.dst] = {};
        fullMerge[list.dst].from = fullMerge[list.src].from - syncedLinePosition[list.src] + syncedLinePosition[list.dst];
        fullMerge[list.dst].to = fullMerge[list.src].to - fullMerge[list.src].from + fullMerge[list.dst].from;
        fullMerge[list.dst].fixedSrcHeight = fullMerge[list.dst].to - fullMerge[list.dst].from;
        fullMerge[list.dst].fixedDstHeight = 1;
        attended.push(list.dst);
        recursivePropagateDestination(fullMerge, attended, list.dst);
      }
    }
  };
  // функция для пробрасывания дельты модификации высоты при слиянии по дереву связей в направлении языка источника
  const recursivePropagateSourceModifyTo = (fullMerge, attended, src, delta) => {
    for (let list of mergesLists) {
      if (list.dst == src && !attended.includes(list.src)) {
        fullMerge[list.src].to += delta;
        // fullMerge[list.src].fixedDstHeight = H;
        attended.push(list.src);
        recursivePropagateSourceModifyTo(fullMerge, attended, list.src, delta);
        recursivePropagateDestinationModifyTo(fullMerge, attended, list.src, delta);
      }
    }
  };
  // функция для пробрасывания дельты модификации высоты при слиянии по дереву связей в направлении языка перевода
  const recursivePropagateDestinationModifyTo = (fullMerge, attended, dst, delta) => {
    for (let list of mergesLists) {
      if (list.src == dst && !attended.includes(list.dst)) {
        fullMerge[list.dst].to += delta;
        // fullMerge[list.dst].fixedSrcHeight = H;
        attended.push(list.dst);
        recursivePropagateDestinationModifyTo(fullMerge, attended, list.dst, delta);
      }
    }
  };
  // функция для пробрасывания высоты фиксирования языка перевода перед слиянием по дереву связей в направлении языка источника
  const recursivePropagateSourceModifyFixedHeight = (fullMerge, attended, src, H) => {
    for (let list of mergesLists) {
      if (list.dst == src && !attended.includes(list.src)) {
        fullMerge[list.src].fixedDstHeight = fullMerge[list.dst].to - fullMerge[list.dst].from + H;
        attended.push(list.src);
        recursivePropagateSourceModifyFixedHeight(fullMerge, attended, list.src, H);
        recursivePropagateDestinationModifyFixedHeight(fullMerge, attended, list.src, H);
      }
    }
  };
  // функция для пробрасывания высоты фиксирования языка источника перед слиянием по дереву связей в направлении языка перевода
  const recursivePropagateDestinationModifyFixedHeight = (fullMerge, attended, dst, H) => {
    for (let list of mergesLists) {
      if (list.src == dst && !attended.includes(list.dst)) {
        fullMerge[list.dst].fixedSrcHeight = fullMerge[list.src].to - fullMerge[list.src].from + H;
        attended.push(list.dst);
        recursivePropagateDestinationModifyFixedHeight(fullMerge, attended, list.dst, H);
      }
    }
  };
  // основной цикл перебирающий все бинарные точки синхронизации
  while (true) {
    let next;
    // ищем следующую наивысшую точку синхронизации
    for (let list of mergesLists) {
      if (list.cur < list.merges.length
          && (!next
              || next.merges[next.cur].srcFrom - syncedLinePosition[next.src] > list.merges[list.cur].srcFrom - syncedLinePosition[list.src]
              || next.merges[next.cur].dstFrom - syncedLinePosition[next.dst] > list.merges[list.cur].dstFrom - syncedLinePosition[list.dst])) {
        next = list;
      }
    }
    if (!next) break;

    // если нет пересечений с предыдуей - начинаем новую общую точку синхронизации
    if (!newFullMerge || (next.merges[next.cur].srcFrom >= newFullMerge[next.src].to &&
                          next.merges[next.cur].dstFrom >= newFullMerge[next.dst].to)) {
      if (newFullMerge) {
        // если предыдущая была - чистим временные данные и сохраняем
        for (let [id] of Object.entries(newFullMerge)) {
          delete newFullMerge[id].fixedDstHeight;
          delete newFullMerge[id].fixedSrcHeight;
        }
        resultMerges.push(newFullMerge);
      }

      newFullMerge = {
        [next.src]: {
          from: next.merges[next.cur].srcFrom,
          to: next.merges[next.cur].srcTo,
          fixedSrcHeight: 1,
          fixedDstHeight: 1,
        },
        [next.dst]: {
          from: next.merges[next.cur].dstFrom,
          to: next.merges[next.cur].dstTo,
          fixedSrcHeight: 1,
          fixedDstHeight: 1,
        },
      };
      recursivePropagateSource(newFullMerge, [next.src, next.dst], next.src);
      recursivePropagateDestination(newFullMerge, [next.src, next.dst], next.src);
      recursivePropagateDestination(newFullMerge, [next.src, next.dst], next.dst);
    }
    else {
      // если пересечения есть - сливаем с предыдущей
      let deltaSrc = 0, deltaDst = 0;
      const PST = newFullMerge[next.src].to;
      const PDT = newFullMerge[next.dst].to;
      const PSF = newFullMerge[next.src].from;
      const PDF = newFullMerge[next.dst].from;
      const NST = next.merges[next.cur].srcTo;
      const NDT = next.merges[next.cur].dstTo;
      const NSF = next.merges[next.cur].srcFrom;
      const NDF = next.merges[next.cur].dstFrom;
      const NSH = NST - NSF;
      const NDH = NDT - NDF;
      const PSH = PST - PSF;
      const PDH = PDT - PDF;
      const dSH = NSH - PSH;
      const dDH = NDH - PDH;
      const dN = NDH - NSH;
      const dP = PDH - PSH;
      if (dSH > 0 || dDH > 0) { // если высота источника или перевода увеличилась - применяем эти изменения на ситочник и на перевод
        deltaSrc = dSH;
        deltaDst = dDH;
      }
      else {
        // в противном случае нам нужно понимать какие изменения были ранее со стороны источнка и со стороны перевода.
        // в зависимости от того были ли там изменения мы можем или увеличить цепочку в одну сторону, или уменшить в другую
        // если dN > 0 мы будем увеличивать цепочку перевода или умешать цепочку источника. если dN < 0 - наоборот
        // если с какой-то стороны вообще не было изменений (только распростроненные от другой бинарной точки синхронизации)
        // то мы можем всю величину dN направить на уменшение.
        // Если изменения с этой стороны были - то мы должны монимать сколько строк затронули изменения именно с этой стороны.
        // если резерв еще есть - мы можем уменшить на часть от величины dN.
        // Увеличивать мы должны на остатой той величины dN на которую не было уменшений
        if (dN > 0) {
          deltaSrc = -Math.min(dN, PSH - newFullMerge[next.dst].fixedSrcHeight);
          deltaDst = dN + deltaSrc;
        }
        else {
          deltaDst = Math.max(dN, newFullMerge[next.src].fixedDstHeight - PDH);
          deltaSrc = deltaDst - dN;
        }
      }
      // После объеденения мы должны обновить по цепочке, сколько строк мы затронули изменениями с той или иной стороны
      // TODO Текущая версия алгоритма расчета количества затронутых строк не совершенна и не справляется в сложных комбинацих.
      // Есть вероятность того что такие сложные помбинации никогда не появятся в реальной практике с тремя языками, потому пока что решений этой проблемы было отложено
      recursivePropagateSourceModifyFixedHeight(newFullMerge, [next.src, next.dst], next.src, deltaSrc);
      recursivePropagateDestinationModifyFixedHeight(newFullMerge, [next.src, next.dst], next.src, deltaSrc);
      recursivePropagateDestinationModifyFixedHeight(newFullMerge, [next.src, next.dst], next.dst, deltaDst);

      // А также нужно обновить саму высоту на расчитаные рание величины
      newFullMerge[next.src].to += deltaSrc;
      recursivePropagateSourceModifyTo(newFullMerge, [next.src, next.dst], next.src, deltaSrc);
      recursivePropagateDestinationModifyTo(newFullMerge, [next.src, next.dst], next.src, deltaSrc);
      newFullMerge[next.dst].to += deltaDst;
      recursivePropagateDestinationModifyTo(newFullMerge, [next.src, next.dst], next.dst, deltaDst);
    }
    // после рассмотрения бинарной точки синхронизации, обновляем текущую последнюю синхронную позицию и помечаем точку как выполненую
    for (let [id] of Object.entries(newFullMerge)) {
      syncedLinePosition[id] = newFullMerge[id].to;
    }
    ++next.cur;
  }
  // не забываем сохранить последнюю общую ТС в масив
  if (newFullMerge) {
    for (let [id] of Object.entries(newFullMerge)) {
      delete newFullMerge[id].fixedDstHeight;
      delete newFullMerge[id].fixedSrcHeight;
    }
    resultMerges.push(newFullMerge);
  }
  return resultMerges;
}

function getSyncedTexts(fullState) {
  const targets = {};
  const chapter = fullState.data.chapters[fullState.view.texts.activeChapter];
  targets[chapter.mainLang] = chapter.text;
  for (let [lang,text] of Object.entries(chapter.langs)) {
    if (fullState.data.config.scroll.syncTexts === true || fullState.data.config.scroll.syncTexts[lang]) {
      targets[lang] = text;
    }
  }
  return targets;
}

export default typeReducers(ACTION_TYPES.TEXTS_VIEW, defaultState, {
  SELECT_CHAPTER: (state, {chapter}) => ({
    ...state,
    activeChapter: chapter,
  }),
  SCROLL_SYNC: (state, {id}, fullState) => {
    const scrollTop = state[id].scrollInfo.top;
    const targets = Object.entries(state.syncData.syncedTexts).map(([,t]) => t);
    if (!targets.includes(id)) return state;
    targets.splice(targets.indexOf(id), 1);
    const targetScrollTop = computeTargetScrollPositions(state, id, scrollTop, targets, fullState.data.config.scroll);
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
    const newOffsets = computeOffsets(state);
    for (let id in state) {
      if (state.hasOwnProperty(id) && typeof state[id] == 'object' && Number.isInteger(+id) && !newOffsets.hasOwnProperty(id)) {
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
  RECALC_SYNCED_TEXTS: (state, {}, fullState) => ({
    ...state,
    syncData: {
      ...state.syncData,
      syncedTexts: getSyncedTexts(fullState),
    }
  }),
  RECALC_ALIGNED_TEXT_SETS: (state, {}, fullState) => ({
    ...state,
    syncData: {
      ...state.syncData,
      alignedTextSets: getAlignedTextSets(Object.entries(state.syncData.syncedTexts).map(([,t]) => t), fullState),
    }
  }),
  RECALC_LINE_MERGES: (state, {}, fullState) => ({
    ...state,
    syncData: {
      ...state.syncData,
      lineMerges: getLineMerges(state.syncData.syncedTexts, fullState),
    },
  }),
  UPDATE_LINES_HEIGHTS: delegateReducerById(oneItemReducer),
  UPDATE_CLIENT_HEIGHT: delegateReducerById(oneItemReducer),
  SCROLL_SET: delegateReducerById(oneItemReducer),
  SCROLL_LINE: delegateReducerById(oneItemReducer),
  SCROLL_PARAGRAPH: delegateReducerById(oneItemReducer),
})

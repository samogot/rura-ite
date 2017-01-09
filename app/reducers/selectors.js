import * as layoutViewSelectors from './view/layoutViewReducer';
import * as textsViewSelectors from './view/textsViewReducer';
import * as textsDataSelectors from './data/textsDataReducer';
import * as configDataSelectors from './data/configDataReducer';
import * as chaptersDataSelectors from './data/chaptersDataReducer';
import * as rootSelectors from './index';
import {createSelector, createSelectorCreator} from 'reselect';
import conditionalMemoize from '../utils/conditionalMemoize';
import SCROLL_CONFIG from '../constants/SCROLL_CONFIG';
import isequal from 'lodash.isequal';


export const getChapterMainTextId = (state, id) => chaptersDataSelectors.getChapterMainTextId(rootSelectors.getChaptersData(state), id);
export const getChapterLangTextId = (state, props) => chaptersDataSelectors.getChapterLangTextId(rootSelectors.getChaptersData(state), props);
export const getChapterLangs = (state, id) => chaptersDataSelectors.getChapterLangs(rootSelectors.getChaptersData(state), id);
export const getChapterMainLang = (state, id) => chaptersDataSelectors.getChapterMainLang(rootSelectors.getChaptersData(state), id);


export const getTextWiki = (state, id) => textsDataSelectors.getTextWiki(rootSelectors.getTextsData(state), id);
export const getTextSourceMerges = (state, id) => textsDataSelectors.getTextSourceMerges(rootSelectors.getTextsData(state), id);
export const getTextOperationToApply = (state, id) => textsDataSelectors.getTextOperationToApply(rootSelectors.getTextsData(state), id);


export const getLayoutConfig = (state) => layoutViewSelectors.getLayoutConfig(rootSelectors.getLayoutView(state));


export const getActiveChapterId = (state) => textsViewSelectors.getActiveChapterId(rootSelectors.getTextsView(state));
export const getFocusedTextId = (state) => textsViewSelectors.getFocusedTextId(rootSelectors.getTextsView(state));

export const getTextScrollTop = (state, id) => textsViewSelectors.getTextScrollTop(rootSelectors.getTextsView(state), id);
export const getTextSelection = (state, id) => textsViewSelectors.getTextSelection(rootSelectors.getTextsView(state), id);
export const getTextOffsets = (state, id) => textsViewSelectors.getTextOffsets(rootSelectors.getTextsView(state), id);
export const getTextHeights = (state, id) => textsViewSelectors.getTextHeights(rootSelectors.getTextsView(state), id);


export const getConfigScrollSyncTexts = (state) => configDataSelectors.getConfigScrollSyncTexts(rootSelectors.getConfigData(state));
export const getConfigScrollAlignLines = (state) => configDataSelectors.getConfigScrollAlignLines(rootSelectors.getConfigData(state));
export const getConfigScrollScrollAnchor = (state) => configDataSelectors.getConfigScrollScrollAnchor(rootSelectors.getConfigData(state));
export const getConfigScrollSyncTextEdges = (state) => configDataSelectors.getConfigScrollSyncTextEdges(rootSelectors.getConfigData(state));
export const getConfigScrollWheelBehaviour = (state) => configDataSelectors.getConfigScrollWheelBehaviour(rootSelectors.getConfigData(state));
export const getConfigScrollWheelAmount = (state) => configDataSelectors.getConfigScrollWheelAmount(rootSelectors.getConfigData(state));
export const getConfigScrollAnchorSelection = (state) => configDataSelectors.getConfigScrollAnchorSelection(rootSelectors.getConfigData(state));
export const getConfigScrollExtraBottomHeight = (state) => configDataSelectors.getConfigScrollExtraBottomHeight(rootSelectors.getConfigData(state));

export const getConfigSrcLangs = (state) => configDataSelectors.getConfigSrcLangs(rootSelectors.getConfigData(state));

export const getConfigSrcForLang = (state, lang) => configDataSelectors.getConfigSrcForLang(rootSelectors.getConfigData(state), lang);


export const getMainTextId = (state, props) => getChapterMainTextId(state, props.chapter);
export const getOrigTextId = (state, props) => getChapterLangTextId(state, {
  id: getActiveChapterId(state),
  lang: props.lang
});


export const getActiveChapterMainTextId = state => getChapterMainTextId(state, getActiveChapterId(state));
export const getActiveChapterLangs = state => getChapterLangs(state, getActiveChapterId(state));
export const getActiveChapterMainLang = state => getChapterMainLang(state, getActiveChapterId(state));


export const getSyncedTexts = createSelector([getActiveChapterMainTextId, getActiveChapterMainLang, getActiveChapterLangs, getConfigScrollSyncTexts],
  (mainTextId, mainLang, langs, syncTexts) => {
    const targets = {};
    targets[mainLang] = mainTextId;
    for (let [lang, text] of Object.entries(langs)) {
      if (syncTexts === true || syncTexts[lang]) {
        targets[lang] = text;
      }
    }
    return targets;
  });


export const getSyncedTextsList = createSelector(getSyncedTexts, syncedTexts => Object.entries(syncedTexts).map(([, t]) => t));


export const getAlignedTextSets = createSelectorCreator(conditionalMemoize, ([config], [lastConfig]) => config !== lastConfig)
([getLayoutConfig, state => state],
  (config, fullState) => {
    const textSets = [];
    config.content.forEach(function recursiveAll(item) {
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
            return item.component == 'text-orig-component' || item.component == 'text-main-component' && item.props.chapter == getActiveChapterId(fullState);
          });
          if (columns.length > 1) {
            textSets.push(columns.map((item) => {
              if (item.component == 'text-orig-component') {
                return getOrigTextId(fullState, item.props);
              }
              else if (item.component == 'text-main-component') {
                return getMainTextId(fullState, item.props);
              }
            }));
          }
          break;
      }
    });
    return textSets;
  });


export const getFilteredAlignedTextSets = createSelector([getSyncedTextsList, getConfigScrollAlignLines, getAlignedTextSets],
  (syncedTextsList, alignLines, alignedTextSets) => {
    switch (alignLines) {
      case SCROLL_CONFIG.ALIGN_LINES.ROW:
        return alignedTextSets.map(set => set.filter(text => syncedTextsList.includes(text))).filter(set => set.length > 1);
      case SCROLL_CONFIG.ALIGN_LINES.NEVER:
        return [];
      case SCROLL_CONFIG.ALIGN_LINES.ALL:
        return [syncedTextsList];
    }
  });


export const computeMergesLists = (syncedTexts, srcLangs, textsData) => {
  const mergesLists = []; //список всех бинарных точек синхронизации с айдишниками
  for (let [l, id] of Object.entries(syncedTexts)) {
    // собераем mergesLists переводя из названи языков в айдишники текстов
    const srcLang = srcLangs[l];
    if (srcLang) {
      const list = {
        src: syncedTexts[srcLang],
        dst: id,
        merges: [],
        cur: 0,
      };
      // если мы можем объеденить бинарные точки синхронизации в приделах самих бинарных - объеденяем
      for (let m of textsDataSelectors.getTextSourceMerges(textsData, id)) {
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
  return mergesLists;
};
export const getMergesLists = createSelectorCreator(conditionalMemoize, ([syncedTexts, srcLangs, textsData], [lastSyncedTexts, lastSrcLangs, lastTextsData]) => {
  if (syncedTexts !== lastSyncedTexts || srcLangs !== lastSrcLangs) return true;
  for (let [, id] of Object.entries(syncedTexts)) {
    if (textsDataSelectors.getTextSourceMerges(textsData, id) !== textsDataSelectors.getTextSourceMerges(lastTextsData, id)) {
      return true;
    }
  }
  return false;
})
([getSyncedTexts, getConfigSrcLangs, rootSelectors.getTextsData], computeMergesLists);


export const computeLineMerges = (mergesLists) => {
  const syncedLinePosition = {}; //последняя известная позиция в которой все синхронно
  for (let list of mergesLists) {
    syncedLinePosition[list.src] = 0;
    syncedLinePosition[list.dst] = 0;
  }
  const resultMerges = [];
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
};
export const getLineMerges = createSelector([getMergesLists], computeLineMerges);

export const computeNewTextOffsets = (filteredAlignedTextSets, lineMerges, syncedTextsList, textsView) => {
  const resultOffsets = {};

  const mergeAtLine = textsViewSelectors.mergeAtLine;
  const getTextOffsets = (id) => textsViewSelectors.getTextOffsets(textsView, id);
  const getTextHeights = (id) => textsViewSelectors.getTextHeights(textsView, id);
  const getTextViewport = (id) => textsViewSelectors.getTextViewport(textsView, id);
  const getTextScrollHeight = (id) => textsViewSelectors.getTextScrollHeight(textsView, id);
  const getTextClientHeight = (id) => textsViewSelectors.getTextClientHeight(textsView, id);
  const prevOffset = (id, line) => getTextOffsets(id)[line] || 0;
  const prevLineTop = (id, line) => getTextHeights(id)[line];
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
      const minTemp = mergeAtLine(id, getTextViewport(id).from, lineMerges, syncedTextsList)[0][id].from;
      if (minViewport > minTemp) {
        minViewport = minTemp;
        minViewportId = id;
      }
      const maxTemp = Math.min(getTextHeights(id).length - 1, mergeAtLine(id, getTextViewport(id).to, lineMerges, syncedTextsList)[0][id].to - 1);
      if (maxViewport < maxTemp) {
        maxViewport = maxTemp;
        maxViewportId = id;
      }
    }
    if (maxViewportId != minViewportId) {
      minViewport = mergeAtLine(minViewportId, getTextViewport(minViewportId).from, lineMerges, syncedTextsList)[0][maxViewportId].from;
      minViewportId = maxViewportId;
    }
    for (let id of textSet) {
      resultOffsets[id] = {offsets: getTextOffsets(id).slice(), minViewport, maxViewport};
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
      if (extraOffsets[id] && Math.max(prevLineTop(id, getTextHeights(id).length - 1), getTextClientHeight(id)) >= getTextScrollHeight(id) - 10) {
        resultOffsets[id].offsets[resultOffsets[id].offsets.length - 1] += extraOffsets[id];
      }
    }
  }
  for (let id in resultOffsets) {
    resultOffsets[id].heights = getTextHeights(id).slice();
    let totalOffsetsDiff = 0;
    for (let line = resultOffsets[id].minViewport; line < resultOffsets[id].maxViewport; ++line) {
      if (resultOffset(id, line) !== undefined) {
        //resultLineBottom
        resultOffsets[id].heights[line + 1] = resultLineTop(id, line) + prevLineTrueHeight(id, line) + resultOffset(id, line);
        totalOffsetsDiff += resultOffset(id, line) - prevOffset(id, line);
      }
    }
    const prevHeight = getTextScrollHeight(id);
    let newHeight = prevHeight + totalOffsetsDiff;
    if (prevHeight == getTextClientHeight(id)) {
      newHeight = resultOffsets[id].heights[resultOffsets[id].heights.length - 1] + resultOffsets[id].heights[0];
    }
    resultOffsets[id].newHeight = newHeight;
  }
  return resultOffsets;
};
export const getNewTextOffsets = createSelectorCreator(conditionalMemoize, ([filteredAlignedTextSets, lineMerges, syncedTextsList, textsView], [lastFilteredAlignedTextSets, lastLineMerges, lastSyncedTextsList, lastTextsView]) => {
  if (filteredAlignedTextSets !== lastFilteredAlignedTextSets || lineMerges !== lastLineMerges || syncedTextsList !== lastSyncedTextsList) {
    return true;
  }
  const s = textsViewSelectors;
  for (let textSets of filteredAlignedTextSets) {
    for (let id of textSets) {
      if (!isequal(s.getTextHeights(textsView, id), s.getTextHeights(lastTextsView, id))) {
        return true;
      }
    }
  }
})
([getFilteredAlignedTextSets, getLineMerges, getSyncedTextsList, rootSelectors.getTextsView], computeNewTextOffsets);

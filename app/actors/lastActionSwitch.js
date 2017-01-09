import ACTION_TYPES from '../constants/ACTION_TYPES';
import * as dataActions from '../actions/textsData';
import TextOperation from 'ot/lib/text-operation';


function parseHtml(data) {
  //убераем лишние пробельные символы
  data = data.replace(/([\n\r] *)+/g, '\n');
  data = data.replace(/>\n</g, '><');
  data = data.replace(/\s+/g, ' ');
  //экранируем теги руби избавляясь от стилей
  data = data.replace(/<(\/?(rb|rp|rt|ruby))( +[^>]*?)?>/g, '[$1]');
  //добавляем разрывы строк в места абзацев и брейков
  data = data.replace(/(<p( [^>]*?)?>)?<\/?br( [^>]*?)?\/?>( <\/p>)?/g, '\n');
  data = data.replace(/(<\/p>(\n*))?<p( [^>]*?)?>/g, '$2\n');
  //удаляем все теги стиля и теги пространства имен вместе с содержимим
  data = data.replace(/<([^: >]+:[^ >]+|style)( [^>]*?)?>.*?<\/\1>/g, '');
  //удаляем текст после завершающего html
  data = data.replace(/<\/html>.*/, '');
  // console.log(data);
  //обрабатываем вордовские сноски
  {
    let data_t = data;
    do {
      data = data_t;
      data_t = data.replace(/<a[^>]+style ?= ?["']([^"']*;)?mso-(foot|end)note-id: ?([^"'; ]+) ?(;[^"']*)?["'].*?<\/a>((.|\r|\n)*?)<div[^>]+id ?= ?["']?\3["']?[^>]*>\s*((.|\r|\n)*?<\/div>)/g, '{{ref|$7}}$5');
    } while (data != data_t);
  }
  //обрабатываем вордовские сноски
  {
    let data_t = data;
    do {
      data = data_t;
      data_t = data.replace(/<a[^>]+href ?= ?["']#(sd(foot|end)note\d+sym)["'].*?<\/a>((.|\r|\n)*?)\s*<a[^>]+name ?= ?["']\1["'].*?<\/a>(<sup[^<]+<\/sup>)?\s*(.*?)\s*<\/div>/g, '{{ref|$6}}$3');
    } while (data != data_t);
  }
  data = data.replace(/<!\[if !support(Foot|End)notes\]>(.|\r|\n)*?<!\[endif\]>/g, '');
  //обрабатываем жирность-курсив для гугл доков
  data = data.replace(/<b [^>]*style\s*=\s*"[^">]*font-weight:normal[^">]*"[^>]*>/g, '');
  data = data.replace(/<i [^>]*style\s*=\s*"[^">]*font-style:normal[^">]*"[^>]*>/g, '');
  data = data.replace(/<span [^>]*style\s*=\s*"[^">]*font-weight:bold[^">]*font-style:italic[^">]*"[^>]*>(.*?)<\/span>/g, "'''''$1'''''");
  data = data.replace(/<span [^>]*style\s*=\s*"[^">]*font-style:italic[^">]*font-weight:bold[^">]*"[^>]*>(.*?)<\/span>/g, "'''''$1'''''");
  data = data.replace(/<span [^>]*style\s*=\s*"[^">]*font-weight:bold[^">]*"[^>]*>(.*?)<\/span>/g, "'''$1'''");
  data = data.replace(/<span [^>]*style\s*=\s*"[^">]*font-style:italic[^">]*"[^>]*>(.*?)<\/span>/g, "''$1''");
  //обрабатываем жирность-курсив для ворда и офиса
  data = data.replace(/<i( [^>]*?)?>(.*?)<\/i>/g, "''$2''");
  data = data.replace(/<b( [^>]*?)?>(.*?)<\/b>/g, "'''$2'''");
  //дублирование иллюстраций в таблице если ячейка второй колонки пустая
  data = data.replace(/(<tr[^>]*>\s*<td[^>]*>\s*.*?\s*(<img[^>]*>)\s*.*?\s*<\/td>\s*<td[^>]*>)\s*(<\/td>\s*<\/tr>)/g, "$1\n$2$3");
  //удаляем правую колонку таблицы если их две
  data = data.replace(/(<tr[^>]*>)\s*<td[^>]*>\s*.*?\s*<\/td>(\s*<td[^>]*>\s*.*?\s*<\/td>\s*<\/tr>)/g, "$1$2");
  //удаляем картинки внешней ссылки
  data = data.replace(/\s*<img[^>]*src="data:image\/(png|jpeg);base64,.{1,500}?"[^>]*>/g, ''); //маленький base64
  data = data.replace(/\s*<img[^>]*width="[0-2]?\d(px)?;?"[^>]*>/g, ''); //маленький width
  //заменяем иллюстрации
  data = data.replace(/<img[^>]*>/g, '{{Иллюстрация}}');
  //удаляем все теги
  data = data.replace(/<\/?.+?>/g, '');
  //чистка пустой жирности-курсива
  data = data.replace(/([^'])('{2,3})( +)?\2([^'])/g, '$1$3$4');
  //чистка разлежшейся жирности-курсива
  // console.log(data);
  data = data.replace(/([^'\n])('{2,3})([,. !?—–]*)(.*?)([,. !?—–]*(\{\{ref\|.*?\}\}[,. !?—–]*)?)(\2)([^'\n])/g, '$1$3$2$4$7$5$8');
  // console.log(data);
  //чистка примечаний
  data = data.replace(/\{\{ref\| /g, '{{ref|');
  data = data.replace(/ \}\}/g, '}}');
  //востановление руби
  data = data.replace(/\[(\/?(rb|rp|rt|ruby))\]/g, '<$1>');
  //удаляем разрывы с начала фрагмента
  data = data.replace(/^\n/, '');
  //заменяем ###
  data = data.replace(/^###$/gm, '{{Иллюстрация}}');
  // заменяем html-сущьности
  data = data.replace(/&nbsp;/g, ' ');
  data = data.replace(/&ldquo;/g, '“');
  data = data.replace(/&rdquo;/g, '”');
  data = data.replace(/&rsquo;/g, '’');
  data = data.replace(/&lsquo;/g, '‘');
  data = data.replace(/&quot;/g, '"');
  //заменяем %%%
  data = data.replace(/\n\n+/g, "\n");
  data = data.replace(/^%%%$/gm, '');
  //чистка лишних пробелов и корректировка тире
  data = data.replace(/  +/g, ' ');
  data = data.replace(/ ?\n ?/g, "\n");
  data = data.replace(/\n[-–] ?/g, "\n— ");
  data = data.replace(/ [-–] /g, " — ");
  data = data.replace(/([^ \n—])[—–]([^ \n—])/g, "$1-$1");
  data = data.replace(/— —/g, "——");
  data = data.replace(/— —/g, "——");
  //console.log(data);
  return data;

}

function makePasteHtmlOperation(selection, html, textLength) {
  const text = parseHtml(html);
  let last_index = 0;
  const operation = new TextOperation();
  for (let range of selection.ranges) {
    const from = Math.min(range.head, range.anchor);
    const to = Math.max(range.head, range.anchor);
    operation.retain(from - last_index);
    operation.delete(to - from);
    operation.insert(text);
    last_index = to;
  }
  operation.retain(textLength - last_index);
  return operation;
}


export default function lastActionSwitch(state, dispatch) {
  switch (state.lastAction.type) {
    case ACTION_TYPES.TEXTS_DATA.PASTE_HTML:
      const operation = makePasteHtmlOperation(state.view.texts[state.lastAction.id].selection, state.lastAction.html, state.data.texts[state.lastAction.id].wiki.length);
      dispatch(dataActions.applyOperationFromCode(state.lastAction.id, operation));
      break;
  }
}
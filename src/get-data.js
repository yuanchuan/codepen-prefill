const fs = require('fs');
const cheerio = require('cheerio');
const URL = require('url');
const format = require('./format');

const EXTERNAL = 'EXTERNAL';
const LOCAL = 'LOCAL';
const EMBEDDED = 'EMBEDDED';

const LINE = '\n\n';

function getType(url) {
  if (typeof url === "undefined" || !url.length) return EMBEDDED;
  if (/^http|^\/{2}.+/.test(url)) return EXTERNAL;
  return LOCAL;
}

function getUrl($elem) {
  let tagName = $elem.get(0).tagName;
  let name = tagName == 'script' ? 'src' : 'href';
  return $elem.attr(name);
}

function getLocalFile(url) {
  try {
    return fs.readFileSync(url, 'utf8');
  } catch (e) {
    return '';
  }
}

function unique(array) {
  return array.filter((v, i) => array.indexOf(v) === i);
}

function getContent($, $elements, options) {
  let external = [];
  let embedded = [];
  let $body = $('body');
  let $head = $('<div></div>').prependTo($body);

  $elements.each(function() {
    let $elem = $(this);
    let url = getUrl($elem);
    let type = getType(url);

    if (type === EXTERNAL) {
      external.push(url);
      $elem.remove();
    }

    else if (type === LOCAL) {
      let { pathname } = URL.parse(url);
      let result = getLocalFile(pathname);
      embedded.push(result);
      $elem.remove();
    }

    else if (type === EMBEDDED) {
      if (options.keepEmbedded) {
        let tag = $elem.get(0).tagName;
        $cloned = $elem.clone();

        if (tag == 'style') {
          $head.append($cloned + LINE);
        } else {
          $body.append($cloned + LINE);
        }
      } else {
        let result = $elem.html();
        if (result.length) {
          embedded.push(result);
        }
      }
      $elem.remove();
    }
  });

  $head.replaceWith($head.html());

  return {
    external: unique(external).join(';'),
    embedded: unique(embedded).join(LINE)
  }
}

function getEditorsFlag({ html, css, js }) {
  let flag = [0,0,0];
  if (html.length) flag[0] = 1;
  if (css.length) flag[1] = 1;
  if (js.length) flag[2] = 1;
  return flag.join('');
}

function getHTMLData(input, options = {}) {
  let $ = cheerio.load(input, { decodeEntities: false });
  let $body = $('body');

  let title = $('title').eq(0).text();
  let description = $('meta[name="description"]').eq(0).attr('content') || '';
  let $styles = $('style, link[rel="stylesheet"]');
  let $scripts = $('script').filter(function() {
    let $elem = $(this);
    let type = $elem.attr('type');
    if (!type || type === 'text/javascript') {
      return true;
    }
    // scripts like shader/fragment
    else {
      $body.append($elem);
    }
  });

  let scriptContent = getContent($, $scripts, options);
  let styleContent = getContent($, $styles, options);

  let html = format.trimEmptyLines($body.html());
  let css = format.normalizeIndent(styleContent.embedded);
  let js = format.trimEmptyLines(scriptContent.embedded);
  let css_external = styleContent.external;
  let js_external = scriptContent.external;

  let editors = getEditorsFlag({ html, css, js });

  return {
    title,
    description,
    editors,
    html,
    css,
    js,
    css_external,
    js_external
  }
}

function getCSSData(input, options = {}) {
  let extname = options.extname;
  let preProccessors = {
    less: 'less',
    scss: 'scss',
    sass: 'sass',
    styl: 'stylus'
  };
  return {
    editors: '010',
    css: input,
    css_pre_processor: preProccessors[extname] || 'none'
  }
}

function getJSData(input) {
  return {
    editors: '001',
    js: input
  }
}

function getTSData(input) {
  return {
    editors: '001',
    js: input,
    js_pre_processor: 'typescript'
  }
}

function getMarkdownData(input) {
  return {
    editors: '100',
    html: input,
    html_pre_processor: 'markdown'
  }
}

function getData(content, options = {}) {
  let data, error;
  let extname = String(options.extname).toLowerCase();
  switch (extname) {
    case 'htm':
    case 'html': {
      data = getHTMLData(content, options);
      break;
    }
    case 'md':
    case 'markdown': {
      data = getMarkdownData(content);
      break;
    }
    case 'js': {
      data = getJSData(content);
      break;
    }
    case 'ts': {
      data = getTSData(content);
      break;
    }
    case 'css':
    case 'less':
    case 'scss':
    case 'sass':
    case 'styl': {
      data = getCSSData(content, { extname });
      break;
    }
    default: {
      error = new Error(`Unsupported file type: ${ extname }`);
    }
  }
  return { data, error }
}

module.exports = getData;

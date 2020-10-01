const fs = require('fs');
const cheerio = require('cheerio');

const EXTERNAL = 'EXTERNAL';
const LOCAL = 'LOCAL';
const INLINE = 'INLINE';

function getType(url) {
  if (typeof url === "undefined" || !url.length) return INLINE;
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
  let inline = [];
  let $body = $('body');

  $elements.each(function() {
    let $elem = $(this);
    let url = getUrl($elem);
    let type = getType(url);

    if (type === EXTERNAL) {
      external.push(url);
      $elem.remove();
    }

    else if (type === LOCAL) {
      let result = getLocalFile(url);
      inline.push(result);
      $elem.remove();
    }

    else if (type === INLINE) {
      if (options.keepInline) {
        let tag = $elem.get(0).tagName;
        if (tag == 'style') {
          $body.prepend($elem);
        } else {
          $body.append($elem);
        }
      } else {
        let result = $elem.html().trim();
        if (result.length) {
          inline.push(result);
        }
      }
      $elem.remove();
    }
  });

  return {
    external: unique(external).join(','),
    inline: unique(inline).join('\n\n')
  }
}

function getHTMLData(html, options = {}) {
  let $ = cheerio.load(html, { decodeEntities: false });
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
  let body = $body.html();

  return {
    title,
    description,
    css_external: styleContent.external,
    css: styleContent.inline,
    js_external: scriptContent.external,
    js: scriptContent.inline,
    html: body
  }
}

function getCSSData(input, options = {}) {
  let extname = options.extname;
  let preProccessors = {
    less: 'less',
    scss: 'scss',
    sass: 'sass',
    stylus: 'stylus'
  };
  return {
    css: input,
    css_pre_processor: preProccessors[extname] || 'none'
  }
}

function getJSData(input) {
  return {
    js: input
  }
}

function getTSData(input) {
  return {
    js: input,
    js_pre_processor: 'typescript'
  }
}

function getMarkdownData(input) {
  return {
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

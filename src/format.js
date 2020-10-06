function trimEmptyLines(input) {
  return input.replace(/^\n+|\n+$/g, '');
}

function normalizeIndent(input) {
  let temp = input.replace(/^\n+/g, '');
  let len = temp.length - temp.replace(/^\s+/g, '').length;
  let result = input.split('\n').map(n => (
    n.replace(new RegExp(`^\\s{${len}}`, 'g'), '')
  ));
  return result.join('\n').trim();
}

module.exports = {
  trimEmptyLines,
  normalizeIndent
}

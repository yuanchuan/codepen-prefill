# codepen-prefill

The live editor of [CodePen](https://codepen.io/) is not stable for me most of the time due to the network (in China...), so I always write demos on my local machine first,
then open CodePen afterwards and copy/paste into the editor.

This tool is for saving this process by doing the following steps:

1. Extract *external* or *embedded* **scripts** and **styles** from a local HTML file.
2. Open a new CodePen editor with default browser.
3. Prefill each HTML/JS/CSS section and external depencencies in the editor automatically.

The rest is to click the **SAVE** button.

## Installation

```bash
$ npm install -g codepen-prefill
```

## Example

```bash
$ codepen-prefill index.html
```

It can be used to preview a `markdown` file quickly on CodePen:

```bash
$ codepen-prefill README.md
```

Edit a JS file on CodePen:

```bash
$ codepen-prefill example.js
```
Using [npx](https://blog.npmjs.org/post/162869356040/introducing-npx-an-npm-package-runner) which is a package runner bundled in `npm`:

```bash
$ npx codepen-prefill index.html
```

## Options

#### --keep-embedded, --embed

By default all the **embedded** scripts/styles in HTML will be put into JS/CSS sections seperatly,
but they can stay with HTML using `--keep-embedded` or `--embed` option.

#### --data

Output the prefiled data instead of open CodePen.


## References

[https://blog.codepen.io/documentation/prefill](https://blog.codepen.io/documentation/prefill/)


## Usage

```
Usage:
  codepen-prefill <filename>

Options:
  --keep-embedded: Keep embedded styles/scripts inside html (alias: --embed)
  --data:          Output the prefilled data
  --help:          Display help info

Supported filename types by extension:
  htm, html, md, markdown, js, ts, css, less, sass, scss, styl
```

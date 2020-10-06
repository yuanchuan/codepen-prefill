const fs = require('fs');
const os = require('os');
const path = require('path');
const open = require('open');

let tmpdir = process.env.TMPDIR || os.tmpdir();
// Cleanup only when the system tmpdir is unavailable
let needCleanup = !tmpdir;

if (!tmpdir) {
  tmpdir = __dirname;
}

function composeHTML(data) {
  let value = JSON.stringify(data)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
  return `
    <style>
      html, body {
        width: 100%;
        height: 100%;
        display: flex;
        background: #1E1F26;
      }
      p {
        margin: auto;
        color: #fff;
      }
    </style>

    <form action="https://codepen.io/pen/define" method="POST" id="form">
      <input type="hidden" name="data" value="${ value }" />
    </form>

    <p>Redirecting to CodePen...</p>

    <script>
      window.onload = function() {
        document.getElementById('form').submit()
      }
    </script>
  `;
}

function openCodePen(data, fn = function() {}) {
  let filename = path.join(tmpdir, Date.now() + '.html');
  try {
    fs.writeFileSync(filename, composeHTML(data));
  } catch (error) {
    return fn(error);
  }

  open(filename)
    .then(() => {
      if (needCleanup) {
        setTimeout(() => {
          try { fs.unlinkSync(filename) } catch (e) {}
          fn();
        }, 3000);
      } else {
        fn();
      }
    })
    .catch(fn);
}

module.exports = openCodePen;

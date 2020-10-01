const fs = require('fs');
const os = require('os');
const path = require('path');
const open = require('open');

const tempdir = process.env.TMPDIR
  || os.tmpdir()
  || __dirname;

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

function openCodePenLink(data, fn) {
  let filename = path.join(tempdir, Date.now() + '.html');
  try {
    fs.writeFileSync(filename, composeHTML(data));
  } catch (error) {
    return fn(error);
  }

  open(filename)
    .then(() => {
      setTimeout(() => {
        // cleanup
        try { fs.unlinkSync(filename) } catch (e) {}
        fn();
      }, 1000);
    })
    .catch(error => {
      fn(error);
    });
}

module.exports = openCodePenLink;;

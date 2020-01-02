let npm = require("child_process"),
  os = require("os"),
  platform = os.platform();

let winCmds = {
  clean: "rimraf ./build",
  install: "yarn",
  setToTEST: "set NODE_ENV=TEST",
  postbuild: "copy swagger.* build"
}
let linCmds = {
  clean: "rm -rf ./build",
  install: "unset http_proxy; unset https_proxy; yarn",
  setToTEST: "export NODE_ENV=TEST",
  postbuild: "cp swagger.json ./build && cp swagger.yaml ./build"
}

let cmds = platform === 'win32' ? winCmds : linCmds;

process.argv.map(function (val, index, array) {
  if (cmds.hasOwnProperty(val)) {
    console.log(`running ${val}:${cmds[val]}`)
    npm.exec(cmds[val], {"encoding" : "utf-8"});
  }
})


#! /usr/bin/env node

var tree = require('npmd-tree').tree
var spawn = require('child_process').spawn
var path = require('path')

var rebuild = module.exports = function (target, config, cb) {
  config.post =
    function (pkg, cb) {
      if(!pkg.gypfile) return cb(null, pkg)
      var cp =
        spawn('node-gyp', ['rebuild'], {cwd: pkg.path})
        .on('exit', function (code) {
          cb(code === 0 ? null : new Error('node-gyp: non-zero exit'), pkg)
        })
        .on('error', cb)

      cp.stdout.pipe(process.stdout)
      cp.stderr.pipe(process.stderr)
    }

  target = target || config.path || process.cwd()

  if(!/^[./]/.test(target))
    target =
      path.join(config.path || process.cwd(), 'node_modules', target)

  tree(target, config, cb)
}

if(!module.parent)
  rebuild(process.cwd(), require('npmd-config'), function (err) {
    if(err) throw err
  })

var menubar = require('menubar');

var menu = menubar();

var Server = require('electron-rpc/server')
var app = new Server()

menu.on('ready', function ready () {
  
  // your app code here
  
  app.on('terminate', function terminate (ev) {
    
    menu.app.terminate()
  })
});

var _ = require('lazy.js');
var blessed = require('blessed');
var path = require('path');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

var Header = require('./Header');
var Editor = require('./Editor');
var SaveAsForm = require('./SaveAsForm');
var FindForm = require('./FindForm');
var GoLineForm = require('./GoLineForm');
var UnsavedChangesDialog = require('./UnsavedChangesDialog');

var util = require('../util');

function Slap (opts) {
  var self = this;

  if (!(self instanceof blessed.Node)) return new Slap(opts);

  blessed.Screen.call(self, opts);

  self.header = new Header(_(opts.header || {}).merge({parent: self}).toObject());

  self.editor = new Editor(_({
    parent: self,
    top: 1,
    left: 0,
    right: 0,
    bottom: 0
  }).merge(opts.editor || {}).toObject());
  self.editor.focus();

  self.fieldOptions = _(opts.editor || {}).merge(opts.field || {}).toObject();
  self.modalOptions = _(opts.modal || {}).merge({
    parent: self,
    field: self.fieldOptions
  }).toObject();
  self.formOptions = _(self.modalOptions).merge(opts.form || {}).toObject();
  self.findFormOptions = _(self.formOptions || {}).merge(opts.findForm || {}).merge({
    prevEditorState: {}
  }).toObject();

  self.findForm = new FindForm(self.findFormOptions);
  self.goLineForm = new GoLineForm(self.findFormOptions);
  self.saveAsForm = new SaveAsForm(self.formOptions);

  self.unsavedChangesDialog = new UnsavedChangesDialog(self.modalOptions);

  self
    .toggleInsertMode()
    ._initHandlers();
}
Slap.prototype.__proto__ = blessed.Screen.prototype;

Slap.normalizePath = function (givenPath) {
  if (!givenPath) givenPath = '';
  if (givenPath[0] === '~') {
    givenPath = path.join(process.platform !== 'win32'
      ? process.env.HOME
      : process.env.USERPROFILE
    , givenPath.slice(1));
  }
  return path.normalize(givenPath);
};
Slap.prototype.path = util.getterSetter('path', null, Slap.normalizePath);
Slap.prototype.open = function (givenPath) {
  var self = this;
  givenPath = Slap.normalizePath(givenPath);
  self.path(givenPath);
  return fs.readFileAsync(givenPath)
    .then(function (data) { self.editor.text(data, givenPath.split('.').pop()); })
    .catch(function (err) {
      if (!err.cause || err.cause.code !== 'ENOENT') throw err;
      self.editor.changeStack.savePosition = null;
      self.render();
    });
};
Slap.prototype.save = function (givenPath) {
  var self = this;
  givenPath = givenPath ? Slap.normalizePath(givenPath) : self.path();
  if (!givenPath) return;

  var text = self.editor.text();
  return fs.writeFileAsync(givenPath, text, {flags: 'w'})
    .then(function () {
      self.editor.changeStack.save();
      self.emit('save', givenPath, text);
      self.path(givenPath);
      self.header.message("saved to " + givenPath, 'success');
    })
    .catch(function (err) {
      switch (err.code) {
        case 'EACCES': case 'EISDIR':
          self.header.message(err.message, 'error');
          break;
        default: throw err;
      }
    });
};
Slap.prototype.insertMode = util.getterSetter('insertMode', null, Boolean);
Slap.prototype.toggleInsertMode = function () { return this.insertMode(!this.insertMode()); };

Slap.prototype.quit = function () {
  process.exit(0);

  return this; // Just in case
};

Slap.prototype._initHandlers = function () {
  var self = this;

  self.on('element keypress', function (el, ch, key) {
    switch (util.getBinding(self.options.bindings, key)) {
      case 'quit':
        var newEmptyFile = self.editor.changeStack.savePosition === null && !self.editor.text();
        if (self.editor.changeStack.dirty() && !newEmptyFile) {
          self.unsavedChangesDialog.show();
        } else {
          self.quit();
        }
        break;
      case 'save': self.path() ? self.save().done() : self.saveAsForm.show(); break;
      case 'saveAs': self.saveAsForm.show(); break;
      case 'find': self.findForm.show(); break;
      case 'goLine': self.goLineForm.show(); break;
      case 'toggleInsertMode': self.toggleInsertMode(); break;
    }
  });

  self.editor.on('keypress', function (ch, key) {
    if (key.action !== 'mousemove') self.header.message(null);
  });
  self.on('resize', function () { self.render(); });
  ['save', 'path', 'insertMode'].forEach(function (evt) {
    self.on(evt, function () { self.render(); });
  });
  ['change', 'cursor'].forEach(function (evt) {
    self.editor.on(evt, function () { self.header.render(); });
  });

  return self;
};

module.exports = Slap;
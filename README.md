![Screenshot](https://raw.githubusercontent.com/slap-editor/slap/master/screenshot.png)

✋ slap
======

slap is a Sublime-like terminal-based text editor that strives to make editing
from the terminal easier. It has:

* first-class mouse support (even over an SSH connection)
* configurable Sublime-like [keybindings](slap.ini#L51)[*](#some-keys-dont-work) (Ctrl+S save, Ctrl+Z undo, etc.)
* copying/pasting with OS clipboard support
* infinite undo/redo
* syntax highlighting for [100+ languages](https://github.com/isagalaev/highlight.js/tree/master/src/languages)
* a Sublime-like file sidebar
* double-click to select word
* selection highlights other occurrences
* Ctrl+F find with regex support
* bracket matching
* autoindentation
* ... many other features that will make you leave nano, vim, and emacs behind

Installation
------------

    $ curl -sL https://raw.githubusercontent.com/slap-editor/slap/master/install.sh | sh

If you already have [NodeJS](http://nodejs.org/download/) installed:

    $ sudo npm install -g slap

Usage
-----

    $ slap fish.c
    $ slap fish1.c fish2.c
    $ slap redfish/ # open dir in browser
    $ slap # new file in current dir

### Configuration

You can pass options in via command line:

    $ slap --header.style.bg red file.c

Or equivalently, you can use `~/.slap/config`:

    [header.style]
    bg = "red"

All configuration options and their defaults are documented [here](slap.ini).

OS support
----------

### OSX

iTerm2 works best. Terminal.app does not support some default keybindings but
mouse support works well with the [MouseTerm](https://bitheap.org/mouseterm/)
[SIMBL](http://www.culater.net/software/SIMBL/SIMBL.php) plugin.

### Linux

If you are using X.Org, ensure xclip is installed for OS clipboard support.

### Windows

Most terminal emulators in Windows do not support mouse events, PuTTY being a
notable exception. In Cygwin, slap crashes on startup due to
[joyent/node#6459](https://github.com/joyent/node/issues/6459).

[Issues](../../issues/new)
--------

Join us in [#slap on Freenode](http://webchat.freenode.net/?channels=slap) for
troubleshooting, theme/plugin/core development, or palm strike discussion of any
nature.

### Some keys don't work!

Unfortunately most terminal emulators do not support certain keystrokes and as
such there is no way to handle them. These include `C-backspace`, `S-home/end`,
and `S-pageup/down`. Most of these actions have alternate keybindings, inspired
by emacs and other editors, but if you find one that doesn't work, please
[submit an issue](../../issues/new)!

### Too slow!

Try `--editor.highlight false` or adding the following to `~/.slap/config`:

    [editor]
    highlight = false

If that doesn't improve performance, please run with `--perf.profile true` and
[submit an issue](../../issues/new) with the newly-created `v8.log` file.

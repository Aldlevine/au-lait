### v0.1.0 (2016-12-12):

Updated compiler to export a function that takes the DOM class `$$` as the only parameter.
This is automatically passed in with `aulait.load` and `require`.
The user no longer needs to specify `$$ = require('aulait/dom')` within template files.

#### BREAKING CHANGES

Some environments may throw an error about redefining `$$`.
If you receive this error remove `$$ = require('aulait/dom')` from the template.

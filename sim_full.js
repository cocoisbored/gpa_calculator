const fs = require('fs');

const { JSDOM } = require('jsdom');
// If jsdom fails, we will just stub document enough for script.js

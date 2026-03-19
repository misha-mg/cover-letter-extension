#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const local = path.join(root, 'src/config/candidate-profile.local.js');
const example = path.join(root, 'src/config/candidate-profile.example.js');

if (fs.existsSync(local)) return;

if (!fs.existsSync(example)) {
  console.warn(
    '[cover-extension] candidate-profile.example.js missing; skipping local profile bootstrap.'
  );
  return;
}

fs.copyFileSync(example, local);
console.log(
  '[cover-extension] Created src/config/candidate-profile.local.js from the example. Edit it with your CV facts (this file is gitignored).'
);

// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Support Dynamic Importing of Music Fonts
//
// vexflow-core-with-petaluma.ts is the entry point for vexflow-core-with-petaluma.js.
// This version bundles the Petaluma music engraving font.
// It also overrides the `Flow.setMusicFont(...)` function to be async, which allows
// other music fonts (e.g., Gonville) to be loaded on the fly.

import { Vex } from '../src/vex';

import { Flow } from '../src/flow';
import { loadCustom } from '../src/fonts/load_custom';
import { loadPetaluma } from '../src/fonts/load_petaluma';
import { loadTextFonts } from '../src/fonts/textfonts';

loadPetaluma();
loadCustom();
Flow.setMusicFont('Petaluma', 'Custom');
loadTextFonts();

export * from '../src/index';
export default Vex;

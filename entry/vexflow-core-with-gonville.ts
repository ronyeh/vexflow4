// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Support Dynamic Importing of Music Fonts
//
// vexflow-core-with-gonville.ts is the entry point for vexflow-core-with-gonville.js.
// This version bundles the Gonville music engraving font.
// It also overrides the `Flow.setMusicFont(...)` function to be async, which allows
// other music fonts (e.g., Bravura) to be loaded on the fly.

import { Vex } from '../src/vex';

import { Flow } from '../src/flow';
import { loadCustom } from '../src/fonts/load_custom';
import { loadGonville } from '../src/fonts/load_gonville';
import { loadTextFonts } from '../src/fonts/textfonts';

loadGonville();
loadCustom();
Flow.setMusicFont('Gonville', 'Custom');
loadTextFonts();

export * from '../src/index';
export default Vex;

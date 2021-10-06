// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { RuntimeError } from './util';
import { Note, NoteStruct } from './note';
import { Glyph } from './glyph';
import { FontInfo } from './types/common';
import { FontStyle, FontWeight, TextFont } from 'textfont';

export enum Justification {
  LEFT = 1,
  CENTER = 2,
  RIGHT = 3,
}

export interface TextNoteStruct extends NoteStruct {
  text?: string;
  glyph?: string;
  ignore_ticks?: boolean;
  smooth?: boolean;
  font?: FontInfo;
  subscript?: string;
  superscript?: string;
}

/**
 * `TextNote` is a notation element that is positioned in time. Generally
 * meant for objects that sit above/below the staff and inline with each other.
 * `TextNote` has to be assigned to a `Stave` before rendering by means of `SetStave`.
 * Examples of this would be such as dynamics, lyrics, chord changes, etc.
 */
export class TextNote extends Note {
  static get CATEGORY(): string {
    return 'TextNote';
  }

  static TEXT_FONT: Required<FontInfo> = {
    family: TextFont.SANS_SERIF,
    size: 12,
    weight: FontWeight.NORMAL,
    style: FontStyle.NORMAL,
  };

  static get Justification(): typeof Justification {
    return Justification;
  }

  /** Glyph data. */
  static get GLYPHS(): Record<string, { code: string }> {
    return {
      segno: {
        code: 'segno',
      },
      tr: {
        code: 'ornamentTrill',
      },
      mordent: {
        code: 'ornamentMordent',
      },
      mordent_upper: {
        code: 'ornamentShortTrill',
      },
      mordent_lower: {
        code: 'ornamentMordent',
      },
      f: {
        code: 'dynamicForte',
      },
      p: {
        code: 'dynamicPiano',
      },
      m: {
        code: 'dynamicMezzo',
      },
      s: {
        code: 'dynamicSforzando',
      },
      z: {
        code: 'dynamicZ',
      },
      coda: {
        code: 'coda',
      },
      pedal_open: {
        code: 'keyboardPedalPed',
      },
      pedal_close: {
        code: 'keyboardPedalUp',
      },
      caesura_straight: {
        code: 'caesura',
      },
      caesura_curved: {
        code: 'caesuraCurved',
      },
      breath: {
        code: 'breathMarkComma',
      },
      tick: {
        code: 'breathMarkTick',
      },
      turn: {
        code: 'ornamentTurn',
      },
      turn_inverted: {
        code: 'ornamentTurnSlash',
      },
    };
  }

  protected text: string;
  protected superscript?: string;
  protected subscript?: string;
  protected smooth: boolean;
  protected justification: Justification;
  protected line: number;

  constructor(noteStruct: TextNoteStruct) {
    super(noteStruct);

    this.text = noteStruct.text || '';
    this.superscript = noteStruct.superscript;
    this.subscript = noteStruct.subscript;
    this.setFont({ ...this.getDefaultFont(), ...noteStruct.font });
    this.line = noteStruct.line || 0;
    this.smooth = noteStruct.smooth || false;
    this.ignore_ticks = noteStruct.ignore_ticks || false;
    this.justification = Justification.LEFT;

    // Determine and set initial note width. Note that the text width is
    // an approximation and isn't very accurate. The only way to accurately
    // measure the length of text is with `CanvasRenderingContext2D.measureText()`.
    if (noteStruct.glyph) {
      const struct = TextNote.GLYPHS[noteStruct.glyph];
      if (!struct) throw new RuntimeError('Invalid glyph type: ' + noteStruct.glyph);

      this.glyph = new Glyph(struct.code, 40, { category: 'textNote' });
      this.setWidth(this.glyph.getMetrics().width);
    } else {
      this.glyph = undefined;
    }
  }

  /** Set the horizontal justification of the TextNote. */
  setJustification(just: Justification): this {
    this.justification = just;
    return this;
  }

  /** Set the Stave line on which the note should be placed. */
  setLine(line: number): this {
    this.line = line;
    return this;
  }

  /** Pre-render formatting. */
  preFormat(): void {
    if (this.preFormatted) return;
    const tickContext = this.checkTickContext(`Can't preformat without a TickContext.`);

    if (this.smooth) {
      this.setWidth(0);
    } else {
      if (this.glyph) {
        // Width already set.
      } else {
        const ctx = this.checkContext();
        ctx.setFont(this.font);
        this.setWidth(ctx.measureText(this.text).width);
      }
    }

    if (this.justification === Justification.CENTER) {
      this.leftDisplacedHeadPx = this.width / 2;
    } else if (this.justification === Justification.RIGHT) {
      this.leftDisplacedHeadPx = this.width;
    }

    // We reposition to the center of the note head
    this.rightDisplacedHeadPx = tickContext.getMetrics().glyphPx / 2;
    this.setPreFormatted(true);
  }

  /**
   * Renders the TextNote.
   * `TextNote` has to be assigned to a `Stave` before rendering by means of `SetStave`.
   */
  draw(): void {
    const ctx = this.checkContext();
    const stave = this.checkStave();
    const tickContext = this.checkTickContext(`Can't draw without a TickContext.`);

    this.setRendered();

    // Reposition to center of note head
    let x = this.getAbsoluteX() + tickContext.getMetrics().glyphPx / 2;

    // Align based on tick-context width.
    const width = this.getWidth();

    if (this.justification === Justification.CENTER) {
      x -= width / 2;
    } else if (this.justification === Justification.RIGHT) {
      x -= width;
    }

    let y;
    if (this.glyph) {
      y = stave.getYForLine(this.line + -3);
      this.glyph.render(ctx, x, y);
    } else {
      y = stave.getYForLine(this.line + -3);
      this.applyStyle(ctx);
      ctx.setFont(this.font);
      ctx.fillText(this.text, x, y);

      const height = ctx.measureText(this.text).height;

      // We called this.setFont() in the constructor, so we know this.font is available.
      // eslint-disable-next-line
      const { family, size, weight, style } = this.font!;
      // Scale the font size by 1/1.3.
      const smallerFontSize = TextFont.scaleSize(size, 0.769231);

      if (this.superscript) {
        ctx.setFont(family, smallerFontSize, weight, style);
        ctx.fillText(this.superscript, x + this.width + 2, y - height / 2.2);
      }

      if (this.subscript) {
        ctx.setFont(family, smallerFontSize, weight, style);
        ctx.fillText(this.subscript, x + this.width + 2, y + height / 2.2 - 1);
      }

      this.restoreStyle(ctx);
    }
  }
}

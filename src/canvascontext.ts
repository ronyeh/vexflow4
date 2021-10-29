// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { GroupAttributes, RenderContext, TextMeasure } from './rendercontext';
import { warn } from './util';

/**
 * A rendering context for the Canvas backend (CanvasRenderingContext2D).
 */
export class CanvasContext extends RenderContext {
  context2D: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement | { width: number; height: number };

  /** Height of one line of text (in pixels). */
  textHeight: number = 0;

  static get WIDTH(): number {
    return 600;
  }

  static get HEIGHT(): number {
    return 400;
  }

  static get CANVAS_BROWSER_SIZE_LIMIT(): number {
    return 32767; // Chrome/Firefox. Could be determined more precisely by npm module canvas-size.
  }

  /**
   * Ensure that width and height do not exceed the browser limit.
   * @returns array of [width, height] clamped to the browser limit.
   */
  static sanitizeCanvasDims(width: number, height: number): [number, number] {
    const limit = this.CANVAS_BROWSER_SIZE_LIMIT;
    if (Math.max(width, height) > limit) {
      warn('Canvas dimensions exceed browser limit. Cropping to ' + limit);
      if (width > limit) {
        width = limit;
      }
      if (height > limit) {
        height = limit;
      }
    }
    return [width, height];
  }

  constructor(context: CanvasRenderingContext2D) {
    super();
    this.context2D = context;
    if (!context.canvas) {
      this.canvas = {
        width: CanvasContext.WIDTH,
        height: CanvasContext.HEIGHT,
      };
    } else {
      this.canvas = context.canvas;
    }
  }

  /**
   * Set all pixels to transparent black rgba(0,0,0,0).
   */
  clear(): void {
    this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // eslint-disable-next-line
  openGroup(cls: string, id?: string, attrs?: GroupAttributes): any {
    // Containers not implemented.
  }

  closeGroup(): void {
    // Containers not implemented.
  }

  // eslint-disable-next-line
  add(child: any): void {
    // Containers not implemented.
  }

  /**
   * @param f a string that specifies the font family, or a `FontInfo` options object.
   * If the first argument is a `FontInfo`, the other arguments below are ignored.
   * @param size a string specifying the font size and unit (e.g., '16pt'), or a number (the unit is assumed to be 'pt').
   * @param weight is inserted into the font-weight attribute (e.g., font-weight="bold")
   * @param style is inserted into the font-style attribute (e.g., font-style="italic")
   */
  setFont(
    f: string | FontInfo = Font.SANS_SERIF,
    size: string | number = Font.SIZE,
    weight: string | number = FontWeight.NORMAL,
    style: string = FontStyle.NORMAL
  ): this {
    let family;
    if (typeof f === 'string') {
      family = f;
    } else {
      family = f.family ?? Font.SANS_SERIF;
      size = f.size ?? Font.SIZE;
      weight = f.weight ?? FontWeight.NORMAL;
      style = f.style ?? FontStyle.NORMAL;
    }

    this.textHeight = Font.convertToPixels(size);

    // Backwards compatibility with 3.0.9.
    // If size is a number, we assume the unit is pt.
    if (typeof size === 'number') {
      size = `${size}pt`;
    }

    this.context2D.font = `${style} ${weight} ${size} ${family}`;

    return this;
  }

  /**
   * @param font a string formatted as CSS font shorthand (e.g., 'italic bold 15pt Arial').
   */
  setRawFont(font: string): this {
    this.context2D.font = font;
    this.textHeight = Font.convertToPixels(Font.parseFont(font).size);
    return this;
  }

  setFillStyle(style: string): this {
    this.context2D.fillStyle = style;
    return this;
  }

  /** CanvasContext ignores `setBackgroundFillStyle()`. */
  // eslint-disable-next-line
  setBackgroundFillStyle(style: string): this {
    // DO NOTHING
    return this;
  }

  setStrokeStyle(style: string): this {
    this.context2D.strokeStyle = style;
    return this;
  }

  setShadowColor(color: string): this {
    this.context2D.shadowColor = color;
    return this;
  }

  setShadowBlur(blur: number): this {
    // CanvasRenderingContext2D does not scale the shadow blur by the current
    // transform, so we have to do it manually. We assume uniform scaling
    // (though allow for rotation) because the blur can only be scaled
    // uniformly anyway.
    const t = this.context2D.getTransform();
    const scale = Math.sqrt(t.a * t.a + t.b * t.b + t.c * t.c + t.d * t.d);
    this.context2D.shadowBlur = scale * blur;
    return this;
  }

  setLineWidth(width: number): this {
    this.context2D.lineWidth = width;
    return this;
  }

  setLineCap(capType: CanvasLineCap): this {
    this.context2D.lineCap = capType;
    return this;
  }

  setLineDash(dash: number[]): this {
    this.context2D.setLineDash(dash);
    return this;
  }

  scale(x: number, y: number): this {
    this.context2D.scale(x, y);
    return this;
  }

  resize(width: number, height: number): this {
    const canvasElement = this.context2D.canvas;
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Scale the canvas size by the device pixel ratio clamping to the maximum supported size.
    [width, height] = CanvasContext.sanitizeCanvasDims(width * devicePixelRatio, height * devicePixelRatio);

    // Divide back down by the pixel ratio and convert to integers.
    width = (width / devicePixelRatio) | 0;
    height = (height / devicePixelRatio) | 0;

    canvasElement.width = width * devicePixelRatio;
    canvasElement.height = height * devicePixelRatio;
    canvasElement.style.width = width + 'px';
    canvasElement.style.height = height + 'px';

    return this.scale(devicePixelRatio, devicePixelRatio);
  }

  rect(x: number, y: number, width: number, height: number): this {
    this.context2D.rect(x, y, width, height);
    return this;
  }

  fillRect(x: number, y: number, width: number, height: number): this {
    this.context2D.fillRect(x, y, width, height);
    return this;
  }

  /**
   * Set the pixels in a rectangular area to transparent black rgba(0,0,0,0).
   */
  clearRect(x: number, y: number, width: number, height: number): this {
    this.context2D.clearRect(x, y, width, height);
    return this;
  }

  beginPath(): this {
    this.context2D.beginPath();
    return this;
  }

  moveTo(x: number, y: number): this {
    this.context2D.moveTo(x, y);
    return this;
  }

  lineTo(x: number, y: number): this {
    this.context2D.lineTo(x, y);
    return this;
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this {
    this.context2D.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    return this;
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): this {
    this.context2D.quadraticCurveTo(cpx, cpy, x, y);
    return this;
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise: boolean): this {
    this.context2D.arc(x, y, radius, startAngle, endAngle, counterclockwise);
    return this;
  }

  fill(): this {
    this.context2D.fill();
    return this;
  }

  stroke(): this {
    this.context2D.stroke();
    return this;
  }

  closePath(): this {
    this.context2D.closePath();
    return this;
  }

  measureText(text: string): TextMeasure {
    const metrics = this.context2D.measureText(text);
    return {
      width: metrics.width,
      height: this.textHeight,
    };
  }

  fillText(text: string, x: number, y: number): this {
    this.context2D.fillText(text, x, y);
    return this;
  }

  save(): this {
    this.context2D.save();
    return this;
  }

  restore(): this {
    this.context2D.restore();
    return this;
  }

  set font(value: string) {
    this.setRawFont(value);
  }

  get font(): string {
    return this.context2D.font;
  }

  set fillStyle(style: string | CanvasGradient | CanvasPattern) {
    this.context2D.fillStyle = style;
  }

  get fillStyle(): string | CanvasGradient | CanvasPattern {
    return this.context2D.fillStyle;
  }

  set strokeStyle(style: string | CanvasGradient | CanvasPattern) {
    this.context2D.strokeStyle = style;
  }

  get strokeStyle(): string | CanvasGradient | CanvasPattern {
    return this.context2D.strokeStyle;
  }
}

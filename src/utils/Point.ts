/**
 * Adaptation of work of Kevin Lindsey(kevin@kevlindev.com)
 * Thanks to fabric.js for the great work
 */

import * as fabric from 'fabric'

export interface XY {
  x: number | undefined
  y: number | undefined
}
export class Point {
  declare x: number | undefined

  declare y: number | undefined

  constructor()
  constructor(x: number | undefined, y: number | undefined)
  constructor(point?: XY)
  constructor(arg0: number | XY = 0, y = 0) {
    if (typeof arg0 === 'object') {
      this.x = arg0.x
      this.y = arg0.y
    } else {
      this.x = arg0
      this.y = y
    }
  }

  /**
   * Adds another point to this one and returns another one
   * @param {XY} that
   * @return {Point} new Point instance with added values
   */
  add(that: XY): Point {
    return new Point(
      this.x == undefined || that.x == undefined ? undefined : this.x + that.x,
      this.y == undefined || that.y == undefined ? undefined : this.y + that.y,
    )
  }

  /**
   * Adds value to this point and returns a new one
   * @param {Number} scalar
   * @return {Point} new Point with added value
   */
  scalarAdd(scalar: number): Point {
    return new Point(
      this.x == undefined ? undefined : this.x + scalar,
      this.y == undefined ? undefined : this.y + scalar,
    )
  }

  /**
   * Subtracts another point from this point and returns a new one
   * @param {XY} that
   * @return {Point} new Point object with subtracted values
   */
  subtract(that: XY): Point {
    return new Point(
      this.x == undefined || that.x == undefined ? undefined : this.x - that.x,
      this.y == undefined || that.y == undefined ? undefined : this.y - that.y,
    )
  }

  /**
   * Subtracts value from this point and returns a new one
   * @param {Number} scalar
   * @return {Point}
   */
  scalarSubtract(scalar: number): Point {
    return new Point(
      this.x == undefined ? undefined : this.x - scalar,
      this.y == undefined ? undefined : this.y - scalar,
    )
  }

  /**
   * Multiplies this point by another value and returns a new one
   * @param {XY} that
   * @return {Point}
   */
  multiply(that: XY): Point {
    return new Point(
      this.x == undefined || that.x == undefined ? undefined : this.x * that.x,
      this.y == undefined || that.y == undefined ? undefined : this.y * that.y,
    )
  }

  /**
   * Multiplies this point by a value and returns a new one
   * @param {Number} scalar
   * @return {Point}
   */
  scalarMultiply(scalar: number): Point {
    return new Point(
      this.x == undefined ? undefined : this.x * scalar,
      this.y == undefined ? undefined : this.y * scalar,
    )
  }

  /**
   * Divides this point by another and returns a new one
   * @param {XY} that
   * @return {Point}
   */
  divide(that: XY): Point {
    return new Point(
      this.x == undefined || that.x == undefined ? undefined : this.x / that.x,
      this.y == undefined || that.y == undefined ? undefined : this.y / that.y,
    )
  }

  /**
   * Divides this point by a value and returns a new one
   * @param {Number} scalar
   * @return {Point}
   */
  scalarDivide(scalar: number): Point {
    return new Point(
      this.x == undefined ? undefined : this.x / scalar,
      this.y == undefined ? undefined : this.y / scalar,
    )
  }

  /**
   * Returns true if this point is equal to another one
   * Is always false if one value is undefined
   * @param {XY} that
   * @return {Boolean}
   */
  eq(that: XY): boolean {
    if (this.x == undefined || this.y == undefined || that.x == undefined || that.y == undefined) {
      return false
    }
    return this.x === that.x && this.y === that.y
  }

  /**
   * Returns true if this point is less than another one
   * Is always false if one value is undefined
   * @param {XY} that
   * @return {Boolean}
   */
  lt(that: XY): boolean {
    if (this.x == undefined || this.y == undefined || that.x == undefined || that.y == undefined) {
      return false
    }
    return this.x < that.x && this.y < that.y
  }

  /**
   * Returns true if this point is less than or equal to another one
   * Is always false if one value is undefined
   * @param {XY} that
   * @return {Boolean}
   */
  lte(that: XY): boolean {
    if (this.x == undefined || this.y == undefined || that.x == undefined || that.y == undefined) {
      return false
    }
    return this.x <= that.x && this.y <= that.y
  }

  /**

   * Returns true if this point is greater another one
   * Is always false if one value is undefined
   * @param {XY} that
   * @return {Boolean}
   */
  gt(that: XY): boolean {
    if (this.x == undefined || this.y == undefined || that.x == undefined || that.y == undefined) {
      return false
    }
    return this.x > that.x && this.y > that.y
  }

  /**
   * Returns true if this point is greater than or equal to another one
   * Is always false if one value is undefined
   * @param {XY} that
   * @return {Boolean}
   */
  gte(that: XY): boolean {
    if (this.x == undefined || this.y == undefined || that.x == undefined || that.y == undefined) {
      return false
    }
    return this.x >= that.x && this.y >= that.y
  }

  /**
   * Returns new point which is the result of linear interpolation with this one and another one
   * @param {XY} that
   * @param {Number} t , position of interpolation, between 0 and 1 default 0.5
   * @return {Point}
   */
  lerp(that: XY, t = 0.5): Point | undefined {
    if (this.x == undefined || this.y == undefined || that.x == undefined || that.y == undefined) {
      return undefined
    }
    t = Math.max(Math.min(1, t), 0)
    return new Point(this.x + (that.x - this.x) * t, this.y + (that.y - this.y) * t)
  }

  /**
   * Returns distance from this point and another one
   * @param {XY} that
   * @return {Number}
   */
  distanceFrom(that: XY): number | undefined {
    if (this.x == undefined || this.y == undefined || that.x == undefined || that.y == undefined) {
      return undefined
    }
    const dx = this.x - that.x,
      dy = this.y - that.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Returns the point between this point and another one
   * @param {XY} that
   * @return {Point}
   */
  midPointFrom(that: XY): Point | undefined {
    return this.lerp(that)
  }

  /**
   * Returns string representation of this point
   * @return {String}
   */
  toString(): string {
    return `${this.x},${this.y}`
  }

  /**
   * Returns fabric representation of this point
   * @return {String}
   */
  toFabricPoint(): fabric.Point {
    if (this.x == undefined || this.y == undefined) {
      throw new Error('x or y is undefined. Cannot convert to fabric.Point')
    }
    return new fabric.Point(this.x, this.y)
  }

  /**
   * Sets x/y of this point
   * @param {Number} x
   * @param {Number} y
   * @chainable
   */
  setXY(x: number, y: number) {
    this.x = x
    this.y = y
    return this
  }

  /**
   * Sets x of this point
   * @param {Number} x
   * @chainable
   */
  setX(x: number) {
    this.x = x
    return this
  }

  /**
   * Sets y of this point
   * @param {Number} y
   * @chainable
   */
  setY(y: number) {
    this.y = y
    return this
  }

  /**
   * Sets x/y of this point from another point
   * @param {XY} that
   * @chainable
   */
  setFromPoint(that: XY) {
    this.x = that.x
    this.y = that.y
    return this
  }

  /**
   * Swaps x/y of this point and another point
   * @param {XY} that
   */
  swap(that: XY) {
    const x = this.x,
      y = this.y
    this.x = that.x
    this.y = that.y
    that.x = x
    that.y = y
  }

  /**
   * return a cloned instance of the point
   * @return {Point}
   */
  clone(): Point {
    return new Point(this.x, this.y)
  }
}

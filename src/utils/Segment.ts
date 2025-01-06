import * as fabric from 'fabric'
export class Segment {
  constructor(
    public start: fabric.Point,
    public end: fabric.Point,
  ) {}
  get length() {
    return this.start.distanceFrom(this.end)
  }

  public pointOnSegment(point: fabric.Point) {
    const denom1 = this.start.x - this.end.x
    const denom2 = this.start.y - this.end.y
    if (denom1 == 0 || denom2 == 0) return false

    const alpha1 = (point.x - this.end.x) / denom1
    const alpha2 = (point.y - this.end.y) / denom2

    if (alpha1 == alpha2 && alpha1 >= 0 && alpha1 <= 1) {
      return true
    }
    return false
  }

  public intersection(segment: Segment) {
    const denom =
      (this.end.x - this.start.x) * (segment.end.y - segment.start.y) -
      (this.end.y - this.start.y) * (segment.end.x - segment.start.x)

    if (denom === 0) {
      return null // Lines are parallel or coincident
    }

    const numeA =
      (this.start.y - segment.start.y) * (segment.end.x - segment.start.x) -
      (this.start.x - segment.start.x) * (segment.end.y - segment.start.y)
    const numeB =
      (this.start.y - segment.start.y) * (this.end.x - this.start.x) -
      (this.start.x - segment.start.x) * (this.end.y - this.start.y)

    const uA = numeA / denom
    const uB = numeB / denom

    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
      const intersectionX = this.start.x + uA * (this.end.x - this.start.x)
      const intersectionY = this.start.y + uA * (this.end.y - this.start.y)
      return new fabric.Point(intersectionX, intersectionY)
    }

    return null // No intersection
  }
  toString() {
    return `Segment: [${this.start.x}, ${this.start.y}] -> [${this.end.x}, ${this.end.y}]`
  }

  // public toString() {
  //   return `Segment: [${this.start.x}, ${this.start.y}] -> [${this.end.x}, ${this.end.y}]`
  // }
}

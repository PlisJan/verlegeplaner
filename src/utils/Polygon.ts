import * as fabric from 'fabric'
import { Segment } from './Segment'

export function area(p: fabric.XY[]): number {
  // console.log(segments(p).map(({ start: p0, end: p1 }) => p0.x * p1.y - p1.x * p0.y))
  return (
    0.5 *
    Math.abs(
      segments(p).reduce((sum, { start: p0, end: p1 }) => sum + (p0.x * p1.y - p1.x * p0.y), 0),
    )
  )
}

export function segments(p: fabric.XY[]): Segment[] {
  return p.map(
    (point, index) =>
      new Segment(new fabric.Point(point), new fabric.Point(p[(index + 1) % p.length])),
  )
}

export function getPolyVertices(poly: fabric.Polygon) {
  const points = poly.points
  const vertices: fabric.Point[] = []

  points.forEach((point) => {
    const x = point.x - poly.pathOffset.x,
      y = point.y - poly.pathOffset.y

    vertices.push(
      new fabric.Point(x, y).transform(
        fabric.util.multiplyTransformMatrices(
          poly.canvas!.viewportTransform,
          poly.calcTransformMatrix(),
        ),
      ),
    )
  })

  return vertices
}

export function pointInPolygon(poly: fabric.Polygon, point: fabric.XY): boolean {
  const seg = new Segment(
    new fabric.Point(point),
    new fabric.Point(point.x + poly.width * 3, point.y),
  )

  const polySegs = segments(poly.points)
  let intersectionCount = 0
  polySegs.forEach((polySeg) => {
    if (seg.intersection(polySeg) != null) {
      intersectionCount++
    }
  })

  return intersectionCount % 2 == 1
}

export function segmentCrossesBoundary(poly: fabric.Polygon, seg: Segment): fabric.Point[] {
  const polySegs = segments(poly.points)

  const intersections: fabric.Point[] = []
  polySegs.forEach((polySeg) => {
    const intersec = seg.intersection(polySeg)
    if (intersec != null) {
      intersections.push(intersec)
    }
  })

  return intersections
}

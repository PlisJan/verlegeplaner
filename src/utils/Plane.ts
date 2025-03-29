import * as fabric from 'fabric'
import { getPolyVertices, pointInPolygon, segmentCrossesBoundary } from './Polygon'
import { Segment } from './Segment'

export function createPlane(
  polygon: fabric.Polygon,
  position: fabric.XY,
  width: number,
  height: number,
  elementScale: number,
): fabric.Group[] {
  const posPoint = new fabric.Point(position)
  const textColor = 'black'

  const pointsInPolygon = [
    pointInPolygon(polygon, posPoint), // Bottom left
    pointInPolygon(polygon, posPoint.add({ x: width, y: 0 })), // bottom right
    pointInPolygon(polygon, posPoint.add({ x: 0, y: height })), // top left
    pointInPolygon(polygon, posPoint.add({ x: width, y: height })), //top right
  ]

  if (!pointsInPolygon.some((p) => p)) {
    // All Points are outside the polygon

    // textColor = 'red'
    return []
  }

  const intersectionPointsTop = segmentCrossesBoundary(
    polygon,
    new Segment(posPoint.add({ x: 0, y: height }), posPoint.add({ x: width, y: height })),
  )
  const intersectionPointsBottom = segmentCrossesBoundary(
    polygon,
    new Segment(posPoint, posPoint.add({ x: width, y: 0 })),
  )
  if (
    pointsInPolygon.filter((v) => !v).length > 1 && // two or three points are outside the polygon
    (intersectionPointsBottom.length == 1 || intersectionPointsTop.length == 1)
  ) {
    let distance = Number.NEGATIVE_INFINITY
    let innerSide: 'left' | 'right' = 'left'
    if (intersectionPointsBottom.length == 0) {
      // => intersectionPointsTop.length == 1
      distance = intersectionPointsTop[0].x - posPoint.add({ x: 0, y: height }).x
      innerSide = pointsInPolygon[2] ? 'left' : 'right'
    } else if (intersectionPointsTop.length == 0) {
      // => intersectionPointsBottom.length == 1
      distance = intersectionPointsBottom[0].x - posPoint.x
      innerSide = pointsInPolygon[0] ? 'left' : 'right'
    } else if (intersectionPointsBottom[0].x == intersectionPointsTop[0].x) {
      distance = intersectionPointsBottom[0].x - posPoint.x
      innerSide = pointsInPolygon[2] || pointsInPolygon[0] ? 'left' : 'right'
    } else if (
      [pointsInPolygon[0], pointsInPolygon[2]].filter((v) => v).length >
      [pointsInPolygon[1], pointsInPolygon[3]].filter((v) => v).length
    ) {
      distance = Math.max(intersectionPointsBottom[0].x, intersectionPointsTop[0].x) - posPoint.x
      innerSide = 'left'
    } else if (
      [pointsInPolygon[0], pointsInPolygon[2]].filter((v) => v).length <
      [pointsInPolygon[1], pointsInPolygon[3]].filter((v) => v).length
    ) {
      distance = Math.min(intersectionPointsBottom[0].x, intersectionPointsTop[0].x) - posPoint.x
      innerSide = 'right'
    }

    if (distance != Number.NEGATIVE_INFINITY) {
      if (innerSide == 'left') {
        return [
          drawPlane(
            polygon,
            posPoint,
            round(distance, 5),
            height,
            elementScale,
            // (textColor = innerSide == 'left' ? 'black' : 'red'),
          ),
        ]
      }

      return [
        drawPlane(
          polygon,
          posPoint.add({ x: distance, y: 0 }),
          round(width - distance, 5),
          height,
          elementScale,
          // (textColor = innerSide == 'right' ? 'black' : 'red'),
        ),
      ]
    }
  }

  const grp = drawPlane(polygon, position, width, height, elementScale, textColor)
  return [grp]
}

function drawPlane(
  polygon: fabric.Polygon,
  position: fabric.XY,
  width: number,
  height: number,
  elementScale: number,
  textColor: string = 'black',
): fabric.Group {
  const plane = new fabric.Rect({
    width: width * 1,
    height: height * 1,
    fill: 'white',
    stroke: 'black',
    strokeWidth: 1,
    strokeUniform: true,
    opacity: 0.5,
  })
  const txt = new fabric.FabricText(`${width}`, {
    fontSize: Math.round(height / elementScale),
    fill: textColor,
    originX: 'center',
    originY: 'center',
    left: width * 0.5,
    top: height * 0.5,
  })
  if (txt.calcTextWidth() > width) {
    txt.left = width * 0.5 + ((txt.calcTextWidth() - width) / 2) * 1.5
  }

  // txt.rotate(180)
  const grp = new fabric.Group([plane, txt], {
    originX: 'left',
    originY: 'center',
    width: width,
    height: height,
  })

  grp.scale(elementScale)
  const polyVerticies = getPolyVertices(polygon)
  const minX = Math.min(...polyVerticies.map((v) => v.x))
  const minY = Math.max(...polyVerticies.map((v) => v.y))

  grp.setPositionByOrigin(
    new fabric.Point(minX, minY).add(
      new fabric.Point(position).multiply({ x: elementScale, y: -elementScale }),
    ),
    'left',
    'bottom',
  )
  return grp
}

function round(num: number, decimalPlaces: number = 0) {
  const p = Math.pow(10, decimalPlaces)
  const n = num * p * (1 + Number.EPSILON)
  return Math.round(n) / p
}

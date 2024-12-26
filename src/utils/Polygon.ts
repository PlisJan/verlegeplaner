export function getWidthAtGivenHeight(polygon: [number, number][], height: number) {
  const criticalEdges = []
  for (let i = 0; i < polygon.length; i++) {
    const [x1, y1] = polygon[i]
    const [x2, y2] = polygon[(i + 1) % polygon.length]

    if ((y1 <= height && y2 >= height) || (y1 >= height && y2 <= height)) {
      criticalEdges.push([x1, y1, x2, y2])
    }
  }
  const criticalPoints: number[] = []
  criticalEdges.forEach(([x1, y1, x2, y2]) => {
    if (y1 === y2) {
      criticalPoints.push(x1)
      criticalPoints.push(x2)
    } else {
      const x = x1 + ((x2 - x1) * (height - y1)) / (y2 - y1)
      criticalPoints.push(x)
    }
  })
  //Achtung: outer width
  return Math.max(...criticalPoints) - Math.min(...criticalPoints)
}

export function getLeftMostPointAtGivenHeight(polygon: [number, number][], height: number) {
  const criticalEdges = []
  for (let i = 0; i < polygon.length; i++) {
    const [x1, y1] = polygon[i]
    const [x2, y2] = polygon[(i + 1) % polygon.length]

    if ((y1 <= height && y2 >= height) || (y1 >= height && y2 <= height)) {
      criticalEdges.push([x1, y1, x2, y2])
    }
  }
  const criticalPoints: number[] = []
  criticalEdges.forEach(([x1, y1, x2, y2]) => {
    if (y1 === y2) {
      criticalPoints.push(x1)
      criticalPoints.push(x2)
    } else {
      const x = x1 + ((x2 - x1) * (height - y1)) / (y2 - y1)
      criticalPoints.push(x)
    }
  })
  //Achtung: outer width
  return Math.min(...criticalPoints)
}

export function getRightMostPointAtGivenHeight(polygon: [number, number][], height: number) {
  const criticalEdges = []
  for (let i = 0; i < polygon.length; i++) {
    const [x1, y1] = polygon[i]
    const [x2, y2] = polygon[(i + 1) % polygon.length]

    if ((y1 <= height && y2 >= height) || (y1 >= height && y2 <= height)) {
      criticalEdges.push([x1, y1, x2, y2])
    }
  }
  const criticalPoints: number[] = []
  criticalEdges.forEach(([x1, y1, x2, y2]) => {
    if (y1 === y2) {
      criticalPoints.push(x1)
      criticalPoints.push(x2)
    } else {
      const x = x1 + ((x2 - x1) * (height - y1)) / (y2 - y1)
      criticalPoints.push(x)
    }
  })
  //Achtung: outer width
  return Math.max(...criticalPoints)
}

export function pointInPolygon(polygon: [number, number][], point: [number, number]) {
  const x = point[0]
  const y = point[1]
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0]
    const yi = polygon[i][1]
    const xj = polygon[j][0]
    const yj = polygon[j][1]

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }

  return inside
}

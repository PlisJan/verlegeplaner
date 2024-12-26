<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';

import * as fabric from 'fabric';
import { useMainStore } from './stores/mainStore';
import { getLeftMostPointAtGivenHeight, getRightMostPointAtGivenHeight, nextBorderInterceptionToLeft, nextBorderInterceptionToRight, pointInPolygon } from './utils/Polygon';

const mainStore = useMainStore()



// const polygon = ref<[number, number][]>([])
const newVertex = ref<[string, string]>(["0", "0"])
const canvas = ref<fabric.StaticCanvas | null>(null)
const elementScale = ref<number>(1)
const pg = ref<fabric.Polygon>()
const trashLeft = ref<number[]>([])
const trashRight = ref<number[]>([])
const trashFull = ref<number[]>([])

onMounted(() => {
  canvas.value = new fabric.StaticCanvas('myCanvas');
  updateCanvas()
});

function addVertex() {
  const nVertex = []
  console.log(newVertex.value[0].replace(/[^-()\d/*+.]/g, ''))
  console.log(eval(newVertex.value[0].replace(/[^-()\d/*+.]/g, '')))
  nVertex.push(parseFloat(eval(newVertex.value[0].replace(/[^-()\d/*+.]/g, ''))));
  nVertex.push(parseFloat(eval(newVertex.value[1].replace(/[^-()\d/*+.]/g, ''))));

  mainStore.addVertex(nVertex as [number, number])
  newVertex.value = [nVertex[0].toString(), nVertex[1].toString()]
  updateCanvas()
}

function popVertex() {
  mainStore.popVertex()
  updateCanvas()
}

function download() {
  const a = document.createElement('a')
  canvas.value!.backgroundColor = 'white'
  let dt = canvas.value!.toDataURL({
    format: 'jpeg',
    quality: 1,
    multiplier: 5,
  })
  dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream')
  dt = dt.replace(
    /^data:application\/octet-stream/,
    'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png',
  )

  a.href = dt
  a.download = 'canvas.jpeg'
  a.click()
}

function updateCanvas() {
  canvas.value?.clear()
  pg.value = new fabric.Polygon(mainStore.polygon.map(v => { return { x: v[0], y: v[1] } }), {
    fill: '#ced8e4',
    stroke: 'black',
    strokeWidth: 5,
    strokeUniform: true
  });
  if (pg.value.width! > pg.value.height!) {
    pg.value.scaleToWidth(1500)
  } else {
    pg.value.scaleToHeight(1500)

  }
  elementScale.value = pg.value.scaleX
  pg.value.flipY = true
  canvas.value?.add(pg.value);
  canvas.value?.centerObject(pg.value);

}

function getPolyVertices(poly: fabric.Polygon) {
  const points = poly.points
  const vertices: fabric.Point[] = [];

  points.forEach((point) => {
    const x = point.x - poly.pathOffset.x,
      y = point.y - poly.pathOffset.y;

    vertices.push((new fabric.Point(x, y)).transform(
      fabric.util.multiplyTransformMatrices(
        poly.canvas!.viewportTransform,
        poly.calcTransformMatrix()
      )
    )
    );
  });

  return vertices;
}

function createMeasurement(lineSegment: [number, number, number, number]) {
  let height = 0;
  let position = new fabric.Point(0, 0)
  // Horizontal line
  if (lineSegment[0] != lineSegment[2]) {
    height = Math.abs(lineSegment[0] - lineSegment[2])

    // always choose left anchor point
    if (lineSegment[0] < lineSegment[2]) {
      position = new fabric.Point(lineSegment[0], lineSegment[1] + 30)
    } else {
      position = new fabric.Point(lineSegment[2], lineSegment[3] + 30)
    }
    // choose point outside of polygon
    if (pointInPolygon(mainStore.polygon, [position.x, position.y])) {
      position = new fabric.Point(position.x, position.y - 35)
    }
    // Vertical line
  } else if (lineSegment[1] != lineSegment[3]) {
    height = Math.abs(lineSegment[1] - lineSegment[3])

    // always choose bottom anchor point
    if (lineSegment[1] < lineSegment[3]) {
      position = new fabric.Point(lineSegment[0] + 5, lineSegment[1])
    } else {
      position = new fabric.Point(lineSegment[0] + 5, lineSegment[3])
    }

    // choose point outside of polygon
    if (pointInPolygon(mainStore.polygon, [position.x, position.y])) {
      position = new fabric.Point(position.x - 35, position.y)
    }

  }

  canvas.value!.backgroundColor = 'white'
  const endline1 = new fabric.Line([0, 0, 10, 0], {
    stroke: 'lightblue',
    strokeWidth: 2,
    strokeUniform: true,
  });
  const endline2 = new fabric.Line([0, height, 10, height], {
    stroke: 'lightblue',
    strokeWidth: 2,
    strokeUniform: true,
  });
  const line = new fabric.Line([5, 0, 5, height], {
    stroke: 'lightblue',
    strokeWidth: 2,
    strokeUniform: true,
  });
  const txt = new fabric.FabricText(`  ${height}  `, {
    fontSize: 16,
    fill: 'lightblue',
    originX: 'center',
    originY: 'center',
    left: 5,
    top: height * 0.5,
    width: 10,
    backgroundColor: 'white',
  });
  txt.rotate(-90)
  const grp = new fabric.Group([endline1, endline2, line, txt], {
    originX: 'center',
    originY: 'center',
    width: 10,
    height: height,
  });

  // Horizontal line
  if (lineSegment[0] != lineSegment[2]) {
    grp.rotate(90)
  }

  grp.scale(elementScale.value)
  grp.setPositionByOrigin(getPolyVertices(pg.value!)[0].add(position.multiply({ x: elementScale.value, y: -elementScale.value })), 'left', 'bottom')
  canvas.value?.add(grp);
  canvas.value?.bringObjectToFront(grp)
}


function createAllMeasurements() {
  for (let i = 0; i < mainStore.polygon.length; i++) {
    createMeasurement([...mainStore.polygon[i], ...mainStore.polygon[(i + 1) % mainStore.polygon.length]])
  }
}

function createPlane(width: number, height: number, position: fabric.Point) {
  const bottomLeftInPolygon = pointInPolygon(mainStore.polygon, [position.x, position.y])
  const bottomRightInPolygon = pointInPolygon(mainStore.polygon, [position.x + width, position.y])
  const topLeftInPolygon = pointInPolygon(mainStore.polygon, [position.x, position.y + height])
  const topRightInPolygon = pointInPolygon(mainStore.polygon, [position.x + width, position.y + height])

  // All points not in polygon
  if (!bottomLeftInPolygon && !bottomRightInPolygon && !topLeftInPolygon && !topRightInPolygon) return;


  // Shrink to right
  if (!bottomRightInPolygon && !topRightInPolygon) {
    let topBorderInterception = nextBorderInterceptionToRight(mainStore.polygon, [position.x, position.y + height]) - position.x
    let bottomBorderInterception = nextBorderInterceptionToRight(mainStore.polygon, [position.x, position.y]) - position.x
    if (topBorderInterception > mainStore.plateSize[0]) {
      topBorderInterception = Number.NEGATIVE_INFINITY
    }
    if (bottomBorderInterception > mainStore.plateSize[0]) {
      bottomBorderInterception = Number.NEGATIVE_INFINITY
    }

    width = Math.max(topBorderInterception, bottomBorderInterception)
  }

  // Shrink to left
  if (!bottomLeftInPolygon && !topLeftInPolygon) {
    let topBorderInterception = nextBorderInterceptionToLeft(mainStore.polygon, [position.x + width, position.y + height]) - position.x
    let bottomBorderInterception = nextBorderInterceptionToLeft(mainStore.polygon, [position.x + width, position.y]) - position.x
    if (topBorderInterception < -mainStore.plateSize[0]) {
      topBorderInterception = Number.POSITIVE_INFINITY
    }
    if (bottomBorderInterception < -mainStore.plateSize[0]) {
      bottomBorderInterception = Number.POSITIVE_INFINITY
    }

    const delta = Math.min(topBorderInterception, bottomBorderInterception)
    width -= delta
    position.x += delta
  }

  const plane = new fabric.Rect({
    width: width * 1,
    height: height * 1,
    fill: 'white',
    stroke: 'black',
    strokeWidth: 1,
    strokeUniform: true,
    opacity: 0.5,
  });
  const txt = new fabric.FabricText(`${width}`, {
    fontSize: 16,
    fill: 'black',
    originX: 'center',
    originY: 'center',
    left: width * 0.5,
    top: height * 0.5,
    width: width * 0.9,
  });
  // txt.rotate(180)
  const grp = new fabric.Group([plane, txt], {
    originX: 'center',
    originY: 'center',
    width: width,
    height: height,
  });

  grp.scale(elementScale.value)
  grp.setPositionByOrigin(getPolyVertices(pg.value!)[0].add(position.multiply({ x: elementScale.value, y: -elementScale.value })), 'left', 'bottom')
  canvas.value?.add(grp);
  canvas.value?.bringObjectToFront(grp)
}

function calcTrash(trashR: Ref<number[]>, trashL: Ref<number[]>, amount: number) {
  const TRASH_TRESHOLD = 60
  const usableTrash = trashL.value.filter(v => v > amount).sort()[0]
  if (usableTrash === undefined || usableTrash - amount > TRASH_TRESHOLD) {
    trashR.value.push(amount)
    return
  }
  // trashR.value.push(usableTrash - amount)
  trashFull.value.push(usableTrash - amount)
  trashL.value.splice(trashL.value.indexOf(usableTrash), 1)
}


function calcPlanes() {
  const h0 = mainStore.h0
  canvas.value?.clear()
  updateCanvas()
  const plateX = mainStore.plateSize[0] * 1
  const plateY = mainStore.plateSize[1] * 1
  const poly = mainStore.polygon
  for (let j = 0; j < 52; j++) { // TODO
    const h = j * plateY + h0
    const leftIndent = mainStore.startingLengths[j % mainStore.startingLengths.length] % plateX || 0
    const w = Math.max(getRightMostPointAtGivenHeight(poly, h), getRightMostPointAtGivenHeight(poly, h + plateY)) -
      Math.min(getLeftMostPointAtGivenHeight(poly, h), getLeftMostPointAtGivenHeight(poly, h + plateY))
    const mostLeftPoint = Math.min(getLeftMostPointAtGivenHeight(poly, h), getLeftMostPointAtGivenHeight(poly, h + plateY))
    const fullPlateNum = Math.floor((w - (leftIndent - mostLeftPoint)) / plateX);


    if (leftIndent - mostLeftPoint != 0) {
      createPlane((leftIndent - mostLeftPoint + 50 * plateX) % plateX, plateY,
        new fabric.Point(
          mostLeftPoint,
          h))
      // calcTrash(trashRight, trashLeft, plateX - ((leftIndent - mostLeftPoint + 50 * plateX) % plateX))
      trashRight.value.push(plateX - ((leftIndent - mostLeftPoint + 50 * plateX) % plateX))
    }

    const prevInsertedPlanes = Math.floor((leftIndent - mostLeftPoint) / plateX)

    for (let i = 0; i < fullPlateNum + prevInsertedPlanes; i++) {
      createPlane(plateX, plateY,
        new fabric.Point(
          (i - prevInsertedPlanes) * plateX + leftIndent,
          h))
    }
    createPlane((w - (leftIndent - mostLeftPoint)) % plateX, plateY,
      new fabric.Point(
        fullPlateNum * plateX + leftIndent,
        h))
    // calcTrash(trashLeft, trashRight, plateX - ((w - (leftIndent - mostLeftPoint)) % plateX))
    trashLeft.value.push(plateX - ((w - (leftIndent - mostLeftPoint)) % plateX))
  }

}


</script>


<template>
  <header>
    <canvas ref="can" id="myCanvas" width="1600" height="1600" class="max-w-[800px] max-h-[800px]"></canvas>
  </header>

  <main class="m-4">
    <span class="font-bold">Dielengröße:</span><input class="ml-2 w-32 p-1 rounded-md text-black px-2" type="text"
      v-model="mainStore.plateSize[0]" /><span class="ml-2 font-bold">x</span>
    <input class="ml-2 w-32 p-1 rounded-md text-black px-2" type="text" v-model="mainStore.plateSize[1]" />
    <button class="ml-2 p-1 rounded-md bg-blue-500 hover:bg-blue-700 text-white px-2" @click="calcPlanes">Berechne
      Dielen</button>
    <span class="ml-4 font-bold">H<sub>0</sub>:</span><input class="ml-2 w-32 p-1 rounded-md text-black px-2"
      type="number" v-model="mainStore.h0" />
    <hr class="my-2" />
    <div v-for="index in mainStore.polygon.length" :key="index">
      <span class="font-bold">Ecke {{ index.toString().padStart(2, "0") }}:&nbsp;&nbsp;</span>
      <input class="ml-2 my-1 w-32 p-1 rounded-md text-black px-2 bg-gray-400" type="text"
        v-model="mainStore.polygon[index - 1][0]" />
      <input class="ml-2 my-1 w-32 p-1 rounded-md text-black px-2 bg-gray-400" type="text"
        v-model="mainStore.polygon[index - 1][1]" />
    </div>
    <span class="font-bold">Ecke Neu:</span><input class="ml-2 w-32 p-1 rounded-md text-black px-2" type="text"
      v-model="newVertex[0]" />
    <input class="ml-2 w-32 p-1 rounded-md text-black px-2" type="text" v-model="newVertex[1]" />
    <button type="submit" tabindex="1" class="ml-2 p-1 rounded-md bg-blue-500 hover:bg-blue-700 text-white px-2 "
      @click="addVertex">Add
      Vertex</button>
    <button class="ml-2 p-1 rounded-md bg-red-500 hover:bg-red-700 text-white px-2" @click="popVertex">Delete last
      Vertex</button>
    <button class="ml-2 p-1 rounded-md bg-green-500 hover:bg-green-700 text-white px-2 " @click="updateCanvas">Update
      Vertices</button>
    <hr class="my-2" />
    <input v-for="i in mainStore.startingLengths.length + 1" :key="i" :placeholder="i.toString()"
      class="ml-2 w-32 p-1 rounded-md text-black px-2" type="number" v-model="mainStore.startingLengths[i - 1]" />
    <button class="ml-2 p-1 rounded-md bg-red-500 hover:bg-red-700 text-white px-2"
      @click="mainStore.startingLengths.pop()">Remove
      last</button>
    <hr class="my-2" />
    <div class="w-full p-2 flex gap-2">
      <button class=" p-1 rounded-md bg-green-500 hover:bg-green-700 text-white px-2 w-1/2"
        @click="download">Download</button>
      <button class="p-1 rounded-md bg-green-500 hover:bg-green-700 text-white px-2 w-1/2"
        @click="createAllMeasurements">Add Measurement</button>
    </div>
    <hr class="my-2" />
    <table class="table-fixed">
      <thead>
        <tr>
          <th class="w-36 text-left">Rest links</th>
          <th>Rest rechts</th>
          <th>Rest insg.</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="i in Math.max(trashLeft.length, trashRight.length, trashFull.length)" :key="i">
          <td>{{ trashLeft[i - 1] }}cm</td>
          <td>{{ trashRight[i - 1] }}cm</td>
          <td>{{ trashFull[i - 1] }}cm</td>
        </tr>
      </tbody>
    </table>

  </main>
</template>

<style scoped>
canvas {
  border: 1px solid black;
  background-color: white;
}
</style>

<script setup lang="ts">
import * as fabric from 'fabric';

import { onMounted, } from 'vue';
import { useMainStore } from './stores/main';
import FileUploadButton from './components/FileUploadButton.vue';
import { z } from 'zod';
import { Point } from './utils/Point';
import ParsedInput from './components/ParsedInput.vue';
import DeleteButton from '@/components/DeleteButton.vue';



function downloadPoints() {
  const a = document.createElement('a')
  const dt = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mainStore.points.slice(0, mainStore.points.length - 1)))
  a.href = dt
  a.download = 'verlegeplaner-points.json'
  a.click()
}

function downloadImage() {
  const a = document.createElement('a')
  mainStore.canvas!.backgroundColor = 'white'
  let dt = mainStore.canvas!.toDataURL({
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
  a.download = 'verlegeplan.jpeg'
  a.click()
}

function updateValues(newPoints: unknown) {
  const parsedPoints = z.array(z.object({
    x: z.coerce.number(),
    y: z.coerce.number()
  })).parse(newPoints)


  if (parsedPoints.length == 0) return;
  mainStore.points = parsedPoints.map(p => new Point(p.x, p.y))
  mainStore.setPoint(parsedPoints.length - 1, "x", parsedPoints[parsedPoints.length - 1].x)
}

const mainStore = useMainStore()

onMounted(() => {
  mainStore.canvas = new fabric.StaticCanvas('myCanvas');
  mainStore.updateCanvas()
});
</script>

<template>
  <header>
    <canvas id="myCanvas" width="2000" height="2000" class="bg-white max-w-[40svw] max-h-[40svw]"></canvas>
    <button class="w-full bg-primary text-white rounded-md p-2 mt-4 mb-1 " @click="downloadImage">Bild
      herunterladen</button>
  </header>

  <main class="flex flex-row gap-8">
    <div class="flex flex-col gap-0">
      <h1 class="w-48 text-center font-extrabold text-xl">Punkte</h1>
      <div v-for="i in mainStore.points.length" :key="i" class="my-2 w-48">
        <div class="w-full flex justify-center items-center align-middle" v-if="i != mainStore.points.length">
          <div v-for="j in 8" :key="j" class="inline-block mb-2 mx-0.5 w-0.5 h-0.5 bg-primary rounded-full"></div>
          <button class="text-xs font-bold rounded-full bg-primary w-4 h-4 text-black mb-2 mx-2"
            @click="mainStore.insertPoint(i - 1)">+</button>
          <div v-for="j in 8" :key="j" class="inline-block mb-2 mx-0.5 w-0.5 h-0.5 bg-primary rounded-full"></div>
        </div>
        <div class="flex flex-row">
          <input
            class="bg-[#282828] rounded-l-md border border-r-[0.5px] ml-4 p-2 w-20 text-center focus:outline-none focus:border-green-500"
            placeholder="x" :value="mainStore.points[i - 1].x"
            @input="(v) => mainStore.setPoint(i - 1, 'x', (v.target as HTMLInputElement).value)" />
          <input
            class="bg-[#282828] rounded-r-md border border-l-[0.5px] mr-4 p-2 w-20 text-center focus:outline-none focus:border-green-500"
            placeholder="y" :value="mainStore.points[i - 1].y"
            @input="(v) => mainStore.setPoint(i - 1, 'y', (v.target as HTMLInputElement).value)" />
        </div>
      </div>
      <button class="w-40 bg-primary text-white rounded-md p-2 m-4 mb-1" @click="downloadPoints">Punkte
        herunterladen</button>
      <FileUploadButton @update="updateValues">Punkte hochladen</FileUploadButton>
      <h2 class="w-48 text-center font-bold text-lg">Fläche:<br> {{ mainStore.polygonArea / 10000
        }}&thinsp;m<sup>2</sup><br> {{
          mainStore.polygonArea }}&thinsp;cm<sup>2</sup></h2>
    </div>
    <div class="flex-grow flex flex-col">
      <h1 class="w-full text-center font-extrabold text-xl mb-8">Dielen</h1>
      <div>
        <label class="text-lg">Dielendimensionen:</label>
        <ParsedInput class="w-20 rounded-l-md border-r-[0.5px] ml-4" placeholder="Breite"
          v-model="mainStore.planeDimensions[0]"
          :zod-validator="z.preprocess((v) => (v as string).replace(/^(\d+),(\d*)$/, '$1.$2'), z.coerce.number().nullable())" />
        <ParsedInput class="w-20 rounded-r-md border-l-[0.5px]" placeholder="Höhe"
          v-model="mainStore.planeDimensions[1]"
          :zod-validator="z.preprocess((v) => (v as string).replace(/^(\d+),(\d*)$/, '$1.$2'), z.coerce.number().nullable())" />
      </div>
      <div class="my-4">
        <label class="text-lg mr-4">Einrückung X:</label>
        <ParsedInput v-for="i in mainStore.indentation.length + 1" :key="i" class="w-20 rounded-md mr-4" placeholder="x"
          v-model="mainStore.indentation[i - 1]"
          :zod-validator="z.preprocess((v) => (v as string).replace(/^(\d+),(\d*)$/, '$1.$2'), z.coerce.number().nullable().optional())" />
      </div>
      <div>
        <label class="text-lg">Verschiebung Y:</label>
        <ParsedInput class="w-20 ml-4 rounded-md border-l-[0.5px]" placeholder="y" v-model="mainStore.indentationY"
          :zod-validator="z.preprocess((v) => (v as string).replace(/^(\d+),(\d*)$/, '$1.$2'), z.coerce.number().nullable())" />
      </div>
      <button class="w-full bg-primary text-white rounded-md p-2 my-4 mb-1" @click="mainStore.addPlane()">Dielen
        berechnen</button>
      <DeleteButton validation-string="Loeschen" @click="() => mainStore.$reset()">Alles zurücksetzen</DeleteButton>
    </div>
  </main>
</template>

import { defineStore } from 'pinia'
import * as fabric from 'fabric'
import { computed, ref } from 'vue'
import { area } from '@/utils/Polygon'
import { createPlane } from '@/utils/Plane'
import { z } from 'zod'
import { Point, type XY } from '@/utils/Point'

export const useMainStore = defineStore(
  'mainStore',
  () => {
    const points = ref<XY[]>([new Point(undefined, undefined)])
    const canvas = ref<fabric.StaticCanvas | null>(null)
    const pg = ref<fabric.Polygon | null>(null)
    const elementScale = ref<number>(1)
    const planeDimensions = ref<[number | null, number | null]>([null, null])
    const indentation = ref<number[]>([0])
    const indentationY = ref<number>(0)

    function insertPoint(index: number) {
      points.value.splice(index, 0, new Point(0, 0))
      updateCanvas()
    }
    function setPoint(index: number, position: 'x' | 'y', value: string | number) {
      const parsedValue = z
        .preprocess((v) => (v == '' ? undefined : v), z.coerce.number().safe().optional())
        .parse(value)
      if (position == 'x') points.value[index].x = parsedValue
      if (position == 'y') points.value[index].y = parsedValue

      // Remove the point if it is empty
      if (
        points.value[index].x == undefined &&
        points.value[index].y == undefined &&
        index != points.value.length - 1
      ) {
        points.value.splice(index, 1)
      } else if (
        index == points.value.length - 1 &&
        points.value[index].x != undefined &&
        points.value[index].y != undefined
      ) {
        points.value.push(new Point(undefined, undefined))
      }
      updateCanvas()
    }

    function updateCanvas() {
      if (canvas.value == null) return
      canvas.value.clear()
      pg.value = new fabric.Polygon(
        points.value.slice(0, points.value.length - 1).map((p) => new Point(p).toFabricPoint()),
        {
          fill: '#ced8e4',
          stroke: 'black',
          strokeWidth: 5,
          strokeUniform: true,
        },
      )

      if (pg.value.width! > pg.value.height!) {
        pg.value.scaleToWidth(canvas.value.width * 0.9)
      } else {
        pg.value.scaleToHeight(canvas.value.height * 0.9)
      }
      elementScale.value = pg.value.scaleX
      pg.value.flipY = true
      canvas.value.add(pg.value as fabric.Polygon)
      canvas.value.centerObject(pg.value as fabric.Polygon)
    }

    function addPlane() {
      if (
        pg.value == null ||
        canvas.value == null ||
        planeDimensions.value == null ||
        planeDimensions.value[0] == null ||
        planeDimensions.value[1] == null
      )
        return
      canvas.value?.clear()
      updateCanvas()
      for (let i = 0; i < pg.value.height / planeDimensions.value[1]; i++) {
        for (let j = 0; j < pg.value.width / planeDimensions.value[0] + 2; j++) {
          const plane = createPlane(
            pg.value as fabric.Polygon,
            {
              x:
                planeDimensions.value[0] * (j - 1) +
                indentation.value[i % indentation.value.length],
              y: planeDimensions.value[1] * i + indentationY.value,
            },
            planeDimensions.value[0],
            planeDimensions.value[1],
            elementScale.value,
          )
          plane.forEach((p) => {
            canvas.value?.add(p)
            canvas.value?.sendObjectToBack(p)
            canvas.value?.sendObjectToBack(pg.value as fabric.Polygon)
          })
        }
      }
    }

    const polygonArea = computed(() => {
      console.log(points.value)
      return area(
        points.value.slice(0, points.value.length - 1).map((p) => new Point(p).toFabricPoint()),
      )
    })

    function $reset() {
      points.value = [new Point(undefined, undefined)]
      pg.value = null
      elementScale.value = 1
      planeDimensions.value = [null, null]
      indentation.value = [0]
      indentationY.value = 0
      updateCanvas()
    }

    return {
      points,
      setPoint,
      canvas,
      updateCanvas,
      elementScale,
      insertPoint,
      polygonArea,
      planeDimensions,
      addPlane,
      indentation,
      indentationY,
      $reset,
    }
  },
  {
    persist: true,
  },
)

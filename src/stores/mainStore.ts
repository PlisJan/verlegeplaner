import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => {
    return { polygon: [], plateSize: [1, 1], startingLengths: [], h0: 0 } as {
      polygon: [number, number][]
      plateSize: [number, number]
      startingLengths: number[]
      h0: number
    }
  },

  actions: {
    popVertex() {
      this.polygon.pop()
    },
    addVertex(vertex: [number, number]) {
      this.polygon.push(vertex)
    },
  },
  persist: true,
})

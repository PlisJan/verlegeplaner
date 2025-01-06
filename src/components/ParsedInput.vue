<script setup lang="ts" generic="T extends z.ZodType<any, any, any>">
import { ref } from 'vue'
import { z } from 'zod'

const props = defineProps<{
  placeholder: string
  class: string
  zodValidator: T
  type?: string
}>()

const model = defineModel<z.infer<T>>()


const emit = defineEmits<{
  input: [value: z.infer<T>]
}>()

const errorMsg = ref<string>('')

function changeValue(event: Event) {
  if (event == null || event.target === null) return
  const value = (event.target as HTMLInputElement).value
  const saveParsed = props.zodValidator.safeParse(value)
  console.log(saveParsed)
  if (saveParsed.success) {
    errorMsg.value = ''
    model.value = saveParsed.data as z.infer<T>
    emit('input', saveParsed.data as z.infer<T>)
  } else {
    errorMsg.value = saveParsed.error.errors[0].message
    model.value = value
  }
}
</script>

<template>
  <div class="inline-block">
    <span class="text-red-600" v-if="errorMsg">{{ errorMsg }}<br /></span>
    <input :type="type || 'text'" :class="'bg-[#282828] border p-2 text-center focus:outline-none focus:border-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' +
      ' ' +
      props.class
      " :placeholder="props.placeholder" :value="model" @input="changeValue" />
  </div>
</template>

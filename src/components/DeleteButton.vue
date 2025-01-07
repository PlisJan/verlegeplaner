<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  validationString: string
}>()

const btnIsClicked = ref<boolean>(false)
const inpText = ref<string>('')
const emit = defineEmits(["click"])

const placeholderText = computed(() => {
  return `Bitte geben sie "${props.validationString}" ein (ohne ")`
})

function cancelClick() {
  btnIsClicked.value = false
  inpText.value = ''
}

function validatedClick() {
  if (inpText.value == props.validationString) {
    emit('click')
    btnIsClicked.value = false
    inpText.value = ''
  }
}

</script>

<template>
  <button v-if="!btnIsClicked"
    class="w-full max-w-full bg-red-500 hover:bg-red-600 text-white rounded-md p-2 my-4 text-center cursor-pointer"
    @click="() => btnIsClicked = true">
    <slot />
  </button>
  <div v-else class="w-full max-w-full grid gap-4 grid-cols-4 justify-between mt-4">
    <input type="text" :placeholder="placeholderText" v-model="inpText"
      class="rounded-md col-span-2 bg-[#282828] border p-2 text-center focus:outline-none focus:border-red-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
    <button class="bg-primary  text-white rounded-md p-2 text-center cursor-pointer" @click="cancelClick">
      Abbrechen
    </button>
    <button
      class="bg-red-500 hover:bg-red-600 text-white rounded-md p-2 text-center cursor-pointer disabled:opacity-50 disabled:hover:bg-red-500"
      :disabled="validationString != inpText" @click="validatedClick">
      Alles zurücksetzen
    </button>
  </div>
</template>

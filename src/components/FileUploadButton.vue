<script setup lang="ts">
import { ref, watch } from 'vue';


const emit = defineEmits<{ update: [value: any] }>()

const content = ref<string | ArrayBuffer | null | undefined>('')

function readFile(event: Event) {
  if (event == null || event.target === null) return;
  const file = (event.target as HTMLInputElement).files?.item(0)
  if (file == null || file == undefined) return;
  const reader = new FileReader();

  if (file.name.endsWith(".json")) {
    reader.onload = (res) => {
      content.value = res.target?.result;
    };
    reader.onerror = (err) => console.log(err);
    reader.readAsText(file);
  }
}

watch(content, (newContent) => {
  if (newContent == null || newContent == undefined) return;
  const newPoints = JSON.parse(newContent as string)
  emit("update", newPoints)
  content.value = null
})

const uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
</script>

<template>
  <label :for="uuid" class="w-40 bg-primary text-white rounded-md p-2 m-4 mt-1 text-center cursor-pointer">
    <input type="file" :id="uuid" accept=".json" @change="readFile"
      class="w-40 bg-primary text-white rounded-md p-2 m-4 mt-1 disabled:opacity-50 file:hidden text-center hidden" />
    <slot />
  </label>
</template>

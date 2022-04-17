<script setup lang="ts">
const props = defineProps({
  localStorageKey: {
    type: String,
    required: false,
  },
});

function onSave() {
  if (props.localStorageKey) {
    const storedPixel: string | null = window.localStorage.getItem("pixel");
    if (storedPixel === null) {
      console.log("no pixel found in local storage, cannot save");
      return;
    }
    const blob = new Blob([storedPixel], { type: "text/plain" });
    const e = new MouseEvent("click", { bubbles: true, cancelable: false });
    const a = document.createElement("a");
    a.download = "pixel.json";
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
    a.dispatchEvent(e);
  }
}
</script>

<template>
  <button @click.prevent="onSave">SAVE</button>
</template>

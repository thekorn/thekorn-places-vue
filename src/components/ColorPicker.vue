<script setup lang="ts">
import { defineEmits, ref, onMounted } from "vue";

const emit = defineEmits(["changeColor"]);

const activeColor = ref<string>("black");

const props = defineProps({
  defaultColor: {
    type: String,
    required: false,
    default: "black",
  },
});

const COLORS: Record<string, [string, string]> = {
  black: ["bg-black", "rgb(0, 0, 0)"],
  white: ["bg-white", "rgb(255, 255, 255)"],
  green: ["bg-green-900", "rgb(20, 83, 45)"],
  red: ["bg-rose-600", "rgb(225, 29, 72)"],
  blue: ["bg-indigo-700", "rgb(67, 56, 202)"],
};

function changeColor(color: string) {
  activeColor.value = color;
  emit("changeColor", { color: COLORS[color][1] });
}

onMounted(() => {
  changeColor(props.defaultColor);
});
</script>

<template>
  <ul
    class="bg-white mt-10 rounded-lg flex flex-col md:flex-row md:space-y-0 space-y-4 space-x-0 md:space-x-4 justify-center p-2"
  >
    <li v-for="color in Object.keys(COLORS)" :key="color">
      <button
        :class="[
          { 'outline-0': color !== activeColor },
          { 'outline-3': color === activeColor },
          COLORS[color][0],
          'transition duration-150 ease-in-out hover:scale-x-110',
          'w-5 h-5 md:w-20 md:h-20 rounded-full border-2 flex justify-center items-center outline outline-offset-2 outline-cyan-500',
        ]"
        @click="changeColor(color)"
      />
    </li>
  </ul>
</template>

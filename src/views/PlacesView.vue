<script setup lang="ts">
import { useMove } from "@vueuse/gesture";
import type { Handler } from "@vueuse/gesture";
import { ref, onMounted } from "vue";

import ColorPicker from "../components/ColorPicker.vue";

interface Cursor {
  x: number;
  y: number;
}

interface Pixel {
  color: string;
}

const PLACES_CANVAS_DIM = 500;
const PLACES_TILE_DIM = 50;

const demo = ref<HTMLCanvasElement>();
const currentCursor = ref<Cursor | null>(null);
const isCursorOutside = ref<boolean | null>(null);

const pixel = ref<Pixel[] | null>(null);
const activeColor = ref<string>("red");

onMounted(() => {
  const numTilesHorz = Math.floor(PLACES_CANVAS_DIM / PLACES_TILE_DIM);

  pixel.value = new Array(numTilesHorz * numTilesHorz);
  demo.value?.addEventListener(
    "mouseleave",
    function () {
      isCursorOutside.value = true;

      currentCursor.value = null;
      if (demo.value) draw(demo.value);
    },
    false
  );
  demo.value?.addEventListener(
    "mouseenter",
    function () {
      isCursorOutside.value = false;
      if (demo.value) draw(demo.value);
    },
    false
  );
  demo.value?.addEventListener(
    "click",
    function () {
      if (currentCursor.value === null) return;
      const xItemPos = currentCursor.value.x / PLACES_TILE_DIM;
      const yItemPos = currentCursor.value.y / PLACES_TILE_DIM;

      const pixelPos =
        xItemPos + yItemPos * (PLACES_CANVAS_DIM / PLACES_TILE_DIM);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      pixel.value![pixelPos] = { color: activeColor.value };
      if (demo.value) draw(demo.value);
    },
    false
  );
});

function draw(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  pixel.value?.forEach((pixel: Pixel | undefined, index: number) => {
    if (pixel) {
      const rectTopX =
        (index % (PLACES_CANVAS_DIM / PLACES_TILE_DIM)) * PLACES_TILE_DIM;
      const rectTopY =
        Math.floor(index / (PLACES_CANVAS_DIM / PLACES_TILE_DIM)) *
        PLACES_TILE_DIM;
      ctx.fillStyle = pixel.color;
      ctx.fillRect(rectTopX, rectTopY, PLACES_TILE_DIM, PLACES_TILE_DIM);
    }
  });

  if (!isCursorOutside.value && currentCursor.value !== null) {
    ctx.strokeRect(
      currentCursor.value.x,
      currentCursor.value.y,
      PLACES_TILE_DIM,
      PLACES_TILE_DIM
    );
  }
}

const moveHandler: Handler<"move"> = (ev) => {
  //console.log(ev);

  const event = ev.event;
  const canvas = demo.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const rectTopX = Math.floor(mouseX / PLACES_TILE_DIM) * PLACES_TILE_DIM;
  const rectTopY = Math.floor(mouseY / PLACES_TILE_DIM) * PLACES_TILE_DIM;

  if (
    currentCursor.value === null ||
    !(currentCursor.value.x === rectTopX && currentCursor.value.y === rectTopY)
  ) {
    currentCursor.value = { x: rectTopX, y: rectTopY };
  } else {
    return;
  }

  draw(canvas);
};

// Composable usage
useMove(moveHandler, {
  domTarget: demo,
});

function changeColor({ color }: { color: string }) {
  activeColor.value = color;
}
</script>

<template>
  <main>
    <canvas
      :height="PLACES_CANVAS_DIM"
      :width="PLACES_CANVAS_DIM"
      ref="demo"
      v-move="moveHandler"
      class="bg-white"
    />
    <ColorPicker @change-color="changeColor" default-color="red" />
  </main>
</template>

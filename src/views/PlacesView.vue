<script setup lang="ts">
import { useMove } from "@vueuse/gesture";
import type { Handler } from "@vueuse/gesture";
import { ref, onMounted } from "vue";

import ColorPicker from "../components/ColorPicker.vue";
import SaveButton from "../components/SaveButton.vue";

interface Cursor {
  x: number;
  y: number;
}

interface Pixel {
  color: string;
}

const PLACES_CANVAS_DIM = 500;
const PLACES_TILE_DIM = 10;

const demo = ref<HTMLCanvasElement>();
const currentCursor = ref<Cursor | null>(null);
const isCursorOutside = ref<boolean | null>(null);
const cooldown = ref<number | null>(null);

const pixel = ref<Pixel[] | null>(null);
const activeColor = ref<string>("red");

const props = defineProps({
  localStorageKey: {
    type: String,
    required: false,
  },
  cooldown: {
    type: Number,
    required: false,
  },
});

function clearCooldown() {
  cooldown.value = null;
}

onMounted(() => {
  const numTilesHorz = Math.floor(PLACES_CANVAS_DIM / PLACES_TILE_DIM);

  pixel.value = new Array(numTilesHorz * numTilesHorz);

  if (props.localStorageKey) {
    try {
      const storedPixel: Pixel[] | null = JSON.parse(
        window.localStorage.getItem(props.localStorageKey) || "null"
      );
      if (storedPixel !== null) {
        if (storedPixel.length === pixel.value.length) {
          pixel.value = storedPixel;
          if (demo.value) draw(demo.value);
        } else {
          console.error(
            "failed loading pixel from localStorage - wrong dimensions"
          );
        }
      }
    } catch (error) {
      console.warn("failed loading pixel from local storage, error was", error);
      console.warn("dropping pixel from loca storage", error);
      window.localStorage.removeItem(props.localStorageKey);
    }
  }

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
      if (cooldown.value !== null) {
        console.warn("Take it easy, it has cooldown!");
        return;
      }
      if (currentCursor.value === null) return;
      const xItemPos = currentCursor.value.x / PLACES_TILE_DIM;
      const yItemPos = currentCursor.value.y / PLACES_TILE_DIM;

      const pixelPos =
        xItemPos + yItemPos * (PLACES_CANVAS_DIM / PLACES_TILE_DIM);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      pixel.value![pixelPos] = { color: activeColor.value };
      if (props.localStorageKey) {
        window.localStorage.setItem(
          props.localStorageKey,
          JSON.stringify(pixel.value)
        );
      }
      if (demo.value) draw(demo.value);
      if (props.cooldown) {
        cooldown.value = setTimeout(clearCooldown, props.cooldown * 1000);
      }
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

  const scale = canvas.width / rect.width;
  const mouseX = (event.clientX - rect.left) * scale;
  const mouseY = (event.clientY - rect.top) * scale;

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

useMove(moveHandler, {
  domTarget: demo,
});

function changeColor({ color }: { color: string }) {
  activeColor.value = color;
}
</script>

<template>
  <main class="flex flex-col">
    <canvas
      :height="PLACES_CANVAS_DIM"
      :width="PLACES_CANVAS_DIM"
      ref="demo"
      v-move="moveHandler"
      class="bg-white"
    />
    <ColorPicker @change-color="changeColor" default-color="red" />
    <SaveButton local-storage-key="pixel" />
  </main>
</template>

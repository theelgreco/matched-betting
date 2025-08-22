<script setup lang="ts">
import {computed} from "vue"

interface Props {
  type?: string
  path: string
  size?: number
  viewbox?: string
  flip?: "horizontal" | "vertical" | "both" | "none"
  rotate?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: "mdi",
  size: 24,
  rotate: 0,
  flip: "none"
})

const types = {
  mdi: {
    size: 24,
    viewbox: "0 0 24 24",
  },
  "simple-icons": {
    size: 24,
    viewbox: "0 0 24 24",
  },
  default: {
    size: 0,
    viewbox: "0 0 0 0",
  },
}

const styles = computed(() => {
  return {
    "--sx": ["both", "horizontal"].includes(props.flip) ? "-1" : "1",
    "--sy": ["both", "vertical"].includes(props.flip) ? "-1" : "1",
    "--r": isNaN(props.rotate) ? props.rotate : props.rotate + "deg",
  }
})

const defaults = computed(() => {
  return types[props.type as keyof typeof types] || types.default
})

const sizeValue = computed(() => {
  return props.size || defaults.value.size
})

const viewboxValue = computed(() => {
  return props.viewbox || defaults.value.viewbox
})
</script>

<template>
  <svg
      :width="sizeValue"
      :height="sizeValue"
      :viewBox="viewboxValue"
      :style="styles"
  >
    <path :d="path"/>
  </svg>
</template>

<style scoped>
svg {
  transform: rotate(var(--r, 0deg)) scale(var(--sx, 1), var(--sy, 1));
}

path {
  fill: currentColor;
}
</style>

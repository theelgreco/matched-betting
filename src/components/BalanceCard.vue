<script setup lang="ts">
import {ref, onMounted, watch} from "vue";

interface Props {
  label: string;
  value: number;
  expanded: boolean
}

const props = defineProps<Props>();
const counter = ref<HTMLElement>();
const counterStroke = ref<HTMLElement>();
const currentProfit = ref(0); // Tracks the current animated value

// Function to animate the counter smoothly
const animateCounter = (targetValue: number) => {
  if (!counter.value && !counterStroke.value) return;

  const startValue = currentProfit.value;
  const duration = 500;
  const startTime = performance.now();

  const update = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1); // 0 to 1
    const easedProgress = easeInOutQuad(progress); // Apply easing
    const newValue = Math.round(
        startValue + (targetValue - startValue) * easedProgress
    );

    // Update the CSS custom property
    counter.value?.style.setProperty('--profit', `${newValue}`);
    counterStroke.value?.style.setProperty('--profit', `${newValue}`);
    currentProfit.value = newValue;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
};

// Easing function for smooth animation (quadratic ease-in-out)
const easeInOutQuad = (t: number) => {
  // return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  return t
};

// Watch for changes to props.value
watch(
    () => props.value,
    (newValue) => {
      animateCounter(newValue);
    }
);

// Set initial value on mount
onMounted(() => {
  animateCounter(props.value);
});
</script>

<template>
  <div :class="{
          'balance-card outline outline-emerald-800/20 min-h-[150px] p-6 flex flex-col rounded bg-gradient-to-tr from-emerald-950/20 relative flex-grow min-w-[calc(33.333%-1.5rem)] max-w-[calc(33.333%-1.5rem)]': expanded,
          'flex gap-2': !expanded,
        }">
    <small class="share-tech-regular" :style="{lineHeight: !expanded ? 2 : 'inherit'}">{{ label }}</small>
    <small v-if="expanded" data-v-52e7ab4d="" class="share-tech-regular label-ghost">{{ label }}</small>
    <p ref="counter" class="text-emerald-600 font-black counter" :class="{'text-6xl my-auto': expanded}"></p>
    <p ref="counterStroke"
       :class="{'hidden': !expanded}"
       class="text-transparent text-stroke text-6xl my-auto font-black counter absolute top-[40%]"></p>
  </div>
</template>

<style scoped>
@property --profit {
  syntax: "<integer>";
  initial-value: 0;
  inherits: false;
}

.balance-card {
  background-color: rgba(0, 0, 0, 1);
  opacity: 1;
  /*background-image: linear-gradient(to bottom right, #101013 60%, rgb(0 44 34 / 20%)), repeating-radial-gradient(circle at 0 0, transparent 0, rgba(0, 0, 0, 1) 6px), repeating-linear-gradient(#15382055, #153820);*/
  background-image: radial-gradient(580px 420px at 15% 62%, black, transparent), repeating-radial-gradient(circle at 0 0, transparent 0, rgba(0, 0, 0, 1) 6px), repeating-linear-gradient(#00996655, #153820);
}

.counter {
  counter-set: profit var(--profit);
}

.counter::after {
  content: "£" counter(profit);
}

.label-ghost {
  position: absolute;
  opacity: 30%;
  color: transparent;
  -webkit-text-stroke: 0.5px white;
  font-size: 25px;
  text-wrap: nowrap;
}

.text-stroke {
  -webkit-text-stroke: 1px var(--color-emerald-600);
  opacity: 50%;
}
</style>
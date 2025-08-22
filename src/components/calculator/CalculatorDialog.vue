<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {Dialog, DialogContent} from "@/components/ui/dialog";

interface Props {
  open: boolean
}

interface Emits {
  (event: "update:open", value: boolean): void;
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const _open = computed({
  get() {
    return props.open
  },
  set() {
    emit('update:open', false)
  }
})

const before = ref()

watch(before, (value: HTMLElement, oldValue) => {
  if (value) {
    const script1 = document.createElement("script")
    script1.src = "https://members.oddsmonkey.com/Scripts/site/iframeResizer.min.js"

    const script2 = document.createElement("script")
    script2.src = "data:text/javascript,iFrameResize%28%7Blog%3Atrue%7D%29%3B"
    script2.defer = true

    const iframe = document.createElement("iframe")
    iframe.src = "https://members.oddsmonkey.com/calculatorsom/omcalc_standard.html"
    iframe.scrolling = "no"
    iframe.id = "iFrameResizer0"
    iframe.style.overflow = "auto"
    iframe.style.height = "476px"
    iframe.style.width = "100%"

    value.appendChild(iframe)
    value.appendChild(script1)
    setTimeout(() => {
      value.appendChild(script2)
    }, 100)
  }
})
</script>

<template>

  <Dialog v-model:open="_open" class="!bg-transparent">
    <DialogContent title="Calculator" subtitle=""
                   :def="false"
                   class="!w-[625px] !max-w-[625px] !bg-transparent !p-0 !border-0">
      <section data-dce-background-color="#FFFFFF"
               class="elementor-section elementor-top-section elementor-element elementor-element-0562ecc elementor-section-boxed elementor-section-height-default elementor-section-height-default lottie-bg-no"
               data-id="0562ecc" data-element_type="section"
               data-settings="{&quot;jet_parallax_layout_list&quot;:[],&quot;background_background&quot;:&quot;classic&quot;,&quot;enable_lottie_background&quot;:&quot;no&quot;}">
        <div class="elementor-container elementor-column-gap-default">
          <div
              class="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-5202055 lottie-bg-no"
              data-id="5202055" data-element_type="column"
              data-settings="{&quot;enable_lottie_background&quot;:&quot;no&quot;}">
            <div class="elementor-widget-wrap elementor-element-populated">
              <div class="elementor-element elementor-element-358370b elementor-widget elementor-widget-html"
                   data-id="358370b" data-element_type="widget" data-widget_type="html.default">
                <div class="elementor-widget-container" id="before" ref="before">
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </DialogContent>
  </Dialog>
</template>
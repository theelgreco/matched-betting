<script setup lang="ts">
import {mdiDotsVertical, mdiMinus, mdiPlus} from "@mdi/js";
import {Button} from "@/components/ui/button";
import SvgIcon from "@/components/icons/SvgIcon.vue";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import CreateOfferDialog from "@/components/bookmakers/dialogs/CreateOfferDialog.vue";
import {ref} from "vue"
import {type BookmakerWithOffersBetsAndMatches} from "@/types/queries/queries.types";

interface Props {
  bookmaker: BookmakerWithOffersBetsAndMatches
}

defineProps<Props>()

const dialogs = ref({
  createOfferDialog: false
})
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="icon">
        <SvgIcon :path="mdiDotsVertical"/>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent :align="'end'">
      <DropdownMenuItem @click="dialogs.createOfferDialog = true">
        <div class="flex items-center gap-2">
          <SvgIcon :path="mdiPlus"/>
          <p>Add offer</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem @click="">
        <div class="flex items-center gap-2">
          <SvgIcon :path="mdiMinus"/>
          <p>Delete bookmaker</p>
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
    <CreateOfferDialog v-model:open="dialogs.createOfferDialog" :bookmaker="bookmaker"/>
  </DropdownMenu>
</template>
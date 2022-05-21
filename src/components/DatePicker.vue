<script setup lang="ts">
const {
  triggerElementId,
  dateOne,
  dateTwo,
  minDate,
  endDate,
  mode = 'range',
  offsetX = 0,
  offsetY = 0,
  monthsToShow = 2,
  startOpen,
  fullscreenMobile,
  inline,
  mobileHeader,
  disabledDates = [],
  enabledDates = [],
  customizedDates = [],
  showActionButtons = true,
  showShortcutsMenuTrigger = true,
  showMonthYearSelect = true,
  yearsForSelect = true,
  trigger = false,
  closeAfterSelect = false,
} = defineProps<{
  triggerElementId: string
  dateOne: string | Date
  dateTwo: string | Date
  minDate: string | Date
  endDate: string | Date
  mode: string
  offsetY: number
  offsetX: number
  monthsToShow: number
  startOpen: boolean
  fullscreenMobile: boolean
  inline: boolean
  mobileHeader: string
  disabledDates: Array<[]>
  enabledDates: Array<[]>
  customizedDates: Array<[]>
  showActionButtons: boolean
  showShortcutsMenuTrigger: boolean
  showMonthYearSelect: boolean
  yearsForSelect: number
  trigger: boolean
  closeAfterSelect: boolean
}>()
</script>

<script setup lang="ts">
import { useDatePicker } from '~/composables/date-picker'

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
  dateOne: Date
  dateTwo: Date
  minDate: Date
  endDate: Date
  mode: string
  offsetY: number
  offsetX: number
  monthsToShow: number
  startOpen: boolean
  fullscreenMobile: boolean
  inline: boolean
  mobileHeader: string
  disabledDates: Date[]
  enabledDates: Date[]
  customizedDates: {
    dates: Date[]
    cssClass: string
  }[]
  showActionButtons: boolean
  showShortcutsMenuTrigger: boolean
  showMonthYearSelect: boolean
  yearsForSelect: number
  trigger: boolean
  closeAfterSelect: boolean
}>()

const { dateFormat } = useDatePicker(
  triggerElementId,
  dateOne,
  dateTwo,
  minDate,
  endDate,
  mode,
  offsetY,
  offsetX,
  monthsToShow,
  startOpen,
  fullscreenMobile,
  inline,
  mobileHeader,
  disabledDates,
  enabledDates,
  customizedDates,
  showActionButtons,
  showShortcutsMenuTrigger,
  showMonthYearSelect,
  yearsForSelect,
  trigger,
  closeAfterSelect,
)
</script>

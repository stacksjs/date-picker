<script setup lang="ts">
import format from 'date-fns/format'
// import subMonths from 'date-fns/sub_months'
// import addMonths from 'date-fns/add_months'
// import getDaysInMonth from 'date-fns/get_days_in_month'
// import lastDayOfMonth from 'date-fns/last_day_of_month'
// import getMonth from 'date-fns/get_month'
// import setMonth from 'date-fns/set_month'
// import getYear from 'date-fns/get_year'
// import setYear from 'date-fns/set_year'
// import isSameMonth from 'date-fns/is_same_month'
// import isSameDay from 'date-fns/is_same_day'
// import addDays from 'date-fns/add_days'
// import subDays from 'date-fns/sub_days'
// import addWeeks from 'date-fns/add_weeks'
// import subWeeks from 'date-fns/sub_weeks'
// import startOfMonth from 'date-fns/start_of_month'
// import startOfWeek from 'date-fns/start_of_week'
// import endOfWeek from 'date-fns/end_of_week'
// import isBefore from 'date-fns/is_before'
// import isAfter from 'date-fns/is_after'
// import isValid from 'date-fns/is_valid'
// import ResizeSelect from '../directives/ResizeSelect'
// import { copyObject, debounce, findAncestor, randomString } from './../helpers'

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

const wrapperId = $ref(`datepicker-wrapper-${randomString(5)}`)
const dateFormat = $ref('YYYY-MM-DD')
const dateLabelFormat = $ref('dddd, MMMM D, YYYY')
const showDatePicker = $ref(false)
const showKeyboardShortcutsMenu = $ref(false)
const showMonths = $ref(2)
const colors = $ref({
  selected: '#00a699',
  inRange: '#66e2da',
  selectedText: '#fff',
  text: '#565a5c',
  inRangeBorder: '#33dacd',
  disabled: '#fff',
  hoveredInRange: '#67f6ee',
})
const sundayFirst = $ref(false)
const ariaLabels = $ref({
  chooseDate: (date: string) => date,
  chooseStartDate: (date: string) => `Choose ${date} as your start date.`,
  chooseEndDate: (date: string) => `Choose ${date} as your end date.`,
  selectedDate: (date: string) => `Selected. ${date}`,
  unavailableDate: (date: string) => `Not available. ${date}`,
  previousMonth: 'Move backward to switch to the previous month.',
  nextMonth: 'Move forward to switch to the next month.',
  closeDatepicker: 'Close calendar',
  openKeyboardShortcutsMenu: 'Open keyboard shortcuts menu.',
  closeKeyboardShortcutsMenu: 'Close keyboard shortcuts menu',
})

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const daysShort = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
const texts = {
  apply: 'Apply',
  cancel: 'Cancel',
  keyboardShortcuts: 'Keyboard Shortcuts',
}

const keyboardShortcuts = [
  { symbol: '↵', label: 'Select the date in focus', symbolDescription: 'Enter key' },
  {
    symbol: '←/→',
    label: 'Move backward (left) and forward (right) by one day.',
    symbolDescription: 'Left or right arrow keys',
  },
  {
    symbol: '↑/↓',
    label: 'Move backward (up) and forward (down) by one week.',
    symbolDescription: 'Up or down arrow keys',
  },
  {
    symbol: 'PgUp/PgDn',
    label: 'Switch months.',
    symbolDescription: 'PageUp and PageDown keys',
  },
  {
    symbol: 'Home/End',
    label: 'Go to the first or last day of a week.',
    symbolDescription: 'Home or End keys',
  },
  { symbol: 'Esc', label: 'Close this panel', symbolDescription: 'Escape key' },
  { symbol: '?', label: 'Open this panel', symbolDescription: 'Question mark' },
]

const keys = {
  arrowDown: 40,
  arrowUp: 38,
  arrowRight: 39,
  arrowLeft: 37,
  enter: 13,
  pgUp: 33,
  pgDn: 34,
  end: 35,
  home: 36,
  questionMark: 191,
  esc: 27,
}

const startingDate = ''
const months = $ref([])
const years = $ref([])
const width = $ref(300)
const selectedDate1 = $ref('')
const selectedDate2 = $ref('')
const isSelectingDate1 = $ref(true)
const hoverDate = $ref('')
const alignRight = $ref(false)
const triggerPosition = $ref({
  height: 0,
  left: 0,
  right: 0,
})
const triggerWrapperPosition = $ref({
  left: 0,
  right: 0,
})
const viewportWidth = $ref(undefined)
const isMobile = $ref(undefined)
const isTablet = $ref(undefined)
const triggerElement = $ref(undefined)

const showFullscreen = $computed(() => isMobile && fullscreenMobile)
const wrapperClasses = $computed(() => {
  return {
    'asd__wrapper--datepicker-open': showDatePicker,
    'asd__wrapper--full-screen': showFullscreen,
    'asd__wrapper--inline': inline,
  }
})
const wrapperStyles = $computed(() => {
  return {
    position: inline ? 'static' : 'absolute',
    top: inline ? '0' : `${triggerPosition.height + offsetY}px`,
    left: !alignRight
      ? `${triggerPosition.left - triggerWrapperPosition.left + offsetX}px`
      : '',
    right: alignRight
      ? `${triggerWrapperPosition.right - triggerPosition.right + offsetX}px`
      : '',
    width: `${width * showMonths}px`,
    zIndex: inline ? '0' : '100',
  }
})
const innerStyles = $computed(() => {
  return {
    'margin-left': showFullscreen ? `-${viewportWidth}` : `-${width}px`,
  }
})
const keyboardShortcutsMenuStyles = $computed(() => {
  return {
    left: showFullscreen ? viewportWidth : `${width}px`,
  }
})
const monthWidthStyles = $computed(() => {
  return {
    width: showFullscreen ? viewportWidth : `${width}px`,
  }
})
const mobileHeaderFallback = $computed(() => mode === 'range' ? 'Select dates' : 'Select date')

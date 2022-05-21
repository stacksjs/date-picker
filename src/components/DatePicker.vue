<script setup lang="ts">
import { addDays, addMonths, addWeeks, endOfWeek, format, getDaysInMonth, getMonth, getYear, isAfter, isBefore, isSameDay, isSameMonth, isValid, lastDayOfMonth, setMonth, setYear, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns'

// import ResizeSelect from '../directives/ResizeSelect'
// import { copyObject, findAncestor } from './../helpers'

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

const emit = defineEmits(['dateOneSelected', 'dateTwoSelected', 'apply', 'closed'])

const wrapperId = $ref(`datepicker-wrapper-${randomString(5)}`)
const dateFormat = $ref('YYYY-MM-DD')
const dateLabelFormat = $ref('dddd, MMMM D, YYYY')
const showDatePicker = $ref(false)
let showKeyboardShortcutsMenu = $ref(false)
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

let startingDate = $ref('')
const months = $ref([])
const years = $ref([])
const width = $ref(300)
const selectedDate1 = $ref('')
let selectedDate2 = $ref('')
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
let viewportWidth = $ref('')
let isMobile = $ref(false)
let isTablet = $ref(false)
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
const datesSelected = $computed(() => {
  return !!(
    (selectedDate1 && selectedDate1 !== '')
    || (selectedDate2 && selectedDate2 !== '')
  )
})
const allDatesSelected = $computed(() => {
  return !!(
    selectedDate1
        && selectedDate1 !== ''
        && selectedDate2
        && selectedDate2 !== ''
  )
})
const hasMinDate = $computed(() => !!(minDate && minDate !== ''))
const isRangeMode = $computed(() => mode === 'range')
const isSingleMode = $computed(() => mode === 'single')
const datePickerWidth = $computed(() => width * showMonths)
const datePropsCompound = $computed(() => dateOne + dateTwo) // used to watch for changes in props, and update GUI accordingly
const isDateTwoBeforeDateOne = $computed(() => {
  if (!dateTwo)
    return false

  return isBefore(dateTwo, dateOne)
})
const visibleMonths = $computed(() => {
  const firstMonthArray = months.filter((m, index) => index > 0)
  const numberOfMonthsArray = []
  for (let i = 0; i < showMonths; i++)
    numberOfMonthsArray.push(i)

  return numberOfMonthsArray.map((_, index) => firstMonthArray[index].firstDateOfMonth)
})

watch(selectedDate1, (newValue, oldValue) => {
  const newDate = !newValue || newValue === '' ? '' : format(newValue, dateFormat)
  emit('dateOneSelected', newDate)
})

watch(selectedDate2, (newValue, oldValue) => {
  const newDate = !newValue || newValue === '' ? '' : format(newValue, dateFormat)
  emit('dateTwoSelected', newDate)
})

watch(mode, () => {
  setStartDates()
})

watch(minDate, () => {
  setStartDates()
  generateMonths()
  generateYears()
})

watch(endDate, () => {
  generateYears()
})

watch(endDate, () => {
  generateYears()
})

watch(datePropsCompound, (newValue) => {
  if (dateOne !== selectedDate1) {
    startingDate = dateOne
    setStartDates()
    generateMonths()
    generateYears()
  }

  if (isDateTwoBeforeDateOne) {
    selectedDate2 = ''
    emit('dateTwoSelected', '')
  }
})

watch(trigger, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      openDatepicker()
    }, 0)
  }
})

onBeforeMount(() => {
  setupDatePicker()

  if (sundayFirst)
    setSundayToFirstDayInWeek()
})

onMounted(() => {
  viewportWidth = `${window.innerWidth}px`
  isMobile = window.innerWidth < 768
  isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024

  _handleWindowResizeEvent = useDebounceFn(() => {
    positionDatepicker()
    setStartDates()
  }, 200)

  _handleWindowClickEvent = (event: any) => {
    if (event.target.id === triggerElementId) {
      event.stopPropagation()
      event.preventDefault()
      toggleDatepicker()
    }
  }

  window.addEventListener('resize', _handleWindowResizeEvent)

  triggerElement = isTest
    ? document.createElement('input')
    : document.getElementById(triggerElementId)

  setStartDates()
  generateMonths()
  generateYears()

  if (startOpen || inline)
    openDatepicker()

  $el.addEventListener('keyup', handleKeyboardInput)
  $el.addEventListener('keydown', trapKeyboardInput)

  triggerElement.addEventListener('keyup', handleTriggerInput)
  triggerElement.addEventListener('click', _handleWindowClickEvent)
})

onUnmounted(() => {
  window.removeEventListener('resize', _handleWindowResizeEvent)
  window.removeEventListener('click', _handleWindowClickEvent)
  $el.removeEventListener('keyup', handleKeyboardInput)
  $el.removeEventListener('keydown', trapKeyboardInput)
  triggerElement.removeEventListener('keyup', handleTriggerInput)
  triggerElement.removeEventListener('click', _handleWindowClickEvent)
})

function randomString(length: number) {
  let text = ''
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}

function copyObject(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

function isSelected(date: any) {
  if (!date)
    return

  return selectedDate1 === date || selectedDate2 === date
}

function getDayStyles(date: any) {
  const selected = isSelected(date)
  const inRange = isInRange(date)
  const disabled = isDisabled(date)
  const hoveredInRange = isHoveredInRange(date)
  const styles = {
    width: `${(width - 30) / 7}px`,
    background: selected
      ? colors.selected
      : hoveredInRange
        ? colors.hoveredInRange
        : inRange
          ? colors.inRange
          : '',
    color: disabled
      ? colors.selectedText
      : isInRange || hoveredInRange
        ? colors.selectedText
        : colors.text,
    border: selected
      ? `1px double ${colors.selected}`
      : (inRange && allDatesSelected) || isHoveredInRange
          ? `1px double ${colors.inRangeBorder}`
          : '',
  }
  if (disabled)
    styles.background = colors.disabled

  return styles
}

function getAriaLabelForDate(date: any) {
  const dateLabel = format(date, dateLabelFormat)
  const disabled = isDisabled(date)

  if (disabled)
    return ariaLabels.unavailableDate(dateLabel)

  if (isSelected(date))
    return ariaLabels.selectedDate(dateLabel)

  if (isRangeMode) {
    if (isSelectingDate1)
      return ariaLabels.chooseStartDate(dateLabel)

    else
      return ariaLabels.chooseEndDate(dateLabel)
  }
  else {
    return ariaLabels.chooseDate(dateLabel)
  }
}

function handleClickOutside(event: any) {
  if (event.target.id === triggerElementId || !showDatePicker || inline)
    return

  closeDatepicker()
}

function shouldHandleInput(event: any, key: any) {
  return (
    event.keyCode === key && (!event.shiftKey || event.keyCode === 191) && showDatePicker
  )
}

function handleTriggerInput(event: any) {
  if (mode === 'single')
    setDateFromText(event.target.value)
}

function trapKeyboardInput(event: any) {
  // prevent keys that are used as keyboard shortcuts from propagating out of this element
  // except for the enter key, which is needed to activate buttons
  const shortcutKeyCodes = Object.keys(keys).map(key => keys[key])
  shortcutKeyCodes.splice(shortcutKeyCodes.indexOf(13), 1)
  const shouldPreventDefault = shortcutKeyCodes.includes(event.keyCode)
  if (shouldPreventDefault)
    event.preventDefault()
}

function handleKeyboardInput(event: any) {
  if (shouldHandleInput(event, keys.esc)) {
    if (showKeyboardShortcutsMenu)
      closeKeyboardShortcutsMenu()

    else
      closeDatepicker()
  }
  else if (showKeyboardShortcutsMenu) {
    // if keyboard shortcutsMenu is open, then esc is the only key we want to have fire events
  }
  else if (shouldHandleInput(event, keys.arrowDown)) {
    const newDate = addWeeks(focusedDate, 1)
    const changeMonths = !isSameMonth(newDate, focusedDate)
    setFocusedDate(newDate)
    if (changeMonths)
      nextMonth()
  }
  else if (shouldHandleInput(event, keys.arrowUp)) {
    const newDate = subWeeks(focusedDate, 1)
    const changeMonths = !isSameMonth(newDate, focusedDate)
    setFocusedDate(newDate)
    if (changeMonths)
      previousMonth()
  }
  else if (shouldHandleInput(event, keys.arrowRight)) {
    const newDate = addDays(focusedDate, 1)
    const changeMonths = !isSameMonth(newDate, focusedDate)
    setFocusedDate(newDate)
    if (changeMonths)
      nextMonth()
  }
  else if (shouldHandleInput(event, keys.arrowLeft)) {
    const newDate = subDays(focusedDate, 1)
    const changeMonths = !isSameMonth(newDate, focusedDate)
    setFocusedDate(newDate)
    if (changeMonths)
      previousMonth()
  }
  else if (shouldHandleInput(event, keys.enter)) {
    // on enter key, only select the date if a date is currently in focus
    const target = event.target
    if (!showKeyboardShortcutsMenu && target && target.tagName === 'TD')
      selectDate(focusedDate)
  }
  else if (shouldHandleInput(event, keys.pgUp)) {
    setFocusedDate(subMonths(focusedDate, 1))
    previousMonth()
  }
  else if (shouldHandleInput(event, keys.pgDn)) {
    setFocusedDate(addMonths(focusedDate, 1))
    nextMonth()
  }
  else if (shouldHandleInput(event, keys.home)) {
    const newDate = startOfWeek(focusedDate, {
      weekStartsOn: sundayFirst ? 0 : 1,
    })
    const changeMonths = !isSameMonth(newDate, focusedDate)
    setFocusedDate(newDate)
    if (changeMonths)
      previousMonth()
  }
  else if (shouldHandleInput(event, keys.end)) {
    const newDate = endOfWeek(focusedDate, {
      weekStartsOn: sundayFirst ? 0 : 1,
    })
    const changeMonths = !isSameMonth(newDate, focusedDate)
    setFocusedDate(newDate)
    if (changeMonths)
      nextMonth()
  }
  else if (shouldHandleInput(event, keys.questionMark)) {
    openKeyboardShortcutsMenu()
  }
}

function setDateFromText(value: any) {
  if (!value || value.length < 10)
    return

  // make sure format is either 'YYYY-MM-DD' or 'DD.MM.YYYY'
  const isFormatYearFirst = value.match(
    /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/,
  )
  const isFormatDayFirst = value.match(
    /^(0[1-9]|1[0-9]|2[0-9]|3[0-1])[.](0[1-9]|1[0-2])[.](\d{4})$/,
  )
  if (!isFormatYearFirst && !isFormatDayFirst)
    return

  if (isFormatDayFirst) {
    // convert to YYYY-MM-DD
    value = `${value.substring(6, 10)}-${value.substring(3, 5)}-${value.substring(0, 2)}`
  }
  const valueAsDateObject = new Date(value)
  if (!isValid(valueAsDateObject))
    return

  const formattedDate = format(valueAsDateObject, dateFormat)
  if (
    isDateDisabled(formattedDate)
        || isBeforeMinDate(formattedDate)
        || isAfterEndDate(formattedDate)
  )
    return

  startingDate = subMonths(formattedDate, 1)
  generateMonths()
  generateYears()
  selectDate(formattedDate)
}

function isMonthDisabled(year, monthIndex) {
  const monthDate = new Date(year, monthIndex)
  if (hasMinDate && isBefore(monthDate, startOfMonth(minDate)))
    return true

  return isAfterEndDate(monthDate)
}

function generateMonths() {
  months = []
  let currentMonth = startingDate
  for (let i = 0; i < showMonths + 2; i++) {
    months.push(getMonth(currentMonth))
    currentMonth = addMonths(currentMonth)
  }
}

function generateYears() {
  if (!showMonthYearSelect)
    return
  years = []
  const currentYear = getYear(startingDate)
  const startYear = minDate ? getYear(minDate) : currentYear - yearsForSelect
  const endYear = endDate ? getYear(endDate) : currentYear + yearsForSelect
  for (let year = startYear; year <= endYear; year++)
    years.push(year.toString())
}

function setupDatepicker() {
  if ($options.ariaLabels)
    ariaLabels = copyObject($options.ariaLabels)

  if ($options.keyboardShortcuts)
    keyboardShortcuts = copyObject($options.keyboardShortcuts)

  if ($options.dateLabelFormat)
    dateLabelFormat = copyObject($options.dateLabelFormat)

  if ($options.sundayFirst)
    sundayFirst = copyObject($options.sundayFirst)

  if ($options.colors) {
    const colors = copyObject($options.colors)
    colors.selected = colors.selected || colors.selected
    colors.inRange = colors.inRange || colors.inRange
    colors.hoveredInRange = colors.hoveredInRange || colors.hoveredInRange
    colors.selectedText = colors.selectedText || colors.selectedText
    colors.text = colors.text || colors.text
    colors.inRangeBorder = colors.inRangeBorder || colors.inRangeBorder
    colors.disabled = colors.disabled || colors.disabled
  }
  if ($options.monthNames && $options.monthNames.length === 12)
    monthNames = copyObject($options.monthNames)

  if ($options.days && $options.days.length === 7)
    days = copyObject($options.days)

  if ($options.daysShort && $options.daysShort.length === 7)
    daysShort = copyObject($options.daysShort)

  if ($options.texts) {
    const texts = copyObject($options.texts)
    texts.apply = texts.apply || texts.apply
    texts.cancel = texts.cancel || texts.cancel
  }
}

function setStartDates() {
  let startDate = dateOne || new Date()
  if (hasMinDate && isBefore(startDate, minDate))
    startDate = minDate

  startingDate = subtractMonths(startDate)
  selectedDate1 = dateOne
  selectedDate2 = dateTwo
  focusedDate = startDate
}

function setSundayToFirstDayInWeek() {
  const lastDay = days.pop()
  days.unshift(lastDay)
  const lastDayShort = daysShort.pop()
  daysShort.unshift(lastDayShort)
}

function getMonth(date: any) {
  const firstDateOfMonth = format(date, 'YYYY-MM-01')
  const year = format(date, 'YYYY')
  const monthNumber = parseInt(format(date, 'M'))
  const monthName = monthNames[monthNumber - 1]
  return {
    year,
    firstDateOfMonth,
    monthName,
    monthNumber,
    weeks: getWeeks(firstDateOfMonth),
  }
}

function getWeeks(date: any) {
  const weekDayNotInMonth = { dayNumber: 0 }
  const daysInMonth = getDaysInMonth(date: any)
  const year = format(date, 'YYYY')
  const month = format(date, 'MM')
  let firstDayInWeek = parseInt(format(date, sundayFirst ? 'd' : 'E'))
  if (sundayFirst) {
    firstDayInWeek++
  }
  const weeks = []
  let week = []
  // add empty days to get first day in correct position
  for (let s = 1; s < firstDayInWeek; s++)
    week.push(weekDayNotInMonth)

  for (let d = 0; d < daysInMonth; d++) {
    const isLastDayInMonth = d >= daysInMonth - 1
    const dayNumber = d + 1
    const dayNumberFull = dayNumber < 10 ? `0${dayNumber}` : dayNumber
    week.push({
      dayNumber,
      dayNumberFull,
      fullDate: `${year}-${month}-${dayNumberFull}`,
    })
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
    else if (isLastDayInMonth) {
      for (let i = 0; i < 7 - week.length; i++)
        week.push(weekDayNotInMonth)

      weeks.push(week)
      week = []
    }
  }
  return weeks
}

function selectDate(date: any) {
  if (isBeforeMinDate(date: any) || isAfterEndDate(date: any) || isDateDisabled(date: any))
    return

  if (mode === 'single') {
    selectedDate1 = date
    closeDatepicker()
    return
  }
  if (isSelectingDate1 || isBefore(date, selectedDate1)) {
    selectedDate1 = date
    isSelectingDate1 = false
    if (isBefore(selectedDate2, date))
      selectedDate2 = ''
  }
  else {
    selectedDate2 = date
    isSelectingDate1 = true
    if (isAfter(selectedDate1, date)) {
      selectedDate1 = ''
    }
    else if (showActionButtons) {
      // if user has selected both dates, focus the apply button for accessibility
      $refs['apply-button'].focus()
    }
    if (allDatesSelected && closeAfterSelect)
      closeDatepicker()
  }
}

function setHoverDate(date: any) {
  hoverDate = date
}

function setFocusedDate(date: any) {
  const formattedDate = format(date, dateFormat)
  focusedDate = formattedDate
  const dateElement = $refs[`date-${formattedDate}`]
  // handle .focus() on ie11 by adding a short timeout
  if (dateElement && dateElement.length) {
    setTimeout(() => {
      dateElement[0].focus()
    }, 10)
  }
}

function resetFocusedDate(setToFirst) {
  if (focusedDate && !isDateVisible(focusedDate)) {
    const visibleMonthIdx = setToFirst ? 0 : visibleMonths.length - 1
    const targetMonth = visibleMonths[visibleMonthIdx]
    const monthIdx = getMonth(targetMonth)
    const year = getYear(targetMonth)
    const newFocusedDate = setYear(setMonth(focusedDate, monthIdx), year)
    focusedDate = format(newFocusedDate, dateFormat)
  }
}

function isToday(date: any) {
  return format(new Date(), dateFormat) === date
}

function isSameDate(date1: any, date2: any) {
  return isSameDay(date1, date2)
}

function isInRange(date: any) {
  if (!allDatesSelected || isSingleMode)
    return false

  return (
    (isAfter(date, selectedDate1) && isBefore(date, selectedDate2))
        || (isAfter(date, selectedDate1)
          && isBefore(date, hoverDate)
          && !allDatesSelected)
  )
}

function isHoveredInRange(date: any) {
  if (isSingleMode || allDatesSelected)
    return false

  return (
    (isAfter(date, selectedDate1) && isBefore(date, hoverDate))
        || (isAfter(date, hoverDate) && isBefore(date, selectedDate1))
  )
}

function isBeforeMinDate(date: any) {
  if (!minDate)
    return false

  return isBefore(date, minDate)
}

function isAfterEndDate(date: any) {
  if (!endDate)
    return false

  return isAfter(date, endDate)
}

function isDateVisible(date: any) {
  if (!date)
    return false

  const start = subDays(visibleMonths[0], 1)
  const end = addDays(lastDayOfMonth(visibleMonths[monthsToShow - 1]), 1)
  return isAfter(date, start) && isBefore(date, end)
}

function isDateDisabled(date: any) {
  if (enabledDates.length > 0)
    return !enabledDates.includes(date: any)

  else
    return disabledDates.includes(date: any)
}

function customizedDateClass(date: any) {
  let customizedClasses = ''

  if (customizedDates.length > 0) {
    for (let i = 0; i < customizedDates.length; i++) {
      if (customizedDates[i].dates.includes(date: any))
        customizedClasses += ` asd__day--${customizedDates[i].cssClass}`
    }
  }

  return customizedClasses
}

function isDisabled(date: any) {
  return isDateDisabled(date: any) || isBeforeMinDate(date: any) || isAfterEndDate(date: any)
}

function previousMonth() {
  startingDate = subtractMonths(months[0].firstDateOfMonth)
  months.unshift(getMonth(startingDate))
  months.splice(months.length - 1, 1)
  $emit('previous-month', visibleMonths)
  resetFocusedDate(false)
}

function nextMonth() {
  startingDate = addMonths(months[months.length - 1].firstDateOfMonth)
  months.push(getMonth(startingDate))
  months.splice(0, 1)
  $emit('next-month', visibleMonths)
  resetFocusedDate(true)
}

function subtractMonths(date: any) {
  return format(subMonths(date, 1), dateFormat)
}

function addMonths(date: any) {
  return format(addMonths(date, 1), dateFormat)
}

function toggleDatepicker() {
  if (showDatePicker)
    closeDatepicker()

  else
    openDatepicker()
}

function updateMonth(offset, year, event) {
  const newMonth = event.target.value
  const monthIdx = monthNames.indexOf(newMonth)
  const newDate = setYear(setMonth(startingDate, monthIdx), year)
  startingDate = subMonths(newDate, offset)
  generateMonths()
}

function updateYear(offset, monthIdx, event) {
  const newYear = event.target.value
  const newDate = setYear(setMonth(startingDate, monthIdx), newYear)
  startingDate = subMonths(newDate, offset)
  generateMonths()
}

function openDatepicker() {
  positionDatepicker()
  setStartDates()
  triggerElement.classList.add('datepicker-open')
  showDatePicker = true
  initialDate1 = dateOne
  initialDate2 = dateTwo
  $emit('opened')
  $nextTick(() => {
    if (!inline)
      setFocusedDate(focusedDate)
  })
}

function closeDatepickerCancel() {
  if (showDatePicker) {
    selectedDate1 = initialDate1
    selectedDate2 = initialDate2
    $emit('cancelled')
    closeDatepicker()
  }
}

function closeDatepicker() {
  if (inline)
    return

  showDatePicker = false
  showKeyboardShortcutsMenu = false
  triggerElement.classList.remove('datepicker-open')
  emit('closed')
}

function openKeyboardShortcutsMenu() {
  showKeyboardShortcutsMenu = true
  const shortcutMenuCloseBtn = $refs['keyboard-shortcus-menu-close']
  $nextTick(() => shortcutMenuCloseBtn.focus())
}

function closeKeyboardShortcutsMenu() {
  showKeyboardShortcutsMenu = false
  nextTick(() => setFocusedDate(focusedDate))
}

function apply() {
  emit('apply')
  closeDatepicker()
}

function positionDatepicker() {
  const triggerWrapperElement = findAncestor(triggerElement, '.datepicker-trigger')
  triggerPosition = triggerElement.getBoundingClientRect()
  if (triggerWrapperElement)
    triggerWrapperPosition = triggerWrapperElement.getBoundingClientRect()

  else
    triggerWrapperPosition = { left: 0, right: 0 }

  const viewportWidth = document.documentElement.clientWidth || window.innerWidth
  viewportWidth = `${viewportWidth}px`
  isMobile = viewportWidth < 768
  isTablet = viewportWidth >= 768 && viewportWidth <= 1024
  showMonths = isMobile
    ? 1
    : isTablet && monthsToShow > 2
      ? 2
      : monthsToShow
  $nextTick(() => {
    const datepickerWrapper = document.getElementById(wrapperId)
    if (!triggerElement || !datepickerWrapper)
      return

    const rightPosition
          = triggerElement.getBoundingClientRect().left
          + datepickerWrapper.getBoundingClientRect().width
    alignRight = rightPosition > viewportWidth
  })
}
</script>

import { addDays, addMonths, addWeeks, endOfWeek, format, getDaysInMonth, getMonth, getYear, isAfter, isBefore, isSameDay, isSameMonth, isValid, lastDayOfMonth, setMonth, setYear, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns'
import { computed, defineEmits, nextTick, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue'

import { useDebounceFn } from '@vueuse/core'

import { findAncestor } from '~/helpers'

const emit = defineEmits(['dateOneSelected', 'dateTwoSelected', 'apply', 'closed', 'opened', 'previous-month', 'next-month', 'cancelled'])

// reactive variables whose initial state may be provided through props
const triggerElementId = ref('')
const dateOne = ref<Date>() as { value: Date }
const dateTwo = ref<Date>() as { value: Date }
const initialDate1 = ref<Date>() as { value: Date }
const initialDate2 = ref<Date>() as { value: Date }
const minDate = ref<Date>() as { value: Date }
const endDate = ref<Date>() as { value: Date }
const mode = ref('range')
const offsetX = ref(0)
const offsetY = ref(0)
const monthsToShow = ref(2)
const startOpen = ref(false)
const inline = ref()
// let mobileHeader = ref('')
const enabledDates = ref<Date[]>([])
const disabledDates = ref<Date[]>([])
const customizedDates = ref<any[]>([])
const fullscreenMobile = ref()
const showActionButtons = ref(true)
// let showShortcutsMenuTrigger = ref(true)
const showMonthYearSelect = ref(false)
const yearsForSelect = ref(10)
const isTest = ref(process.env.NODE_ENV === 'test')
const trigger = ref(false)
const closeAfterSelect = ref(false)

const wrapperId = ref(`datepicker-wrapper-${randomString(5)}`)
const dateFormat = ref('yyyy-LL-dd')
const dateLabelFormat = ref('iiii, LLLL d, yyyy')
const showDatePicker = ref(false)
const showKeyboardShortcutsMenu = ref(false)
const showMonths = ref(2)
const colors = ref({
  selected: '#00a699',
  inRange: '#66e2da',
  selectedText: '#fff',
  text: '#565a5c',
  inRangeBorder: '#33dacd',
  disabled: '#fff',
  hoveredInRange: '#67f6ee',
})
const sundayFirst = ref(false)
const ariaLabels = ref({
  chooseDate: (date: string) => date,
  chooseStartDate: (date: string) => `Choose ${date} as your start date.`,
  chooseEndDate: (date: string) => `Choose ${date} as your end date.`,
  selectedDate: (date: string) => `Selected. ${date}`,
  unavailableDate: (date: string) => `Not available. ${date}`,
  previousMonth: 'Move backward to switch to the previous month.',
  nextMonth: 'Move forward to switch to the next month.',
  closeDatePicker: 'Close calendar',
  openKeyboardShortcutsMenu: 'Open keyboard shortcuts menu.',
  closeKeyboardShortcutsMenu: 'Close keyboard shortcuts menu',
})
const startingDate = ref<Date | null>()
const focusedDate = ref<Date | null>()
const months = ref<any[]>([])
const years = ref<any[]>([])
const width = ref(300)
const selectedDate1 = ref<Date | null>()
const selectedDate2 = ref<Date | null>()
const isSelectingDate1 = ref(true)
const hoverDate = ref<Date>() as { value: Date }
const alignRight = ref(false)
const triggerPosition = ref({
  height: 0,
  left: 0,
  right: 0,
})
const triggerWrapperPosition = ref({
  left: 0,
  right: 0,
})
const viewportWidth = ref(0) // number 720
const viewportWidthPx = ref('') // string 720px
const isMobile = ref(false)
const isTablet = ref(false)
const triggerElement = ref<HTMLElement | null>()

const showFullscreen = computed(() => isMobile.value && fullscreenMobile.value)
const wrapperClasses = computed(() => {
  return {
    'asd__wrapper--datepicker-open': showDatePicker.value,
    'asd__wrapper--full-screen': showFullscreen.value,
    'asd__wrapper--inline': inline.value,
  }
})
const wrapperStyles = computed(() => {
  return {
    position: inline.value ? 'static' : 'absolute',
    top: inline.value ? '0' : `${triggerPosition.value.height + offsetY.value}px`,
    left: !alignRight.value
      ? `${triggerPosition.value.left - triggerWrapperPosition.value.left + offsetX.value}px`
      : '',
    right: alignRight.value
      ? `${triggerWrapperPosition.value.right - triggerPosition.value.right + offsetX.value}px`
      : '',
    width: `${width.value * showMonths.value}px`,
    zIndex: inline.value ? '0' : '100',
  }
})
const innerStyles = computed(() => {
  return {
    'margin-left': showFullscreen.value ? `-${viewportWidthPx.value}` : `-${width.value}px`,
  }
})
const keyboardShortcutsMenuStyles = computed(() => {
  return {
    left: showFullscreen.value ? viewportWidthPx.value : `${width.value}px`,
  }
})
const monthWidthStyles = computed(() => {
  return {
    width: showFullscreen.value ? viewportWidthPx.value : `${width.value}px`,
  }
})
const mobileHeaderFallback = computed(() => mode.value === 'range' ? 'Select dates' : 'Select date')
const datesSelected = computed(() => !!(selectedDate1.value || selectedDate2.value))
const allDatesSelected = computed(() => !!(selectedDate1.value && selectedDate2.value))
const hasMinDate = computed(() => !!(minDate.value))
const isRangeMode = computed(() => mode.value === 'range')
const isSingleMode = computed(() => mode.value === 'single')
const datePickerWidth = computed(() => width.value * showMonths.value)
const datePropsCompound = computed(() => `${dateOne.value?.toString} ${dateTwo.value?.toString}`) // used to watch for changes in props, and update GUI accordingly
const isDateTwoBeforeDateOne = computed(() => {
  if (!dateTwo.value)
    return false

  return isBefore(dateTwo.value, dateOne.value)
})
const visibleMonths = computed(() => {
  const firstMonthArray: any[] = months.value.filter((_m, index: number) => index > 0)
  const numberOfMonthsArray = []

  for (let i = 0; i < showMonths.value; i++)
    numberOfMonthsArray.push(i)

  return numberOfMonthsArray.map((_, index: number) => firstMonthArray[index].firstDateOfMonth)
})

// static variables
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
const keys: Record<string, number> = {
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

if (selectedDate1.value) {
  watch(selectedDate1, (newValue) => {
    if (!selectedDate1.value)
      return

    const date = new Date(newValue as Date)
    const newDate = format(date, dateFormat.value)

    emit('dateOneSelected', newDate)
  })
}

if (selectedDate2.value) {
  watch(selectedDate2, (newValue) => {
    const date = new Date(newValue as Date)
    const newDate = format(date, dateFormat.value)

    emit('dateTwoSelected', newDate)
  })
}

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

watch(datePropsCompound, () => {
  if (dateOne.value !== selectedDate1.value) {
    startingDate.value = dateOne.value
    setStartDates()
    generateMonths()
    generateYears()
  }

  if (isDateTwoBeforeDateOne.value) {
    selectedDate2.value = null
    emit('dateTwoSelected', '')
  }
})

watch(trigger, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      openDatePicker()
    }, 0)
  }
})

onBeforeMount(() => {
  if (sundayFirst.value)
    setSundayToFirstDayInWeek()
})

const handleWindowResizeEvent = useDebounceFn(() => {
  positionDatePicker()
  setStartDates()
}, 200)

onMounted(() => {
  viewportWidth.value = window.innerWidth
  viewportWidthPx.value = `${viewportWidth.value}px`
  isMobile.value = viewportWidth.value < 768
  isTablet.value = viewportWidth.value >= 768 && viewportWidth.value <= 1024

  // window.addEventListener('resize', handleWindowResizeEvent)

  triggerElement.value = isTest.value
    ? document.createElement('input')
    : document.getElementById(triggerElementId.value)

  setStartDates()
  generateMonths()
  generateYears()

  if (startOpen.value || inline.value)
    openDatePicker()

  // $el.addEventListener('keyup', handleKeyboardInput)
  // $el.addEventListener('keydown', trapKeyboardInput)

  if (triggerElement.value) {
    triggerElement.value.addEventListener('keyup', handleTriggerInput)
    triggerElement.value.addEventListener('click', handleWindowClickEvent)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResizeEvent)
  window.removeEventListener('click', handleWindowClickEvent)

  // $el.removeEventListener('keyup', handleKeyboardInput)
  // $el.removeEventListener('keydown', trapKeyboardInput)

  if (!triggerElement.value)
    return

  triggerElement.value.removeEventListener('keyup', handleTriggerInput)
  triggerElement.value.removeEventListener('click', handleWindowClickEvent)
})

function handleWindowClickEvent(event: any) {
  if (event.target.id !== triggerElementId.value)
    return

  event.stopPropagation()
  event.preventDefault()
  toggleDatepicker()
}

function randomString(length: number) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let text = ''

  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))

  return text
}

function isSelected(date: Date) {
  if (!date)
    return

  return selectedDate1.value === date || selectedDate2.value === date
}

function getDayStyles(date: Date) {
  const selected = isSelected(date)
  const inRange = isInRange(date)
  const disabled = isDisabled(date)

  const styles = {
    width: `${(width.value - 30) / 7}px`,
    background: selected
      ? colors.value.selected
      : isHoveredInRange(date)
        ? colors.value.hoveredInRange
        : inRange
          ? colors.value.inRange
          : '',
    color: disabled
      ? colors.value.selectedText
      : isInRange(date) || isHoveredInRange(date)
        ? colors.value.selectedText
        : colors.value.text,
    border: selected
      ? `1px double ${colors.value.selected}`
      : (inRange && allDatesSelected.value) || isHoveredInRange(date)
          ? `1px double ${colors.value.inRangeBorder}`
          : '',
  }
  if (disabled)
    styles.background = colors.value.disabled

  return styles
}

function getAriaLabelForDate(date: Date) {
  const dateLabel = format(date, dateLabelFormat.value)
  const disabled = isDisabled(date)

  if (disabled)
    return ariaLabels.value.unavailableDate(dateLabel)

  if (isSelected(date))
    return ariaLabels.value.selectedDate(dateLabel)

  if (isRangeMode.value) {
    if (isSelectingDate1.value)
      return ariaLabels.value.chooseStartDate(dateLabel)

    return ariaLabels.value.chooseEndDate(dateLabel)
  }

  return ariaLabels.value.chooseDate(dateLabel)
}

function handleClickOutside(event: any) {
  if (event.target.id === triggerElementId.value || !showDatePicker.value || inline.value)
    return

  closeDatePicker()
}

function shouldHandleInput(event: any, key: number) {
  return (
    event.keyCode === key && (!event.shiftKey || event.keyCode === 191) && showDatePicker.value
  )
}

function handleTriggerInput(event: any) {
  if (mode.value === 'single')
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
    if (showKeyboardShortcutsMenu.value)
      closeKeyboardShortcutsMenu()

    else
      closeDatePicker()
  }

  else if (showKeyboardShortcutsMenu.value) {
    // if keyboard shortcutsMenu is open, then esc is the only key we want to have fire events
  }

  else if (shouldHandleInput(event, keys.arrowDown)) {
    if (!focusedDate.value)
      return

    const newDate = addWeeks(focusedDate.value, 1)
    const changeMonths = !isSameMonth(newDate, focusedDate.value)
    setFocusedDate(newDate)

    if (changeMonths)
      nextMonth()
  }

  else if (shouldHandleInput(event, keys.arrowUp)) {
    if (!focusedDate.value)
      return

    const newDate = subWeeks(focusedDate.value, 1)
    const changeMonths = !isSameMonth(newDate, focusedDate.value)
    setFocusedDate(newDate)

    if (changeMonths)
      previousMonth()
  }

  else if (shouldHandleInput(event, keys.arrowRight)) {
    if (!focusedDate.value)
      return

    const newDate = addDays(focusedDate.value, 1)
    const changeMonths = !isSameMonth(newDate, focusedDate.value)
    setFocusedDate(newDate)

    if (changeMonths)
      nextMonth()
  }

  else if (shouldHandleInput(event, keys.arrowLeft)) {
    if (!focusedDate.value)
      return

    const newDate = subDays(focusedDate.value, 1)
    const changeMonths = !isSameMonth(newDate, focusedDate.value)
    setFocusedDate(newDate)

    if (changeMonths)
      previousMonth()
  }

  else if (shouldHandleInput(event, keys.enter)) {
    // on enter key, only select the date if a date is currently in focus
    const target = event.target
    if (!showKeyboardShortcutsMenu.value && target && target.tagName === 'TD')
      selectDate(focusedDate.value)
  }

  else if (shouldHandleInput(event, keys.pgUp)) {
    if (!focusedDate.value)
      return

    setFocusedDate(subMonths(focusedDate.value, 1))
    previousMonth()
  }

  else if (shouldHandleInput(event, keys.pgDn)) {
    setFocusedDate(addManyMonths(focusedDate.value))
    nextMonth()
  }

  else if (shouldHandleInput(event, keys.home)) {
    if (!focusedDate.value)
      return

    const newDate = startOfWeek(focusedDate.value, {
      weekStartsOn: sundayFirst.value ? 0 : 1,
    })

    const changeMonths = !isSameMonth(newDate, focusedDate.value)
    setFocusedDate(newDate)

    if (changeMonths)
      previousMonth()
  }

  else if (shouldHandleInput(event, keys.end)) {
    if (!focusedDate.value)
      return

    const newDate = endOfWeek(focusedDate.value, {
      weekStartsOn: sundayFirst.value ? 0 : 1,
    })

    const changeMonths = !isSameMonth(newDate, focusedDate.value)
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

  // make sure format is either 'yyyy-MM-dd' or 'DD.MM.YYYY'
  const isFormatYearFirst = value.match(
    /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/,
  )
  const isFormatDayFirst = value.match(
    /^(0[1-9]|1[0-9]|2[0-9]|3[0-1])[.](0[1-9]|1[0-2])[.](\d{4})$/,
  )

  if (!isFormatYearFirst && !isFormatDayFirst)
    return

  if (isFormatDayFirst) // then convert to yyyy-MM-dd
    value = `${value.substring(6, 10)}-${value.substring(3, 5)}-${value.substring(0, 2)}`

  const valueAsDateObject = new Date(value)

  if (!isValid(valueAsDateObject))
    return

  if (
    isDateDisabled(valueAsDateObject)
        || isBeforeMinDate(valueAsDateObject)
        || isAfterEndDate(valueAsDateObject)
  )
    return

  startingDate.value = subMonths(valueAsDateObject, 1)

  generateMonths()
  generateYears()
  selectDate(valueAsDateObject)
}

function isMonthDisabled(year: number, month: number) {
  const monthDate = new Date(year, month)
  if (hasMinDate.value && isBefore(monthDate, startOfMonth(minDate.value)))
    return true

  return isAfterEndDate(monthDate)
}

function generateMonths() {
  months.value = []

  let currentMonth = startingDate.value

  for (let i = 0; i < showMonths.value + 2; i++) {
    if (!currentMonth)
      return

    const month = getMonthOf(currentMonth)

    months.value.push(month)

    currentMonth = new Date(addManyMonths(currentMonth))
  }
}

function generateYears() {
  if (!showMonthYearSelect.value)
    return

  const currentYear = getYear(startingDate.value as Date)
  const startYear = minDate.value ? getYear(minDate.value) : currentYear - yearsForSelect.value
  const endYear = endDate.value ? getYear(endDate.value) : currentYear + yearsForSelect.value

  for (let year = startYear; year <= endYear; year++)
    years.value.push(year)
}

function setStartDates() {
  let startDate = dateOne.value || new Date()
  if (hasMinDate.value && isBefore(startDate, minDate.value))
    startDate = minDate.value

  startingDate.value = new Date(subtractMonths(startDate))
  selectedDate1.value = dateOne.value
  selectedDate2.value = dateTwo.value
  focusedDate.value = startDate
}

function setSundayToFirstDayInWeek() {
  const lastDay = days.pop()

  if (lastDay)
    days.unshift(lastDay)

  const lastDayShort = daysShort.pop()

  if (lastDayShort)
    daysShort.unshift(lastDayShort)
}

function getMonthOf(date: Date) {
  const firstDateOfMonth = format(date, 'YYYY-MM-01')
  const d = new Date(firstDateOfMonth)
  const year = format(date, 'YYYY')
  const monthNumber = parseInt(format(date, 'M'))
  const monthName = monthNames[monthNumber - 1]

  return {
    year,
    firstDateOfMonth,
    monthName,
    monthNumber,
    weeks: getWeeks(d),
  }
}

function getWeeks(date: Date) {
  const weekDayNotInMonth = { dayNumber: 0 }
  const daysInMonth = getDaysInMonth(date)
  const year = format(date, 'yyyy')
  const month = format(date, 'MM')

  let firstDayInWeek = parseInt(format(date, sundayFirst.value ? 'd' : 'E'))

  if (sundayFirst.value)
    firstDayInWeek++

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
  if (isBeforeMinDate(date) || isAfterEndDate(date) || isDateDisabled(date))
    return

  if (mode.value === 'single') {
    selectedDate1.value = date
    closeDatePicker()
    return
  }

  if (isSelectingDate1.value || isBefore(date, selectedDate1.value as Date)) {
    selectedDate1.value = date
    isSelectingDate1.value = false

    if (isBefore(selectedDate2.value as Date, date))
      selectedDate2.value = null
  }

  else {
    selectedDate2.value = date
    isSelectingDate1.value = true

    if (isAfter(selectedDate1.value as Date, date))
      selectedDate1.value = null

    else if (showActionButtons.value) {
      // if user has selected both dates, focus the apply button for accessibility
      // TODO: $refs['apply-button'].focus()
    }

    if (allDatesSelected.value && closeAfterSelect.value)
      closeDatePicker()
  }
}

function setHoverDate(date: any) {
  hoverDate.value = date
}

function setFocusedDate(date: any) {
  const formattedDate = format(date, dateFormat.value)
  focusedDate.value = new Date(formattedDate)

  // TODO: const dateElement = $refs[`date-${formattedDate}`]
  // // handle .focus() on ie11 by adding a short timeout
  // if (dateElement && dateElement.length) {
  //   setTimeout(() => {
  //     dateElement[0].focus()
  //   }, 10)
  // }
}

function resetFocusedDate(setToFirst: any) {
  if (focusedDate.value && !isDateVisible(focusedDate.value)) {
    const visibleMonthIdx = setToFirst ? 0 : visibleMonths.value.length - 1
    const targetMonth = visibleMonths.value[visibleMonthIdx]
    const monthIdx = getMonth(targetMonth)
    const year = getYear(targetMonth)
    const newFocusedDate = setYear(setMonth(focusedDate.value, monthIdx), year)

    focusedDate.value = new Date(format(newFocusedDate, dateFormat.value))
  }
}

function isToday(date: any) {
  return format(new Date(), dateFormat.value) === date
}

function isSameDate(date1: any, date2: any) {
  return isSameDay(date1, date2)
}

function isInRange(date: any) {
  if (isSingleMode.value || allDatesSelected.value)
    return false

  return (
    (isAfter(date, selectedDate1.value as Date) && isBefore(date, selectedDate1.value as Date))
        || (isAfter(date, selectedDate1.value as Date)
          && isBefore(date, hoverDate.value)
          && !allDatesSelected.value)
  )
}

function isHoveredInRange(date: Date) {
  if (isSingleMode.value || allDatesSelected.value)
    return false

  return (
    (isAfter(date, selectedDate1.value as Date) && isBefore(date, hoverDate.value))
        || (isAfter(date, hoverDate.value) && isBefore(date, selectedDate1.value as Date))
  )
}

function isBeforeMinDate(date: Date) {
  if (!minDate.value)
    return false

  return isBefore(date, minDate.value)
}

function isAfterEndDate(date: Date) {
  if (!endDate.value)
    return false

  return isAfter(date, endDate.value)
}

function isDateVisible(date: Date) {
  if (!date)
    return false

  const start = subDays(visibleMonths.value[0], 1)
  const end = addDays(lastDayOfMonth(visibleMonths.value[monthsToShow.value - 1]), 1)
  return isAfter(date, start) && isBefore(date, end)
}

function isDateDisabled(date: Date) {
  if (enabledDates.value.length > 0)
    return !enabledDates.value.includes(date)

  return disabledDates.value.includes(date)
}

function customizedDateClass(date: Date) {
  let customizedClasses = ''

  if (customizedDates.value.length) {
    for (let i = 0; i < customizedDates.value.length; i++) {
      if (customizedDates.value[i].dates.includes(date))
        customizedClasses += ` asd__day--${customizedDates.value[i].cssClass}`
    }
  }

  return customizedClasses
}

function isDisabled(date: Date) {
  return isDateDisabled(date) || isBeforeMinDate(date) || isAfterEndDate(date)
}

function previousMonth() {
  startingDate.value = new Date(subtractMonths(months.value[0].firstDateOfMonth))

  months.value.unshift(getMonth(startingDate.value))
  months.value.splice(months.value.length - 1, 1)

  emit('previous-month', visibleMonths.value)

  resetFocusedDate(false)
}

function nextMonth() {
  startingDate.value = new Date(addManyMonths(months.value[months.value.length - 1].firstDateOfMonth))

  months.value.push(getMonth(startingDate.value))
  months.value.splice(0, 1)

  emit('next-month', visibleMonths.value)
  resetFocusedDate(true)
}

function subtractMonths(date: any) {
  return format(subMonths(date, 1), dateFormat.value)
}

function addManyMonths(date: any) {
  return format(addMonths(date, 1), dateFormat.value)
}

function toggleDatepicker() {
  if (showDatePicker.value)
    closeDatePicker()

  else
    openDatePicker()
}

function updateMonth(offset: number, year: number, event: any) {
  const newMonth = event.target.value
  const monthIdx = monthNames.indexOf(newMonth)
  const newDate = setYear(setMonth(startingDate.value as Date, monthIdx), year)

  startingDate.value = subMonths(newDate, offset)

  generateMonths()
}

function updateYear(offset: number, monthIdx: number, event: any) {
  const newYear = event.target.value
  const newDate = setYear(setMonth(startingDate.value as Date, monthIdx), newYear)

  startingDate.value = subMonths(newDate, offset)

  generateMonths()
}

function openDatePicker() {
  positionDatePicker()
  setStartDates()
  if (triggerElement.value)
    triggerElement.value.classList.add('datepicker-open')
  showDatePicker.value = true
  initialDate1.value = dateOne.value
  initialDate2.value = dateTwo.value

  emit('opened')

  nextTick(() => {
    if (!inline.value)
      setFocusedDate(focusedDate.value)
  })
}

function closeDatePickerCancel() {
  if (showDatePicker.value) {
    selectedDate1.value = initialDate1.value
    selectedDate2.value = initialDate2.value

    emit('cancelled')

    closeDatePicker()
  }
}

function closeDatePicker() {
  if (inline.value)
    return

  showDatePicker.value = false
  showKeyboardShortcutsMenu.value = false
  triggerElement.value?.classList.remove('datepicker-open')

  emit('closed')
}

function openKeyboardShortcutsMenu() {
  showKeyboardShortcutsMenu.value = true

  // TODO: implement this
  // const shortcutMenuCloseBtn = $refs['keyboard-shortcuts-menu-close']

  // nextTick(() => shortcutMenuCloseBtn.focus())
}

function closeKeyboardShortcutsMenu() {
  showKeyboardShortcutsMenu.value = false
  nextTick(() => setFocusedDate(focusedDate.value))
}

function apply() {
  emit('apply')
  closeDatePicker()
}

function positionDatePicker() {
  const triggerWrapperElement = findAncestor(triggerElement.value ?? null, '.datepicker-trigger')

  if (triggerElement.value)
    triggerPosition.value = triggerElement.value.getBoundingClientRect()

  if (triggerWrapperElement)
    triggerWrapperPosition.value = triggerWrapperElement.getBoundingClientRect()

  else
    triggerWrapperPosition.value = { left: 0, right: 0 }

  const w = document.documentElement.clientWidth || window.innerWidth
  viewportWidthPx.value = `${w}px`
  isMobile.value = w < 768
  isTablet.value = w >= 768 && w <= 1024
  showMonths.value = isMobile.value
    ? 1
    : isTablet.value && monthsToShow.value > 2
      ? 2
      : monthsToShow.value

  nextTick(() => {
    const datepickerWrapper = document.getElementById(wrapperId.value)
    if (!triggerElement.value || !datepickerWrapper)
      return

    const rightPosition
          = triggerElement.value.getBoundingClientRect().left
          + datepickerWrapper.getBoundingClientRect().width

    alignRight.value = rightPosition > viewportWidth.value
  })
}

function setupData(options: any) {
  triggerElementId.value = options.triggerElementId
  dateOne.value = options.dateOne
  dateTwo.value = options.dateTwo
  minDate.value = options.minDate
  endDate.value = options.endDate
  mode.value = options.mode
  offsetY.value = options.offsetY
  offsetX.value = options.offsetX
  monthsToShow.value = options.monthsToShow
  startOpen.value = options.startOpen
  fullscreenMobile.value = options.fullscreenMobile
  inline.value = options.inline
  // mobileHeader.value = options.mobileHeader
  disabledDates.value = options.disabledDates
  enabledDates.value = options.enabledDates
  customizedDates.value = options.customizedDates
  showActionButtons.value = options.showActionButtons
  // showShortcutsMenuTrigger.value = options.showShortcutsMenuTrigger
  showMonthYearSelect.value = options.showMonthYearSelect
  yearsForSelect.value = options.yearsForSelect
  trigger.value = options.trigger
  closeAfterSelect.value = options.closeAfterSelect
}

export function useDatePicker(
  triggerElementId: string,
  dateOne: Date,
  dateTwo?: Date,
  minDate?: Date,
  endDate?: Date,
  mode?: string,
  offsetY?: number,
  offsetX?: number,
  monthsToShow?: number,
  startOpen?: boolean,
  fullscreenMobile?: boolean,
  inline?: boolean,
  mobileHeader?: string,
  disabledDates?: Date[],
  enabledDates?: Date[],
  customizedDates?: {
    dates: Date[]
    cssClass: string
  },
  showActionButtons?: boolean,
  showShortcutsMenuTrigger?: boolean,
  showMonthYearSelect?: boolean,
  yearsForSelect?: number,
  trigger?: string,
  closeAfterSelect?: boolean,
) {
  const options = {
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
  }

  setupData(options)

  return {
    dateFormat,
    wrapperClasses,
    wrapperStyles,
    innerStyles,
    keyboardShortcuts,
    keyboardShortcutsMenuStyles,
    monthWidthStyles,
    mobileHeaderFallback,
    datesSelected,
    allDatesSelected,
    texts,
    datePickerWidth,
    getDayStyles,
    closeDatePickerCancel,
    getAriaLabelForDate,
    handleClickOutside,
    trapKeyboardInput,
    handleKeyboardInput,
    isMonthDisabled,
    setHoverDate,
    isToday,
    isSameDate,
    apply,
    customizedDateClass,
    updateMonth,
    updateYear,
  }
}

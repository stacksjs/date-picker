import { addDays, addMonths, addWeeks, endOfWeek, format, getDaysInMonth, getMonth, getYear, isAfter, isBefore, isSameDay, isSameMonth, isValid, lastDayOfMonth, setMonth, setYear, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns'

import { findAncestor } from '~/helpers'

const emit = defineEmits(['dateOneSelected', 'dateTwoSelected', 'apply', 'closed', 'opened', 'previous-month', 'next-month', 'cancelled'])

// reactive variables whose initial state may be provided through props
let triggerElementId = $ref('')
let dateOne: Date = $ref()
let dateTwo: Date = $ref()
let initialDate1: Date = $ref()
let initialDate2: Date = $ref()
let minDate: Date = $ref()
let endDate: Date = $ref()
let mode = $ref('range')
let offsetX = $ref(0)
let offsetY = $ref(0)
let monthsToShow = $ref(2)
let startOpen = $ref(false)
let inline = $ref()
// let mobileHeader = $ref('')
let enabledDates = $ref([])
let disabledDates = $ref([])
let customizedDates = $ref([])
let fullscreenMobile = $ref()
let showActionButtons = $ref(true)
// let showShortcutsMenuTrigger = $ref(true)
let showMonthYearSelect = $ref(false)
let yearsForSelect = $ref(10)
const isTest = $ref(process.env.NODE_ENV === 'test')
let trigger = $ref(false)
let closeAfterSelect = $ref(false)

const wrapperId = $ref(`datepicker-wrapper-${randomString(5)}`)
const dateFormat = $ref('yyyy-LL-dd')
const dateLabelFormat = $ref('iiii, LLLL d, yyyy')
let showDatePicker = $ref(false)
let showKeyboardShortcutsMenu = $ref(false)
let showMonths = $ref(2)
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
  closeDatePicker: 'Close calendar',
  openKeyboardShortcutsMenu: 'Open keyboard shortcuts menu.',
  closeKeyboardShortcutsMenu: 'Close keyboard shortcuts menu',
})
let startingDate: Date | null = $ref()
let focusedDate: Date | null = $ref()
let months: any[] = $ref([])
const years = $ref([])
const width = $ref(300)
let selectedDate1: Date | null = $ref()
let selectedDate2: Date | null = $ref()
let isSelectingDate1 = $ref(true)
let hoverDate: Date = $ref()
let alignRight = $ref(false)
let triggerPosition = $ref({
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
let triggerElement: HTMLElement | null = $ref()

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
const datesSelected = $computed(() => !!(selectedDate1 || selectedDate2))
const allDatesSelected = $computed(() => !!(selectedDate1 && selectedDate2))
const hasMinDate = $computed(() => !!(minDate))
const isRangeMode = $computed(() => mode === 'range')
const isSingleMode = $computed(() => mode === 'single')
const datePickerWidth = $computed(() => width * showMonths)
const datePropsCompound = $computed(() => `${dateOne?.toString} ${dateTwo?.toString}`) // used to watch for changes in props, and update GUI accordingly
const isDateTwoBeforeDateOne = $computed(() => {
  if (!dateTwo)
    return false

  return isBefore(dateTwo, dateOne)
})
const visibleMonths = $computed(() => {
  interface FirstMonth {
    firstDateOfMonth: string
  }

  const firstMonthArray: FirstMonth | string[] = months.filter((m, index: number) => index > 0)
  const numberOfMonthsArray = []

  for (let i = 0; i < showMonths; i++)
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

if (selectedDate1) {
  watch(selectedDate1, (newValue) => {
    if (!selectedDate1)
      return

    const date = new Date(newValue)
    const newDate = format(date, dateFormat)

    emit('dateOneSelected', newDate)
  })
}

if (selectedDate2) {
  watch(selectedDate2, (newValue) => {
    const date = new Date(newValue)
    const newDate = format(date, dateFormat)

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
  if (dateOne !== selectedDate1) {
    startingDate = dateOne
    setStartDates()
    generateMonths()
    generateYears()
  }

  if (isDateTwoBeforeDateOne) {
    selectedDate2 = null
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
  if (sundayFirst)
    setSundayToFirstDayInWeek()
})

const handleWindowResizeEvent = useDebounceFn(() => {
  positionDatePicker()
  setStartDates()
}, 200)

onMounted(() => {
  viewportWidth = `${window.innerWidth}px`
  isMobile = window.innerWidth < 768
  isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024

  // window.addEventListener('resize', handleWindowResizeEvent)

  triggerElement = isTest
    ? document.createElement('input')
    : document.getElementById(triggerElementId)

  setStartDates()
  generateMonths()
  generateYears()

  if (startOpen || inline)
    openDatePicker()

  // $el.addEventListener('keyup', handleKeyboardInput)
  // $el.addEventListener('keydown', trapKeyboardInput)

  if (triggerElement) {
    triggerElement.addEventListener('keyup', handleTriggerInput)
    triggerElement.addEventListener('click', handleWindowClickEvent)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResizeEvent)
  window.removeEventListener('click', handleWindowClickEvent)

  // $el.removeEventListener('keyup', handleKeyboardInput)
  // $el.removeEventListener('keydown', trapKeyboardInput)

  if (!triggerElement)
    return

  triggerElement.removeEventListener('keyup', handleTriggerInput)
  triggerElement.removeEventListener('click', handleWindowClickEvent)
})

function handleWindowClickEvent(event: any) {
  if (event.target.id === triggerElementId) {
    event.stopPropagation()
    event.preventDefault()
    toggleDatepicker()
  }
}

function randomString(length: number) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))

  return text
}

function isSelected(date: any) {
  if (!date)
    return

  return selectedDate1 === date || selectedDate2 === date
}

function getDayStyles(date: Date) {
  const selected = isSelected(date)
  const inRange = isInRange(date)
  const disabled = isDisabled(date)

  const styles = {
    width: `${(width - 30) / 7}px`,
    background: selected
      ? colors.selected
      : isHoveredInRange(date)
        ? colors.hoveredInRange
        : inRange
          ? colors.inRange
          : '',
    color: disabled
      ? colors.selectedText
      : isInRange || isHoveredInRange(date)
        ? colors.selectedText
        : colors.text,
    border: selected
      ? `1px double ${colors.selected}`
      : (inRange && allDatesSelected) || isHoveredInRange(date)
          ? `1px double ${colors.inRangeBorder}`
          : '',
  }
  if (disabled)
    styles.background = colors.disabled

  return styles
}

function getAriaLabelForDate(date: Date) {
  const dateLabel = format(date, dateLabelFormat)
  const disabled = isDisabled(date)

  if (disabled)
    return ariaLabels.unavailableDate(dateLabel)

  if (isSelected(date))
    return ariaLabels.selectedDate(dateLabel)

  if (isRangeMode) {
    if (isSelectingDate1)
      return ariaLabels.chooseStartDate(dateLabel)

    return ariaLabels.chooseEndDate(dateLabel)
  }

  return ariaLabels.chooseDate(dateLabel)
}

function handleClickOutside(event: any) {
  if (event.target.id === triggerElementId || !showDatePicker || inline)
    return

  closeDatePicker()
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
      closeDatePicker()
  }

  else if (showKeyboardShortcutsMenu) {
    // if keyboard shortcutsMenu is open, then esc is the only key we want to have fire events
  }

  else if (shouldHandleInput(event, keys.arrowDown)) {
    if (!focusedDate)
      return

    const newDate = addWeeks(focusedDate, 1)
    const changeMonths = !isSameMonth(newDate, focusedDate)
    setFocusedDate(newDate)

    if (changeMonths)
      nextMonth()
  }

  else if (shouldHandleInput(event, keys.arrowUp)) {
    if (!focusedDate)
      return

    const newDate = subWeeks(focusedDate, 1)
    const changeMonths = !isSameMonth(newDate, focusedDate)
    setFocusedDate(newDate)

    if (changeMonths)
      previousMonth()
  }

  else if (shouldHandleInput(event, keys.arrowRight)) {
    if (!focusedDate)
      return

    const newDate = addDays(focusedDate, 1)
    const changeMonths = !isSameMonth(newDate, focusedDate)
    setFocusedDate(newDate)

    if (changeMonths)
      nextMonth()
  }

  else if (shouldHandleInput(event, keys.arrowLeft)) {
    if (!focusedDate)
      return

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
    if (!focusedDate)
      return

    setFocusedDate(subMonths(focusedDate, 1))
    previousMonth()
  }

  else if (shouldHandleInput(event, keys.pgDn)) {
    setFocusedDate(addManyMonths(focusedDate))
    nextMonth()
  }

  else if (shouldHandleInput(event, keys.home)) {
    if (!focusedDate)
      return

    const newDate = startOfWeek(focusedDate, {
      weekStartsOn: sundayFirst ? 0 : 1,
    })

    const changeMonths = !isSameMonth(newDate, focusedDate)
    setFocusedDate(newDate)

    if (changeMonths)
      previousMonth()
  }

  else if (shouldHandleInput(event, keys.end)) {
    if (!focusedDate)
      return

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

  // make sure format is either 'yyyy-MM-dd' or 'DD.MM.YYYY'
  const isFormatYearFirst = value.match(
    /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/,
  )
  const isFormatDayFirst = value.match(
    /^(0[1-9]|1[0-9]|2[0-9]|3[0-1])[.](0[1-9]|1[0-2])[.](\d{4})$/,
  )
  if (!isFormatYearFirst && !isFormatDayFirst)
    return

  if (isFormatDayFirst) {
    // convert to yyyy-MM-dd
    value = `${value.substring(6, 10)}-${value.substring(3, 5)}-${value.substring(0, 2)}`
  }

  const valueAsDateObject = new Date(value)

  if (!isValid(valueAsDateObject))
    return

  if (
    isDateDisabled(valueAsDateObject)
        || isBeforeMinDate(valueAsDateObject)
        || isAfterEndDate(valueAsDateObject)
  )
    return

  startingDate = subMonths(valueAsDateObject, 1)

  generateMonths()
  generateYears()
  selectDate(valueAsDateObject)
}

function isMonthDisabled(year: number, month: number) {
  const monthDate = new Date(year, month)
  if (hasMinDate && isBefore(monthDate, startOfMonth(minDate)))
    return true

  return isAfterEndDate(monthDate)
}

function generateMonths() {
  months = []

  let currentMonth = startingDate

  for (let i = 0; i < showMonths + 2; i++) {
    if (!currentMonth)
      return

    const month = getMonthOf(currentMonth)

    months.push(month)

    currentMonth = new Date(addManyMonths(currentMonth))
  }
}

function generateYears() {
  if (!showMonthYearSelect)
    return

  const currentYear = getYear(startingDate as Date)
  const startYear = minDate ? getYear(minDate) : currentYear - yearsForSelect
  const endYear = endDate ? getYear(endDate) : currentYear + yearsForSelect

  for (let year = startYear; year <= endYear; year++)
    years.push(year)
}

function setStartDates() {
  let startDate = dateOne || new Date()
  if (hasMinDate && isBefore(startDate, minDate))
    startDate = minDate

  startingDate = new Date(subtractMonths(startDate))
  selectedDate1 = dateOne
  selectedDate2 = dateTwo
  focusedDate = startDate
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

  let firstDayInWeek = parseInt(format(date, sundayFirst ? 'd' : 'E'))

  if (sundayFirst)
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

  if (mode === 'single') {
    selectedDate1 = date
    closeDatePicker()
    return
  }

  if (isSelectingDate1 || isBefore(date, selectedDate1 as Date)) {
    selectedDate1 = date
    isSelectingDate1 = false

    if (isBefore(selectedDate2 as Date, date))
      selectedDate2 = null
  }

  else {
    selectedDate2 = date
    isSelectingDate1 = true

    if (isAfter(selectedDate1 as Date, date)) { selectedDate1 = null }

    else if (showActionButtons) {
      // if user has selected both dates, focus the apply button for accessibility
      // TODO: $refs['apply-button'].focus()
    }

    if (allDatesSelected && closeAfterSelect)
      closeDatePicker()
  }
}

function setHoverDate(date: any) {
  hoverDate = date
}

function setFocusedDate(date: any) {
  const formattedDate = format(date, dateFormat)
  focusedDate = new Date(formattedDate)

  // TODO: const dateElement = $refs[`date-${formattedDate}`]
  // // handle .focus() on ie11 by adding a short timeout
  // if (dateElement && dateElement.length) {
  //   setTimeout(() => {
  //     dateElement[0].focus()
  //   }, 10)
  // }
}

function resetFocusedDate(setToFirst: any) {
  if (focusedDate && !isDateVisible(focusedDate)) {
    const visibleMonthIdx = setToFirst ? 0 : visibleMonths.length - 1
    const targetMonth = visibleMonths[visibleMonthIdx]
    const monthIdx = getMonth(targetMonth)
    const year = getYear(targetMonth)
    const newFocusedDate = setYear(setMonth(focusedDate, monthIdx), year)

    focusedDate = new Date(format(newFocusedDate, dateFormat))
  }
}

function isToday(date: any) {
  return format(new Date(), dateFormat) === date
}

function isSameDate(date1: any, date2: any) {
  return isSameDay(date1, date2)
}

function isInRange(date: any) {
  if (isSingleMode || allDatesSelected)
    return false

  return (
    (isAfter(date, selectedDate1 as Date) && isBefore(date, selectedDate1 as Date))
        || (isAfter(date, selectedDate1 as Date)
          && isBefore(date, hoverDate)
          && !allDatesSelected)
  )
}

function isHoveredInRange(date: Date) {
  if (isSingleMode || allDatesSelected)
    return false

  return (
    (isAfter(date, selectedDate1 as Date) && isBefore(date, hoverDate))
        || (isAfter(date, hoverDate) && isBefore(date, selectedDate1 as Date))
  )
}

function isBeforeMinDate(date: Date) {
  if (!minDate)
    return false

  return isBefore(date, minDate)
}

function isAfterEndDate(date: Date) {
  if (!endDate)
    return false

  return isAfter(date, endDate)
}

function isDateVisible(date: Date) {
  if (!date)
    return false

  const start = subDays(visibleMonths[0], 1)
  const end = addDays(lastDayOfMonth(visibleMonths[monthsToShow - 1]), 1)
  return isAfter(date, start) && isBefore(date, end)
}

function isDateDisabled(date: Date) {
  if (enabledDates.length > 0)
    return !enabledDates.includes(date)

  return disabledDates.includes(date)
}

function customizedDateClass(date: Date) {
  let customizedClasses = ''

  if (customizedDates.length) {
    for (let i = 0; i < customizedDates.length; i++) {
      if (customizedDates[i].dates.includes(date))
        customizedClasses += ` asd__day--${customizedDates[i].cssClass}`
    }
  }

  return customizedClasses
}

function isDisabled(date: Date) {
  return isDateDisabled(date) || isBeforeMinDate(date) || isAfterEndDate(date)
}

function previousMonth() {
  startingDate = new Date(subtractMonths(months[0].firstDateOfMonth))

  months.unshift(getMonth(startingDate))
  months.splice(months.length - 1, 1)

  emit('previous-month', visibleMonths)

  resetFocusedDate(false)
}

function nextMonth() {
  startingDate = new Date(addManyMonths(months[months.length - 1].firstDateOfMonth))

  months.push(getMonth(startingDate))
  months.splice(0, 1)

  emit('next-month', visibleMonths)
  resetFocusedDate(true)
}

function subtractMonths(date: any) {
  return format(subMonths(date, 1), dateFormat)
}

function addManyMonths(date: any) {
  return format(addMonths(date, 1), dateFormat)
}

function toggleDatepicker() {
  if (showDatePicker)
    closeDatePicker()

  else
    openDatePicker()
}

function updateMonth(offset: number, year: number, event: any) {
  const newMonth = event.target.value
  const monthIdx = monthNames.indexOf(newMonth)
  const newDate = setYear(setMonth(startingDate as Date, monthIdx), year)

  startingDate = subMonths(newDate, offset)

  generateMonths()
}

function updateYear(offset: number, monthIdx: number, event: any) {
  const newYear = event.target.value
  const newDate = setYear(setMonth(startingDate as Date, monthIdx), newYear)

  startingDate = subMonths(newDate, offset)

  generateMonths()
}

function openDatePicker() {
  positionDatePicker()
  setStartDates()
  if (triggerElement)
    triggerElement.classList.add('datepicker-open')
  showDatePicker = true
  initialDate1 = dateOne
  initialDate2 = dateTwo

  emit('opened')

  nextTick(() => {
    if (!inline)
      setFocusedDate(focusedDate)
  })
}

function closeDatePickerCancel() {
  if (showDatePicker) {
    selectedDate1 = initialDate1
    selectedDate2 = initialDate2

    emit('cancelled')

    closeDatePicker()
  }
}

function closeDatePicker() {
  if (inline)
    return

  showDatePicker = false
  showKeyboardShortcutsMenu = false
  triggerElement.classList.remove('datepicker-open')

  emit('closed')
}

function openKeyboardShortcutsMenu() {
  showKeyboardShortcutsMenu = true

  // TODO: implement this
  // const shortcutMenuCloseBtn = $refs['keyboard-shortcus-menu-close']

  // nextTick(() => shortcutMenuCloseBtn.focus())
}

function closeKeyboardShortcutsMenu() {
  showKeyboardShortcutsMenu = false
  nextTick(() => setFocusedDate(focusedDate))
}

function apply() {
  emit('apply')
  closeDatePicker()
}

function positionDatePicker() {
  const triggerWrapperElement = findAncestor(triggerElement, '.datepicker-trigger')

  triggerPosition = triggerElement?.getBoundingClientRect()

  if (triggerWrapperElement)
    triggerWrapperPosition = triggerWrapperElement.getBoundingClientRect()

  else
    triggerWrapperPosition = { left: 0, right: 0 }

  const width = document.documentElement.clientWidth || window.innerWidth
  viewportWidth = `${width}px`
  isMobile = width < 768
  isTablet = width >= 768 && width <= 1024
  showMonths = isMobile
    ? 1
    : isTablet && monthsToShow > 2
      ? 2
      : monthsToShow

  nextTick(() => {
    const datepickerWrapper = document.getElementById(wrapperId)
    if (!triggerElement || !datepickerWrapper)
      return

    const rightPosition
          = triggerElement.getBoundingClientRect().left
          + datepickerWrapper.getBoundingClientRect().width

    alignRight = rightPosition > viewportWidth
  })
}

function setupData(options: any) {
  triggerElementId = options.triggerElementId
  dateOne = options.dateOne
  dateTwo = options.dateTwo
  minDate = options.minDate
  endDate = options.endDate
  mode = options.mode
  offsetY = options.offsetY
  offsetX = options.offsetX
  monthsToShow = options.monthsToShow
  startOpen = options.startOpen
  fullscreenMobile = options.fullscreenMobile
  inline = options.inline
  // mobileHeader = options.mobileHeader
  disabledDates = options.disabledDates
  enabledDates = options.enabledDates
  customizedDates = options.customizedDates
  showActionButtons = options.showActionButtons
  // showShortcutsMenuTrigger = options.showShortcutsMenuTrigger
  showMonthYearSelect = options.showMonthYearSelect
  yearsForSelect = options.yearsForSelect
  trigger = options.trigger
  closeAfterSelect = options.closeAfterSelect
}

export function useDatePicker(
  triggerElementId: string,
  dateOne: Date,
  dateTwo: Date,
  minDate: Date,
  endDate: Date,
  mode: string,
  offsetY: number,
  offsetX: number,
  monthsToShow: number,
  startOpen: boolean,
  fullscreenMobile: boolean,
  inline: boolean,
  mobileHeader: string,
  disabledDates: Date[],
  enabledDates: Date[],
  customizedDates: [],
  showActionButtons: boolean,
  showShortcutsMenuTrigger: boolean,
  showMonthYearSelect: boolean,
  yearsForSelect: number,
  trigger: string,
  closeAfterSelect: boolean,
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

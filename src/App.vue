<script setup lang="ts">
import { format } from 'date-fns'
import { DatePicker } from '~/index'

const dateFormat = $ref('YYYY-MM-DD')
let inputDateOne = $ref('')
let inputDateTwo = $ref('')
const inputSingleDateOne = $ref('')
const inputSingleDateTwo = $ref('')
const buttonDateOne = $ref('')
const buttonDateTwo = $ref('')
const inlineDateOne = $ref('')
const withDisabledDatesDateOne = $ref('')
const callbackDateOne = $ref('')
const callbackDateTwo = $ref('')
const sundayFirst = $ref(false)
let alignRight = $ref(false)
let showDatePickers = $ref(true)
let trigger = $ref(false)

const disabledDates = $computed(() => ['2018-12-30', '2018-12-10', '2018-12-14'])

onBeforeMount(() => {
  setTimeout(() => {
    inputDateOne = '2019-01-12'
    inputDateTwo = ''
  }, 5000)
})

function formatDates(dateOne: any, dateTwo?: any) {
  let formattedDates = ''

  if (dateOne)
    formattedDates = format(dateOne, dateFormat)

  if (dateTwo)
    formattedDates += ` - ${format(dateTwo, dateFormat)}`

  return formattedDates
}

function toggleAlign() {
  alignRight = !alignRight
}

function toggleDatepickers() {
  showDatePickers = !showDatePickers
}

function toggleTrigger() {
  trigger = !trigger
}

function applyMethod() {
  // eslint-disable-next-line no-console
  console.log('apply')
}

function openedMethod() {
  // eslint-disable-next-line no-console
  console.log('opened')
}

function closedMethod() {
  // eslint-disable-next-line no-console
  console.log('closed')

  trigger = false
}

function cancelledMethod() {
  // eslint-disable-next-line no-console
  console.log('cancelled')
}

function changeMonthMethod(visibleMonths: any) {
  // eslint-disable-next-line no-console
  console.log('change months', visibleMonths)
}
</script>

<template>
  <div class="app" :class="{ 'align-right': alignRight }">
    <h1>Examples</h1>
    <div class="buttons">
      <button @click="toggleDatepickers">
        Hide datepickers
      </button>
      <button @click="toggleAlign">
        Toggle alignment
      </button>
      <button @click="toggleTrigger">
        Toggle trigger
      </button>
    </div>
    <div v-if="showDatePickers">
      <div class="datepicker-container with-input">
        <h3>Range datepicker with input</h3>
        <div class="datepicker-trigger">
          <input
            id="datepicker-input-trigger"
            type="text"
            :value="formatDates(inputDateOne, inputDateTwo)"
            placeholder="Select dates"
          >

          <DatePicker
            trigger-element-id="datepicker-input-trigger"
            mode="range"
            :date-one="inputDateOne"
            :date-two="inputDateTwo"
            min-date="2018-08-28"
            :months-to-show="2"
            :show-action-buttons="true"
            :show-month-year-select="true"
            @date-one-selected="val => { inputDateOne = val }"
            @date-two-selected="val => { inputDateTwo = val }"
          />
        </div>
      </div>

      <div class="datepicker-container single-with-input">
        <h3>Single datepicker with input</h3>
        <div class="datepicker-trigger">
          <input
            id="datepicker-input-single-trigger"
            type="text"
            :value="formatDates(inputSingleDateOne)"
            placeholder="Select dates"
          >

          <DatePicker
            trigger-element-id="datepicker-input-single-trigger"
            mode="single"
            :date-one="inputSingleDateOne"
            :date-two="inputSingleDateTwo"
            @date-one-selected="val => { inputSingleDateOne = val }"
          />
        </div>
      </div>

      <div class="datepicker-container with-button">
        <h3>Range datepicker with button</h3>
        <div class="datepicker-trigger">
          <button id="datepicker-button-trigger">
            {{ formatDates(buttonDateOne, buttonDateTwo) || 'Select dates' }}
          </button>

          <DatePicker
            trigger-element-id="datepicker-button-trigger"
            mode="range"
            :date-one="buttonDateOne"
            :date-two="buttonDateTwo"
            min-date="2018-04-18"
            :fullscreen-mobile="true"
            :months-to-show="2"
            :trigger="trigger"
            :offset-y="10"
            :close-after-select="true"
            @date-one-selected="val => { buttonDateOne = val }"
            @date-two-selected="val => { buttonDateTwo = val; trigger = false }"
          />
        </div>
      </div>

      <div class="datepicker-container inline-with-input">
        <h3>Inline datepicker with input</h3>
        <input
          id="datepicker-inline-trigger"
          :value="formatDates(inlineDateOne)"
          type="text"
          placeholder="Select date"
        >
        <DatePicker
          trigger-element-id="datepicker-inline-trigger"
          mode="single"
          :inline="true"
          :fullscreen-mobile="false"
          :date-one="inlineDateOne"
          :months-to-show="2"
          :disabled-dates="['2018-04-30', '2018-05-10', '2018-12-14']"
          :customized-dates="[{ dates: ['2019-03-21', '2019-03-22', '2019-03-23', '2019-03-24'], cssClass: 'booked' }, { dates: ['2019-03-21', '2019-03-22', '2019-03-23', '2019-04-24'], cssClass: 'not-available' }]"
          @date-one-selected="val => { inlineDateOne = val }"
        />
      </div>

      <div class="datepicker-container inline-with-input">
        <h3>Inline datepicker with disabled dates</h3>
        <input
          id="datepicker-disabled-dates-trigger"
          :value="formatDates(withDisabledDatesDateOne)"
          type="text"
          placeholder="Select date"
        >
        <DatePicker
          trigger-element-id="datepicker-disabled-dates-trigger"
          mode="single"
          :inline="true"
          :date-one="withDisabledDatesDateOne"
          :months-to-show="2"
          :disabled-dates="disabledDates"
          @date-one-selected="val => { withDisabledDatesDateOne = val }"
        />
      </div>

      <div class="datepicker-container with-button">
        <h3>Test callback methods</h3>
        <div class="datepicker-trigger">
          <button id="datepicker-callback-trigger">
            {{ formatDates(callbackDateOne, callbackDateTwo) || 'Select dates' }}
          </button>

          <DatePicker
            trigger-element-id="datepicker-callback-trigger"
            mode="range"
            :date-one="callbackDateOne"
            :date-two="callbackDateTwo"
            :fullscreen-mobile="true"
            :months-to-show="2"
            :offset-y="10"
            @date-one-selected="val => { callbackDateOne = val }"
            @date-two-selected="val => { callbackDateTwo = val }"
            @apply="applyMethod"
            @closed="closedMethod"
            @cancelled="cancelledMethod"
            @opened="openedMethod"
            @previous-month="changeMonthMethod"
            @next-month="changeMonthMethod"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
html,
body {
  min-height: 200vh;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell,
    Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  line-height: 18px;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  padding: 10px;
}
.app .align-right {
  text-align: right;
}

h1 {
  font-size: 1.8em;
  line-height: 1.5em;
  text-align: center;
}
.datepicker-container {
  padding: 0 30px 20px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.01);
  max-width: 600px;
  margin: 0 auto 30px;
  border-radius: 12px;
}
#datepicker-button-trigger {
  background: #008489;
  border: 1px solid #008489;
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 15px;
  font-weight: bold;
  text-align: center;
  min-width: 200px;
}
input {
  padding: 6px 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.buttons {
  max-width: 500px;
  margin: 0 auto 30px;
  text-align: center;
}
</style>

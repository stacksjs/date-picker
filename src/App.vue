<script setup lang="ts">
import { format } from 'date-fns'
import { DatePicker } from '~/index'
import { useDatePicker } from '~/composables/date-picker'

useDatePicker({
  format: 'yyyy-MM-dd',
  value: format(new Date(), 'yyyy-MM-dd'),
})

const { dateFormat } = useDatePicker(
  'datepicker-input-single-trigger',
  inputDateOne,
)

// const disabledDates = $computed(() => [new Date('2018-12-30'), new Date('2018-12-10'), new Date('2018-12-14')])

onBeforeMount(() => {
  setTimeout(() => {
    inputDateOne = new Date('2019-01-12')
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
</script>

<template>
  <input
    id="datepicker-trigger"
    type="text"
    placeholder="Select dates"
    :value="formatDates(dateOne, dateTwo)"
  >

  <DatePicker
    trigger-element-id="datepicker-trigger"
    mode="range"
    :fullscreen-mobile="true"
    :date-one="new Date(dateOne)"
    :date-two="new Date(dateTwo)"
    @date-one-selected="val => { dateOne = val }"
    @date-two-selected="val => { dateTwo = val }"
  />
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

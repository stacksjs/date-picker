<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { format } from 'date-fns'
import { DatePicker } from '~/index'
import { useDatePicker } from '~/composables/date-picker'

const dateOne = ref<Date>(new Date())
const dateTwo = ref<Date>(new Date())

const { dateFormat } = useDatePicker(
  'datepicker-input-single-trigger',
  dateOne.value,
)

onBeforeMount(() => {
  setTimeout(() => {
    dateOne.value = new Date('2019-01-12')
  }, 5000)
})

function formatDates(dateOneVal: any, dateTwoVal?: any) {
  let formattedDates = ''

  if (dateOneVal)
    formattedDates = format(dateOneVal, dateFormat.value)

  if (dateTwoVal)
    formattedDates += ` - ${format(dateTwoVal, dateFormat.value)}`

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
    :date-one="new Date(dateOne as any)"
    :date-two="new Date(dateTwo as any)"
    @date-one-selected="(val: any) => { dateOne = val }"
    @date-two-selected="(val: any) => { dateTwo = val }"
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

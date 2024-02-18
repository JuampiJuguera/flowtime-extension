<template>
  <h1 class="color-red-50">Time-O FlowTime</h1>
  Settings -> modal -> change rest time count
  <a target="_blank" href="https://www.taskade.com/blog/flowtime-technique-guide/">How time-O flowTime works</a>
  <Timer @timer-live="updateTimerStatus"/>
  <div>
    Add new tasks
    <TaskManager :is-timer-live="isTimerLive"></TaskManager>
  </div>
  <div>
  </div>
</template>

<script setup>
import { ref, defineComponent } from 'vue'
import TaskManager from './TaskManager.vue';
import Timer from './Timer.vue';

const count = ref(0)

const isTimerLive = ref(false);

const updateTimerStatus = (status) => {
  isTimerLive.value = status;
};

</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>

<template>
    <div>
        {{ formatTime }}
        <button v-if="flowtime" type="button" @click="startStopwatch">Start</button>
        <button type="button" @click="pauseTime">Pause</button>
        <button v-if="flowtime" type="button" @click="resetStopwatch">Reset</button>
        <button v-if="flowtime" type="button" @click="finishFlowTime">Finish FlowTime</button>
        <button v-if="!flowtime" type="button" @click="startRest">Start Rest</button>
        <button v-if="!flowtime" type="button" @click="finishRestTime">Finish Rest</button>
    </div>
</template>

<script setup>

    // imports
    import { computed, defineEmits, onMounted, ref } from 'vue';
    // Uses

    // Refs
    const startTime = ref(null);
    const elapsedSeconds = ref(0);
    const intervalId = ref(null);
    const flowtime = ref(true);
    const timerLive = ref(false);
    const emit = defineEmits();
    // Props & Emit


    // Computed
    const formatTime = computed(() => {
        const hours = Math.floor(elapsedSeconds.value / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((elapsedSeconds.value % 3600) / 60).toString().padStart(2, '0');
        const seconds = Math.floor(elapsedSeconds.value % 60).toString().padStart(2, '0')
        return `${hours}:${minutes}:${seconds}`
    });

    // Methods

    const startStopwatch = () => {
        startTime.value = new Date().getTime() - elapsedSeconds.value * 1000;
        intervalId.value = setInterval(updateTime, 1000);
        timerLive.value = true;
        emit('timer-live', timerLive.value);
        chrome.runtime.sendMessage({ action: 'startTimer' }, function(response) {
            intervalId.value = response.intervalId;
            emit('timer-live', timerLive.value);
        });
    };

    const resetStopwatch = () => {
        clearInterval(intervalId.value);
        timerLive.value = false;
        chrome.runtime.sendMessage({ action: 'stopTimer', intervalId: intervalId.value }, function(response) {
            elapsedSeconds.value = 0;
            saveElapsedSeconds();
            emit('timer-live', timerLive.value);
        });
    };

    const pauseTime = () => {
        clearInterval(intervalId.value);
        timerLive.value = false;
        chrome.runtime.sendMessage({ action: 'stopTimer', intervalId: intervalId.value }, function(response) {
            saveElapsedSeconds();
            emit('timer-live', timerLive.value);
        });
    }

    const finishFlowTime = () => {
        pauseTime();
        elapsedSeconds.value = (elapsedSeconds.value / 300) * 60;
        flowtime.value = !flowtime.value;
        saveElapsedSeconds();
        emit('timer-live', false);
    };

    const finishRestTime = () => {
        resetStopwatch();
        flowtime.value = !flowtime.value;
    }

    const startRest = () => {
        intervalId.value = setInterval(updateRestTime, 1000);
    }

    const updateTime = () => {
        const currentTime = new Date().getTime();
        elapsedSeconds.value = Math.floor((currentTime - startTime.value) / 1000);
        saveElapsedSeconds();
    };

    const updateRestTime = () => {
        elapsedSeconds.value = Math.max(0, elapsedSeconds.value - 1);
        if (elapsedSeconds.value === 0) {
            clearInterval(intervalId.value);
        }
        saveElapsedSeconds();
    };

    const saveElapsedSeconds = () => {
        chrome.storage.sync.set({ 'elapsedSeconds': elapsedSeconds.value, 'timerLive': timerLive.value });
    };

    // Hooks

    onMounted(() => {
        chrome.storage.sync.get(['elapsedSeconds','timerLive'], function(result) {
            if (result.elapsedSeconds) {
                elapsedSeconds.value = result.elapsedSeconds
                if (result.timerLive) {
                    startTime.value = new Date().getTime() - elapsedSeconds.value * 1000;
                    intervalId.value = setInterval(updateTime, 1000);
                }
            }
        })
    })
</script>

<style scoped>
    
</style>
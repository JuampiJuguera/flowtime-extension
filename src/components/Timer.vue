<template>
    <div>
        {{ formatTime }}
        <button v-if="flowtime" type="button" @click="startStopwatch">Start</button>
        <button v-if="elapsedSeconds !== 0" type="button" @click="pauseTime">Pause</button>
        <button v-if="flowtime" type="button" @click="resetStopwatch">Reset</button>
        <button v-if="flowtime" type="button" @click="finishFlowTime">Finish FlowTime</button>
        <button v-if="!flowtime && elapsedSeconds !== 0" type="button" @click="startRest">Start Rest</button>
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
    const restTimerLive = ref(false);
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
        saveTimerLiveStatus();
        emit('timer-live', timerLive.value);
        runBackgroundStopwatch();
    };

    const runBackgroundStopwatch = () => {
        chrome.runtime.sendMessage({ action: 'startTimer', intervalId: intervalId.value }, function(response) {});
    }

    const resetStopwatch = () => {
        clearInterval(intervalId.value);
        timerLive.value = false;
        restTimerLive.value = false;
        saveTimerLiveStatus();
        saveRestTimerLiveStatus();
        chrome.runtime.sendMessage({ action: 'stopTimer', intervalId: intervalId.value }, function(response) {
            elapsedSeconds.value = 0;
            saveElapsedSeconds();
            emit('timer-live', timerLive.value);
        });
    };

    const pauseTime = () => {
        clearInterval(intervalId.value);
        timerLive.value = false;
        restTimerLive.value = false;
        saveTimerLiveStatus();
        saveRestTimerLiveStatus();
        chrome.runtime.sendMessage({ action: 'stopTimer', intervalId: intervalId.value }, function(response) {
            saveElapsedSeconds();
            emit('timer-live', timerLive.value);
        });
    }

    const finishFlowTime = () => {
        pauseTime();
        elapsedSeconds.value = (elapsedSeconds.value / 300) * 60;
        flowtime.value = !flowtime.value;
        saveFlowtimeStatus();
        saveElapsedSeconds();
        emit('timer-live', false);
    };

    const finishRestTime = () => {
        resetStopwatch();
        flowtime.value = !flowtime.value;
        saveFlowtimeStatus();
    }

    const startRest = () => {
        restTimerLive.value = true;
        saveRestTimerLiveStatus();
        intervalId.value = setInterval(updateRestTime, 1000);
        chrome.runtime.sendMessage({ action: 'startRestTimer', intervalId: intervalId.value }, function(response) {});
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
        chrome.storage.local.set({ 'elapsedSeconds': elapsedSeconds.value });
    };

    const saveTimerLiveStatus = () => {
        chrome.storage.local.set({ 'timerLive': timerLive.value });
    }

    const saveRestTimerLiveStatus = () => {
        chrome.storage.local.set({ 'restTimerLive': restTimerLive.value });
    }

    const saveFlowtimeStatus = () => {
        chrome.storage.local.set({ 'flowtime': flowtime.value });
    }

    // Hooks

    onMounted(() => {
        chrome.storage.local.get(['elapsedSeconds','timerLive', 'restTimerLive', 'flowtime'], function(result) {
            if ('flowtime' in result) {
                flowtime.value = result.flowtime;
            }
            if (result.elapsedSeconds) {
                elapsedSeconds.value = result.elapsedSeconds
                if (result.timerLive) {
                    startStopwatch()
                }
                if (result.restTimerLive) {
                    startRest()
                }
            }
        })
    })
</script>

<style scoped>
    
</style>
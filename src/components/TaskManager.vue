<template>
    <label for="task">Add a short task</label><br>
    <input id="task" name="task" type="text" v-model="newTask"/>
    <button @click="addTask">+</button>
    <p>Tasks - Pending to Start</p>
    <div v-for="(task, index) in pendingTasks">
        {{ task.name }}
    <button @click="startTask(task)">Start Task</button>
    <button @click="deleteTask(task)">X</button>
    </div>

    <p>Tasks - on Board</p>
    <div v-for="(task, index) in liveTasks">
        {{ task.name }} {{ formatTime(task.time) }}
    <button @click="finishTask(task)">Finish Task</button>
    <button v-if="isTimerLive" @click="pauseTask(task)">Pause Task</button>
    <button v-if="isTimerLive" @click="resumeTask(task)">Resume Task</button>
    </div>

    <p>Tasks - Finished</p>
    <div v-for="(task, index) in finishedTasks">
        {{ task.name }} {{ formatTime(task.time) }}
    <button @click="goLiveTask(task)">Go live</button>
    <button @click="deleteTask(task)">X</button>
    </div>
</template>

<script setup>


    // imports
    import { ref, computed, watchEffect } from 'vue';
    // Uses


    // Refs
    const taskList = ref([]);
    const newTask = ref('');
    const intervalId = ref(null);

    // Props & Emit
    const props = defineProps(['is-timer-live']);

    // Computed
    const pendingTasks = computed(() => taskList.value.filter(task => task.status === 'pending'));
    const liveTasks = computed(() =>
        taskList.value
            .filter((task) => task.status === 'live' || task.status === 'paused')
    );
    const finishedTasks = computed(() => taskList.value.filter(task => task.status === 'finished'))
    // Methods

    const addTask = () => {
        taskList.value.push({
            'name': newTask.value,
            'status': 'pending',
            'time': 0
        });
        newTask.value = ''
    }

    const startTask = (task) => {
        task.status = 'live';
        task.startTime = new Date().getTime();
    }

    const finishTask = (task) => {
        task.status = 'finished';
    }

    const deleteTask = (task) => {
        const index = taskList.value.findIndex(t => t === task);
        if (index !== -1) {
            taskList.value.splice(index, 1);
        }
    }

    const goLiveTask = (task) => {
        task.status = 'live';
    }

    const startTimer = () => {
        intervalId.value = setInterval(updateLiveTasksTime, 1000);
    };

    const updateLiveTasksTime = () => {
        liveTasks.value.forEach((task) => {
            if (task.status === 'live') {
                task.time = task.time + 1;
            }
        });
    };

    const pauseAllTasks = () => {
        clearInterval(intervalId.value)
    };

    const resumeTask = (task) => {
        task.status = 'live';
    };

    const pauseTask = (task) => {
        task.status = 'paused'
    }
    
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    // Hooks

    watchEffect(() => {
        if (props.isTimerLive) {
            startTimer();
        } else {
            pauseAllTasks();
        }
    });


</script>

<style scoped>
    
</style>
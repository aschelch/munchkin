<template>
    <div class="handzone">
        <h6>Evènements</h6>
        <ul id="logs" class="list-unstyled">
            <li v-for="event in events" :key="event">{{event}}</li>
        </ul>
    </div>
</template>

<script>
export default {
    data() {
        return {
            events: [],
        }
    }
}
</script>

<style>
</style>
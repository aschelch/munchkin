<template>
    <div class=".container-fluid">
        <div class="row">
            <div class="col-9">
                <Board/>
                <Hand/>
            </div>
            <div class="col-3">
                <Visio/>
                <Events/>
            </div>
        </div>
    </div>
</template>

<script>
import Board from './components/Board.vue'
import Hand from './components/Hand.vue'
import Visio from './components/Visio.vue'
import Events from './components/Events.vue'

export default {
    name: 'app',
    components: {
        Board, Hand, Visio, Events
    },
    sockets: {
        connect() {
            console.log("Websocket connected to " + this.$socket.nsp);
        },
        disconnect() {
            console.log("Websocket disconnected from " + this.$socket.nsp);
        }  
    }
}
</script>

<style>
</style>
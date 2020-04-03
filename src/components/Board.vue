<template>
    <div class="boardzone">
        <h6>Votre équipement</h6>
        <p class="empty" v-if="cards.length == 0">Vous n'avez aucun équipement</p>
    </div>
</template>

<script>
export default {
    data() {
        return {
            cards: []
        }
    },
    methods: {
        equip() {
            this.$socket.emit("equip", {});
        },
        desequip() {
            this.$socket.emit("desequip", {});
        },
        discard() {
            this.$socket.emit("discard", {});
        }
    },
    mounted() {
        console.log("mounted");
    }
}
</script>

<style>
</style>
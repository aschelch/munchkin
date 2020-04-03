<template>
    <div class="handzone">
        <h6>Votre main</h6>
        <ul id="hand" class="list-inline">
            <li class='list-inline-item card-item' v-for="(card, index) in cards"  :key="index">
                <img src="images/deck/{card.img}" class="rounded card" title="{card.name}"/>
            </li>
        </ul>
        <p class="empty" v-if="cards.length == 0">Vous n'avez aucune carte en main</p>
    </div>
</template>

<script>
export default {
    data() {
        return {
            cards: [],
        }
    }
}
</script>

<style>
</style>
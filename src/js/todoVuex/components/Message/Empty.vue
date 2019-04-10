<template lang="html">
  <p class="empty">{{ emptyMessage }}</p>
</template>

<script>
export default {
  computed: {
    emptyMessage() {
      return this.$store.state.emptyMessage;
    },
  },
};
</script>

<style lang="scss" scoped>
.empty {
  font-size: 14px;
  text-align: center;
}
</style>

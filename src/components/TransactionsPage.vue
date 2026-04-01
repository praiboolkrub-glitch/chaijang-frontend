<template>
  <div class="space-y-6">
    <TransactionForm
      :categories="categories"
      :bankAccounts="bankAccounts"
      :currentUserId="currentUserId"
      @submit="handleCreateTransaction"
    />
    <TransactionList :transactions="transactions" />
  </div>
</template>

<script setup>
import TransactionForm from './TransactionForm.vue';
import TransactionList from './TransactionList.vue';

const props = defineProps({
  categories: Array,
  bankAccounts: Array,
  transactions: Array,
  currentUserId: Number,
});
const emits = defineEmits(['submit']);

const handleCreateTransaction = (payload) => {
  emits('submit', payload);
};
</script>
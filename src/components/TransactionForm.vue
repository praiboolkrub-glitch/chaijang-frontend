<template>
  <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div class="mb-5 space-y-2">
      <h2 class="text-xl font-semibold text-slate-900">บันทึกรายรับ / รายจ่าย</h2>
      <p class="text-sm text-slate-500">เชื่อมต่อกับ API เพื่อบันทึก transaction ใหม่</p>
    </div>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="text-sm font-medium text-slate-700">ประเภท</span>
          <select
            v-model="form.transaction_type"
            class="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="text-sm font-medium text-slate-700">บัญชีธนาคาร</span>
          <select
            v-model="form.bank_account_id"
            class="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 outline-none"
          >
            <option value="">เลือกบัญชี</option>
            <option v-for="account in bankAccounts" :key="account.id" :value="account.id">
              {{ account.name }} - {{ account.bank_name }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700">หมวดหมู่</span>
          <select
            v-model="form.category_id"
            class="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 outline-none"
          >
            <option value="">เลือกหมวดหมู่</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </label>
      </div>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">หัวข้อ</span>
        <input
          v-model="form.title"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 outline-none"
          placeholder="เดินทางไปทำงาน"
        />
      </label>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="text-sm font-medium text-slate-700">จำนวนเงิน</span>
          <input
            v-model.number="form.amount"
            type="number"
            step="0.01"
            class="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="120.00"
          />
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700">วันที่</span>
          <input
            v-model="form.expense_date"
            type="date"
            class="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 outline-none"
          />
        </label>
      </div>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">คำอธิบาย</span>
        <textarea
          v-model="form.notes"
          rows="3"
          class="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 outline-none"
          placeholder="รายละเอียดเพิ่มเติม"
        ></textarea>
      </label>

      <button
        type="submit"
        class="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
      >
        บันทึกรายการ
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  categories: Array,
  bankAccounts: Array,
  currentUserId: Number,
});
const emits = defineEmits(['submit']);

const form = reactive({
  user_id: props.currentUserId || '',
  category_id: '',
  bank_account_id: '',
  transaction_type: 'expense',
  title: '',
  amount: null,
  notes: '',
  expense_date: new Date().toISOString().slice(0, 10),
});

watch(
  () => props.currentUserId,
  (newUserId) => {
    if (newUserId) {
      form.user_id = newUserId;
    }
  },
  { immediate: true }
);

const submitForm = () => {
  emits('submit', { ...form });
};
</script>

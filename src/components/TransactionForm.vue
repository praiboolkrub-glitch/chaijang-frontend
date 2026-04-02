<template>
  <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 max-h-[calc(100vh-180px)] overflow-y-auto sm:max-h-none">
    <div class="mb-5 space-y-2">
      <h2 class="text-xl font-semibold text-slate-900">บันทึกรายรับ / รายจ่าย</h2>
      <p class="text-sm text-slate-500">เลือกบัญชีหลักแล้วระบบจะเลือกให้โดยอัตโนมัติ</p>
    </div>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <span class="text-sm font-medium text-slate-700">ประเภท</span>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              @click="form.transaction_type = 'expense'"
              :class="[
                'rounded-full px-5 py-2 text-sm font-semibold transition',
                form.transaction_type === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              ]"
            >
              Expense
            </button>
            <button
              type="button"
              @click="form.transaction_type = 'income'"
              :class="[
                'rounded-full px-5 py-2 text-sm font-semibold transition',
                form.transaction_type === 'income'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              ]"
            >
              Income
            </button>
          </div>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="text-sm font-medium text-slate-700">บัญชีธนาคาร</span>
          <select
            v-model="form.bank_account_id"
            class="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">เลือกบัญชี</option>
            <option v-for="account in bankAccounts" :key="account.id" :value="account.id">
              {{ account.name }} {{ account.is_primary ? '(หลัก)' : '' }} - {{ account.bank_name || 'ไม่ระบุธนาคาร' }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700">หมวดหมู่</span>
          <select
            v-model="form.category_id"
            class="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">เลือกหมวดหมู่</option>
            <option
              v-for="category in categories.filter((category) => category.transaction_type === form.transaction_type)"
              :key="category.id"
              :value="category.id"
            >
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
          class="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          placeholder="เช่น ค่าอาหาร, เงินเดือน"
        />
      </label>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="text-sm font-medium text-slate-700">จำนวนเงิน</span>
          <input
            v-model="form.amount"
            type="tel"
            inputmode="decimal"
            pattern="[0-9]*"
            class="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="0.00"
          />
        </label>
      </div>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">คำอธิบาย</span>
        <textarea
          v-model="form.notes"
          rows="3"
          class="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
        ></textarea>
      </label>

      <button
        type="submit"
        class="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
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
  user_id: props.currentUserId || null,
  category_id: '',
  bank_account_id: '',
  transaction_type: 'expense',
  title: '',
  amount: '',
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

watch(
  () => props.categories,
  (categories) => {
    const matching = Array.isArray(categories)
      ? categories.find((category) => category.transaction_type === form.transaction_type)
      : null;
    if (!form.category_id && matching) {
      form.category_id = matching.id;
    }
  },
  { immediate: true }
);

watch(
  () => form.transaction_type,
  (newTransactionType) => {
    const matching = props.categories?.find((category) => category.transaction_type === newTransactionType);
    if (matching) {
      form.category_id = matching.id;
    }
  }
);

watch(
  () => props.bankAccounts,
  (bankAccounts) => {
    if (!form.bank_account_id && Array.isArray(bankAccounts) && bankAccounts.length > 0) {
      const primary = bankAccounts.find((account) => account.is_primary);
      form.bank_account_id = (primary || bankAccounts[0]).id;
    }
  },
  { immediate: true }
);

const submitForm = () => {
  const amountValue = Number.parseFloat(String(form.amount).replace(',', '.'));
  emits('submit', {
    user_id: form.user_id,
    category_id: form.category_id || null,
    bank_account_id: form.bank_account_id || null,
    transaction_type: form.transaction_type,
    title: form.title?.trim() || null,
    amount: Number.isNaN(amountValue) ? undefined : amountValue,
    notes: form.notes?.trim() || null,
    expense_date: new Date().toISOString().slice(0, 10),
  });
};
</script>

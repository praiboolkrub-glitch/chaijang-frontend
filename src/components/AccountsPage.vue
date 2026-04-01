<template>
  <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Bank Accounts</h2>
        <p class="mt-1 text-sm text-slate-500">จัดการบัญชีธนาคารที่ผูกกับ Household</p>
      </div>
      <button
        class="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        @click="newAccount = !newAccount"
      >
        {{ newAccount ? 'ปิดแบบฟอร์ม' : 'สร้างบัญชี' }}
      </button>
    </div>

    <form v-if="newAccount" @submit.prevent="submitAccount" class="mb-6 space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-5">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="text-sm font-medium text-slate-700">Household</span>
          <select v-model="form.household_id" class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none">
            <option value="">เลือก Household</option>
            <option v-for="household in households" :key="household.id" :value="household.id">{{ household.name }}</option>
          </select>
        </label>
        <label class="block">
          <span class="text-sm font-medium text-slate-700">ชื่อบัญชี</span>
          <input v-model="form.name" type="text" class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none" placeholder="Primary Account" />
        </label>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="text-sm font-medium text-slate-700">ธนาคาร</span>
          <input v-model="form.bank_name" type="text" class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none" placeholder="Bank Name" />
        </label>
        <label class="block">
          <span class="text-sm font-medium text-slate-700">เลขที่บัญชี</span>
          <input v-model="form.account_number" type="text" class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none" placeholder="1234567890" />
        </label>
      </div>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">ยอดเงินเริ่มต้น</span>
        <input v-model.number="form.balance" type="number" step="0.01" class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none" placeholder="0.00" />
      </label>

      <button type="submit" class="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">บันทึกบัญชี</button>
    </form>

    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-sm text-slate-700">
        <thead class="border-b border-slate-200 text-slate-900">
          <tr>
            <th class="px-3 py-3">ID</th>
            <th class="px-3 py-3">ชื่อบัญชี</th>
            <th class="px-3 py-3">ธนาคาร</th>
            <th class="px-3 py-3">เลขที่บัญชี</th>
            <th class="px-3 py-3">Household</th>
            <th class="px-3 py-3">ยอดเงิน</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="account in accounts" :key="account.id" class="border-b border-slate-100 hover:bg-slate-50">
            <td class="px-3 py-3">{{ account.id }}</td>
            <td class="px-3 py-3">{{ account.name }}</td>
            <td class="px-3 py-3">{{ account.bank_name || '-' }}</td>
            <td class="px-3 py-3">{{ account.account_number || '-' }}</td>
            <td class="px-3 py-3">{{ getHouseholdName(account.household_id) }}</td>
            <td class="px-3 py-3">{{ formatMoney(account.balance) }}</td>
          </tr>
          <tr v-if="accounts.length === 0">
            <td colspan="6" class="px-3 py-6 text-center text-slate-500">ยังไม่มีบัญชีธนาคาร</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchHouseholds, fetchBankAccounts, createBankAccount } from '../api';

const accounts = ref([]);
const households = ref([]);
const newAccount = ref(false);
const form = ref({ household_id: '', name: '', bank_name: '', account_number: '', balance: 0 });

const loadAccounts = async () => {
  const response = await fetchBankAccounts();
  if (response.success) accounts.value = response.data || [];
};

const loadHouseholds = async () => {
  const response = await fetchHouseholds();
  if (response.success) households.value = response.data || [];
};

const submitAccount = async () => {
  await createBankAccount(form.value);
  form.value = { household_id: '', name: '', bank_name: '', account_number: '', balance: 0 };
  newAccount.value = false;
  await loadAccounts();
};

const formatMoney = (value) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value);
};

const getHouseholdName = (id) => {
  const household = households.value.find((item) => item.id === id);
  return household ? household.name : '-';
};

onMounted(async () => {
  await loadHouseholds();
  await loadAccounts();
});
</script>
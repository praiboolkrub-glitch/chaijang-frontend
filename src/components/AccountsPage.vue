<template>
  <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Bank Accounts</h2>
        <p class="mt-1 text-sm text-slate-500">จัดการบัญชีธนาคารที่ผูกกับผู้ใช้</p>
      </div>
      <button
        class="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        @click="newAccount = !newAccount"
      >
        {{ newAccount ? 'ปิดแบบฟอร์ม' : 'สร้างบัญชี' }}
      </button>
    </div>

    <form v-if="newAccount && currentUserId" @submit.prevent="submitAccount" class="mb-6 space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-5">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="text-sm font-medium text-slate-700">ชื่อบัญชี</span>
          <input v-model="form.name" type="text" class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none" placeholder="Primary Account" />
        </label>
        <label class="block">
          <span class="text-sm font-medium text-slate-700">ธนาคาร</span>
          <input v-model="form.bank_name" type="text" class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none" placeholder="Bank Name" />
        </label>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="text-sm font-medium text-slate-700">เลขที่บัญชี</span>
          <input v-model="form.account_number" type="text" class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none" placeholder="1234567890" />
        </label>
        <label class="block">
          <span class="text-sm font-medium text-slate-700">ตั้งเป็นบัญชีหลัก</span>
          <div class="mt-2 flex items-center gap-2">
            <input id="primary-account" type="checkbox" v-model="form.is_primary" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <label for="primary-account" class="text-sm text-slate-700">ใช่</label>
          </div>
        </label>
      </div>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">ยอดเงินเริ่มต้น</span>
        <input v-model.number="form.balance" type="number" step="0.01" class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none" placeholder="0.00" />
      </label>

      <button type="submit" class="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">บันทึกบัญชี</button>
    </form>
    <div v-if="newAccount && !currentUserId" class="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      ต้องเข้าสู่ระบบก่อน เพื่อสร้างบัญชีธนาคารและตั้งบัญชีหลัก
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-sm text-slate-700">
        <thead class="border-b border-slate-200 text-slate-900">
          <tr>
            <th class="px-3 py-3">ID</th>
            <th class="px-3 py-3">ชื่อบัญชี</th>
            <th class="px-3 py-3">ธนาคาร</th>
            <th class="px-3 py-3">เลขที่บัญชี</th>
            <th class="px-3 py-3">สถานะ</th>
            <th class="px-3 py-3">ยอดเงิน</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="account in accounts" :key="account.id" class="border-b border-slate-100 hover:bg-slate-50">
            <td class="px-3 py-3">{{ account.id }}</td>
            <td class="px-3 py-3">{{ account.name }}</td>
            <td class="px-3 py-3">{{ account.bank_name || '-' }}</td>
            <td class="px-3 py-3">{{ account.account_number || '-' }}</td>
            <td class="px-3 py-3">
              <span v-if="account.is_primary" class="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">หลัก</span>
              <button
                v-else
                type="button"
                @click="setPrimary(account)"
                class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                ตั้งหลัก
              </button>
            </td>
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
import { ref, onMounted, watch } from 'vue';
import { fetchBankAccounts, createBankAccount, updateBankAccount } from '../api';

const { currentUserId } = defineProps({
  currentUserId: Number,
});

const accounts = ref([]);
const newAccount = ref(false);
const form = ref({ user_id: currentUserId || null, name: '', bank_name: '', account_number: '', balance: 0, is_primary: false });

const loadAccounts = async () => {
  const response = await fetchBankAccounts(currentUserId);
  if (response.success) accounts.value = response.data || [];
};

const setPrimary = async (account) => {
  if (!currentUserId) return;
  await updateBankAccount(account.id, { is_primary: true, user_id: currentUserId });
  await loadAccounts();
};

const submitAccount = async () => {
  if (!currentUserId) return;
  form.value.user_id = currentUserId;
  await createBankAccount(form.value);
  form.value = { user_id: currentUserId, name: '', bank_name: '', account_number: '', balance: 0, is_primary: false };
  newAccount.value = false;
  await loadAccounts();
};

const formatMoney = (value) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value);
};

watch(
  () => currentUserId,
  (newUserId) => {
    if (newUserId) {
      form.value.user_id = newUserId;
      loadAccounts();
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await loadAccounts();
});
</script>
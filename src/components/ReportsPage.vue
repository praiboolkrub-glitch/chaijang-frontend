<template>
  <div class="space-y-6">
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Reports</h2>
        <p class="mt-1 text-sm text-slate-500">สรุปยอดรายรับ รายจ่าย และยอดคงเหลือบัญชี</p>
      </div>

      <div class="mt-6 grid gap-4 sm:grid-cols-3">
        <div class="rounded-3xl bg-emerald-50 p-5">
          <div class="text-sm text-slate-500">รวมรายรับ</div>
          <div class="mt-3 text-2xl font-semibold text-emerald-700">{{ formatMoney(summary.income) }}</div>
        </div>
        <div class="rounded-3xl bg-rose-50 p-5">
          <div class="text-sm text-slate-500">รวมรายจ่าย</div>
          <div class="mt-3 text-2xl font-semibold text-rose-700">{{ formatMoney(summary.expense) }}</div>
        </div>
        <div class="rounded-3xl bg-sky-50 p-5">
          <div class="text-sm text-slate-500">ยอดคงเหลือสุทธิ</div>
          <div class="mt-3 text-2xl font-semibold text-sky-700">{{ formatMoney(summary.net) }}</div>
        </div>
      </div>
    </div>

    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-semibold text-slate-900">สรุปตามช่วงเวลา</h3>
          <p class="mt-1 text-sm text-slate-500">ดูรายรับ-รายจ่ายแยกตามวัน/สัปดาห์/เดือน</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-for="option in periodOptions"
            :key="option.value"
            @click="selectedPeriod = option.value"
            :class="[
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              selectedPeriod === option.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            ]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="mt-6 overflow-x-auto">
        <table class="min-w-full border-separate border-spacing-y-3 text-left text-sm">
          <thead>
            <tr>
              <th class="px-4 py-3 text-slate-500">ช่วงเวลา</th>
              <th class="px-4 py-3 text-slate-500">รายรับ</th>
              <th class="px-4 py-3 text-slate-500">รายจ่าย</th>
              <th class="px-4 py-3 text-slate-500">คงเหลือ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in periodSummary" :key="row.label" class="rounded-3xl bg-slate-50">
              <td class="px-4 py-4 font-medium text-slate-900">{{ row.label }}</td>
              <td class="px-4 py-4 text-emerald-700">{{ formatMoney(row.income) }}</td>
              <td class="px-4 py-4 text-rose-700">{{ formatMoney(row.expense) }}</td>
              <td class="px-4 py-4 text-sky-700">{{ formatMoney(row.net) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">สรุปตามหมวดหมู่</h3>
      <p class="mt-1 text-sm text-slate-500">ดูยอดรายรับ-รายจ่ายของแต่ละหมวดหมู่</p>

      <div class="mt-6 overflow-x-auto">
        <table class="min-w-full border-separate border-spacing-y-3 text-left text-sm">
          <thead>
            <tr>
              <th class="px-4 py-3 text-slate-500">หมวดหมู่</th>
              <th class="px-4 py-3 text-slate-500">รายรับ</th>
              <th class="px-4 py-3 text-slate-500">รายจ่าย</th>
              <th class="px-4 py-3 text-slate-500">คงเหลือ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in categorySummary" :key="row.category" class="rounded-3xl bg-slate-50">
              <td class="px-4 py-4 font-medium text-slate-900">{{ row.category }}</td>
              <td class="px-4 py-4 text-emerald-700">{{ formatMoney(row.income) }}</td>
              <td class="px-4 py-4 text-rose-700">{{ formatMoney(row.expense) }}</td>
              <td class="px-4 py-4 text-sky-700">{{ formatMoney(row.net) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">ยอดเงินคงเหลือในบัญชี</h3>
      <div class="mt-4 grid gap-4 lg:grid-cols-[1.5fr_2fr]">
        <div class="rounded-3xl bg-slate-50 p-5">
          <div class="text-sm text-slate-500">ยอดเงินคงเหลือทั้งหมดในบ้าน</div>
          <div class="mt-3 text-2xl font-semibold text-slate-900">{{ formatMoney(accountTotal) }}</div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div v-for="account in accounts" :key="account.id" class="rounded-3xl bg-slate-50 p-5">
            <div class="text-sm text-slate-500">{{ account.name }}</div>
            <div class="mt-2 text-xl font-semibold text-slate-900">{{ formatMoney(account.balance) }}</div>
            <div class="mt-1 text-sm text-slate-500">{{ account.bank_name || 'ไม่มีธนาคาร' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, defineProps } from 'vue';
import { fetchTransactions, fetchBankAccounts } from '../api';

const transactions = ref([]);
const accounts = ref([]);
const selectedPeriod = ref('daily');

const periodOptions = [
  { value: 'daily', label: 'รายวัน' },
  { value: 'weekly', label: 'รายสัปดาห์' },
  { value: 'monthly', label: 'รายเดือน' },
];

const parseDate = (dateValue) => {
  const date = dateValue ? new Date(dateValue) : null;
  return Number.isNaN(date?.getTime()) ? new Date() : date;
};

const getPeriodLabel = (date, period) => {
  if (!date) return 'ไม่ระบุวันที่';
  const d = parseDate(date);

  if (period === 'weekly') {
    const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
    return `สัปดาห์ ${weekNo} / ${target.getUTCFullYear()}`;
  }

  if (period === 'monthly') {
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short' });
  }

  return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getPeriodSortKey = (date, period) => {
  const d = parseDate(date);
  if (period === 'weekly') {
    const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - day);
    const year = target.getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const weekNo = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
    return `${year}-${String(weekNo).padStart(2, '0')}`;
  }
  if (period === 'monthly') {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const groupTransactions = (groupKey) => {
  const grouped = new Map();

  transactions.value.forEach((tx) => {
    const label = getPeriodLabel(tx.expense_date, groupKey);
    const sortKey = getPeriodSortKey(tx.expense_date, groupKey);
    if (!grouped.has(label)) {
      grouped.set(label, { label, sortKey, income: 0, expense: 0, net: 0 });
    }
    const row = grouped.get(label);
    const amount = Number(tx.amount) || 0;
    if (tx.transaction_type === 'income') {
      row.income += amount;
    } else {
      row.expense += amount;
    }
    row.net = row.income - row.expense;
  });

  return Array.from(grouped.values()).sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1));
};

const periodSummary = computed(() => groupTransactions(selectedPeriod.value));

const categorySummary = computed(() => {
  const categoryMap = new Map();
  transactions.value.forEach((tx) => {
    const category = tx.category_name || 'ไม่ระบุหมวดหมู่';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, { category, income: 0, expense: 0, net: 0 });
    }
    const row = categoryMap.get(category);
    const amount = Number(tx.amount) || 0;
    if (tx.transaction_type === 'income') {
      row.income += amount;
    } else {
      row.expense += amount;
    }
    row.net = row.income - row.expense;
  });
  return Array.from(categoryMap.values()).sort((a, b) => b.net - a.net);
});

const summary = computed(() => {
  const income = transactions.value.reduce(
    (sum, item) => sum + (item.transaction_type === 'income' ? Number(item.amount) : 0),
    0,
  );
  const expense = transactions.value.reduce(
    (sum, item) => sum + (item.transaction_type === 'expense' ? Number(item.amount) : 0),
    0,
  );
  return {
    income,
    expense,
    net: income - expense,
  };
});

const props = defineProps({
  householdId: Number,
});

const loadData = async () => {
  const [txResponse, accountResponse] = await Promise.all([
    fetchTransactions(props.householdId),
    props.householdId ? fetchBankAccounts(undefined, props.householdId) : Promise.resolve({ success: true, data: [] }),
  ]);
  if (txResponse.success) transactions.value = txResponse.data || [];
  if (accountResponse.success) accounts.value = accountResponse.data || [];
};

const accountTotal = computed(() =>
  accounts.value.reduce((sum, account) => sum + Number(account.balance || 0), 0),
);

const formatMoney = (value) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value);
};

onMounted(loadData);
</script>
<template>
  <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">รายการธุรกรรม</h2>
        <p class="mt-1 text-sm text-slate-500">รายการรายรับและรายจ่ายล่าสุด</p>
      </div>
      <span class="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
        จำนวนทั้งหมด {{ transactions.length }} รายการ
      </span>
    </div>

    <div class="space-y-4">
      <div v-if="transactions.length === 0" class="rounded-3xl bg-slate-50 p-6 text-center text-sm text-slate-500">
        ไม่มีข้อมูล
      </div>

      <div class="space-y-4 sm:hidden">
        <div
          v-for="item in transactions"
          :key="item.id"
          class="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
        >
          <div class="flex items-center justify-between gap-4">
            <span class="text-sm font-semibold text-slate-900">{{ item.expense_date }}</span>
            <span
              :class="[
                'rounded-full px-3 py-1 text-xs font-semibold',
                item.transaction_type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
              ]"
            >
              {{ item.transaction_type }}
            </span>
          </div>
          <div class="mt-3 space-y-2 text-sm text-slate-700">
            <div class="flex items-center justify-between gap-2">
              <span class="font-medium">หัวข้อ</span>
              <span>{{ item.title }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="font-medium">หมวด</span>
              <span>{{ item.category_name || '-' }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="font-medium">บัญชี</span>
              <span>{{ item.bank_account_name || '-' }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="font-medium">ผู้ใช้</span>
              <span>{{ item.user_name || '-' }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="font-medium">จำนวน</span>
              <span class="text-slate-900">{{ formatMoney(item.amount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="hidden sm:block overflow-x-auto">
        <table class="min-w-full text-left text-sm text-slate-700">
          <thead class="border-b border-slate-200 text-slate-900">
            <tr>
              <th class="px-3 py-3">วันที่</th>
              <th class="px-3 py-3">หัวข้อ</th>
              <th class="px-3 py-3">ผู้ใช้</th>
              <th class="px-3 py-3">ประเภท</th>
              <th class="px-3 py-3">บัญชี</th>
              <th class="px-3 py-3">จำนวน</th>
              <th class="px-3 py-3">หมวด</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in transactions" :key="item.id" class="border-b border-slate-100 hover:bg-slate-50">
              <td class="px-3 py-3">{{ item.expense_date }}</td>
              <td class="px-3 py-3">{{ item.title || '-' }}</td>
              <td class="px-3 py-3">{{ item.user_name || '-' }}</td>
              <td class="px-3 py-3 capitalize">{{ item.transaction_type }}</td>
              <td class="px-3 py-3">{{ item.bank_account_name || '-' }}</td>
              <td class="px-3 py-3">{{ formatMoney(item.amount) }}</td>
              <td class="px-3 py-3">{{ item.category_name || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  transactions: Array,
});

const formatMoney = (value) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(value);
};
</script>

<template>
  <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Households</h2>
        <p class="mt-1 text-sm text-slate-500">จัดการครอบครัวและสมาชิกในกลุ่ม</p>
      </div>
      <button
        class="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        @click="newHousehold = !newHousehold"
      >
        {{ newHousehold ? 'ปิดแบบฟอร์ม' : 'สร้าง Household' }}
      </button>
    </div>

    <form v-if="newHousehold" @submit.prevent="submitHousehold" class="mb-6 space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-5">
      <div>
        <label class="block text-sm font-medium text-slate-700">ชื่อครอบครัว</label>
        <input v-model="form.name" type="text" class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none" placeholder="Family Name" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700">คำอธิบาย</label>
        <textarea v-model="form.description" rows="3" class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none" placeholder="รายละเอียด"></textarea>
      </div>
      <button type="submit" class="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">บันทึก Household</button>
    </form>

    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-sm text-slate-700">
        <thead class="border-b border-slate-200 text-slate-900">
          <tr>
            <th class="px-3 py-3">ID</th>
            <th class="px-3 py-3">ชื่อ</th>
            <th class="px-3 py-3">คำอธิบาย</th>
            <th class="px-3 py-3">วันที่สร้าง</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="household in households" :key="household.id" class="border-b border-slate-100 hover:bg-slate-50">
            <td class="px-3 py-3">{{ household.id }}</td>
            <td class="px-3 py-3">{{ household.name }}</td>
            <td class="px-3 py-3">{{ household.description || '-' }}</td>
            <td class="px-3 py-3">{{ formatDate(household.created_at) }}</td>
          </tr>
          <tr v-if="households.length === 0">
            <td colspan="4" class="px-3 py-6 text-center text-slate-500">ยังไม่มี Household</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchHouseholds, createHousehold } from '../api';

const households = ref([]);
const newHousehold = ref(false);
const form = ref({ name: '', description: '' });

const loadHouseholds = async () => {
  const response = await fetchHouseholds();
  if (response.success) households.value = response.data || [];
};

const submitHousehold = async () => {
  await createHousehold(form.value);
  form.value = { name: '', description: '' };
  newHousehold.value = false;
  await loadHouseholds();
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('th-TH');
};

onMounted(loadHouseholds);
</script>
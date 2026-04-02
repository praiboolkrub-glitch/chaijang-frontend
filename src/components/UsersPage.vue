<template>
  <div class="rounded-3xl bg-white p-6 shadow-sm">
    <h2 class="text-xl font-semibold text-slate-900">{{ existingUser ? 'เลือก Household เพื่อใช้งานต่อ' : 'Create User' }}</h2>
    <p class="mt-2 text-sm text-slate-500">
      สำหรับ LINE LIFF จะดึง LINE MID ให้โดยอัตโนมัติ
      <span v-if="existingUser">และผูกบัญชีกับ household ที่เลือก</span>
      <span v-else>ผู้ใช้เพียงเลือก household ครั้งแรกเท่านั้น</span>
    </p>

    <form @submit.prevent="handleSubmit" class="mt-6 space-y-5">
      <div>
        <label class="block text-sm font-medium text-slate-700">Household</label>
        <select
          v-model="form.household_id"
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
          required
        >
          <option value="">เลือก household</option>
          <option v-for="household in households" :key="household.id" :value="household.id">
            {{ household.name }}
          </option>
        </select>
      </div>

      <button
        type="submit"
        class="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        ลงทะเบียนผู้ใช้ใหม่
      </button>
    </form>

    <div class="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
      <p>LINE MID จะถูกส่งจาก LIFF ไปยัง API โดยอัตโนมัติในฝั่ง client.</p>
      <p class="mt-2 text-xs text-slate-500">ถ้าไม่มี LINE MID ให้ระบบสร้างบัญชีด้วย username อัตโนมัติเมื่อมีข้อมูล LINE MID เข้ามา</p>
    </div>

    <div v-if="message" class="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
      {{ message }}
    </div>

    <div v-if="createdUser" class="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800">
      <h3 class="font-semibold">สร้างสำเร็จ</h3>
      <p class="mt-2">ID: {{ createdUser.id }}</p>
      <p>Username: {{ createdUser.username }}</p>
      <p v-if="createdUser.line_mid">LINE MID: {{ createdUser.line_mid }}</p>
      <p v-if="createdUser.household_id">Household ID: {{ createdUser.household_id }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { createUser, fetchHouseholds, updateUser } from '../api';

const props = defineProps({
  lineMid: {
    type: String,
    default: 'grnjvgml[o',
  },
  lineProfile: {
    type: Object,
    default: () => ({ displayName: '', pictureUrl: '' }),
  },
  existingUser: {
    type: Object,
    default: null,
  },
});
const emits = defineEmits(['userReady']);

const form = ref({
  household_id: '',
});
const households = ref([]);
const message = ref('');
const createdUser = ref(null);

const loadHouseholds = async () => {
  try {
    const res = await fetchHouseholds();
    households.value = res.data || [];
  } catch (err) {
    console.error(err);
  }
};

const handleSubmit = async () => {
  message.value = '';
  createdUser.value = null;

  const payload = {
    household_id: form.value.household_id || undefined,
    line_mid: props.lineMid || undefined,
    display_name: props.lineProfile?.displayName || undefined,
    profile_picture: props.lineProfile?.pictureUrl || undefined,
  };

  try {
    let response;
    if (props.existingUser && props.existingUser.id) {
      response = await updateUser(props.existingUser.id, payload);
    } else {
      response = await createUser(payload);
    }

    if (response.success) {
      createdUser.value = response.data;
      message.value = 'บันทึกผู้ใช้เรียบร้อยแล้ว';
      form.value.household_id = '';
      emits('userReady', response.data);
    } else {
      message.value = response.message || 'ไม่สามารถบันทึกผู้ใช้ได้';
    }
  } catch (err) {
    console.error(err);
    message.value = 'เกิดข้อผิดพลาดในการบันทึกผู้ใช้';
  }
};

onMounted(async () => {
  await loadHouseholds();
});
</script>

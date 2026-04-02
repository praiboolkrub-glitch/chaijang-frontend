<template>
  <div class="space-y-6">
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">จัดการหมวดหมู่</h2>
          <p class="mt-1 text-sm text-slate-500">สร้าง แก้ไข ลบหมวดหมู่สำหรับรายรับ/รายจ่าย</p>
        </div>
        <button
          @click="resetForm"
          class="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          สร้างหมวดหมู่ใหม่
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="mt-6 grid gap-4 sm:grid-cols-3">
        <label class="block">
          <span class="text-sm font-medium text-slate-700">ชื่อหมวดหมู่</span>
          <input
            v-model="form.name"
            type="text"
            class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            placeholder="ชื่อหมวดหมู่"
            required
          />
        </label>
        <label class="block">
          <span class="text-sm font-medium text-slate-700">ประเภท</span>
          <select
            v-model="form.transaction_type"
            class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          >
            <option value="expense">ใช้จ่าย</option>
            <option value="income">เงินเข้า</option>
          </select>
        </label>
        <label class="block sm:col-span-2">
          <span class="text-sm font-medium text-slate-700">คำอธิบาย</span>
          <input
            v-model="form.description"
            type="text"
            class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            placeholder="คำอธิบายสั้น ๆ"
          />
        </label>

        <div class="sm:col-span-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            class="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {{ form.id ? 'อัปเดตหมวดหมู่' : 'บันทึกหมวดหมู่' }}
          </button>
          <span v-if="message" class="text-sm text-slate-600">{{ message }}</span>
        </div>
      </form>
    </div>

    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">รายการหมวดหมู่</h3>
      <div class="mt-4 overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500">
              <th class="px-4 py-3">ชื่อ</th>
              <th class="px-4 py-3">ประเภท</th>
              <th class="px-4 py-3">คำอธิบาย</th>
              <th class="px-4 py-3">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category.id" class="border-b border-slate-100 hover:bg-slate-50">
              <td class="px-4 py-4 font-medium text-slate-900">{{ category.name }}</td>
              <td class="px-4 py-4 text-slate-600 capitalize">{{ category.transaction_type || 'expense' }}</td>
              <td class="px-4 py-4 text-slate-600">{{ category.description || '-' }}</td>
              <td class="px-4 py-4 text-sm text-slate-700">
                <button
                  @click="editCategory(category)"
                  class="mr-3 rounded-full bg-slate-100 px-3 py-2 hover:bg-slate-200"
                >แก้ไข</button>
                <button
                  @click="deleteCategoryItem(category.id)"
                  class="rounded-full bg-rose-100 px-3 py-2 text-rose-700 hover:bg-rose-200"
                >ลบ</button>
              </td>
            </tr>
            <tr v-if="categories.length === 0">
              <td colspan="4" class="px-4 py-6 text-center text-slate-500">ยังไม่มีหมวดหมู่</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../api';

const categories = ref([]);
const form = ref({ id: null, name: '', description: '', transaction_type: 'expense' });
const message = ref('');

const loadCategories = async () => {
  try {
    const res = await fetchCategories();
    categories.value = res.data || [];
  } catch (err) {
    console.error(err);
    message.value = 'ไม่สามารถโหลดหมวดหมู่ได้';
  }
};

const resetForm = () => {
  form.value = { id: null, name: '', description: '', transaction_type: 'expense' };
  message.value = '';
};

const handleSubmit = async () => {
  message.value = '';
  try {
    let res;
    if (form.value.id) {
      res = await updateCategory(form.value.id, {
        name: form.value.name,
        description: form.value.description,
        transaction_type: form.value.transaction_type,
      });
    } else {
      res = await createCategory({
        name: form.value.name,
        description: form.value.description,
        transaction_type: form.value.transaction_type,
      });
    }

    if (res.success) {
      message.value = form.value.id ? 'อัปเดตหมวดหมู่เรียบร้อยแล้ว' : 'สร้างหมวดหมู่เรียบร้อยแล้ว';
      await loadCategories();
      resetForm();
    } else {
      message.value = res.message || 'เกิดข้อผิดพลาด';
    }
  } catch (err) {
    console.error(err);
    message.value = 'ไม่สามารถบันทึกหมวดหมู่ได้';
  }
};

const editCategory = (category) => {
  form.value = {
    id: category.id,
    name: category.name,
    description: category.description,
    transaction_type: category.transaction_type || 'expense',
  };
  message.value = 'แก้ไขหมวดหมู่: ปรับข้อมูลและกดบันทึก';
};

const deleteCategoryItem = async (id) => {
  if (!confirm('ต้องการลบหมวดหมู่นี้ใช่หรือไม่?')) return;
  try {
    const res = await deleteCategory(id);
    if (res.success) {
      message.value = 'ลบหมวดหมู่เรียบร้อยแล้ว';
      await loadCategories();
    } else {
      message.value = res.message || 'ไม่สามารถลบหมวดหมู่ได้';
    }
  } catch (err) {
    console.error(err);
    message.value = 'เกิดข้อผิดพลาดในการลบหมวดหมู่';
  }
};

onMounted(loadCategories);
</script>

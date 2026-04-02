<template>
  <div class="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-8">
    <div class="mx-auto w-full max-w-screen-xl">
      <header class="mb-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-sky-500 px-6 py-8 sm:px-8 sm:py-10 text-white shadow-xl">
        <div class="flex flex-wrap items-center gap-4">
          <div class="h-14 w-14 overflow-hidden rounded-full bg-slate-200">
            <img
              v-if="currentUser?.profile_picture"
              :src="currentUser.profile_picture"
              alt="User avatar"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center text-slate-500">👤</div>
          </div>
          <div>
            <p class="text-sm text-slate-100">สวัสดี</p>
            <h1 class="text-3xl font-semibold">
              {{ currentUser?.display_name || currentUser?.username || 'Expense Tracker' }}
            </h1>
          </div>
        </div>
        <p class="mt-3 max-w-2xl text-slate-100">ระบบบันทึกรายรับ-รายจ่าย พร้อมจัดการ household, bank account, transaction และรายงาน</p>
      </header>

      <div class="space-y-8">
        <div v-if="!loginChecked" class="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
          {{ statusMessage }}
        </div>

        <UsersPage
          v-else-if="!currentUser"
          :lineMid="lineMid"
          :lineProfile="lineProfile"
          :existingUser="pendingUser"
          @userReady="handleUserReady"
        />

        <div v-else>
          <div class="mb-8 rounded-3xl bg-white p-4 shadow-sm">
            <div class="flex flex-wrap items-center gap-3">
              <button
                v-for="page in visiblePages"
                :key="page.key"
                @click="currentPage = page.key"
                :class="[
                  'rounded-full px-5 py-2 text-sm font-semibold transition',
                  currentPage === page.key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                ]"
              >
                {{ page.label }}
              </button>
            </div>
          </div>

          <TransactionsPage
            v-if="currentPage === 'transactions'"
            :categories="categories"
            :bankAccounts="bankAccounts"
            :transactions="transactions"
            :currentUserId="currentUser.id"
            @submit="handleCreateTransaction"
          />

          <HouseholdsPage v-if="currentPage === 'households'" />
          <AccountsPage v-if="currentPage === 'accounts'" :currentUserId="currentUser ? currentUser.id : null" />
          <CategoriesPage v-if="currentPage === 'categories'" />
          <UsersPage v-if="currentPage === 'users'" :lineMid="lineMid" :lineProfile="lineProfile" :existingUser="currentUser" @userReady="handleUserReady" />
          <ReportsPage v-if="currentPage === 'reports'" :householdId="currentUser?.household_id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import TransactionsPage from './components/TransactionsPage.vue';
import HouseholdsPage from './components/HouseholdsPage.vue';
import AccountsPage from './components/AccountsPage.vue';
import ReportsPage from './components/ReportsPage.vue';
import UsersPage from './components/UsersPage.vue';
import CategoriesPage from './components/CategoriesPage.vue';
import {
  fetchCategories,
  fetchBankAccounts,
  fetchTransactions,
  createTransaction,
  fetchUserByLineMid,
} from './api';

const pages = [
  { key: 'transactions', label: 'Transactions' },
  { key: 'households', label: 'Households' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'categories', label: 'Categories' },
  { key: 'users', label: 'Users' },
  { key: 'reports', label: 'Reports' },
];
const visiblePages = computed(() =>
  pages.filter(
    (page) =>
      page.key !== 'users' || !currentUser.value?.line_mid || !currentUser.value?.household_id
  )
);
const currentPage = ref('transactions');
const categories = ref([]);
const bankAccounts = ref([]);
const transactions = ref([]);
const statusMessage = ref('กำลังโหลดข้อมูล...');
const lineMid = ref(''); // Default MID for testing
const lineProfile = ref({ displayName: '', pictureUrl: '' });
const currentUser = ref(null);
const pendingUser = ref(null);
const loginChecked = ref(false);

const LIFF_ID = import.meta.env.VITE_LIFF_ID || 'YOUR_LIFF_ID';

const loadLiffScript = () => {
  return new Promise((resolve, reject) => {
    if (globalThis.liff) {
      return resolve();
    }

    const existingScript = document.querySelector('script[data-liff-sdk]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load LIFF SDK')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://static.line-scdn.net/liff/edge/2.1/sdk.js';
    script.dataset.liffSdk = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load LIFF SDK'));
    document.head.appendChild(script);
  });
};

const initLiff = async () => {
  try {
    await loadLiffScript();

    if (!globalThis.liff || typeof globalThis.liff.init !== 'function') {
      throw new Error('LIFF SDK not available');
    }

    await globalThis.liff.init({ liffId: LIFF_ID });

    if (typeof globalThis.liff.isLoggedIn === 'function' && !globalThis.liff.isLoggedIn()) {
      globalThis.liff.login();
      return false;
    }

    return true;
  } catch (error) {
    console.warn('LIFF initialization failed', error);
    return false;
  }
};

const loadLineMid = async () => {
  let mid = '1234';
  lineProfile.value = { displayName: '', pictureUrl: '' };

  if (globalThis.liff && typeof globalThis.liff.getProfile === 'function') {
    try {
      const profile = await globalThis.liff.getProfile();
      if (profile?.userId) {
        mid = profile.userId;
      }
      lineProfile.value = {
        displayName: profile?.displayName || '',
        pictureUrl: profile?.pictureUrl || '',
      };
    } catch (err) {
      console.warn('LIFF profile not available', err);
    }
  }

  lineMid.value = mid;
  return mid;
};

const loadData = async () => {
  try {
    const [categoriesResponse, bankResponse] = await Promise.all([
      fetchCategories(),
      currentUser.value?.id ? fetchBankAccounts(currentUser.value.id) : Promise.resolve({ success: true, data: [] }),
    ]);
    categories.value = categoriesResponse.data || [];
    bankAccounts.value = bankResponse.data || [];
  } catch (error) {
    console.error(error);
    statusMessage.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
  }
};

const loadTransactions = async () => {
  try {
    const response = await fetchTransactions(currentUser.value?.household_id);
    transactions.value = response.data || [];
    statusMessage.value = 'ระบบพร้อมใช้งาน';
  } catch (error) {
    console.error(error);
    statusMessage.value = 'เกิดข้อผิดพลาดในการโหลดธุรกรรม';
  }
};

const handleCreateTransaction = async (payload) => {
  try {
    const response = await createTransaction(payload);
    if (response.success) {
      await loadTransactions();
      statusMessage.value = 'บันทึกรายการเรียบร้อยแล้ว';
    } else {
      statusMessage.value = response.message || 'ไม่สามารถบันทึกรายการได้';
    }
  } catch (error) {
    console.error(error);
    statusMessage.value = 'เกิดข้อผิดพลาดในการบันทึกรายการ';
  }
};

const checkCurrentUser = async () => {
  statusMessage.value = 'กำลังตรวจสอบผู้ใช้...';
  const mid = await loadLineMid();
  try {
    const response = await fetchUserByLineMid(mid);
    if (response.success && response.data) {
      const userData = {
        ...response.data,
        display_name: response.data.display_name || lineProfile.value.displayName,
        profile_picture: response.data.profile_picture || lineProfile.value.pictureUrl,
      };
      if (response.data.household_id) {
        currentUser.value = userData;
        statusMessage.value = `ยินดีต้อนรับ ${userData.display_name || userData.username}`;
        currentPage.value = 'transactions';
        await loadData();
        await loadTransactions();
      } else {
        pendingUser.value = userData;
        statusMessage.value = 'กรุณาเลือก household ก่อนใช้งาน';
        currentPage.value = 'users';
      }
    } else {
      statusMessage.value = 'กรุณาสมัครและเลือก household ก่อนใช้งาน';
      currentPage.value = 'users';
    }
  } catch (err) {
    console.error(err);
    statusMessage.value = 'ไม่สามารถตรวจสอบผู้ใช้ได้';
    currentPage.value = 'users';
  }
  loginChecked.value = true;
};

const handleUserReady = async (user) => {
  currentUser.value = user;
  pendingUser.value = null;
  currentPage.value = 'transactions';
  statusMessage.value = `ยินดีต้อนรับ ${user.username || 'ผู้ใช้ใหม่'}`;
  await loadData();
  await loadTransactions();
};

onMounted(async () => {
  await initLiff();
  await checkCurrentUser();
});
</script>

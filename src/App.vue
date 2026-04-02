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
            <div class="flex-1 min-w-0">
              <p class="text-sm text-slate-100">สวัสดี</p>
              <h1 class="text-3xl font-semibold">
                {{ currentUser?.display_name || currentUser?.username || 'Expense Tracker' }}
              </h1>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-between gap-4">
            <div class="grid w-full gap-4 sm:grid-cols-2">
              <div class="rounded-3xl bg-slate-50 p-4 text-slate-900">
                <div class="text-sm text-slate-500">ยอดค่าใช้จ่ายรวม</div>
                <div class="mt-3 text-2xl font-semibold text-rose-700">
                  {{ showHeaderTotals ? formatMoney(headerExpenseTotal) : '•••' }}
                </div>
              </div>
              <div class="rounded-3xl bg-slate-50 p-4 text-slate-900">
                <div class="text-sm text-slate-500">ยอดคงเหลือสุทธิ</div>
                <div class="mt-3 text-2xl font-semibold text-sky-700">
                  {{ showHeaderTotals ? formatMoney(headerNetTotal) : '•••' }}
                </div>
              </div>
            </div>
            <button
              type="button"
              @click="showHeaderTotals = !showHeaderTotals"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
              :aria-label="showHeaderTotals ? 'ซ่อนยอด' : 'แสดงยอด'"
            >
              <span aria-hidden="true">{{ showHeaderTotals ? '👁️' : '🙈' }}</span>
            </button>
          </div>
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
                @click="navigateToPage(page.key)"
                :class="[
                  'rounded-full px-5 py-2 text-sm font-semibold transition',
                  currentPage === page.key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                ]"
              >
                {{ page.label }}
              </button>
            </div>
          </div>

          <div v-if="currentPage === 'transactions'">
            <TransactionsPage
              :categories="categories"
              :bankAccounts="bankAccounts"
              :transactions="transactions"
              :currentUserId="currentUser.id"
              @submit="handleCreateTransaction"
            />
          </div>

          <div v-else-if="currentPage === 'expense' || currentPage === 'income'">
            <div class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-4 shadow-sm">
              <div>
                <p class="text-sm text-slate-500">บันทึกรายการ</p>
                <h2 class="text-xl font-semibold text-slate-900">
                  {{ currentPage === 'income' ? 'ลงบันทึกรายรับ' : 'ลงบันทึกรายจ่าย' }}
                </h2>
              </div>
              <button
                type="button"
                @click="navigateToPage('transactions')"
                class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                กลับไปหน้าหลัก
              </button>
            </div>
            <TransactionsPage
              :categories="categories"
              :bankAccounts="bankAccounts"
              :transactions="transactions"
              :currentUserId="currentUser.id"
              :defaultTransactionType="currentPage"
              @submit="handleCreateTransaction"
            />
          </div>

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
const entryPages = ['expense', 'income'];
const validPages = [...pages.map((page) => page.key), ...entryPages];
const visiblePages = computed(() =>
  pages.filter(
    (page) =>
      page.key !== 'users' || !currentUser.value?.line_mid || !currentUser.value?.household_id
  )
);
const currentPage = ref('transactions');
const categories = ref([]);
const bankAccounts = ref([]);
const householdAccounts = ref([]);
const transactions = ref([]);
const statusMessage = ref('กำลังโหลดข้อมูล...');
const lineMid = ref(''); // Default MID for testing
const lineProfile = ref({ displayName: '', pictureUrl: '' });
const showHeaderTotals = ref(true);
const currentUser = ref(null);
const pendingUser = ref(null);
const loginChecked = ref(false);

const LIFF_ID = import.meta.env.VITE_LIFF_ID || 'YOUR_LIFF_ID';
if (!import.meta.env.VITE_LIFF_ID || LIFF_ID === 'YOUR_LIFF_ID') {
  console.warn('VITE_LIFF_ID is not configured. LIFF initialization will fail unless you set the real LIFF ID.');
}

const loadLiffScript = () => {
  return new Promise((resolve, reject) => {
    if (globalThis.liff) {
      return resolve();
    }

    const existingScript =
      document.querySelector('script[data-liff-sdk]') ||
      Array.from(document.scripts).find((script) =>
        script.src?.includes('https://static.line-scdn.net/liff/edge/2.1/sdk.js')
      );

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
    const liffInitResult = await globalThis.liff.init({ liffId: LIFF_ID });
    console.log('LIFF initialized', liffInitResult);
    // if (typeof globalThis.liff.isLoggedIn === 'function' && !globalThis.liff.isLoggedIn()) {
    //   globalThis.liff.login();
    //   return false;
    // }

    return true;
  } catch (error) {
    console.warn('LIFF initialization failed', error);
    return false;
  }
};

const loadLineMid = async () => {
  let mid = '';
  lineProfile.value = { displayName: '', pictureUrl: '' };
  console.log('Initializing LIFF with ID 1:', LIFF_ID);
  if (globalThis.liff && typeof globalThis.liff.getProfile === 'function') {
    console.log('Initializing LIFF with ID:', LIFF_ID);
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
    const [categoriesResponse, bankResponse, householdBankResponse] = await Promise.all([
      fetchCategories(),
      currentUser.value?.id ? fetchBankAccounts(currentUser.value.id) : Promise.resolve({ success: true, data: [] }),
      currentUser.value?.household_id ? fetchBankAccounts(undefined, currentUser.value.household_id) : Promise.resolve({ success: true, data: [] }),
    ]);
    categories.value = categoriesResponse.data || [];
    bankAccounts.value = bankResponse.data || [];
    householdAccounts.value = householdBankResponse.data || [];
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

const routeToPage = (path) => {
  const pageKey = String(path || '')
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();
  if (!pageKey || pageKey === 'transactions') return 'transactions';
  return validPages.includes(pageKey) ? pageKey : 'transactions';
};

const pathForPage = (page) => {
  if (page === 'transactions') return '/';
  return `/${page}`;
};

const navigateToPage = (page) => {
  if (!validPages.includes(page)) {
    page = 'transactions';
  }
  currentPage.value = page;
  if (window && window.history && typeof window.history.pushState === 'function') {
    window.history.pushState({ page }, '', pathForPage(page));
  }
};

const setPageFromPath = () => {
  currentPage.value = routeToPage(window.location.pathname);
  if (window && window.history && typeof window.history.replaceState === 'function') {
    window.history.replaceState({ page: currentPage.value }, '', pathForPage(currentPage.value));
  }
};

const handlePopState = () => {
  currentPage.value = routeToPage(window.location.pathname);
};

const lockPortraitOrientation = async () => {
  try {
    if (screen?.orientation?.lock) {
      await screen.orientation.lock('portrait');
    } else if (screen?.lockOrientation) {
      screen.lockOrientation('portrait');
    } else if (screen?.mozLockOrientation) {
      screen.mozLockOrientation('portrait');
    } else if (screen?.msLockOrientation) {
      screen.msLockOrientation('portrait');
    }
  } catch (error) {
    console.warn('Unable to lock portrait orientation', error);
  }
};

const formatMoney = (value) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(value);
};

const headerExpenseTotal = computed(() =>
  transactions.value.reduce(
    (sum, item) => sum + (item.transaction_type === 'expense' ? Number(item.amount) : 0),
    0,
  ),
);

const headerNetTotal = computed(() =>
  transactions.value.reduce(
    (sum, item) => sum + (item.transaction_type === 'income' ? Number(item.amount) : -Number(item.amount)),
    0,
  ),
);

const householdAccountBalanceTotal = computed(() =>
  householdAccounts.value.reduce((sum, account) => sum + Number(account.balance || 0), 0),
);

const createFlexTransactionMessage = (transaction) => {
  const typeLabel = transaction.transaction_type === 'income' ? 'เงินเข้า' : 'เงินออก';
  const amountLabel = formatMoney(Number(transaction.amount) || 0);
  const categoryName =
    categories.value.find((category) => String(category.id) === String(transaction.category_id))?.name ||
    transaction.category_name ||
    '-';
  const bankName =
    bankAccounts.value.find((account) => String(account.id) === String(transaction.bank_account_id))?.name ||
    transaction.bank_account_name ||
    '-';
  const dateLabel = new Date(transaction.expense_date || new Date()).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return {
    type: 'flex',
    altText: `${typeLabel} ${amountLabel}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: typeLabel,
            weight: 'bold',
            size: 'lg',
            color: transaction.transaction_type === 'income' ? '#0f766e' : '#b91c1c',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'text',
            text: titleCase(transaction.title || '-'),
            weight: 'bold',
            size: 'md',
            wrap: true,
          },
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              { type: 'text', text: 'วันที่', color: '#64748b', size: 'sm', flex: 2 },
              { type: 'text', text: dateLabel, color: '#0f172a', size: 'sm', flex: 3 },
            ],
          },
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              { type: 'text', text: 'หมวดหมู่', color: '#64748b', size: 'sm', flex: 2 },
              { type: 'text', text: categoryName, color: '#0f172a', size: 'sm', flex: 3 },
            ],
          },
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              { type: 'text', text: 'บัญชี', color: '#64748b', size: 'sm', flex: 2 },
              { type: 'text', text: bankName, color: '#0f172a', size: 'sm', flex: 3 },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: amountLabel,
            weight: 'bold',
            size: 'xl',
            color: transaction.transaction_type === 'income' ? '#0f766e' : '#b91c1c',
            align: 'end',
          },
        ],
      },
    },
  };
};

const titleCase = (text) => {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const sendLineTransactionNotification = async (transaction) => {
  if (!globalThis.liff || typeof globalThis.liff.sendMessages !== 'function') {
    return;
  }
  try {
    await globalThis.liff.sendMessages([createFlexTransactionMessage(transaction)]);
  } catch (err) {
    console.warn('ส่งข้อความ LINE ไม่ได้', err);
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
        if (!entryPages.includes(currentPage.value)) {
          currentPage.value = 'transactions';
        }
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
  if (!entryPages.includes(currentPage.value)) {
    currentPage.value = 'transactions';
  }
  statusMessage.value = `ยินดีต้อนรับ ${user.username || 'ผู้ใช้ใหม่'}`;
  await loadData();
  await loadTransactions();
};

onMounted(async () => {
  setPageFromPath();
  window.addEventListener('popstate', handlePopState);
  await initLiff();
  await lockPortraitOrientation();
  await checkCurrentUser();
});
</script>

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const jsonOptions = (body) => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const fetchCategories = async () => {
  const response = await fetch(`${baseUrl}/api/categories`);
  return response.json();
};

export const fetchHouseholds = async () => {
  const response = await fetch(`${baseUrl}/api/households`);
  return response.json();
};

export const createCategory = async (payload) => {
  const response = await fetch(`${baseUrl}/api/categories`, {
    method: 'POST',
    ...jsonOptions(payload),
  });
  return response.json();
};

export const updateCategory = async (id, payload) => {
  const response = await fetch(`${baseUrl}/api/categories/${id}`, {
    method: 'PUT',
    ...jsonOptions(payload),
  });
  return response.json();
};

export const deleteCategory = async (id) => {
  const response = await fetch(`${baseUrl}/api/categories/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const fetchBankAccounts = async () => {
  const response = await fetch(`${baseUrl}/api/bank-accounts`);
  return response.json();
};

export const fetchTransactions = async () => {
  const response = await fetch(`${baseUrl}/api/transactions`);
  return response.json();
};

export const fetchUserByLineMid = async (lineMid) => {
  const response = await fetch(`${baseUrl}/api/users/line/${encodeURIComponent(lineMid)}`);
  return response.json();
};

export const updateUser = async (userId, payload) => {
  const response = await fetch(`${baseUrl}/api/users/${userId}`, {
    method: 'PUT',
    ...jsonOptions(payload),
  });
  return response.json();
};

export const createHousehold = async (payload) => {
  const response = await fetch(`${baseUrl}/api/households`, {
    method: 'POST',
    ...jsonOptions(payload),
  });
  return response.json();
};

export const createBankAccount = async (payload) => {
  const response = await fetch(`${baseUrl}/api/bank-accounts`, {
    method: 'POST',
    ...jsonOptions(payload),
  });
  return response.json();
};

export const createTransaction = async (payload) => {
  const response = await fetch(`${baseUrl}/api/expenses`, {
    method: 'POST',
    ...jsonOptions(payload),
  });
  return response.json();
};

export const createUser = async (payload) => {
  const response = await fetch(`${baseUrl}/api/users`, {
    method: 'POST',
    ...jsonOptions(payload),
  });
  return response.json();
};

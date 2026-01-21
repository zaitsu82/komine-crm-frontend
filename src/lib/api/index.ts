/**
 * API統合レイヤーのエントリーポイント
 */

// 型のエクスポート
export * from './types';

// クライアントユーティリティのエクスポート
export {
  API_CONFIG,
  shouldUseMockData,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
} from './client';

// 認証APIのエクスポート
export {
  login,
  logout,
  getCurrentUser,
  changePassword,
  isAuthenticated,
} from './auth';

// 顧客APIのエクスポート
export {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  terminateCustomer,
  getAllCustomersSync,
  searchCustomersSync,
} from './customers';

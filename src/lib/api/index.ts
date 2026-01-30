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
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
  getTokenExpiresAt,
  setTokenExpiresAt,
  clearTokenExpiresAt,
  clearAllTokens,
  isTokenExpiringSoon,
  isTokenExpired,
} from './client';

// 認証APIのエクスポート
export {
  login,
  logout,
  getCurrentUser,
  changePassword,
  isAuthenticated,
  refreshAccessToken,
  initializeTokenRefresh,
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

// マスタAPIのエクスポート
export {
  getAllMasters,
  getCemeteryTypes,
  getPaymentMethods,
  getTaxTypes,
  getCalcTypes,
  getBillingTypes,
  getAccountTypes,
  getRecipientTypes,
  getConstructionTypes,
} from './masters';
export type { MasterItem, TaxTypeMasterItem, AllMastersData } from './masters';

// スタッフAPIのエクスポート
export {
  getStaffList,
  getStaffById,
  updateStaff,
  deleteStaff,
  toggleStaffActive,
  ROLE_LABELS,
} from './staff';
export type {
  StaffRole,
  StaffListItem,
  StaffDetail,
  StaffListResponse,
  UpdateStaffRequest,
  ToggleActiveResponse,
  StaffSearchParams,
} from './staff';

// 合祀管理APIのエクスポート
export {
  getCollectiveBurialList,
  getCollectiveBurialById,
  createCollectiveBurial,
  updateCollectiveBurial,
  updateBillingStatus,
  syncBurialCount,
  deleteCollectiveBurial,
  getCollectiveBurialStatsByYear,
  BILLING_STATUS_LABELS,
  BILLING_STATUS_COLORS,
  // notes変換ヘルパー
  serializeNotesData,
  parseNotesData,
} from './collective-burials';
export type {
  BillingStatus,
  BuriedPersonSummary,
  BuriedPersonDetail,
  ApplicantInfo,
  CollectiveBurialListItem,
  CollectiveBurialDetail,
  CollectiveBurialListResponse,
  CreateCollectiveBurialRequest,
  UpdateCollectiveBurialRequest,
  UpdateBillingStatusRequest,
  SyncBurialCountResponse,
  YearlyStats,
  CollectiveBurialSearchParams,
  // notes統合用型定義
  CeremonyInfo,
  DocumentInfo,
  NotesData,
} from './collective-burials';

// 書類管理APIのエクスポート
export {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  uploadDocumentFile,
  getDocumentDownloadUrl,
  generatePdf,
  downloadPdfFromBase64,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_COLORS,
} from './documents';
export type {
  DocumentType,
  DocumentStatus,
  DocumentListItem,
  DocumentDetail,
  DocumentListResponse,
  DocumentSearchParams,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DownloadUrlResponse,
  GeneratePdfRequest,
  GeneratePdfResponse,
  InvoiceTemplateData,
  PostcardTemplateData,
} from './documents';

// 区画在庫管理APIのエクスポート
export {
  getInventorySummary,
  getInventoryPeriods,
  getInventorySections,
  getInventoryAreas,
} from './plot-inventory';
export type {
  PlotStatus,
  SectionSortKey,
  AreaSortKey,
  SortOrder,
  InventorySummary,
  PeriodSummary,
  SectionInventoryItem,
  AreaInventoryItem,
  InventoryPeriodsResponse,
  InventorySectionsResponse,
  InventoryAreasResponse,
  InventorySectionsParams,
  InventoryAreasParams,
} from './plot-inventory';

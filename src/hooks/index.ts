/**
 * カスタムフックのエントリーポイント
 */

// 汎用データフェッチフック
export { useAsyncData, clearAllAsyncDataCache, clearAsyncDataCacheByPattern } from './useAsyncData';
export { useAsyncList } from './useAsyncList';

// 認証フック（auth-contextから統合されたエクスポート）
export {
  AuthProvider,
  useAuth,
  useRequireAuth,
  useHasPermission,
  type User,
  type AuthContextType,
} from '@/contexts/auth-context';

// 顧客フック
export { useCustomers, useCustomerDetail, useCreateCustomer } from './useCustomers';

// マスタフック
export {
  useMasters,
  useMasterData,
  useCemeteryTypes,
  usePaymentMethods,
  useTaxTypes,
  useCalcTypes,
  useBillingTypes,
  useAccountTypes,
  useRecipientTypes,
  useConstructionTypes,
  findMasterByCode,
  findMasterById,
  masterToSelectOptions,
} from './useMasters';

// スタッフフック
export {
  useStaffList,
  useStaffDetail,
  useStaffMutations,
  filterStaffByRole,
  filterStaffByActive,
} from './useStaff';

// 合祀管理フック
export {
  useCollectiveBurialList,
  useCollectiveBurialDetail,
  useCollectiveBurialMutations,
  useCollectiveBurialStats,
  filterByBillingStatus,
  filterByYear,
  filterCapacityReached,
} from './useCollectiveBurials';

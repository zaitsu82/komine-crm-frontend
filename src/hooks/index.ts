/**
 * カスタムフックのエントリーポイント
 */

// 認証フック
export { AuthProvider, useAuth, useRequireAuth, useHasPermission } from './useAuth';

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

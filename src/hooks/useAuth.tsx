/**
 * @deprecated This file is deprecated. Import from '@/contexts/auth-context' or '@/hooks' instead.
 * This file exists for backwards compatibility and will be removed in a future version.
 */

// Re-export everything from the consolidated auth context
export {
  AuthProvider,
  useAuth,
  useRequireAuth,
  useHasPermission,
  type User,
  type AuthContextType,
} from '@/contexts/auth-context';

// Also export AuthUser from lib/api for backwards compatibility
export type { AuthUser } from '@/lib/api';

'use client'

import { LoginForm } from '@/components/login-form'
import { GuestGuard } from '@/components/auth-guard'

export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginForm />
    </GuestGuard>
  )
}

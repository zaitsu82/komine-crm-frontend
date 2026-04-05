'use client'

import { Suspense } from 'react'
import { PasswordSetForm } from '@/components/password-set-form'
import { GuestGuard } from '@/components/auth-guard'

export default function SetPasswordPage() {
  return (
    <GuestGuard>
      <Suspense>
        <PasswordSetForm mode="set" />
      </Suspense>
    </GuestGuard>
  )
}

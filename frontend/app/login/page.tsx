import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to your account"
      footer={
        <>
          {"Don't have an account? "}
          <Link
            href="/register"
            className="font-medium text-white transition-colors underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  )
}

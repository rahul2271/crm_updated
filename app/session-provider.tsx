'use client'
import { SessionProvider as P } from 'next-auth/react'
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <P>{children}</P>
}

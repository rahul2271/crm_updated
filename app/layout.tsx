import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from './session-provider'

<<<<<<< HEAD
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
=======
const inter = Inter({ subsets: ['latin'] })
>>>>>>> origin/main

export const metadata: Metadata = {
  title: 'PatientCRM',
  description: 'Telecaller daily reporting and analytics',
<<<<<<< HEAD
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
=======
>>>>>>> origin/main
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
<<<<<<< HEAD
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
=======
    <html lang="en">
>>>>>>> origin/main
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}

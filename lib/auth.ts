import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from './mongodb'
import { User } from '@/models/User'

type UserDoc = {
  _id: unknown
  name: string
  email: string
  password: string
  role: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error('Email and password required')
        await connectDB()
        const user = await User.findOne({ email: credentials.email.toLowerCase(), isActive: true })
          .select('+password').lean() as UserDoc | null
        if (!user) throw new Error('No account found with this email')
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) throw new Error('Incorrect password')
        return { id: String(user._id), name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as unknown as { role: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id   = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
}

declare module 'next-auth' {
  interface Session { user: { id: string; name: string; email: string; role: string } }
}
declare module 'next-auth/jwt' {
  interface JWT { id: string; role: string }
}
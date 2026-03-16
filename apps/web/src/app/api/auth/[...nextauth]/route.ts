import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        username: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const validUser = process.env.ADMIN_USER || 'admin'
        const validPass = process.env.ADMIN_PASSWORD || 'admin123'

        if (
          credentials?.username === validUser &&
          credentials?.password === validPass
        ) {
          return { id: '1', name: 'Administrador', email: 'admin@boka.cr' }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = 'admin'
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role
      return session
    },
  },
})

export { handler as GET, handler as POST }

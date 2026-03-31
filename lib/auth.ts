import { getServerSession } from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        
        const clinic = await prisma.clinic.findFirst({
          where: { email: credentials.email }
        })

        if (clinic) {
          return { id: clinic.id, name: clinic.name, email: clinic.email }
        }
        
        return null
      }
    })
  ],
  callbacks: {
    async session({ session, token }: any) {
      if (session.user) {
        session.user.clinicId = token.sub
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt" as const
  }
}

export async function getSession() {
  return await getServerSession(authOptions)
}

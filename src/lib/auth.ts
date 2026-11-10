import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./prisma";

export type AppRole = "VOLUNTEER" | "CHARITY" | "ADMIN";

declare module "next-auth" {
  interface User {
    role: AppRole;
    isDemo: boolean;
    coins: number;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: AppRole;
      isDemo: boolean;
      coins: number;
      image?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
    isDemo: boolean;
    coins: number;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role as AppRole,
          isDemo: user.isDemo,
          coins: user.coins,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.isDemo = user.isDemo;
        token.coins = user.coins;
      }
      if (trigger === "update" && session?.coins != null) {
        token.coins = session.coins;
      }
      if (token.id && trigger === "update") {
        const fresh = await prisma.user.findUnique({ where: { id: token.id } });
        if (fresh) {
          token.coins = fresh.coins;
          token.role = fresh.role as AppRole;
          token.name = fresh.name;
          token.picture = fresh.avatarUrl;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isDemo = token.isDemo;
        session.user.coins = token.coins;
      }
      return session;
    },
  },
});

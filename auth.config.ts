import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const adminRoutes = ['/dashboard/callerid', '/dashboard/orders'];
      if (adminRoutes.some((route) => pathname.startsWith(route))) {
        return isLoggedIn && auth?.user?.role === 'admin';
      }

      const isOnDashboard = pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        (session.user as any).role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user && (user as any).role) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;

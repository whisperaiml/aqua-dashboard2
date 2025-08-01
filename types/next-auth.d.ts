import 'next-auth';

declare module 'next-auth' {
  interface User {
    role: 'admin' | 'user';
  }

  interface Session {
    user?: User;
  }

  interface JWT {
    role?: string;
  }
}

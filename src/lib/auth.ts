import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// In production, this would come from a database
// Store configuration based on SUB_DISTRICT from CSV
const stores: Record<string, { password: string; storeName: string; subDistrict: string }> = {
  'ADMIN': { password: bcrypt.hashSync('admin@2025', 10), storeName: 'Administrator - All Regions', subDistrict: '' },
  'DKI01': { password: bcrypt.hashSync('dki01', 10), storeName: 'DKI 01 - Jakarta Pusat', subDistrict: 'DKI 01' },
  'DKI02': { password: bcrypt.hashSync('dki02', 10), storeName: 'DKI 02 - Jakarta Timur & Bekasi', subDistrict: 'DKI 02' },
  'DKI03': { password: bcrypt.hashSync('dki03', 10), storeName: 'DKI 03 - Tangerang & Serang', subDistrict: 'DKI 03' },
  'DKI04': { password: bcrypt.hashSync('dki04', 10), storeName: 'DKI 04 - Depok & Bogor', subDistrict: 'DKI 04' },
  'JABAR01': { password: bcrypt.hashSync('jabar01', 10), storeName: 'Jawa Barat 1 - Bandung', subDistrict: 'JABAR 01' },
  'JABAR02': { password: bcrypt.hashSync('jabar02', 10), storeName: 'Jawa Barat 2 - Karawang & Subang', subDistrict: 'JABAR 02' },
  'JABAR03': { password: bcrypt.hashSync('jabar03', 10), storeName: 'Jawa Barat 3 - Cirebon', subDistrict: 'JABAR 03' },
  'JABAR04': { password: bcrypt.hashSync('jabar04', 10), storeName: 'Jawa Barat 4 - Tasik & Sukabumi', subDistrict: 'JABAR 04' },
  'JATENG02': { password: bcrypt.hashSync('jateng02', 10), storeName: 'Jawa Tengah 2 - Semarang & Solo', subDistrict: 'JATENG 02' },
  'JATIM01': { password: bcrypt.hashSync('jatim01', 10), storeName: 'Jawa Timur 1 - Surabaya', subDistrict: 'JATIM 01' },
  'JATIM02': { password: bcrypt.hashSync('jatim02', 10), storeName: 'Jawa Timur 2 - Malang', subDistrict: 'JATIM 02' },
  'JATIM03': { password: bcrypt.hashSync('jatim03', 10), storeName: 'Jawa Timur 3 - Kediri & Jember', subDistrict: 'JATIM 03' },
  'SUMATERA01': { password: bcrypt.hashSync('sumatera01', 10), storeName: 'Sumatera 1 - Medan', subDistrict: 'SUMATERA 01' },
  'SUMATERA02': { password: bcrypt.hashSync('sumatera02', 10), storeName: 'Sumatera 2 - Palembang', subDistrict: 'SUMATERA 02' },
  'SUMATERA03': { password: bcrypt.hashSync('sumatera03', 10), storeName: 'Sumatera 3 - Padang', subDistrict: 'SUMATERA 03' },
  'IBT01': { password: bcrypt.hashSync('ibt01', 10), storeName: 'IBT 1 - Makassar', subDistrict: 'IBT 01' },
  'IBT02': { password: bcrypt.hashSync('ibt02', 10), storeName: 'IBT 2 - Bali', subDistrict: 'IBT 02' },
  'IBT03': { password: bcrypt.hashSync('ibt03', 10), storeName: 'IBT 3 - Lombok', subDistrict: 'IBT 03' },
  'IBT04': { password: bcrypt.hashSync('ibt04', 10), storeName: 'IBT 4 - Ambon', subDistrict: 'IBT 04' },
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Store Login',
      credentials: {
        storeId: { label: 'Store ID', type: 'text', placeholder: 'STORE001' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.storeId || !credentials?.password) {
          return null;
        }

        const store = stores[credentials.storeId.toUpperCase()];
        if (!store) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, store.password);
        if (!isValid) {
          return null;
        }

        // Return user object with store info
        return {
          id: credentials.storeId.toUpperCase(),
          storeId: credentials.storeId.toUpperCase(),
          storeName: store.storeName,
          subDistrict: store.subDistrict,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.storeId = user.storeId;
        token.storeName = user.storeName;
        token.subDistrict = user.subDistrict;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.storeId = token.storeId as string;
        session.user.storeName = token.storeName as string;
        session.user.subDistrict = token.subDistrict as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    storeId: string;
    storeName: string;
    subDistrict: string;
  }
  interface Session {
    user: {
      storeId: string;
      storeName: string;
      subDistrict: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    storeId: string;
    storeName: string;
    subDistrict: string;
  }
}

import { DefaultSession } from 'next-auth';

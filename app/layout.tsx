import './globals.css';
import type { Metadata } from 'next';
import ClientProvider from './ClientProvider';
import { UserProvider } from './context/UserContext';  

export const metadata: Metadata = {
  title: 'Graduation Wishlist',
  description: 'This is a list of gifts I want as graduation presents',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider> 
    <html lang="en">
      <body>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
    </UserProvider>
  );
}

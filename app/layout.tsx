import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'LinguaNote AI - Learn English from YouTube',
  description: 'Transform YouTube videos into interactive English learning materials with AI-powered notes, quizzes, and vocabulary lists.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
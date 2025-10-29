import { Sidebar } from '@/components/pte/sidebar';
import { ThemeProvider } from '@/components/theme-provider';

export default function PTELayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}

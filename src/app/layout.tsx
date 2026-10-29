import Footer from "../components/footer/Footer";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/contexts/UserContext";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen">
        <ReactQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <UserProvider>
              {children}
              <Toaster />
              <Footer />
            </UserProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

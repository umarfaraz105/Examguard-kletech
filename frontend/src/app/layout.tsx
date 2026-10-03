import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { HelpProvider } from "@/components/help/HelpSystem";
import AppLayout from "@/components/layout/AppLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ExamGuard - Exam Management System",
  description: "Intelligent Multi-Engine Examination Management System for KLE Technological University",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <HelpProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </HelpProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

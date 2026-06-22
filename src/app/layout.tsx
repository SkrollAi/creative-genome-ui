import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import Providers from "@/providers";
import { AppSidebar } from "@/app/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Creative Genome",
  description: "Creative Genome is a knowledge graph of creative analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {" "}
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen">
              {children}
            </SidebarInset>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}

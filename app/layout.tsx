import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export const metadata: Metadata = {
   title: "Docs Editor",
   description: "A live collaborative docs editor",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <ClerkProvider
         appearance={{
            baseTheme: dark,
            variables: {
               colorPrimary: "#3371FF",
               fontSize: "16px",
            },
         }}
      >
         <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen">{children}</body>
         </html>
      </ClerkProvider>
   );
}

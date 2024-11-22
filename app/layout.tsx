import type { Metadata } from "next";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-lexical/styles.css";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Provider from "./Provider";

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
               colorBackground: "#09111f",

               fontSize: "16px",
            },
         }}
      >
         <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen">
               <Provider>{children}</Provider>
            </body>
         </html>
      </ClerkProvider>
   );
}

import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Fair Mind | Negotiation Analysis Tool",
  description: "Analyze interests, generate options, and improve negotiation outcomes with Fair Mind.",
  icons: [
    // place favicon.ico in public folder and uncomment the following line
    // { rel: "icon", url: "/favicon.ico" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          {children}
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
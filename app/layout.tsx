import type { Metadata } from "next";
import "./globals.scss";

// TODO: metadata + ico
export const metadata: Metadata = {
  title: "Health+Recreation",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
       
        {children}
      </body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";
import StyledComponentsRegistry from "./lib/AntdRegistry";
import { Inter, Montserrat } from "next/font/google";
import CustomProvider from "./lib/Provider";
import ErrorBoundary from "./lib/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FILL",
  // description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body id="root" className={montserrat.className}>
        <ErrorBoundary fallback={<p>Something wrong!</p>}>
          <StyledComponentsRegistry>
            <CustomProvider>{children}</CustomProvider>
          </StyledComponentsRegistry>
        </ErrorBoundary>
      </body>
    </html>
  );
}

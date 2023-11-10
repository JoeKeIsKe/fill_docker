import "./globals.css";
import type { Metadata } from "next";
import StyledComponentsRegistry from "./lib/AntdRegistry";
import { Montserrat } from "next/font/google";
import CustomProvider from "./lib/Provider";
import ErrorBoundary from "./lib/ErrorBoundary";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FiLLiquid",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ErrorBoundary fallback={<p>Something wrong!</p>}>
        <body id="root" className={montserrat.className}>
          <StyledComponentsRegistry>
            <CustomProvider>{children}</CustomProvider>
          </StyledComponentsRegistry>
        </body>
      </ErrorBoundary>
    </html>
  );
}

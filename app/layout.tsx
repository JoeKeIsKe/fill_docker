import './globals.css'
import type { Metadata } from 'next'
import bg from '@/assets/bg1.jpg';
import StyledComponentsRegistry from './lib/AntdRegistry';
import { Inter } from 'next/font/google'
import CustomProvider from './lib/Provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
  }) {
  
 
  return (
    <html lang="en">
      <body id="root" className={inter.className} style={{ backgroundImage: `url(${bg.src})`, }}>
        <StyledComponentsRegistry>
          <CustomProvider>
            {children}
          </CustomProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}



// This is the root layout component for your Next.js app.
// Learn more: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
import { IBM_Plex_Mono } from 'next/font/google'
import { cn } from '@/lib/utils'
import './globals.css'
import { ReactNode } from 'react'

const fontHeading = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],  // Added weight property
  display: 'swap',
  variable: '--font-heading',
})

const fontBody = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],  // Added weight property
  display: 'swap',
  variable: '--font-body',
})

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body
        className={cn(
          'antialiased',
          fontHeading.variable,
          fontBody.variable
        )}
      >
        {children}
      </body>
    </html>
  )
}
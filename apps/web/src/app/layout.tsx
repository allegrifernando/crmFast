import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'crmFast',
  description: 'CRM para gestión de leads, oportunidades y pipeline comercial',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

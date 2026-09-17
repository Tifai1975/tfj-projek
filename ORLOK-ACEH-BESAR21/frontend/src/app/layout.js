export const metadata = {
  title: 'ORARI Lokal Aceh Besar',
  description: 'Portal Informasi dan Transaksi Anggota ORARI Lokal Aceh Besar',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  )
}

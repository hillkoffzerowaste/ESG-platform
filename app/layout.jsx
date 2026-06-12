import '@/app/globals.css';

export const metadata = {
  title: 'Hillkoff CFO - Carbon Footprint Organization',
  description: 'ระบบรายงานคาร์บอนฟุตพริ้นท์องค์กร ตามมาตรฐาน อบก. (TGO)',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
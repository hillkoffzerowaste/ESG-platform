import "./globals.css";
export const metadata = {
  title: "Packing Next",
  description: "Packing System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}

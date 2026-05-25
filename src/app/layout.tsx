import "./globals.css";

export const metadata = {
  title: "Control Porcino",
  description: "Sistema porcino",
  manifest: "/manifest.json",
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
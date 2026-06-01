import "./globals.css";

export const metadata = {
  title: "Control Porcino",
  description: "Sistema porcino",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>

        {/* ✔️ PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* ✔️ ICONOS */}
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />

        {/* ✔️ IPHONE FULLSCREEN */}
        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />

        <meta
          name="apple-mobile-web-app-title"
          content="Control Porcino"
        />

      </head>

      {/* ✔️ BODY */}
      <body className="min-h-screen bg-white text-black">

        {children}

      </body>
    </html>
  );
}
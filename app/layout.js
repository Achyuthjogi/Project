import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Emotion Share - Community Story Platform",
  description: "A community-driven platform to express emotions, share personal experiences, and connect securely.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="app-container">
          {children}
        </main>
      </body>
    </html>
  );
}

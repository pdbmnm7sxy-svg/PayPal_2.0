import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import PrototypeBanner from '../components/PrototypeBanner';

export const metadata: Metadata = {
  title: 'Crossbridge AI - Institutional Cross-Border Payment Orchestration',
  description:
    'Hackathon prototype demonstrating cross-border payment initiation, PayPal Sandbox funding, Scikit-learn/LightGBM fraud scoring, Google OR-Tools routing, simulated interbank settlement, and Hyperledger Fabric audit trails.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        <PrototypeBanner />
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}

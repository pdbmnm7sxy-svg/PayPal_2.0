import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import PrototypeBanner from '../components/PrototypeBanner';

export const metadata: Metadata = {
  title: 'Transnational - Institutional Cross-Border Payment Orchestration',
  description:
    'Transnational is an institutional cross-border settlement and digital funding orchestrator demonstrating payment initiation, PayPal Sandbox funding, Scikit-learn/LightGBM fraud scoring, Google OR-Tools routing, simulated interbank settlement, and Hyperledger Fabric audit trails.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f7fa] text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
        <PrototypeBanner />
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

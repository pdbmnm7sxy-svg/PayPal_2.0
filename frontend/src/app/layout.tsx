import type { Metadata } from 'next';
import './globals.css';
import AppShell from '../components/AppShell';

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
    <html lang="en" className="dark">
      <body className="bg-[#07080c] text-slate-100 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

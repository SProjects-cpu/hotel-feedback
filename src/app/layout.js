import './globals.css';

export const metadata = {
  title: 'Hotel Feedback System | Share Your Experience',
  description: 'Personalized hotel feedback system — help us improve your experience by sharing your valuable feedback across all services you used.',
  keywords: 'hotel, feedback, review, guest experience, hospitality',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-pattern" />
        {children}
      </body>
    </html>
  );
}

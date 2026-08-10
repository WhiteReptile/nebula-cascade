import React from 'react';
import { ThirdwebProvider } from 'thirdweb/react';
import { AuthProvider } from '@/context/AuthContext';

// Game-only providers wrapper. Import this only from game pages so Thirdweb
// and wallet logic are not initialized by the public film application.
const GameProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThirdwebProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThirdwebProvider>
  );
};

export default GameProviders;

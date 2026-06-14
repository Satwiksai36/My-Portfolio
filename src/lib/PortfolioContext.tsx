'use client';

import React, { createContext, useContext, useState } from 'react';
import { PortfolioData } from './data';

interface PortfolioContextType {
  portfolioData: PortfolioData;
  setPortfolioData: React.Dispatch<React.SetStateAction<PortfolioData>>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: PortfolioData;
}) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(initialData);

  return (
    <PortfolioContext.Provider value={{ portfolioData, setPortfolioData }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}

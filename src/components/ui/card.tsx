import React from 'react';

export const Card = ({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string; 
}) => (
  <div className={`rounded-xl border bg-white shadow-lg ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string; 
}) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string; 
}) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);
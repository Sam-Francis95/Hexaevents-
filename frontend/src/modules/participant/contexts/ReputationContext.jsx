import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getMyReputation } from '../services/reputationService';

const ReputationContext = createContext(null);

export const ReputationProvider = ({ children }) => {
  const { user } = useAuth();
  const [reputation, setReputation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReputation = useCallback(async () => {
    if (!user) {
      setReputation(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const res = await getMyReputation();
    if (res.success) {
      setReputation(res.data);
      setError(null);
    } else {
      setError(res.message);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchReputation();
  }, [fetchReputation]);

  return (
    <ReputationContext.Provider value={{ reputation, isLoading, error, refreshReputation: fetchReputation }}>
      {children}
    </ReputationContext.Provider>
  );
};

export const useReputation = () => {
  const context = useContext(ReputationContext);
  if (!context) {
    throw new Error('useReputation must be used within a ReputationProvider');
  }
  return context;
};

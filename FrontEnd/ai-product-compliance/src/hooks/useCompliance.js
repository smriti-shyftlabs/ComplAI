import { useState, useCallback } from 'react';
import * as aiService from '../services/aiService';

export const useCompliance = () => {
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  const analyzeProduct = useCallback(async (product, force = false) => {
    try {
      setLoading(true);
      setError(null);
      setProgress({ step: 0, total: 6, label: 'Starting...', progress: 0 });

      await aiService.simulateAnalysis((progressData) => {
        setProgress(progressData);
      });

      const result = await aiService.analyzeProduct(product, force);
      setComplianceData(result);
      setProgress(null);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getComplianceReport = useCallback(async (product) => {
    if (complianceData) return complianceData;
    return analyzeProduct(product);
  }, [complianceData, analyzeProduct]);

  const clearCompliance = useCallback(() => {
    setComplianceData(null);
    setProgress(null);
    setError(null);
  }, []);

  return {
    complianceData,
    loading,
    progress,
    error,
    analyzeProduct,
    getComplianceReport,
    clearCompliance
  };
};

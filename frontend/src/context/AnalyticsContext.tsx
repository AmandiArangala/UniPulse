'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AnalyticsFilterState, DashboardAnalyticsData } from '@/types/analytics';
import { analyticsService } from '@/lib/analytics-service';

export const initialFilterState: AnalyticsFilterState = {
  department: 'ALL',
  semester: 'ALL',
  academicYear: 'ALL',
  riskStatus: 'ALL',
  searchTerm: '',
};

export type AnalyticsTab = 'overview' | 'performance' | 'engagement';

interface AnalyticsContextType {
  filters: AnalyticsFilterState;
  setDepartment: (department: string) => void;
  setSemester: (semester: string) => void;
  setAcademicYear: (academicYear: string) => void;
  setRiskStatus: (riskStatus: string) => void;
  setSearchTerm: (searchTerm: string) => void;
  resetFilters: () => void;
  activeTab: AnalyticsTab;
  setActiveTab: (tab: AnalyticsTab) => void;
  drillThroughProgramId: string | null;
  setDrillThroughProgramId: (programId: string | null) => void;
  data: DashboardAnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refetchData: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<AnalyticsFilterState>(initialFilterState);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [drillThroughProgramId, setDrillThroughProgramId] = useState<string | null>(null);
  const [data, setData] = useState<DashboardAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (currentFilters: AnalyticsFilterState) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getDashboardData(currentFilters);
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load analytics dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(filters);
  }, [filters, fetchDashboardData]);

  const setDepartment = (department: string) => {
    setFilters((prev) => ({ ...prev, department }));
  };

  const setSemester = (semester: string) => {
    setFilters((prev) => ({ ...prev, semester }));
  };

  const setAcademicYear = (academicYear: string) => {
    setFilters((prev) => ({ ...prev, academicYear }));
  };

  const setRiskStatus = (riskStatus: string) => {
    setFilters((prev) => ({ ...prev, riskStatus }));
  };

  const setSearchTerm = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, searchTerm }));
  };

  const resetFilters = () => {
    setFilters(initialFilterState);
  };

  const refetchData = async () => {
    await fetchDashboardData(filters);
  };

  return (
    <AnalyticsContext.Provider
      value={{
        filters,
        setDepartment,
        setSemester,
        setAcademicYear,
        setRiskStatus,
        setSearchTerm,
        resetFilters,
        activeTab,
        setActiveTab,
        drillThroughProgramId,
        setDrillThroughProgramId,
        data,
        isLoading,
        error,
        refetchData,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

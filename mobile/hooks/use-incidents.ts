/**
 * useIncidents Hook
 * Manages fetching and subscribing to incident reports from Firestore
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { IncidentReport, PriorityLevel } from '../types/incident';

interface UseIncidentsResult {
  reports: IncidentReport[];
  validReports: IncidentReport[];
  isLoading: boolean;
  error: string | null;
  updatePriority: (reportId: string, priority: PriorityLevel) => Promise<void>;
  refetch: () => void;
}

export function useIncidents(): UseIncidentsResult {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Subscribe to Firestore updates
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const reportsQuery = query(
      collection(db, 'reports'),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(
      reportsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as IncidentReport[];

        setReports(data);
        setIsLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error('Firestore subscription error:', err);
        
        // Provide user-friendly error messages
        let errorMessage = 'Unable to load incident reports.';
        
        switch (err.code) {
          case 'permission-denied':
            errorMessage = 'Access denied. Please check your permissions.';
            break;
          case 'unavailable':
            errorMessage = 'Network unavailable. Please check your connection.';
            break;
          case 'not-found':
            errorMessage = 'Reports collection not found.';
            break;
          default:
            errorMessage = `Error loading reports: ${err.message}`;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [retryCount]);

  // Filter valid reports with coordinates
  const validReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          typeof report.reporter_lat === 'number' &&
          typeof report.reporter_lng === 'number' &&
          !isNaN(report.reporter_lat) &&
          !isNaN(report.reporter_lng)
      ),
    [reports]
  );

  // Update priority for a report
  const updatePriority = useCallback(
    async (reportId: string, priority: PriorityLevel): Promise<void> => {
      try {
        const reportRef = doc(db, 'reports', reportId);
        await updateDoc(reportRef, {
          priority,
          priority_updated_at: new Date(),
        });
      } catch (err) {
        console.error('Error updating priority:', err);
        throw new Error('Failed to update priority. Please try again.');
      }
    },
    []
  );

  // Manual refetch trigger
  const refetch = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  return {
    reports,
    validReports,
    isLoading,
    error,
    updatePriority,
    refetch,
  };
}

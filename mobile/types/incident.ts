/**
 * Incident Report Types
 */

export type PriorityLevel = 'high' | 'medium' | 'low' | null;

export type CriticalLevel = 'high' | 'medium' | 'low' | 'unidentified';

export interface IncidentReport {
  id: string;
  text: string | null;
  source_url: string | null;
  reporter_lat: number;
  reporter_lng: number;
  source_platform: string;
  created_at: Date | { seconds: number; nanoseconds: number };
  image_url?: string | null;
  reporter_name?: string | null;
  location_name?: string | null;
  priority?: PriorityLevel;
  critical_level?: CriticalLevel;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

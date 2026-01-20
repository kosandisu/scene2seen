/**
 * Incident Report Types
 */

export type PriorityLevel = 'high' | 'medium' | 'low' | null;

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
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

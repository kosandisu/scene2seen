/**
 * Incident Report Types
 */

export type PriorityLevel = 'high' | 'medium' | 'low' | null;

export type CriticalLevel = 'high' | 'medium' | 'low' | 'unidentified';

export type IncidentType = 'fire' | 'flood' | 'accident' | 'collapse' | 'other';

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  fire: 'Fire',
  flood: 'Flood',
  accident: 'Accident',
  collapse: 'Collapse',
  other: 'Other',
};

export interface IncidentReport {
  id: string;
  type?: string | null;
  text: string | null;
  source_url: string | null;
  reporter_lat: number;
  reporter_lng: number;
  source_platform: string;
  created_at: Date | { seconds: number; nanoseconds: number };
  //image_url?: string | null;
  reporter_name?: string | null;
  location_name?: string | null;
  priority?: PriorityLevel;
  //critical_level?: CriticalLevel;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  og_site?: string | null;

  // New Evidence Fields
  evidence_image_url?: string | null;
  evidence_voice_url?: string | null;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

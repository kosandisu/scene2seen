/**
 * Priority Level Configuration
 */

import type { PriorityLevel } from '../types/incident';

export interface PriorityConfig {
  label: string;
  color: string;
  backgroundColor: string;
  markerColor: string;
  ariaLabel: string;
}

export const PRIORITY_CONFIG: Record<NonNullable<PriorityLevel>, PriorityConfig> = {
  high: {
    label: 'High',
    color: '#FFFFFF',
    backgroundColor: '#DC2626',
    markerColor: '#DC2626',
    ariaLabel: 'Set priority to high - urgent attention required',
  },
  medium: {
    label: 'Medium',
    color: '#000000',
    backgroundColor: '#F59E0B',
    markerColor: '#F59E0B',
    ariaLabel: 'Set priority to medium - moderate attention required',
  },
  low: {
    label: 'Low',
    color: '#FFFFFF',
    backgroundColor: '#10B981',
    markerColor: '#10B981',
    ariaLabel: 'Set priority to low - can be addressed later',
  },
};

export const DEFAULT_MARKER_COLOR = '#3B82F6'; // Blue for unset priority

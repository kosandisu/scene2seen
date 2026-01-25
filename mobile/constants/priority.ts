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
    backgroundColor: '#EF4444',
    markerColor: '#EF4444',
    ariaLabel: 'Set priority to high - urgent attention required',
  },
  medium: {
    label: 'Medium',
    color: '#000000',
    backgroundColor: '#F97316',
    markerColor: '#F97316',
    ariaLabel: 'Set priority to medium - moderate attention required',
  },
  low: {
    label: 'Low',
    color: '#FFFFFF',
    backgroundColor: '#22C55E',
    markerColor: '#22C55E',
    ariaLabel: 'Set priority to low - can be addressed later',
  },
};

export const DEFAULT_MARKER_COLOR = '#9CA3AF'; //for unidentified

/**
 * Priority Selector Component
 * Allows users to set incident priority levels (High, Medium, Low)
 * could use this for operator 
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  AccessibilityInfo,
} from 'react-native';
import { styles } from '../styles/PrioritySelector.styles';
import type { PriorityLevel } from '../../types/incident';
import { PRIORITY_CONFIG } from '../../constants/priority';

interface PrioritySelectorProps {
  currentPriority: PriorityLevel;
  onPriorityChange: (priority: PriorityLevel) => Promise<void>;
  isUpdating: boolean;
  disabled?: boolean;
}

const PRIORITY_LEVELS: NonNullable<PriorityLevel>[] = ['high', 'medium', 'low'];

export function PrioritySelector({
  currentPriority,
  onPriorityChange,
  isUpdating,
  disabled = false,
}: PrioritySelectorProps) {
  const handlePress = async (priority: NonNullable<PriorityLevel>) => {
    if (disabled || isUpdating) return;

    // Toggle off if same priority selected
    const newPriority = currentPriority === priority ? null : priority;
    
    try {
      await onPriorityChange(newPriority);
      
      // Announce change to screen readers
      const message = newPriority 
        ? `Priority set to ${PRIORITY_CONFIG[newPriority].label}`
        : 'Priority cleared';
      AccessibilityInfo.announceForAccessibility(message);
    } catch (error) {
      AccessibilityInfo.announceForAccessibility('Failed to update priority');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label} accessibilityRole="header">
        Priority Level
      </Text>
      
      <View 
        style={styles.buttonGroup}
        accessibilityRole="radiogroup"
        accessibilityLabel="Priority level selector"
      >
        {PRIORITY_LEVELS.map((priority) => {
          const config = PRIORITY_CONFIG[priority];
          const isSelected = currentPriority === priority;
          
          return (
            <TouchableOpacity
              key={priority}
              style={[
                styles.button,
                { backgroundColor: config.backgroundColor },
                isSelected && styles.buttonSelected,
                (disabled || isUpdating) && styles.buttonDisabled,
              ]}
              onPress={() => handlePress(priority)}
              disabled={disabled || isUpdating}
              accessibilityRole="radio"
              accessibilityState={{ 
                checked: isSelected,
                disabled: disabled || isUpdating,
              }}
              accessibilityLabel={config.ariaLabel}
              accessibilityHint={
                isSelected 
                  ? 'Double tap to clear priority' 
                  : 'Double tap to set this priority'
              }
            >
              {isUpdating && isSelected ? (
                <ActivityIndicator 
                  size="small" 
                  color={config.color}
                  accessibilityLabel="Updating priority"
                />
              ) : (
                <>
                  <View 
                    style={[
                      styles.indicator,
                      isSelected && styles.indicatorSelected,
                    ]} 
                  />
                  <Text style={[styles.buttonText, { color: config.color }]}>
                    {config.label}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}



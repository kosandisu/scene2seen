/**
 * Priority Selector Component
 * Allows users to set incident priority levels (High, Medium, Low)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  AccessibilityInfo,
} from 'react-native';
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

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 44, // Accessibility minimum touch target
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonSelected: {
    borderWidth: 3,
    borderColor: '#1F2937',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: 6,
  },
  indicatorSelected: {
    backgroundColor: '#FFFFFF',
  },
});

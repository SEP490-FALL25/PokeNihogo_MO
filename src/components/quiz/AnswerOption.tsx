import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Checkbox } from '../ui/Checkbox';

interface AnswerOptionProps {
  id: string;
  text: string;
  image?: string;
  isCorrect?: boolean;
  isSelected?: boolean;
  showResult?: boolean;
  isMultipleChoice?: boolean;
  onSelect: (id: string) => void;
  style?: ViewStyle;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  id,
  text,
  image,
  isCorrect,
  isSelected,
  showResult,
  isMultipleChoice,
  onSelect,
  style,
}) => {
  const getOptionStyle = (): ViewStyle => {
    let baseStyle: ViewStyle = {
      borderRadius: 12,
      borderWidth: 2,
      padding: 16,
      marginVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    };

    if (showResult && isCorrect !== undefined) {
      // Show correct/incorrect state
      if (isSelected && isCorrect) {
        baseStyle.backgroundColor = '#dcfce7';
        baseStyle.borderColor = '#16a34a';
      } else if (isSelected && !isCorrect) {
        baseStyle.backgroundColor = '#fef2f2';
        baseStyle.borderColor = '#dc2626';
      } else if (!isSelected && isCorrect) {
        baseStyle.backgroundColor = '#f0fdf4';
        baseStyle.borderColor = '#22c55e';
        baseStyle.borderStyle = 'dashed';
      } else {
        baseStyle.backgroundColor = '#f9fafb';
        baseStyle.borderColor = '#d1d5db';
      }
    } else if (isSelected) {
      // Normal selected state
      baseStyle.backgroundColor = '#dbeafe';
      baseStyle.borderColor = '#3b82f6';
    } else {
      // Normal unselected state
      baseStyle.backgroundColor = '#ffffff';
      baseStyle.borderColor = '#e5e7eb';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    if (showResult && isCorrect !== undefined) {
      if (isSelected && isCorrect) {
        return { color: '#166534', fontWeight: '600' };
      } else if (isSelected && !isCorrect) {
        return { color: '#dc2626', fontWeight: '600' };
      } else if (!isSelected && isCorrect) {
        return { color: '#16a34a', fontWeight: '500' };
      }
    } else if (isSelected) {
      return { color: '#1e40af', fontWeight: '600' };
    }
    return { color: '#374151', fontWeight: '400' };
  };

  return (
    <TouchableOpacity
      style={[getOptionStyle(), style]}
      onPress={() => onSelect(id)}
      activeOpacity={0.7}
      disabled={showResult}
    >
      {/* Selection Indicator */}
      <View style={styles.selectionIndicator}>
        {isMultipleChoice ? (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(id)}
            disabled={showResult}
          />
        ) : (
          <View style={[
            styles.radioButton,
            isSelected && styles.radioButtonSelected
          ]}>
            {isSelected && <View style={styles.radioButtonInner} />}
          </View>
        )}
      </View>

      {/* Option Text */}
      <View style={styles.textContainer}>
        <Text style={[styles.optionText, getTextStyle()]}>
          {text}
        </Text>
        {image && (
          <View style={styles.imageContainer}>
            {/* Image placeholder - you can replace with actual Image component */}
            <Text style={styles.imagePlaceholder}>🖼️</Text>
          </View>
        )}
      </View>

      {/* Result Indicator */}
      {showResult && isCorrect !== undefined && (
        <View style={styles.resultIndicator}>
          {isSelected && isCorrect && (
            <Text style={styles.correctIcon}>✓</Text>
          )}
          {isSelected && !isCorrect && (
            <Text style={styles.incorrectIcon}>✗</Text>
          )}
          {!isSelected && isCorrect && (
            <Text style={styles.missedCorrectIcon}>✓</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = {
  selectionIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#3b82f6',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  textContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  imageContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 24,
  },
  resultIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
  },
  correctIcon: {
    fontSize: 20,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  incorrectIcon: {
    fontSize: 20,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  missedCorrectIcon: {
    fontSize: 20,
    color: '#16a34a',
    fontWeight: 'bold',
  },
};

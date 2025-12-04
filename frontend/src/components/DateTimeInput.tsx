import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/colors';

interface DateTimeInputProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  error?: string;
}

const DateTimeInput: React.FC<DateTimeInputProps> = ({
  label,
  value,
  onChange,
  minimumDate = new Date(),
  error,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        const newDate = new Date(selectedDate);
        if (value) {
          newDate.setHours(value.getHours());
          newDate.setMinutes(value.getMinutes());
        }
        setTempDate(newDate);
        onChange(newDate);
        // Abrir seletor de hora após selecionar data no Android
        setTimeout(() => setShowTimePicker(true), 100);
      }
    } else {
      // iOS
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event.type === 'set' && selectedTime) {
        const newDate = new Date(tempDate);
        newDate.setHours(selectedTime.getHours());
        newDate.setMinutes(selectedTime.getMinutes());
        onChange(newDate);
      }
    } else {
      // iOS
      if (selectedTime) {
        setTempDate(selectedTime);
      }
    }
  };

  const confirmIOSDateTime = () => {
    onChange(tempDate);
    setShowDatePicker(false);
  };

  const openPicker = () => {
    setTempDate(value || new Date());
    setShowDatePicker(true);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.row}>
        {/* Input de Data */}
        <TouchableOpacity
          style={[
            styles.inputContainer,
            styles.dateInput,
            error && styles.inputError,
          ]}
          onPress={openPicker}
          activeOpacity={0.7}
        >
          <MaterialIcons name="calendar-today" size={20} color={colors.primary.main} />
          <Text style={[styles.inputText, !value && styles.placeholder]}>
            {value ? formatDate(value) : 'DD/MM/AAAA'}
          </Text>
        </TouchableOpacity>

        {/* Input de Hora */}
        <TouchableOpacity
          style={[
            styles.inputContainer,
            styles.timeInput,
            error && styles.inputError,
          ]}
          onPress={() => {
            setTempDate(value || new Date());
            if (Platform.OS === 'android') {
              setShowTimePicker(true);
            } else {
              setShowDatePicker(true);
            }
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="access-time" size={20} color={colors.secondary.main} />
          <Text style={[styles.inputText, !value && styles.placeholder]}>
            {value ? formatTime(value) : 'HH:MM'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Android DatePicker */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={minimumDate}
        />
      )}

      {/* Android TimePicker */}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
          is24Hour={true}
        />
      )}

      {/* iOS Modal Picker */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Selecione Data e Hora</Text>
                <TouchableOpacity onPress={confirmIOSDateTime}>
                  <Text style={styles.confirmText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={tempDate}
                mode="datetime"
                display="spinner"
                onChange={(event, date) => {
                  if (date) setTempDate(date);
                }}
                minimumDate={minimumDate}
                locale="pt-BR"
                textColor={colors.neutral.textPrimary}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default DateTimeInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  dateInput: {
    flex: 2,
  },
  timeInput: {
    flex: 1,
  },
  inputError: {
    borderColor: colors.feedback.error,
  },
  inputText: {
    ...typography.body,
    color: colors.neutral.textPrimary,
  },
  placeholder: {
    color: colors.neutral.textMuted,
  },
  errorText: {
    ...typography.small,
    color: colors.feedback.error,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  modalTitle: {
    ...typography.subtitle,
    color: colors.neutral.textPrimary,
  },
  cancelText: {
    ...typography.body,
    color: colors.feedback.error,
  },
  confirmText: {
    ...typography.body,
    color: colors.primary.main,
    fontWeight: '600',
  },
});


import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createTask, deleteTask, setTaskCompleted, setTaskSnoozed } from '../lib/tasks';
import { useTasks } from '../lib/useTasks';
import { getUser } from '../lib/users';

export default function FeedScreen({ currentUserId, onSwitchUser }) {
  const [inputText, setInputText] = useState('');
  const [showSnoozed, setShowSnoozed] = useState(false);
  const { tasks, isLoading, isOffline, error } = useTasks();

  const currentUser = getUser(currentUserId);
  const displayedTasks = useMemo(
    () => tasks.filter((task) => Boolean(task.isSnoozed) === showSnoozed),
    [tasks, showSnoozed]
  );

  const handleAdd = async () => {
    const text = inputText.trim();
    if (text === '') return;

    // מנקים את התיבה מיד כדי שההקלדה תרגיש מיידית. Firestore כבר יציג
    // את המשימה מקומית לפני שהשרת מאשר אותה.
    setInputText('');
    try {
      await createTask({ text, creatorId: currentUserId });
    } catch {
      setInputText(text);
      Alert.alert('לא הצלחנו לשמור', 'בדוק את החיבור לאינטרנט ונסה שוב.');
    }
  };

  const handleDelete = (task) => {
    Alert.alert('למחוק את המשימה?', task.text, [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: () => {
          deleteTask(task.id).catch(() =>
            Alert.alert('המחיקה נכשלה', 'בדוק את החיבור לאינטרנט ונסה שוב.')
          );
        },
      },
    ]);
  };

  const renderTask = ({ item }) => {
    const creator = getUser(item.creatorId);

    return (
      <TouchableOpacity
        style={styles.card}
        onLongPress={() => handleDelete(item)}
        delayLongPress={400}
        activeOpacity={0.9}
      >
        {creator && (
          <View style={[styles.badge, { backgroundColor: creator.color }]}>
            <Text style={[styles.badgeText, { color: creator.textColor }]}>{creator.name}</Text>
          </View>
        )}

        <View style={styles.cardRow}>
          <TouchableOpacity
            onPress={() => setTaskCompleted(item.id, !item.isCompleted)}
            hitSlop={8}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: Boolean(item.isCompleted) }}
          >
            <Ionicons
              name={item.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
              size={28}
              color={item.isCompleted ? '#9CA3AF' : '#3B82F6'}
            />
          </TouchableOpacity>

          <Text style={[styles.taskText, item.isCompleted && styles.taskTextDone]}>
            {item.text}
          </Text>

          <TouchableOpacity
            onPress={() => setTaskSnoozed(item.id, !item.isSnoozed)}
            hitSlop={8}
            style={styles.snoozeButton}
            accessibilityRole="button"
            accessibilityLabel={item.isSnoozed ? 'החזר לפיד' : 'דחה למועד אחר'}
          >
            <Ionicons
              name={item.isSnoozed ? 'return-up-back' : 'alarm-outline'}
              size={24}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      );
    }

    return (
      <View style={styles.empty}>
        <Ionicons
          name={showSnoozed ? 'alarm-outline' : 'sparkles-outline'}
          size={48}
          color="#D1D5DB"
        />
        <Text style={styles.emptyTitle}>
          {showSnoozed ? 'אין כאן כלום' : 'הפיד ריק'}
        </Text>
        <Text style={styles.emptyText}>
          {showSnoozed
            ? 'משימות שתדחו יופיעו כאן.'
            : 'כתוב משימה או רעיון למטה, וזיו יראה אותו מיד.'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{showSnoozed ? 'רעיונות דחויים' : 'הפיד שלנו'}</Text>

          <View style={styles.toggleRow}>
            <TouchableOpacity style={styles.chip} onPress={onSwitchUser}>
              <Ionicons name="person-circle-outline" size={16} color="#4B5563" />
              <Text style={styles.chipText}>{currentUser?.name ?? 'לא ידוע'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, showSnoozed && styles.chipActive]}
              onPress={() => setShowSnoozed((value) => !value)}
            >
              <Text style={styles.chipText}>
                {showSnoozed ? 'חזרה לפיד' : 'דחויים'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isOffline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={15} color="#92400E" />
            <Text style={styles.offlineText}>אין חיבור - השינויים יסונכרנו כשהרשת תחזור</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              שגיאת חיבור ל-Firebase. בדוק את ההגדרות ואת חוקי האבטחה.
            </Text>
          </View>
        )}

        <FlatList
          data={displayedTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.list,
            displayedTasks.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {!showSnoozed && (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="הוסף משימה או רעיון..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleAdd}
              returnKeyType="send"
              blurOnSubmit={false}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
              onPress={handleAdd}
              disabled={inputText.trim() === ''}
              accessibilityRole="button"
              accessibilityLabel="שלח"
            >
              <Ionicons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 14,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  toggleRow: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  chipActive: { backgroundColor: '#D1D5DB' },
  chipText: { fontSize: 14, color: '#4B5563', fontWeight: '600' },

  offlineBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  offlineText: { fontSize: 13, color: '#92400E', writingDirection: 'rtl' },

  errorBanner: { backgroundColor: '#FEE2E2', paddingVertical: 10, paddingHorizontal: 16 },
  errorText: { fontSize: 13, color: '#991B1B', textAlign: 'center', writingDirection: 'rtl' },

  list: { padding: 20 },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badge: {
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardRow: { flexDirection: 'row-reverse', alignItems: 'center' },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginHorizontal: 12,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  taskTextDone: { color: '#9CA3AF', textDecorationLine: 'line-through' },
  snoozeButton: { padding: 4 },

  empty: { alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 14,
    writingDirection: 'rtl',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    writingDirection: 'rtl',
  },

  inputBar: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    gap: 10,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { backgroundColor: '#93C5FD' },
});

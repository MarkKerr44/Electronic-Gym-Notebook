// RoutineSetupScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SCREEN_WIDTH = Dimensions.get('window').width;

function RoutineSetupScreen() {
  const navigation = useNavigation();
  const [routineType, setRoutineType] = useState<'fixedDays' | 'intervalDays' | 'custom' | 'cycle'>('fixedDays');
  const [routineName, setRoutineName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [extraCheck, setExtraCheck] = useState(false);
  const [expandedInstructions, setExpandedInstructions] = useState(false);

  const [routine, setRoutine] = useState<string[]>([]);

  const [intervalRoutine, setIntervalRoutine] = useState({ workoutName: '', daysOff: '' });

  const [customRoutines, setCustomRoutines] = useState<
    { name: string; interval: number; restDays: number; times: number }[]
  >([]);

  const [cycleItems, setCycleItems] = useState<string[]>([]);
  const [tempCycleItem, setTempCycleItem] = useState('');

  const [multipleRoutines, setMultipleRoutines] = useState<string[][]>([]);
  const [savedRoutineNames, setSavedRoutineNames] = useState<string[]>([]);

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [tempCustomName, setTempCustomName] = useState('');
  const [tempCustomInterval, setTempCustomInterval] = useState('');
  const [tempCustomRest, setTempCustomRest] = useState('');
  const [tempCustomTimes, setTempCustomTimes] = useState('');

  const [showMultipleModal, setShowMultipleModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMsg, setErrorModalMsg] = useState('');

  useEffect(() => {
    loadAllRoutines();
  }, []);

  useEffect(() => {
    if (!routine.length) {
      setRoutine(Array(7).fill(''));
    }
  }, [routine]);

  function handleBackToDashboard() {
    navigation.navigate('DashboardScreen');
  }

  function handleRoutineTypeChange(type: 'fixedDays' | 'intervalDays' | 'custom' | 'cycle') {
    setRoutineType(type);
    setErrorMessage('');
  }

  function toggleExtraCheck() {
    setExtraCheck(!extraCheck);
  }

  function toggleInstructions() {
    setExpandedInstructions(!expandedInstructions);
  }

  function handleCloseErrorModal() {
    setShowErrorModal(false);
  }

  function toggleMultipleModal() {
    setShowMultipleModal(!showMultipleModal);
  }

  async function loadAllRoutines() {
    try {
      const stored = await AsyncStorage.getItem('allUserRoutines');
      if (stored) {
        const parsed = JSON.parse(stored);
        setMultipleRoutines(parsed.routines || []);
        setSavedRoutineNames(parsed.names || []);
      } else {
        setMultipleRoutines([]);
        setSavedRoutineNames([]);
      }
    } catch {
      setMultipleRoutines([]);
      setSavedRoutineNames([]);
    }
  }

  async function fetchAllRoutines() {
    try {
      const stored = await AsyncStorage.getItem('allUserRoutines');
      if (stored) {
        return JSON.parse(stored);
      }
      return { routines: [], names: [] };
    } catch {
      return { routines: [], names: [] };
    }
  }

  function handleRoutineChange(text: string, index: number) {
    const updated = [...routine];
    updated[index] = text;
    setRoutine(updated);
  }

  function handleIntervalChange(field: 'workoutName' | 'daysOff', value: string) {
    setIntervalRoutine({ ...intervalRoutine, [field]: value });
  }

  function handleAddCustomRoutine() {
    setShowCustomModal(true);
  }

  function handleSaveCustomRoutine() {
    if (!tempCustomName.trim()) {
      setErrorModalMsg('Invalid Workout Name');
      setShowErrorModal(true);
      return;
    }
    const i = parseInt(tempCustomInterval, 10);
    const r = parseInt(tempCustomRest, 10);
    const t = parseInt(tempCustomTimes, 10);
    if (isNaN(i) || i <= 0) {
      setErrorModalMsg('Invalid Interval');
      setShowErrorModal(true);
      return;
    }
    if (isNaN(r) || r < 0) {
      setErrorModalMsg('Invalid Rest Days');
      setShowErrorModal(true);
      return;
    }
    if (isNaN(t) || t <= 0) {
      setErrorModalMsg('Invalid Repeat Times');
      setShowErrorModal(true);
      return;
    }
    const newCustom = {
      name: tempCustomName,
      interval: i,
      restDays: r,
      times: t,
    };
    const updated = [...customRoutines, newCustom];
    setCustomRoutines(updated);
    setTempCustomName('');
    setTempCustomInterval('');
    setTempCustomRest('');
    setTempCustomTimes('');
    setShowCustomModal(false);
  }

  function handleRemoveCustomItem(index: number) {
    const updated = [...customRoutines];
    updated.splice(index, 1);
    setCustomRoutines(updated);
  }

  function handleAddCycleItem() {
    if (!tempCycleItem.trim()) {
      setErrorModalMsg('Invalid cycle item name');
      setShowErrorModal(true);
      return;
    }
    const newCycleItems = [...cycleItems, tempCycleItem.trim()];
    setCycleItems(newCycleItems);
    setTempCycleItem('');
  }

  function handleRemoveCycleItem(index: number) {
    const updated = [...cycleItems];
    updated.splice(index, 1);
    setCycleItems(updated);
  }

  function validateFixedDays() {
    let validCount = 0;
    routine.forEach(r => {
      if (r && r.trim().length > 0) {
        validCount += 1;
      }
    });
    return validCount > 0;
  }

  function validateInterval() {
    if (!intervalRoutine.workoutName || !intervalRoutine.daysOff) {
      return false;
    }
    const offDays = parseInt(intervalRoutine.daysOff, 10);
    if (isNaN(offDays) || offDays < 1) {
      return false;
    }
    return true;
  }

  function validateCustom() {
    if (customRoutines.length === 0) return false;
    for (const item of customRoutines) {
      if (!item.name || item.interval <= 0 || item.restDays < 0 || item.times <= 0) {
        return false;
      }
    }
    return true;
  }

  function validateCycle() {
    return cycleItems.length > 0;
  }

  function handleSave() {
    let valid = false;
    if (routineType === 'fixedDays') {
      valid = validateFixedDays();
    } else if (routineType === 'intervalDays') {
      valid = validateInterval();
    } else if (routineType === 'custom') {
      valid = validateCustom();
    } else {
      valid = validateCycle();
    }
    if (!valid) {
      setErrorMessage('Please fill out the fields properly.');
      return;
    }
    if (!routineName.trim()) {
      setErrorMessage('Please give a name for your routine.');
      return;
    }
    if (routineType === 'fixedDays') saveFixedRoutine();
    else if (routineType === 'intervalDays') saveIntervalRoutine();
    else if (routineType === 'custom') saveCustomRoutine();
    else saveCycleRoutine();
  }

  async function saveFixedRoutine() {
    try {
      const all = await fetchAllRoutines();
      all.routines.push(routine);
      all.names.push(routineName.trim());
      await AsyncStorage.setItem('allUserRoutines', JSON.stringify(all));
      await AsyncStorage.setItem('userRoutine', JSON.stringify(routine));

      setMultipleRoutines(all.routines);
      setSavedRoutineNames(all.names);
      setRoutine(Array(7).fill(''));
      setRoutineName('');
      setErrorMessage('');
      navigation.navigate('DashboardScreen');
    } catch {}
  }

  async function saveIntervalRoutine() {
    const offDays = parseInt(intervalRoutine.daysOff, 10);
    const newRoutine = Array(7).fill('');
    newRoutine[0] = intervalRoutine.workoutName.trim();
    let nextIndex = 0;
    while (true) {
      nextIndex += (offDays + 1);
      if (nextIndex > 6) break;
      newRoutine[nextIndex] = intervalRoutine.workoutName.trim();
    }
    try {
      const all = await fetchAllRoutines();
      all.routines.push(newRoutine);
      all.names.push(routineName.trim());
      await AsyncStorage.setItem('allUserRoutines', JSON.stringify(all));
      await AsyncStorage.setItem('userRoutine', JSON.stringify(newRoutine));

      setMultipleRoutines(all.routines);
      setSavedRoutineNames(all.names);
      setIntervalRoutine({ workoutName: '', daysOff: '' });
      setRoutineName('');
      setErrorMessage('');
      navigation.navigate('DashboardScreen');
    } catch {}
  }

  async function saveCustomRoutine() {
    const newRoutine = Array(7).fill('');
    let pointer = 0;
    customRoutines.forEach(item => {
      for (let i = 0; i < item.times; i++) {
        newRoutine[pointer % 7] = item.name;
        pointer += item.interval;
        pointer += item.restDays;
      }
    });
    try {
      const all = await fetchAllRoutines();
      all.routines.push(newRoutine);
      all.names.push(routineName.trim());
      await AsyncStorage.setItem('allUserRoutines', JSON.stringify(all));
      await AsyncStorage.setItem('userRoutine', JSON.stringify(newRoutine));

      setMultipleRoutines(all.routines);
      setSavedRoutineNames(all.names);
      setCustomRoutines([]);
      setRoutineName('');
      setErrorMessage('');
      navigation.navigate('DashboardScreen');
    } catch {}
  }

  async function saveCycleRoutine() {
    const newRoutine = Array(7).fill('');
    let idx = 0;
    for (let day = 0; day < 7; day++) {
      newRoutine[day] = cycleItems[idx % cycleItems.length];
      idx++;
    }
    try {
      const all = await fetchAllRoutines();
      all.routines.push(newRoutine);
      all.names.push(routineName.trim());
      await AsyncStorage.setItem('allUserRoutines', JSON.stringify(all));
      await AsyncStorage.setItem('userRoutine', JSON.stringify(newRoutine));

      setMultipleRoutines(all.routines);
      setSavedRoutineNames(all.names);
      setCycleItems([]);
      setRoutineName('');
      setErrorMessage('');
      navigation.navigate('DashboardScreen');
    } catch {}
  }

  function handleAddAnotherRoutine() {
    setRoutine(Array(7).fill(''));
    setRoutineName('');
    setIntervalRoutine({ workoutName: '', daysOff: '' });
    setCustomRoutines([]);
    setCycleItems([]);
    setRoutineType('fixedDays');
  }

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradientBackground}>
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.flexContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.headerTitle}>Advanced Routine Setup</Text>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToDashboard}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.viewAllButton} onPress={toggleMultipleModal}>
              <Text style={styles.viewAllButtonText}>View All Routines</Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <TouchableOpacity
                style={[styles.switchButton, routineType === 'fixedDays' && styles.switchButtonActive]}
                onPress={() => handleRoutineTypeChange('fixedDays')}
              >
                <Text style={styles.switchButtonText}>Fixed Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.switchButton, routineType === 'intervalDays' && styles.switchButtonActive]}
                onPress={() => handleRoutineTypeChange('intervalDays')}
              >
                <Text style={styles.switchButtonText}>Interval</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.switchButton, routineType === 'custom' && styles.switchButtonActive]}
                onPress={() => handleRoutineTypeChange('custom')}
              >
                <Text style={styles.switchButtonText}>Custom</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.switchButton, routineType === 'cycle' && styles.switchButtonActive]}
                onPress={() => handleRoutineTypeChange('cycle')}
              >
                <Text style={styles.switchButtonText}>Cycle</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.routineNameInput}
              placeholder="Routine Name"
              placeholderTextColor="#999"
              value={routineName}
              onChangeText={t => setRoutineName(t)}
            />

            {/* Fixed Days */}
            {routineType === 'fixedDays' && (
              <View style={styles.dayContainer}>
                {DAYS.map((day, i) => (
                  <View key={day} style={styles.dayRow}>
                    <Text style={styles.dayLabel}>{day}:</Text>
                    <TextInput
                      style={styles.dayInput}
                      placeholder="Workout or rest"
                      placeholderTextColor="#999"
                      value={routine[i] || ''}
                      onChangeText={txt => handleRoutineChange(txt, i)}
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Interval */}
            {routineType === 'intervalDays' && (
              <View style={styles.intervalContainer}>
                <Text style={styles.subTitle}>Interval Routine</Text>
                <TextInput
                  style={styles.intervalInput}
                  placeholder="Workout Name"
                  placeholderTextColor="#999"
                  value={intervalRoutine.workoutName}
                  onChangeText={v => handleIntervalChange('workoutName', v)}
                />
                <TextInput
                  style={styles.intervalInput}
                  placeholder="Days off between sessions"
                  placeholderTextColor="#999"
                  value={intervalRoutine.daysOff}
                  onChangeText={v => handleIntervalChange('daysOff', v)}
                  keyboardType="numeric"
                />
              </View>
            )}

            {/* Custom */}
            {routineType === 'custom' && (
              <View style={styles.customContainer}>
                <TouchableOpacity onPress={handleAddCustomRoutine} style={styles.addCustomButton}>
                  <Text style={styles.addCustomButtonText}>Add Custom Step</Text>
                </TouchableOpacity>
                {customRoutines.map((item, index) => (
                  <View style={styles.customItem} key={`custom-${index}`}>
                    <View style={styles.customDetail}>
                      <Text style={styles.customLabel}>Name:</Text>
                      <Text style={styles.customValue}>{item.name}</Text>
                    </View>
                    <View style={styles.customDetail}>
                      <Text style={styles.customLabel}>Interval:</Text>
                      <Text style={styles.customValue}>{item.interval}</Text>
                    </View>
                    <View style={styles.customDetail}>
                      <Text style={styles.customLabel}>Rest:</Text>
                      <Text style={styles.customValue}>{item.restDays}</Text>
                    </View>
                    <View style={styles.customDetail}>
                      <Text style={styles.customLabel}>Times:</Text>
                      <Text style={styles.customValue}>{item.times}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeCustomButton}
                      onPress={() => handleRemoveCustomItem(index)}
                    >
                      <Text style={styles.removeCustomButtonText}>X</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Cycle */}
            {routineType === 'cycle' && (
              <View style={styles.cycleContainer}>
                <Text style={styles.subTitle}>Cycle</Text>
                <Text style={styles.cycleInstructions}>
                  For example: Push, Pull, Legs, Rest, then repeat until 7 days are filled.
                </Text>
                <View style={styles.cycleRow}>
                  <TextInput
                    style={styles.cycleInput}
                    placeholder="Add item (e.g., Push)"
                    placeholderTextColor="#999"
                    value={tempCycleItem}
                    onChangeText={setTempCycleItem}
                  />
                  <TouchableOpacity style={styles.cycleAddButton} onPress={handleAddCycleItem}>
                    <Text style={styles.cycleAddButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                {cycleItems.map((cItem, index) => (
                  <View style={styles.cycleItem} key={`cycle-${index}`}>
                    <Text style={styles.cycleItemText}>{cItem}</Text>
                    <TouchableOpacity
                      style={styles.cycleRemoveButton}
                      onPress={() => handleRemoveCycleItem(index)}
                    >
                      <Text style={styles.cycleRemoveButtonText}>X</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.extraCheckContainer}>
              <TouchableOpacity style={styles.extraCheckBox} onPress={toggleExtraCheck}>
                <View style={[styles.checkBoxIndicator, extraCheck && styles.checkBoxIndicatorActive]} />
              </TouchableOpacity>
              <Text style={styles.extraCheckLabel}>Include advanced validations</Text>
            </View>

            {expandedInstructions ? (
              <TouchableOpacity onPress={toggleInstructions} style={styles.instructionToggle}>
                <Text style={styles.instructionToggleText}>Hide Instructions</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={toggleInstructions} style={styles.instructionToggle}>
                <Text style={styles.instructionToggleText}>Show Instructions</Text>
              </TouchableOpacity>
            )}

            {expandedInstructions && (
              <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                  Fixed Days: Assign each weekday a workout or rest.
                  Interval: One workout name + # of rest days.
                  Custom: Multiple steps with intervals, rest, repeats.
                  Cycle: A short sequence (Push, Pull, Legs, Rest...) repeated for the 7-day week.
                </Text>
              </View>
            )}

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Routine</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addAnotherButton} onPress={handleAddAnotherRoutine}>
              <Text style={styles.addAnotherButtonText}>Add Another Routine</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Modal for viewing all routines */}
      <Modal visible={showMultipleModal} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalInnerLarge}>
            <Text style={styles.loadTitle}>All Saved Routines</Text>
            {multipleRoutines.length === 0 && (
              <Text style={styles.noRoutinesText}>No routines saved.</Text>
            )}
            <ScrollView style={{ marginBottom: 10 }}>
              {multipleRoutines.map((item, idx) => {
                const name = savedRoutineNames[idx] || `Routine ${idx + 1}`;
                return (
                  <View style={styles.largeRoutineContainer} key={`all-${idx}`}>
                    <Text style={styles.largeRoutineTitle}>{name}</Text>
                    <View style={styles.largeRoutineRow}>
                      {item.map((val, idx2) => (
                        <View style={styles.largeRoutineCell} key={`val-${idx2}`}>
                          <Text style={styles.largeRoutineDay}>{DAYS[idx2].slice(0, 3)}</Text>
                          <Text style={styles.largeRoutineVal}>{val || 'Rest'}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMultipleModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for adding a custom step */}
      <Modal visible={showCustomModal} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalInner}>
            <Text style={styles.modalTitle}>New Custom Step</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Workout Name"
              placeholderTextColor="#999"
              value={tempCustomName}
              onChangeText={setTempCustomName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Interval (days) between each session"
              placeholderTextColor="#999"
              value={tempCustomInterval}
              onChangeText={setTempCustomInterval}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Rest (days) after each session"
              placeholderTextColor="#999"
              value={tempCustomRest}
              onChangeText={setTempCustomRest}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Number of times to repeat"
              placeholderTextColor="#999"
              value={tempCustomTimes}
              onChangeText={setTempCustomTimes}
              keyboardType="numeric"
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalButton} onPress={handleSaveCustomRoutine}>
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowCustomModal(false);
                  setTempCustomName('');
                  setTempCustomInterval('');
                  setTempCustomRest('');
                  setTempCustomTimes('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error modal */}
      <Modal visible={showErrorModal} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.errorModalContent}>
            <Text style={styles.errorModalText}>{errorModalMsg}</Text>
            <TouchableOpacity style={styles.errorModalButton} onPress={handleCloseErrorModal}>
              <Text style={styles.errorModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  flexContainer: { flex: 1 },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 50 },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginVertical: 15,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#FF5F6D',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  viewAllButton: {
    backgroundColor: '#FF5F6D',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  viewAllButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  switchButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  switchButtonActive: {
    backgroundColor: '#FF5F6D',
  },
  switchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  routineNameInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  dayContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 20,
    paddingVertical: 10,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 10,
  },
  dayLabel: { fontSize: 14, color: '#fff', width: 100 },
  dayInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  intervalContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  intervalInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  customContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  addCustomButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  addCustomButtonText: { color: '#fff', fontWeight: 'bold' },
  customItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
    alignItems: 'center',
  },
  customDetail: { flexDirection: 'row', alignItems: 'center', marginRight: 6 },
  customLabel: { color: '#fff', fontWeight: 'bold', marginRight: 2, fontSize: 12 },
  customValue: { color: '#fff', fontSize: 12 },
  removeCustomButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    padding: 6,
    marginLeft: 'auto',
  },
  removeCustomButtonText: { color: '#fff', fontWeight: 'bold' },
  cycleContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  cycleInstructions: { color: '#fff', fontSize: 14, marginBottom: 10 },
  cycleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cycleInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 10,
  },
  cycleAddButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleAddButtonText: { color: '#fff', fontWeight: 'bold' },
  cycleItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  cycleItemText: { color: '#fff', flex: 1 },
  cycleRemoveButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    padding: 6,
    marginLeft: 10,
  },
  cycleRemoveButtonText: { color: '#fff', fontWeight: 'bold' },
  extraCheckContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  extraCheckBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FF5F6D',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxIndicator: { width: 0, height: 0 },
  checkBoxIndicatorActive: { width: 12, height: 12, backgroundColor: '#FF5F6D' },
  extraCheckLabel: { color: '#fff' },
  instructionToggle: { alignSelf: 'center', marginBottom: 10 },
  instructionToggleText: { color: '#FF5F6D', fontWeight: 'bold' },
  instructionContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  instructionText: { color: '#fff', fontSize: 14 },
  errorText: { color: '#ff0000', textAlign: 'center', marginBottom: 15 },
  saveButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  addAnotherButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FF5F6D',
  },
  addAnotherButtonText: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalInnerLarge: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
    maxHeight: 500,
  },
  loadTitle: { fontSize: 20, color: '#fff', marginBottom: 10, textAlign: 'center', fontWeight: 'bold' },
  noRoutinesText: { color: '#fff', textAlign: 'center', marginVertical: 10 },
  largeRoutineContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginVertical: 8,
    padding: 8,
  },
  largeRoutineTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 5 },
  largeRoutineRow: { flexDirection: 'row', flexWrap: 'wrap' },
  largeRoutineCell: {
    width: (SCREEN_WIDTH - 72) / 7,
    alignItems: 'center',
    marginBottom: 8,
  },
  largeRoutineDay: { color: '#fff', fontSize: 12 },
  largeRoutineVal: { color: '#fff', fontSize: 10, marginTop: 2 },
  modalInner: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 10, textAlign: 'center' },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-around' },
  modalButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalButtonText: { color: '#fff', fontWeight: 'bold' },
  errorModalContent: {
    width: SCREEN_WIDTH - 60,
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  errorModalText: { color: '#fff', fontSize: 16, marginBottom: 10 },
  errorModalButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  errorModalButtonText: { color: '#fff', fontWeight: 'bold' },
});

export { RoutineSetupScreen };

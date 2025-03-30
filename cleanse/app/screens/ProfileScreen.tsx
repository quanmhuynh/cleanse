import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  TextInput,
  Modal
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useUser } from '../context/UserContext';

// Mock statistics data - in a real app would come from tracked scans
const mockStatistics = {
  totalScans: 27,
  averageHealthScore: 68,
  nutritionAverages: {
    sugar: {
      amount: '21g',
      level: 'Medium',
    },
    sodium: {
      amount: '420mg',
      level: 'Medium',
    },
    fat: {
      amount: '12g',
      level: 'Medium',
    },
    protein: {
      amount: '15g',
      level: 'Medium',
    },
  },
  mostScannedCategories: [
    { name: 'Snacks', percentage: 35 },
    { name: 'Beverages', percentage: 25 },
    { name: 'Dairy', percentage: 20 },
    { name: 'Grains', percentage: 10 },
    { name: 'Other', percentage: 10 },
  ],
};

const ProfileScreen = () => {
  const { healthData, updateHealthData } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  // Function to render nutritional stat
  const renderNutritionStat = (title: string, data: { amount: string, level: string }) => {
    const getColor = (level: string) => {
      switch (level) {
        case 'Low': return COLORS.success;
        case 'Medium': return COLORS.secondary;
        case 'High': return COLORS.error;
        default: return COLORS.text;
      }
    };

    return (
      <View style={styles.nutritionStatItem}>
        <View style={styles.nutritionStatHeader}>
          <Text style={styles.nutritionStatTitle}>{title}</Text>
          <Text 
            style={[styles.nutritionStatLevel, { color: getColor(data.level) }]}
          >
            {data.level}
          </Text>
        </View>
        <Text style={styles.nutritionStatValue}>{data.amount}</Text>
      </View>
    );
  };

  // Function to handle opening the edit modal
  const handleEditField = (field: string, currentValue: any) => {
    setCurrentField(field);
    setTempValue(currentValue ? currentValue.toString() : '');
    setEditModalVisible(true);
  };

  // Function to save edited field
  const saveField = () => {
    if (!currentField) return;

    let value: any = tempValue;
    
    // Convert to appropriate type based on field
    if (currentField === 'age' || currentField === 'weight' || currentField === 'height') {
      value = tempValue ? parseFloat(tempValue) : null;
    }

    // Update the appropriate field in healthData
    if (currentField === 'age' || currentField === 'weight' || currentField === 'height' || currentField === 'gender') {
      updateHealthData({ [currentField]: value });
    }

    setEditModalVisible(false);
  };

  // Render a category bar for stats
  const renderCategoryBar = (category: { name: string, percentage: number }) => (
    <View style={styles.categoryBarContainer}>
      <View style={styles.categoryBarHeader}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
      </View>
      <View style={styles.categoryBarBackground}>
        <View 
          style={[
            styles.categoryBarFill, 
            { width: `${category.percentage}%`, backgroundColor: COLORS.primary }
          ]} 
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setEditMode(!editMode)}
          >
            <Text style={styles.editButtonText}>
              {editMode ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        >
        {/* Profile Info Card */}
        <View style={styles.profileCardContainer}>
          <View style={styles.profileIconContainer}>
            <Ionicons name="person" size={60} color={COLORS.primary} />
          </View>
          
          <View style={styles.profileDetailsContainer}>
            <View style={styles.profileSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.profileRow}>
                <View style={styles.profileField}>
                  <Text style={styles.fieldLabel}>Age</Text>
                  <Text style={styles.fieldValue}>{healthData.age || 'Not set'}</Text>
                </View>
                {editMode && (
                  <TouchableOpacity 
                    style={styles.fieldEditButton}
                    onPress={() => handleEditField('age', healthData.age)}
                  >
                    <MaterialCommunityIcons name="pencil" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.profileRow}>
                <View style={styles.profileField}>
                  <Text style={styles.fieldLabel}>Weight</Text>
                  <Text style={styles.fieldValue}>
                    {healthData.weight ? `${healthData.weight} kg` : 'Not set'}
                  </Text>
                </View>
                {editMode && (
                  <TouchableOpacity 
                    style={styles.fieldEditButton}
                    onPress={() => handleEditField('weight', healthData.weight)}
                  >
                    <MaterialCommunityIcons name="pencil" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.profileRow}>
                <View style={styles.profileField}>
                  <Text style={styles.fieldLabel}>Height</Text>
                  <Text style={styles.fieldValue}>
                    {healthData.height ? `${healthData.height} cm` : 'Not set'}
                  </Text>
                </View>
                {editMode && (
                  <TouchableOpacity 
                    style={styles.fieldEditButton}
                    onPress={() => handleEditField('height', healthData.height)}
                  >
                    <MaterialCommunityIcons name="pencil" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.profileRow}>
                <View style={styles.profileField}>
                  <Text style={styles.fieldLabel}>Gender</Text>
                  <Text style={styles.fieldValue}>
                    {healthData.gender ? healthData.gender.charAt(0).toUpperCase() + healthData.gender.slice(1) : 'Not set'}
                  </Text>
                </View>
                {editMode && (
                  <TouchableOpacity 
                    style={styles.fieldEditButton}
                    onPress={() => handleEditField('gender', healthData.gender)}
                  >
                    <MaterialCommunityIcons name="pencil" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <View style={styles.profileSection}>
              <Text style={styles.sectionTitle}>Health Conditions</Text>
              
              {editMode ? (
                <>
                  <View style={styles.conditionToggleRow}>
                    <Text style={styles.conditionToggleLabel}>High Blood Pressure</Text>
                    <Switch
                      trackColor={{ false: COLORS.lightGray, true: `${COLORS.primary}50` }}
                      thumbColor={healthData.conditions.highBloodPressure ? COLORS.primary : COLORS.mediumGray}
                      ios_backgroundColor={COLORS.lightGray}
                      onValueChange={(value) => 
                        updateHealthData({ 
                          conditions: { 
                            ...healthData.conditions, 
                            highBloodPressure: value 
                          } 
                        })
                      }
                      value={healthData.conditions.highBloodPressure}
                    />
                  </View>
                  
                  <View style={styles.conditionToggleRow}>
                    <Text style={styles.conditionToggleLabel}>Diabetes</Text>
                    <Switch
                      trackColor={{ false: COLORS.lightGray, true: `${COLORS.primary}50` }}
                      thumbColor={healthData.conditions.diabetes ? COLORS.primary : COLORS.mediumGray}
                      ios_backgroundColor={COLORS.lightGray}
                      onValueChange={(value) => 
                        updateHealthData({ 
                          conditions: { 
                            ...healthData.conditions, 
                            diabetes: value 
                          } 
                        })
                      }
                      value={healthData.conditions.diabetes}
                    />
                  </View>
                  
                  <View style={styles.conditionToggleRow}>
                    <Text style={styles.conditionToggleLabel}>Heart Disease</Text>
                    <Switch
                      trackColor={{ false: COLORS.lightGray, true: `${COLORS.primary}50` }}
                      thumbColor={healthData.conditions.heartDisease ? COLORS.primary : COLORS.mediumGray}
                      ios_backgroundColor={COLORS.lightGray}
                      onValueChange={(value) => 
                        updateHealthData({ 
                          conditions: { 
                            ...healthData.conditions, 
                            heartDisease: value 
                          } 
                        })
                      }
                      value={healthData.conditions.heartDisease}
                    />
                  </View>
                </>
              ) : (
                <View style={styles.conditionsDisplayContainer}>
                  {healthData.conditions.highBloodPressure || 
                   healthData.conditions.diabetes || 
                   healthData.conditions.heartDisease || 
                   healthData.conditions.kidneyDisease ||
                   healthData.conditions.pregnant ||
                   healthData.conditions.cancer ||
                   healthData.conditions.dietaryRestrictions.length > 0 ? (
                    <View style={styles.conditionsList}>
                      {healthData.conditions.highBloodPressure && (
                        <View style={styles.conditionTag}>
                          <Text style={styles.conditionText}>High Blood Pressure</Text>
                        </View>
                      )}
                      {healthData.conditions.diabetes && (
                        <View style={styles.conditionTag}>
                          <Text style={styles.conditionText}>Diabetes</Text>
                        </View>
                      )}
                      {healthData.conditions.heartDisease && (
                        <View style={styles.conditionTag}>
                          <Text style={styles.conditionText}>Heart Disease</Text>
                        </View>
                      )}
                      {healthData.conditions.kidneyDisease && (
                        <View style={styles.conditionTag}>
                          <Text style={styles.conditionText}>Kidney Disease</Text>
                        </View>
                      )}
                      {healthData.conditions.pregnant && (
                        <View style={styles.conditionTag}>
                          <Text style={styles.conditionText}>Pregnant</Text>
                        </View>
                      )}
                      {healthData.conditions.cancer && (
                        <View style={styles.conditionTag}>
                          <Text style={styles.conditionText}>Cancer</Text>
                        </View>
                      )}
                      {healthData.conditions.dietaryRestrictions.map((restriction, index) => (
                        <View key={index} style={styles.conditionTag}>
                          <Text style={styles.conditionText}>{restriction}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noConditionsText}>No health conditions specified</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCardContainer}>
          <Text style={styles.statsCardTitle}>Your Scan Statistics</Text>
          
          <View style={styles.statsOverview}>
            <View style={styles.statOverviewItem}>
              <Text style={styles.statOverviewValue}>{mockStatistics.totalScans}</Text>
              <Text style={styles.statOverviewLabel}>Products Scanned</Text>
            </View>
            <View style={styles.statOverviewDivider} />
            <View style={styles.statOverviewItem}>
              <Text style={styles.statOverviewValue}>{mockStatistics.averageHealthScore}</Text>
              <Text style={styles.statOverviewLabel}>Avg. Health Score</Text>
            </View>
          </View>
          
          <Text style={styles.statsSubtitle}>Nutrition Averages</Text>
          <View style={styles.nutritionStatsContainer}>
            {renderNutritionStat('Sugar', mockStatistics.nutritionAverages.sugar)}
            {renderNutritionStat('Sodium', mockStatistics.nutritionAverages.sodium)}
            {renderNutritionStat('Fat', mockStatistics.nutritionAverages.fat)}
            {renderNutritionStat('Protein', mockStatistics.nutritionAverages.protein)}
          </View>
          
          <Text style={styles.statsSubtitle}>Most Scanned Categories</Text>
          <View style={styles.categoriesContainer}>
            {mockStatistics.mostScannedCategories.map((category, index) => (
              <React.Fragment key={index}>
                {renderCategoryBar(category)}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Edit Field Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Edit {currentField && currentField.charAt(0).toUpperCase() + currentField.slice(1)}
            </Text>
            
            {currentField === 'gender' ? (
              <View style={styles.genderOptions}>
                {['male', 'female', 'other'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderOption,
                      tempValue === gender && styles.genderOptionSelected
                    ]}
                    onPress={() => setTempValue(gender)}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      tempValue === gender && styles.genderOptionTextSelected
                    ]}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                style={styles.modalInput}
                value={tempValue}
                onChangeText={setTempValue}
                keyboardType={
                  currentField === 'age' || 
                  currentField === 'weight' || 
                  currentField === 'height' 
                    ? 'numeric' 
                    : 'default'
                }
                autoFocus
              />
            )}
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={saveField}
              >
                <Text style={styles.modalSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SIZES.paddingLarge,
    paddingTop: SIZES.paddingLarge * 3,
    paddingBottom: SIZES.paddingLarge,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    ...SHADOWS.medium,
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xxxLarge,
    color: COLORS.white,
  },
  editButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.paddingMedium,
    paddingVertical: SIZES.paddingSmall / 2,
    borderRadius: SIZES.borderRadiusFull,
  },
  editButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  profileCardContainer: {
    margin: SIZES.marginLarge,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    ...SHADOWS.medium,
    overflow: 'hidden',
  },
  profileIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.paddingLarge,
    backgroundColor: COLORS.gray,
  },
  profileDetailsContainer: {
    padding: SIZES.paddingLarge,
  },
  profileSection: {
    marginBottom: SIZES.marginLarge,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SIZES.marginMedium,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.paddingSmall,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  profileField: {
    flex: 1,
  },
  fieldLabel: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  fieldValue: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  fieldEditButton: {
    padding: SIZES.paddingSmall,
  },
  conditionToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.paddingSmall,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  conditionToggleLabel: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  conditionsDisplayContainer: {
    marginTop: SIZES.marginSmall,
  },
  conditionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  conditionTag: {
    backgroundColor: COLORS.primary + '15',
    paddingVertical: SIZES.paddingSmall / 2,
    paddingHorizontal: SIZES.paddingSmall,
    borderRadius: SIZES.borderRadiusFull,
    marginRight: SIZES.marginSmall,
    marginBottom: SIZES.marginSmall,
  },
  conditionText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  noConditionsText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.mediumGray,
    fontStyle: 'italic',
  },
  statsCardContainer: {
    margin: SIZES.marginLarge,
    marginTop: 0,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingLarge,
    ...SHADOWS.medium,
  },
  statsCardTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SIZES.marginMedium,
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
    marginBottom: SIZES.marginLarge,
  },
  statOverviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  statOverviewDivider: {
    width: 1,
    height: '70%',
    backgroundColor: COLORS.mediumGray,
    marginHorizontal: SIZES.marginMedium,
  },
  statOverviewValue: {
    ...FONTS.bold,
    fontSize: SIZES.xxLarge,
    color: COLORS.primary,
    marginBottom: 4,
  },
  statOverviewLabel: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
  },
  statsSubtitle: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.marginMedium,
  },
  nutritionStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SIZES.marginLarge,
  },
  nutritionStatItem: {
    width: '48%',
    backgroundColor: COLORS.gray,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
    marginBottom: SIZES.marginMedium,
  },
  nutritionStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nutritionStatTitle: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
  },
  nutritionStatLevel: {
    ...FONTS.bold,
    fontSize: SIZES.xSmall,
  },
  nutritionStatValue: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  categoriesContainer: {
    marginBottom: SIZES.marginMedium,
  },
  categoryBarContainer: {
    marginBottom: SIZES.marginMedium,
  },
  categoryBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  categoryPercentage: {
    ...FONTS.bold,
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  categoryBarBackground: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadiusFull,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: SIZES.borderRadiusFull,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingLarge,
    ...SHADOWS.large,
  },
  modalTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SIZES.marginLarge,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadiusSmall,
    padding: SIZES.paddingMedium,
    fontSize: SIZES.medium,
    marginBottom: SIZES.marginLarge,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.marginLarge,
  },
  genderOption: {
    flex: 1,
    paddingVertical: SIZES.paddingMedium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginHorizontal: 4,
    borderRadius: SIZES.borderRadiusSmall,
  },
  genderOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderOptionText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  genderOptionTextSelected: {
    color: COLORS.white,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: SIZES.paddingMedium,
    borderRadius: SIZES.borderRadiusMedium,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: COLORS.gray,
    marginRight: SIZES.marginSmall,
  },
  modalCancelButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
  },
  modalSaveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: SIZES.marginSmall,
  },
  modalSaveButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
  spacer: {
    height: 100, // Space for the tab bar
  },
});

export default ProfileScreen; 
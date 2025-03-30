import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../utils/api';
import { useUser } from '../context/UserContext';

interface Profile {
  id: string;
  username: string;
  createdAt: string;
}

interface ProfileSelectionScreenProps {
  onProfileSelect: (profileId: string) => void;
}

const ProfileSelectionScreen = ({ onProfileSelect }: ProfileSelectionScreenProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProfileModalVisible, setNewProfileModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      // Get the list of profile IDs
      const profileListJson = await AsyncStorage.getItem('profileList');
      if (profileListJson) {
        const profileList = JSON.parse(profileListJson) as Profile[];
        setProfiles(profileList);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewProfile = async () => {
    if (!newUsername.trim()) {
      setError('Please enter a username');
      return;
    }

    // Check if username already exists
    if (profiles.some(profile => profile.username.toLowerCase() === newUsername.toLowerCase())) {
      setError('Username already exists');
      return;
    }

    try {
      const newProfile: Profile = {
        id: `profile_${Date.now()}`,
        username: newUsername,
        createdAt: new Date().toISOString(),
      };

      console.log(`Creating new profile: ${newProfile.id} (${newUsername})`);

      // Create basic health data for this profile
      const emptyHealthData = {
        age: null,
        weight: null,
        height: null,
        gender: null,
        conditions: {
          highBloodPressure: false,
          diabetes: false,
          heartDisease: false,
          kidneyDisease: false,
          pregnant: false,
          cancer: false,
          dietaryRestrictions: [],
          otherConditions: [],
        },
        additionalPreferences: '',
      };

      // Create an empty health data object for this profile
      await AsyncStorage.setItem(
        `userData_${newProfile.id}`, 
        JSON.stringify({
          completedSurvey: false,
          healthData: emptyHealthData,
          currentSurveyStep: 1,
        })
      );

      // Create user on server
      try {
        console.log('Creating user on server...');
        const apiUserData = {
          email: newProfile.id,
          height: 170.0,
          weight: 70.0,
          age: 30,
          physical_activity: "Moderate",
          gender: "not_specified",
          comorbidities: [],
          preferences: "No specific preferences",
        };
        
        await api.post('add_user', apiUserData);
        console.log('User created successfully on server');
      } catch (apiError) {
        console.error('Failed to create user on server, but proceeding with local profile', apiError);
      }

      // Update the profile list
      const updatedProfiles = [...profiles, newProfile];
      await AsyncStorage.setItem('profileList', JSON.stringify(updatedProfiles));
      setProfiles(updatedProfiles);
      setNewProfileModalVisible(false);
      setNewUsername('');
      setError('');

      // Automatically select the new profile
      onProfileSelect(newProfile.id);
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Failed to create profile');
    }
  };

  const handleProfileSelect = (profileId: string) => {
    onProfileSelect(profileId);
  };

  const renderProfileItem = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={() => handleProfileSelect(item.id)}
    >
      <View style={styles.profileAvatar}>
        <MaterialCommunityIcons name="account" size={32} color={COLORS.white} />
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{item.username}</Text>
        <Text style={styles.profileDate}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.mediumGray} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Profile</Text>
        <Text style={styles.subtitle}>
          Choose an existing profile or create a new one
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          {profiles.length > 0 ? (
            <FlatList
              data={profiles}
              renderItem={renderProfileItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-multiple" size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyStateText}>No profiles found</Text>
              <Text style={styles.emptyStateSubtext}>Create a profile to get started</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setNewProfileModalVisible(true)}
          >
            <MaterialCommunityIcons name="plus" size={24} color={COLORS.white} />
            <Text style={styles.createButtonText}>Create New Profile</Text>
          </TouchableOpacity>
        </>
      )}

      {/* New Profile Modal */}
      <Modal
        visible={newProfileModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setNewProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              value={newUsername}
              onChangeText={setNewUsername}
              autoCapitalize="none"
              autoFocus
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewProfileModalVisible(false);
                  setNewUsername('');
                  setError('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createModalButton]}
                onPress={createNewProfile}
              >
                <Text style={styles.createModalButtonText}>Create</Text>
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
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: SIZES.paddingLarge,
    paddingTop: SIZES.paddingLarge * 3,
    paddingBottom: SIZES.paddingLarge,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    ...SHADOWS.medium,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.xxxLarge,
    color: COLORS.white,
    marginBottom: SIZES.marginSmall,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.white,
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SIZES.paddingLarge,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingLarge,
    marginBottom: SIZES.marginMedium,
    ...SHADOWS.small,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.marginMedium,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 4,
  },
  profileDate: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.paddingLarge,
  },
  emptyStateText: {
    ...FONTS.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.text,
    marginTop: SIZES.marginLarge,
    marginBottom: SIZES.marginSmall,
  },
  emptyStateSubtext: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
    margin: SIZES.marginLarge,
    ...SHADOWS.medium,
  },
  createButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginLeft: SIZES.marginSmall,
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
    fontSize: SIZES.xLarge,
    color: COLORS.text,
    marginBottom: SIZES.marginLarge,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadiusSmall,
    padding: SIZES.paddingMedium,
    fontSize: SIZES.medium,
    marginBottom: SIZES.marginMedium,
  },
  errorText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.error,
    marginBottom: SIZES.marginMedium,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: SIZES.paddingMedium,
    borderRadius: SIZES.borderRadiusMedium,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.gray,
    marginRight: SIZES.marginSmall,
  },
  cancelButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
  },
  createModalButton: {
    backgroundColor: COLORS.primary,
    marginLeft: SIZES.marginSmall,
  },
  createModalButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
});

export default ProfileSelectionScreen; 
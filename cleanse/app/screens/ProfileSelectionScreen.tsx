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
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

interface ProfileSelectionScreenProps {
  onProfileSelect?: (profileId: string) => void; // Optional for backward compatibility
}

const ProfileSelectionScreen = ({ onProfileSelect }: ProfileSelectionScreenProps) => {
  const { userList, loadUserList, selectUser, createNewUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [newUserModalVisible, setNewUserModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      await loadUserList();
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewProfile = async () => {
    if (!newEmail.trim()) {
      setError('Please enter an email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check if email already exists
    if (userList.includes(newEmail)) {
      setError('Email already exists');
      return;
    }

    try {
      console.log(`Creating new user: ${newEmail}`);
      
      // Use the context method to create a new user
      await createNewUser(newEmail);
      
      setNewUserModalVisible(false);
      setNewEmail('');
      setError('');
      
      // Call the callback if provided (for backward compatibility)
      if (onProfileSelect) {
        onProfileSelect(newEmail);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user');
    }
  };

  const handleProfileSelect = (email: string) => {
    selectUser(email);
    
    // Call the callback if provided (for backward compatibility)
    if (onProfileSelect) {
      onProfileSelect(email);
    }
  };

  const renderProfileItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={() => handleProfileSelect(item)}
    >
      <View style={styles.profileAvatar}>
        <MaterialCommunityIcons name="account" size={32} color={COLORS.white} />
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{item}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.mediumGray} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select User</Text>
        <Text style={styles.subtitle}>
          Choose an existing user or create a new one
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          {userList.length > 0 ? (
            <FlatList
              data={userList}
              renderItem={renderProfileItem}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-multiple" size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyStateText}>No users found</Text>
              <Text style={styles.emptyStateSubtext}>Create a user to get started</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setNewUserModalVisible(true)}
          >
            <MaterialCommunityIcons name="plus" size={24} color={COLORS.white} />
            <Text style={styles.createButtonText}>Create New User</Text>
          </TouchableOpacity>
        </>
      )}

      {/* New User Modal */}
      <Modal
        visible={newUserModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setNewUserModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New User</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              value={newEmail}
              onChangeText={setNewEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewUserModalVisible(false);
                  setNewEmail('');
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
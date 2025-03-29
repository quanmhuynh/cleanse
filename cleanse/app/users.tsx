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
import { useRouter } from 'expo-router';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { User, getAllUsers, createUser, deleteUser } from '../utils/userStorage';
import { useUser } from './context/UserContext';

export default function UsersScreen() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const { setCurrentUser } = useUser();

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const loadedUsers = await getAllUsers();
    setUsers(loadedUsers);
    setLoading(false);
  };

  const handleSelectUser = async (user: User) => {
    setCurrentUser(user);
    if (user.completedSurvey) {
      router.push('/');
    } else {
      router.push('/screens/survey');
    }
  };

  const handleCreateUser = async () => {
    if (newUserName.trim()) {
      setLoading(true);
      const user = await createUser(newUserName.trim());
      setUsers([...users, user]);
      setNewUserName('');
      setModalVisible(false);
      setLoading(false);
      
      // Select the new user and navigate
      setCurrentUser(user);
      router.push('/screens/survey');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    await deleteUser(userId);
    setUsers(users.filter(user => user.id !== userId));
    setLoading(false);
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => handleSelectUser(item)}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.userStatus}>
          {item.completedSurvey ? 'Survey Completed' : 'Survey Incomplete'}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteUser(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Selection</Text>
        <Text style={styles.subtitle}>
          Select an existing user or create a new one
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          {users.length > 0 ? (
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No users found</Text>
              <Text style={styles.emptySubtext}>Create a new user to get started</Text>
            </View>
          )}
        </>
      )}

      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.createButtonText}>Create New User</Text>
      </TouchableOpacity>

      {/* New User Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New User</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={newUserName}
              onChangeText={setNewUserName}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateUser}
                disabled={!newUserName.trim()}
              >
                <Text style={styles.confirmButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: SIZES.paddingLarge,
  },
  header: {
    paddingHorizontal: SIZES.paddingLarge,
    marginBottom: SIZES.marginLarge,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.xxxLarge,
    color: COLORS.primary,
    marginBottom: SIZES.marginSmall,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SIZES.paddingLarge,
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingLarge,
    marginBottom: SIZES.marginLarge,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SIZES.marginSmall / 2,
  },
  userDate: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    marginBottom: SIZES.marginSmall / 2,
  },
  userStatus: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.secondary,
  },
  deleteButton: {
    backgroundColor: COLORS.error + '15', // 15% opacity
    paddingVertical: SIZES.paddingSmall,
    paddingHorizontal: SIZES.paddingMedium,
    borderRadius: SIZES.borderRadiusMedium,
  },
  deleteButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.paddingLarge,
  },
  emptyText: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.darkGray,
    marginBottom: SIZES.marginSmall,
  },
  emptySubtext: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SIZES.paddingMedium,
    borderRadius: SIZES.borderRadiusMedium,
    margin: SIZES.marginLarge,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  createButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.white,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
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
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadiusSmall,
    paddingHorizontal: SIZES.paddingMedium,
    marginBottom: SIZES.marginLarge,
    ...FONTS.regular,
    fontSize: SIZES.medium,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: SIZES.paddingMedium,
    paddingHorizontal: SIZES.paddingLarge,
    borderRadius: SIZES.borderRadiusMedium,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
    marginRight: SIZES.marginMedium,
  },
  cancelButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
  },
  confirmButton: {
    backgroundColor: COLORS.secondary,
  },
  confirmButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
}); 
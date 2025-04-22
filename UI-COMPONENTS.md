# Good-Busy UI Components Documentation

This document describes the key UI components for the Good-Busy mobile application, focusing on implementation details and best practices.

## Goal Privacy Settings Component

The GoalPrivacySelector component allows users to control the visibility of their goals, which is a critical feature for social accountability while maintaining user privacy.

### Usage

```jsx
import { GoalPrivacySelector } from '../components/GoalPrivacySelector';

function AddGoalScreen() {
  const [privacy, setPrivacy] = useState('followers');
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Who can see this goal?</Text>
      <GoalPrivacySelector
        selectedOption={privacy}
        onSelect={setPrivacy}
      />
      {/* Other goal form fields */}
    </View>
  );
}
```

### Component Implementation

```jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const privacyOptions = [
  {
    id: 'public',
    label: 'Everyone',
    description: 'Anyone using Good-Busy can see this goal',
    icon: 'earth',
  },
  {
    id: 'followers',
    label: 'Followers',
    description: 'Only people who follow you can see this goal',
    icon: 'account-group',
  },
  {
    id: 'private',
    label: 'Only Me',
    description: 'Only you can see this goal',
    icon: 'lock',
  },
];

export const GoalPrivacySelector = ({ selectedOption, onSelect }) => {
  return (
    <View style={styles.container}>
      {privacyOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.option,
            selectedOption === option.id && styles.selectedOption,
          ]}
          onPress={() => onSelect(option.id)}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={option.icon}
              size={24}
              color={selectedOption === option.id ? '#6b4dc5' : '#757575'}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{option.label}</Text>
            <Text style={styles.description}>{option.description}</Text>
          </View>
          <View style={styles.radioContainer}>
            <View
              style={[
                styles.radioOuter,
                selectedOption === option.id && styles.radioOuterSelected,
              ]}
            >
              {selectedOption === option.id && (
                <View style={styles.radioInner} />
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#f0ebfa',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#757575',
  },
  radioContainer: {
    width: 24,
    alignItems: 'center',
  },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9e9e9e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#6b4dc5',
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#6b4dc5',
  },
});
```

### Integration with API

When creating or updating a goal, the privacy setting is included in the request payload:

```javascript
const createNewGoal = async (goalData) => {
  try {
    const response = await fetch(`${API_URL}/v1/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: goalData.title,
        description: goalData.description,
        frequency: goalData.frequency,
        privacy: goalData.privacy, // 'public', 'followers', or 'private'
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      // Handle success
      return data.data;
    } else {
      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: data.message || 'Failed to create goal',
      });
      return null;
    }
  } catch (error) {
    // Show error toast for network issues
    Toast.show({
      type: 'error',
      text1: 'Network Error',
      text2: 'Check your internet connection',
    });
    return null;
  }
};
```

## Toast Notification Component

The Toast component displays feedback messages to users after API operations. It integrates with our responseHandler middleware to provide consistent messaging.

### Usage

```jsx
import { Toast } from '../components/Toast';

function App() {
  return (
    <>
      <NavigationContainer>
        {/* App navigation */}
      </NavigationContainer>
      <Toast />
    </>
  );
}
```

### Component Implementation

```jsx
import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../hooks/useToast';

export const Toast = () => {
  const { visible, type, message, hideToast } = useToast();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideAnimation();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast();
    });
  };

  if (!visible) return null;

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'info':
        return '#2196f3';
      default:
        return '#6b4dc5';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={getIconName()} size={24} color="white" />
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={hideAnimation}>
        <Ionicons name="close" size={20} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 9999,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
});
```

### Context Provider

```jsx
import React, { createContext, useState, useContext } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    type: 'info',
    message: '',
  });

  const showToast = (type, message) => {
    setToast({
      visible: true,
      type,
      message,
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return (
    <ToastContext.Provider value={{ ...toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
```

### API Response Integration

```javascript
// Example of using the toast with our API
const updateGoal = async (goalId, goalData) => {
  try {
    const response = await fetch(`${API_URL}/v1/goals/${goalId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(goalData),
    });

    const data = await response.json();
    
    if (data.success) {
      // Show success toast
      showToast('success', data.message || 'Goal updated successfully');
      return data.data;
    } else {
      // Show error toast
      showToast('error', data.message || 'Failed to update goal');
      return null;
    }
  } catch (error) {
    // Show error toast for network issues
    showToast('error', 'Network error. Please try again later.');
    return null;
  }
};
```

These components work together to provide a complete user experience for managing goal privacy settings and receiving consistent feedback on API operations. 
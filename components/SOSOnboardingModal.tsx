import { useSOS } from '@/context/SOSContext';
import React, { useState } from 'react';
import { Alert, Button, Keyboard, Modal, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

interface SOSOnboardingModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function SOSOnboardingModal({ isVisible, onClose }: SOSOnboardingModalProps) {
  const { setConfig, requestPermissions } = useSOS();
  const [name, setName] = useState('');
  const [helpline1, setHelpline1] = useState('');
  const [helpline2, setHelpline2] = useState('');

  const handleSave = async () => {
    console.log('Attempting to save SOS configuration...');

    const trimmedName = name.trim();
    const trimmedHelpline1 = helpline1.trim();
    const trimmedHelpline2 = helpline2.trim();

    if (!trimmedName || !trimmedHelpline1) {
      console.log('Validation failed: Missing name or helpline1.');
      Alert.alert('Missing Information', 'Please enter your name and at least one helpline number.');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(trimmedHelpline1) || (trimmedHelpline2 && !phoneRegex.test(trimmedHelpline2))) {
        console.log('Validation failed: Invalid phone number format.');
        Alert.alert('Invalid Phone Number', 'Please enter valid phone numbers (including country code if necessary).\nExample: +11234567890');
        return;
    }

    console.log('Validation passed. Requesting permissions...');
    const permissionsGranted = await requestPermissions();

    if (!permissionsGranted) {
        console.log('Permissions not granted. Aborting save.');
        // requestPermissions function should already show an alert
        return;
    }

    console.log('Permissions granted. Attempting to set config...');
    try {
      await setConfig({
        name: trimmedName,
        helpline1: trimmedHelpline1,
        helpline2: trimmedHelpline2 || undefined, // Use undefined if empty
      });
      console.log('Config set successfully. Closing modal.');
      onClose(); // Close modal only on successful config set
    } catch (error) {
      console.error('Error setting SOS config:', error);
      Alert.alert('Save Error', 'An error occurred while saving your configuration. Please try again.');
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.title}>SOS Configuration</Text>
            <Text style={styles.description}>
              Please enter your name and at least one helpline number to use the SOS feature.
              Your location will be sent to these numbers in case of an emergency.
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Helpline Number 1"
              keyboardType="phone-pad"
              value={helpline1}
              onChangeText={setHelpline1}
            />
             <TextInput
              style={styles.input}
              placeholder="Helpline Number 2 (Optional)"
              keyboardType="phone-pad"
              value={helpline2}
              onChangeText={setHelpline2}
            />

            <Button title="Save Configuration" onPress={handleSave} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
}); 
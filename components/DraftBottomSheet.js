import React from 'react'

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

const { height: screenHeight } = Dimensions.get('window')

const DraftBottomSheet = ({
  visible,
  onClose,
  onSaveDraft,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation()

const handleSaveDraft = () => {
  setTimeout(() => onClose(), 0)
  onSaveDraft()
}


 const handleSubmit = () => {
  setTimeout(() => onClose(), 0)
  onSubmit()
}


  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        <View style={styles.bottomSheet}>
          <View style={styles.handle} />
          
          <Text style={styles.title}>{t('saveChanges', 'Save Changes')}</Text>
          <Text style={styles.subtitle}>
            {t('saveChangesMessage', 'Choose how you want to save your changes')}
          </Text>

          <View style={styles.options}>
            <TouchableOpacity
              style={styles.option}
              onPress={handleSaveDraft}
              disabled={isLoading}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="save-outline" size={24} color="#007EFD" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  {t('saveAsDraft', 'Save as Draft')}
                </Text>
                <Text style={styles.optionDescription}>
                  {t('saveAsDraftDesc', 'Save your progress and continue later')}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  {t('submitListing', 'Submit Listing')}
                </Text>
                <Text style={styles.optionDescription}>
                  {t('submitListingDesc', 'Publish your car listing now')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>
              {t('cancel', 'Cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    maxHeight: screenHeight * 0.6,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  options: {
    gap: 16,
    marginBottom: 32,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
})

export default DraftBottomSheet
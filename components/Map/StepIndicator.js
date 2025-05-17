import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"

const StepIndicator = ({ steps, currentStep, onStepPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <View style={[styles.line, index <= currentStep ? styles.activeLine : styles.inactiveLine]} />
            )}
            <TouchableOpacity
              style={[
                styles.stepCircle,
                index < currentStep
                  ? styles.completedStep
                  : index === currentStep
                    ? styles.activeStep
                    : styles.inactiveStep,
              ]}
              onPress={() => onStepPress(index)}
              disabled={index > currentStep}
            >
              <Text
                style={[styles.stepNumber, index <= currentStep ? styles.activeStepNumber : styles.inactiveStepNumber]}
              >
                {index + 1}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>
      <View style={styles.labelsContainer}>
        {steps.map((step, index) => (
          <Text
            key={index}
            style={[styles.stepLabel, index === currentStep ? styles.activeStepLabel : styles.inactiveStepLabel]}
            numberOfLines={1}
          >
            {step}
          </Text>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  activeStep: {
    backgroundColor: "#007EFD",
  },
  completedStep: {
    backgroundColor: "#007EFD",
  },
  inactiveStep: {
    backgroundColor: "#EEEEEE",
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "bold",
  },
  activeStepNumber: {
    color: "white",
  },
  inactiveStepNumber: {
    color: "#666666",
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
  activeLine: {
    backgroundColor: "#007EFD",
  },
  inactiveLine: {
    backgroundColor: "#EEEEEE",
  },
  stepLabel: {
    fontSize: 12,
    textAlign: "center",
    width: 60,
  },
  activeStepLabel: {
    color: "#007EFD",
    fontWeight: "600",
  },
  inactiveStepLabel: {
    color: "#666666",
  },
})

export default StepIndicator


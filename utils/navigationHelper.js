import { getUserData } from "./auth"

// Check if user should see commissionary plan
export const shouldShowCommissionaryPlan = async () => {
  try {
    const user = await getUserData()
    if (!user) return false

    // Check if user is a car owner
    if (user.userType !== "owner" && user.role !== "owner") return false

    // Check if user has been registered for 6 months
    const registrationDate = new Date(user.createdAt || user.registeredAt)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    return registrationDate <= sixMonthsAgo
  } catch (error) {
    console.error("Error checking commissionary plan eligibility:", error)
    return false
  }
}

// Navigate to commissionary plan if eligible
export const navigateToCommissionaryPlanIfEligible = async (navigation) => {
  try {
    const shouldShow = await shouldShowCommissionaryPlan()
    if (shouldShow) {
      navigation.navigate("CommissionaryPlan")
      return true
    }
    return false
  } catch (error) {
    console.error("Error navigating to commissionary plan:", error)
    return false
  }
}

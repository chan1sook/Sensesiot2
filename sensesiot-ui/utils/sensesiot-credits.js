export function formatSensesiotCredit(authUser, { withUnit = false } = {}) {
  if (!authUser || !authUser.sensesiot) {
    return '-'
  }

  const credit = getSensesiotAvaliableCredits(authUser.sensesiot)

  if (withUnit) {
    return `${credit} Credit(s)`
  }

  return `${credit}`
}

export function getSensesiotUsedCredits(sensesiotUserInfo) {
  if (!sensesiotUserInfo) {
    return 0
  }
  return sensesiotUserInfo.usedCredits
}

export function getSensesiotMaxCredits(sensesiotUserInfo) {
  if (!sensesiotUserInfo) {
    return 0
  }
  return sensesiotUserInfo.credits
}

export function getSensesiotAvaliableCredits(sensesiotUserInfo) {
  return Math.max(sensesiotUserInfo.credits - sensesiotUserInfo.usedCredits, 0)
}

export default Object.freeze({
  getSensesiotUsedCredits,
  getSensesiotMaxCredits,
  getSensesiotAvaliableCredits,
})

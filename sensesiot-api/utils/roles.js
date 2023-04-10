export const DEVELOPER_ROLE = "developer";
export const ADSMANAGER_ROLE = "adsmanager";
export const USER_ROLE = "user";
export const GUEST_ROLE = "guest";

export function isDevRole(role) {
  return role === DEVELOPER_ROLE;
}

export function isAdsManagerRole(role) {
  return isDevRole(role) || role === ADSMANAGER_ROLE;
}

export function isNotGuestRole(role) {
  return role !== GUEST_ROLE;
}

export default Object.freeze({
  DEVELOPER_ROLE,
  ADSMANAGER_ROLE,
  USER_ROLE,
  GUEST_ROLE,
  isDevRole,
  isAdsManagerRole,
  isNotGuestRole,
})
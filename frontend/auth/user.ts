export type StoredUserProfile = {
  username: string;
};

const STORAGE_KEY = "user_profile";

export function getStoredUserProfile(): StoredUserProfile | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUserProfile;
  } catch {
    return null;
  }
}

export function setStoredUserProfile(profile: StoredUserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

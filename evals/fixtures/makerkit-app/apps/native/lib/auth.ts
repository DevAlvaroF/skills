import * as SecureStore from 'expo-secure-store';

/** The signed-in user's Supabase access token, kept in the device's secure store. */
export async function getAccessToken() {
  return SecureStore.getItemAsync('access-token');
}

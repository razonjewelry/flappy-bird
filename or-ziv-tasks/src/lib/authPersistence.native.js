import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from 'firebase/auth';

// שמירת ההתחברות ב-AsyncStorage, כדי שלא נתחבר מחדש בכל פתיחה.
export const authPersistence = getReactNativePersistence(AsyncStorage);

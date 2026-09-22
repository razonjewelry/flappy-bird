import { registerRootComponent } from 'expo';

import App from './App';

// נקודת הכניסה של האפליקציה. registerRootComponent עוטף את AppRegistry
// ודואג שהאפליקציה תעלה נכון גם ב-Expo Go וגם בבילד עצמאי.
registerRootComponent(App);

import { jest } from '@jest/globals';
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual(
    '@react-native-async-storage/async-storage/jest/async-storage-mock',
  ),
);
jest.mock('expo-image', () => ({
  Image:
    jest.requireActual<typeof import('react-native')>('react-native').Image,
}));

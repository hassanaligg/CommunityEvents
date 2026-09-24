import { StyleSheet } from 'react-native';

export const typography = StyleSheet.create({
  default: { fontSize: 14 },
  strong: { fontSize: 14, fontWeight: '700' },
  captionStrong: { fontSize: 13, fontWeight: '700' },
  coverTitle: { fontSize: 25, fontWeight: '700', textAlign: 'center' },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.7 },
  body: { fontSize: 16, lineHeight: 25 },
  button: { fontSize: 15, fontWeight: '700' },
  cardTitle: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  category: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  appBarTitle: { fontSize: 20, fontWeight: '700' },
  brand: { fontSize: 12, letterSpacing: 2 },
  caption: { fontSize: 13 },
  tabLabel: { fontSize: 10, fontWeight: '500' },
  tabLabelBeside: { fontSize: 13, lineHeight: 24, fontWeight: '500' },
});

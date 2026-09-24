import { useColorScheme } from 'react-native';

export function usePalette() {
  const dark = useColorScheme() === 'dark';
  return {
    appBar: dark ? '#183C31' : '#235D43',
    onAppBar: '#FFFFFF',
    background: dark ? '#131C1A' : '#F7F8F4',
    surface: dark ? '#202D29' : '#FFFFFF',
    text: dark ? '#F2F5ED' : '#183C31',
    muted: dark ? '#B4C5BC' : '#586D62',
    accent: dark ? '#B9E3C4' : '#235D43',
    border: dark ? '#3D5147' : '#DFE5DD',
    placeholder: '#DCE6D8',
    onPlaceholder: '#235D43',
    appBarButton: 'rgba(255,255,255,0.1)',
    error: dark ? '#FFB7AD' : '#A22C26',
  };
}

export type Palette = ReturnType<typeof usePalette>;

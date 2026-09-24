import { Image } from 'expo-image';
import { ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    error: dark ? '#FFB7AD' : '#A22C26',
  };
}
export function Title({ children }: { children: ReactNode }) {
  const p = usePalette();
  return (
    <Text accessibilityRole="header" style={[styles.title, { color: p.text }]}>
      {children}
    </Text>
  );
}
export function Body({ children }: { children: ReactNode }) {
  const p = usePalette();
  return (
    <Text style={{ color: p.muted, fontSize: 16, lineHeight: 25 }}>
      {children}
    </Text>
  );
}
export function Button({
  label,
  onPress,
  disabled = false,
  selected = false,
}: {
  label: string;
  onPress(): void;
  disabled?: boolean;
  selected?: boolean;
}) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: p.accent,
        backgroundColor: selected ? p.accent : p.surface,
        opacity: disabled || pressed ? 0.6 : 1,
        justifyContent: 'center',
        alignItems: 'center',
      })}
    >
      <Text
        style={{
          color: selected ? p.background : p.accent,
          fontWeight: '700',
          fontSize: 15,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function StateView({
  title,
  message,
  loading,
  retry,
}: {
  title: string;
  message?: string;
  loading?: boolean;
  retry?: () => void;
}) {
  const p = usePalette();
  return (
    <View style={{ padding: 28, gap: 16 }} accessibilityLiveRegion="polite">
      {loading && (
        <ActivityIndicator color={p.accent} accessibilityLabel="Loading" />
      )}
      <Title>{title}</Title>
      {message && <Body>{message}</Body>}
      {retry && <Button label="Try again" onPress={retry} />}
    </View>
  );
}
export function Page({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  const p = usePalette();
  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.page}>{children}</ScrollView>
  ) : (
    <View style={[styles.page, { flex: 1 }]}>{children}</View>
  );
  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={{ flex: 1, backgroundColor: p.background }}
    >
      {content}
    </SafeAreaView>
  );
}
export function Cover({ uri, title }: { uri?: string; title: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <View
      style={{
        aspectRatio: 1.9,
        backgroundColor: '#DCE6D8',
        overflow: 'hidden',
        borderRadius: 18,
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Text
          style={{
            color: '#235D43',
            fontSize: 25,
            fontWeight: '700',
            textAlign: 'center',
          }}
        >
          Together is better.
        </Text>
        <Text style={{ color: '#235D43', marginTop: 10 }}>
          COMMUNITY EVENTS
        </Text>
      </View>
      {uri && !failed && (
        <Image
          source={uri}
          accessibilityLabel={title}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}
export function Avatar({ name, uri }: { name: string; uri?: string }) {
  const [failedUri, setFailedUri] = useState<string>();
  const p = usePalette();
  return (
    <View
      accessibilityLabel={name}
      style={{
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: p.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: p.text, fontWeight: '700' }}>
        {name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)}
      </Text>
      {uri && failedUri !== uri && (
        <Image
          source={uri}
          accessibilityLabel={name}
          style={[StyleSheet.absoluteFill, { borderRadius: 23 }]}
          contentFit="cover"
          cachePolicy="memory-disk"
          onError={() => setFailedUri(uri)}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.7 },
  page: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    padding: 20,
    gap: 20,
  },
});

import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { usePalette } from './ui';

export function DataNotice({
  retry,
  loading,
}: {
  retry(): void;
  loading: boolean;
}) {
  const p = usePalette();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingLeft: 12,
        paddingRight: 4,
        borderRadius: 12,
        backgroundColor: p.surface,
        borderWidth: 1,
        borderColor: p.border,
      }}
    >
      <Text style={{ flex: 1, color: p.muted, fontSize: 13 }}>
        Showing demo data. Live data unavailable.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={loading ? 'Retrying' : 'Retry'}
        accessibilityState={{ disabled: loading, busy: loading }}
        disabled={loading}
        onPress={retry}
        style={({ pressed }) => ({
          minHeight: 44,
          paddingHorizontal: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        {loading && <ActivityIndicator size="small" color={p.accent} />}
        <Text style={{ color: p.accent, fontWeight: '700', fontSize: 13 }}>
          {loading ? 'Retrying…' : 'Retry'}
        </Text>
      </Pressable>
    </View>
  );
}

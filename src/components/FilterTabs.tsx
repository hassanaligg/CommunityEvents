import { ScrollView, StyleSheet, View } from 'react-native';
import { layout } from '@/theme/layout';
import { Button } from './Button';

type FilterTabsProps = {
  options: readonly string[];
  selected: string;
  onSelect(value: string): void;
  getLabel?(value: string): string;
};

export function FilterTabs({
  options,
  selected,
  onSelect,
  getLabel = (value) => value,
}: FilterTabsProps) {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.options}
      >
        {options.map((option) => (
          <Button
            key={option}
            label={getLabel(option)}
            selected={selected === option}
            onPress={() => onSelect(option)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ options: { gap: layout.controlGap } });

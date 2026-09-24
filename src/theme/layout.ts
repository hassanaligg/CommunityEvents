// Shared dimensions; one-off component geometry stays beside its component.
export const layout = {
  maxContentWidth: 1120,
  pagePadding: 20,
  sectionGap: 20,
  controlGap: 8,
  gridGap: 18,
  minTouchSize: 48,
  buttonRadius: 14,
  cardRadius: 24,
};

export const columnsForWidth = (width: number) => (width >= 768 ? 2 : 1);

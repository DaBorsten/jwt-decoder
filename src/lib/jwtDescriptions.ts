import i18n from "../i18n";

// Return localized description for a JWT key if available
export function tooltipTextForKey(key: string): string | undefined {
  const val = i18n.t(`jwtdesc.${key}`);
  // If translation not found, i18next returns the key itself
  if (!val || val === `jwtdesc.${key}`) return undefined;
  return val;
}

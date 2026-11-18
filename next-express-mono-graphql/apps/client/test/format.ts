export function formatPrice(cents: number, currency = "EGP", locale = "ar-EG"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
}

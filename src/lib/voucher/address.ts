// Dirección con la ciudad y el país si no los incluye ya.
export function fullAddress({ address, city, country }: { address: string; city: string; country: string }) {
  const extra = [city, country].filter((part) => part && !address.includes(part));
  return [address, ...extra].join(", ");
}

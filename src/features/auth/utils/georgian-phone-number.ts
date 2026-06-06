export function formatGeorgianPhoneNumber(value: string) {
  const localNumber = extractGeorgianLocalNumber(value);
  const groups = [
    localNumber.slice(0, 3),
    localNumber.slice(3, 5),
    localNumber.slice(5, 7),
    localNumber.slice(7, 9),
  ].filter(Boolean);

  return `(+995) ${groups.join(' ')}`;
}

export function normalizeGeorgianPhoneNumber(value: string) {
  return `+995${extractGeorgianLocalNumber(value)}`;
}

function extractGeorgianLocalNumber(value: string) {
  const digits = value.replace(/\D/g, '');
  const withoutCountryCode = digits.startsWith('995')
    ? digits.slice(3)
    : digits;
  const withoutLocalPrefix = withoutCountryCode.startsWith('0')
    ? withoutCountryCode.slice(1)
    : withoutCountryCode;

  return withoutLocalPrefix.slice(0, 9);
}

export function hexToString(hex: string | undefined): string {
  if (!hex) return 'Unknown'
  // Remove leading 0x if present
  if (hex.startsWith('0x')) hex = hex.slice(2)

  // Convert every 2 hex chars to a char
  return (
    hex
      .match(/.{1,2}/g)
      ?.map((byte) => String.fromCharCode(parseInt(byte, 16)))
      .join('') || ''
  )
}

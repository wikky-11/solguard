type BufferLike = Buffer | Uint8Array;

function toHex(buffer: BufferLike) {
  return Buffer.from(buffer).toString("hex");
}

export function toBigIntBE(buffer: BufferLike) {
  const hex = toHex(buffer);

  return hex.length === 0 ? 0n : BigInt(`0x${hex}`);
}

export function toBigIntLE(buffer: BufferLike) {
  const reversed = Buffer.from(buffer);
  reversed.reverse();

  return toBigIntBE(reversed);
}

export function toBufferBE(value: bigint, width: number) {
  const hex = value.toString(16).padStart(width * 2, "0").slice(0, width * 2);

  return Buffer.from(hex, "hex");
}

export function toBufferLE(value: bigint, width: number) {
  const buffer = toBufferBE(value, width);
  buffer.reverse();

  return buffer;
}

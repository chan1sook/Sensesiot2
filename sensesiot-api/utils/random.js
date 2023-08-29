import { nanoid, customAlphabet } from "nanoid";

// Random Device Key 2.0 for iot garage
// Using nanoid except last 12 letter must not mac address letters [0-9A-Fa-f]
const prefixAlphabetSet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-";
const suffixAlphabetSet = prefixAlphabetSet.replace(/[0-9A-Fa-f]/g, "");

export function randomDeviceKey(length = 20) {
  if (length < 12) {
    throw new Error("Too short!");
  }

  let prefixLength = length - 12;
  let suffixLength = 12;
  if (length < 12) {
    prefixLength = 0;
    suffixLength = length;
  }

  const prefix =
    prefixLength > 0 ? customAlphabet(prefixAlphabetSet)(prefixLength) : "";
  const suffix = customAlphabet(suffixAlphabetSet)(suffixLength);
  return prefix + suffix;
}

export function isReservedDeviceKey(str = "") {
  if (str.length < 12) {
    return true;
  }

  const prefixLength = str.length - 12;
  const suffixLength = 12;

  const suffix = str.substring(prefixLength, suffixLength);
  return /[0-9A-Fa-f]/.test(suffix);
}

// Other random hash
export function randomHash(length = 21) {
  return nanoid(length);
}

export default Object.freeze({
  randomDeviceKey,
  randomHash,
});

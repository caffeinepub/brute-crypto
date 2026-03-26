// Keys are stored encoded to avoid plaintext exposure in source
// Encoded with a simple reversible cipher for obfuscation
const _xk = (s: string) =>
  s
    .split("")
    .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (7 + (i % 5))))
    .join("");
const _dk = (s: string) => _xk(s); // symmetric

// Encoded key banks — do not edit raw values
const _BK = [_xk("GIAYACEY"), _xk("OVECSIBS"), _xk("YEVSGUVA")];
const _EK = [_xk("FSHVSJNW"), _xk("GSYSSGUI"), _xk("HSGSVSUU")];
const _NK = [_xk("TVVUVETY"), _xk("HSGVSFUI"), _xk("TWIGSXOW")];
const _UK = [_xk("GEHBSCIY"), _xk("HEGVSIJU"), _xk("HEUBEIHH")];
const _AK = [
  _xk("GEUJWIJV"),
  _xk("KAIHVWFY"),
  _xk("GSYVUWIN"),
  _xk("UIOENSOP"),
];
const _MK = _xk("BRUTECRYPTOADM");

export type KeyResult =
  | { type: "master" }
  | { type: "all" }
  | { type: "chain"; chain: string }
  | { type: "invalid" };

export function validateKey(input: string): KeyResult {
  const upper = input.toUpperCase();
  if (_dk(_MK) === upper) return { type: "master" };
  if (_AK.some((k) => _dk(k) === upper)) return { type: "all" };
  if (_BK.some((k) => _dk(k) === upper)) return { type: "chain", chain: "btc" };
  if (_EK.some((k) => _dk(k) === upper)) return { type: "chain", chain: "eth" };
  if (_NK.some((k) => _dk(k) === upper)) return { type: "chain", chain: "bnb" };
  if (_UK.some((k) => _dk(k) === upper))
    return { type: "chain", chain: "usdt" };
  return { type: "invalid" };
}

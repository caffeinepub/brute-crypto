import { createActorWithConfig } from "../config";

// Admin token stored as base64 — do not expose plaintext
const _at = atob("QnJ1dGVDcnlwdG9BZG1pbjIwMjY=");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _backendInstance: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getBackend(): Promise<any> {
  if (!_backendInstance) {
    _backendInstance = await createActorWithConfig();
  }
  return _backendInstance;
}

export const adminToken = () => _at;

// Lazy proxy that calls getBackend() for each method
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const backend: any = new Proxy(
  {},
  {
    get(_target, prop: string) {
      return async (...args: unknown[]) => {
        const actor = await getBackend();
        if (typeof actor[prop] === "function") {
          return actor[prop](...args);
        }
        throw new Error(`Method ${prop} not found on backend`);
      };
    },
  },
);

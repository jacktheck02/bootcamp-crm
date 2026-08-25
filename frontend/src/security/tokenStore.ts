// Deliberately memory-only.
// Do not move this token into localStorage/sessionStorage.
let token: string | null = null;

export const tokenStore = {
  set(value: string) {
    token = value;
  },
  get() {
    return token;
  },
  clear() {
    token = null;
  },
};

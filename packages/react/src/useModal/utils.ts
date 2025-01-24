export function basicActions<T extends string, P = any>(type: T, payload?: P) {
  return {
    type,
    payload,
  };
}
export type BasicActions<T = string> = {
  dispatch: (actions: { type: T; payload: any }) => void;
};

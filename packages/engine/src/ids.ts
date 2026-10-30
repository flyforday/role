let counter = 0;

/** Identifiant court et unique, préfixé (ex. "pj_k3x9a1"). */
export function makeId(prefix: string): string {
  counter = (counter + 1) % 1_000_000;
  const rand = Math.floor(Math.random() * 36 ** 4).toString(36).padStart(4, '0');
  return `${prefix}_${Date.now().toString(36).slice(-5)}${counter.toString(36)}${rand}`;
}

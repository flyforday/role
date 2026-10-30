/**
 * Limiteur à fenêtre fixe, en mémoire de l'isolat. C'est une protection « au mieux » : Cloudflare peut
 * répartir les requêtes sur plusieurs isolats, mais pour un petit groupe cela suffit à éviter qu'une
 * boucle ou un abus ne vide le quota commun en quelques minutes.
 */
export class RateLimiter {
  private buckets = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly now: () => number = Date.now) {}

  /** Renvoie 0 si la requête est acceptée, sinon le nombre de secondes avant de réessayer. */
  hit(key: string, limit: number, windowMs: number): number {
    const t = this.now();
    if (this.buckets.size > 5000) this.sweep(t);
    const b = this.buckets.get(key);
    if (!b || b.resetAt <= t) {
      this.buckets.set(key, { count: 1, resetAt: t + windowMs });
      return 0;
    }
    if (b.count >= limit) return Math.ceil((b.resetAt - t) / 1000);
    b.count++;
    return 0;
  }

  private sweep(t: number) {
    for (const [k, b] of this.buckets) if (b.resetAt <= t) this.buckets.delete(k);
  }
}

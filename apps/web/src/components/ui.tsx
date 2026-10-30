import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-braise-500 text-nuit-950 hover:bg-braise-400 shadow-[0_0_24px_-6px_rgba(236,131,54,.6)]',
  secondary: 'bg-nuit-700 text-parchemin-100 hover:bg-nuit-600 border border-nuit-600',
  ghost: 'text-parchemin-200 hover:bg-nuit-700/70',
  danger: 'bg-sang-500/90 text-white hover:bg-sang-400',
};

export function Button({ variant = 'secondary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    />
  );
}

export function Card({ children, className = '', title, actions }: { children: ReactNode; className?: string; title?: ReactNode; actions?: ReactNode }) {
  return (
    <section className={`rounded-xl border border-nuit-700 bg-nuit-900/80 p-4 ${className}`}>
      {(title || actions) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="font-titre text-xl font-semibold text-parchemin-100">{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-parchemin-200">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-parchemin-300/70">{hint}</span>}
    </label>
  );
}

const inputCls =
  'w-full rounded-lg border border-nuit-600 bg-nuit-950/70 px-3 py-2 text-parchemin-100 placeholder:text-parchemin-300/40 focus:border-braise-500 focus:outline-none focus:ring-1 focus:ring-braise-500';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ''}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} ${props.className ?? ''}`} />;
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`my-8 w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} animate-fadein rounded-2xl border border-nuit-600 bg-nuit-900 p-5 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-titre text-2xl font-semibold text-parchemin-100">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-parchemin-300 hover:text-white" aria-label="Fermer">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Tag({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'bad' | 'ember' }) {
  const tones = {
    neutral: 'bg-nuit-700 text-parchemin-200',
    good: 'bg-mousse-500/20 text-mousse-400',
    bad: 'bg-sang-500/20 text-sang-400',
    ember: 'bg-braise-500/20 text-braise-300',
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Bar({ value, max, tone = 'good' }: { value: number; max: number; tone?: 'good' | 'bad' | 'ember' }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const color = tone === 'bad' ? 'bg-sang-500' : tone === 'ember' ? 'bg-braise-500' : pct < 35 ? 'bg-sang-500' : pct < 65 ? 'bg-braise-500' : 'bg-mousse-500';
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-nuit-700" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-braise-300">
      <span className="h-2 w-2 animate-flicker rounded-full bg-braise-400" />
      {label}
    </span>
  );
}

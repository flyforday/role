import { useEffect, useState } from 'react';
import { saveSettings, useSettings, workerBase, type ProviderChoice } from '../lib/settings';
import { webGpuAvailable } from '../lib/webllm';
import { NARRATOR_VOICES, narrate } from '../lib/narration';
import { Button, Field, Input, Modal } from './ui';

const CHOICES: Array<[ProviderChoice, string, string]> = [
  ['relais', 'Relais partagé', "Le Worker du groupe appelle Gemini, puis Groq ou OpenRouter en secours (offres gratuites)."],
  ['byok', 'Ma propre clé', "Votre clé reste dans ce navigateur et n'est envoyée au relais qu'au moment de chaque requête, jamais enregistrée côté serveur."],
  ['webllm', 'Modèle local (expérimental)', 'Le modèle tourne dans votre navigateur via WebGPU : sans quota, mais lent à charger (~2 Go) et moins bon conteur.'],
  ['demo', 'MJ de démonstration', "Un MJ scripté, hors ligne, pour essayer l'interface sans IA."],
];

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useSettings();
  const [health, setHealth] = useState<string>('');

  useEffect(() => {
    if (!open || s.provider === 'demo' || s.provider === 'webllm') return;
    let cancelled = false;
    setHealth('Vérification du relais…');
    fetch(`${workerBase(s)}/api/health`)
      .then((r) => r.json())
      .then((d: { providers?: Array<{ name: string; model: string }> }) => {
        if (cancelled) return;
        const list = d.providers ?? [];
        setHealth(list.length ? `Relais joignable — fournisseurs : ${list.map((p) => `${p.name} (${p.model})`).join(', ')}` : 'Relais joignable mais aucun fournisseur configuré.');
      })
      .catch(() => !cancelled && setHealth('Relais injoignable à cette adresse.'));
    return () => {
      cancelled = true;
    };
  }, [open, s.provider, s.workerUrl]);

  return (
    <Modal open={open} onClose={onClose} title="Réglages">
      <div className="space-y-4">
        <Field label="Votre nom (affiché aux autres joueurs)">
          <Input value={s.displayName} onChange={(e) => saveSettings({ displayName: e.target.value })} placeholder="Léo" />
        </Field>
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium text-parchemin-200">Intelligence artificielle</legend>
          {CHOICES.map(([id, label, desc]) => (
            <label key={id} className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${s.provider === id ? 'border-braise-500 bg-braise-500/5' : 'border-nuit-700'}`}>
              <input type="radio" name="provider" checked={s.provider === id} onChange={() => saveSettings({ provider: id })} className="mt-1 accent-braise-500" />
              <span>
                <span className="block text-parchemin-100">{label}</span>
                <span className="block text-xs text-parchemin-300">{desc}</span>
                {id === 'webllm' && !webGpuAvailable() && <span className="block text-xs text-sang-400">WebGPU indisponible dans ce navigateur.</span>}
              </span>
            </label>
          ))}
        </fieldset>
        {s.provider === 'byok' && (
          <div className="space-y-3 rounded-lg border border-nuit-700 p-3">
            <Field label="Fournisseur">
              <select
                value={s.byokProvider}
                onChange={(e) => saveSettings({ byokProvider: e.target.value as typeof s.byokProvider })}
                className="w-full rounded-lg border border-nuit-600 bg-nuit-950 px-3 py-2 text-parchemin-100"
              >
                <option value="gemini">Google Gemini</option>
                <option value="groq">Groq</option>
                <option value="openrouter">OpenRouter</option>
              </select>
            </Field>
            <Field label="Clé d'API" hint="Stockée uniquement dans ce navigateur.">
              <Input type="password" autoComplete="off" value={s.byokKey} onChange={(e) => saveSettings({ byokKey: e.target.value.trim() })} />
            </Field>
            <Field label="Modèle (optionnel)" hint="Laisser vide pour le modèle par défaut du relais.">
              <Input value={s.byokModel} onChange={(e) => saveSettings({ byokModel: e.target.value.trim() })} />
            </Field>
          </div>
        )}
        {s.provider === 'webllm' && (
          <Field label="Modèle WebLLM" hint="Identifiant d'un modèle de la liste prédéfinie de WebLLM.">
            <Input value={s.webllmModel} onChange={(e) => saveSettings({ webllmModel: e.target.value.trim() })} />
          </Field>
        )}
        {(s.provider === 'relais' || s.provider === 'byok') && (
          <Field label="Adresse du relais (optionnel)" hint="Laisser vide pour utiliser l'adresse configurée au déploiement.">
            <Input value={s.workerUrl} onChange={(e) => saveSettings({ workerUrl: e.target.value.trim() })} placeholder="https://role.votre-compte.workers.dev" />
          </Field>
        )}
        {health && <p className="text-xs text-parchemin-300">{health}</p>}
        <fieldset className="space-y-3 rounded-lg border border-nuit-700 p-3">
          <legend className="px-1 text-sm font-medium text-parchemin-200">Voix du MJ</legend>
          <Field label="Moteur" hint="La voix de conteur passe par le relais (quota gratuit limité) ; la voix du navigateur prend le relais si besoin.">
            <select
              value={s.narratorEngine}
              onChange={(e) => saveSettings({ narratorEngine: e.target.value as typeof s.narratorEngine })}
              className="w-full rounded-lg border border-nuit-600 bg-nuit-950 px-3 py-2 text-parchemin-100"
            >
              <option value="ia">Voix de conteur (IA)</option>
              <option value="navigateur">Voix du navigateur (hors ligne)</option>
            </select>
          </Field>
          {s.narratorEngine === 'ia' && (
            <Field label="Conteur">
              <select
                value={s.narratorVoice}
                onChange={(e) => saveSettings({ narratorVoice: e.target.value })}
                className="w-full rounded-lg border border-nuit-600 bg-nuit-950 px-3 py-2 text-parchemin-100"
              >
                {NARRATOR_VOICES.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-parchemin-100">
            <input type="checkbox" checked={s.narrationAuto} onChange={(e) => saveSettings({ narrationAuto: e.target.checked })} className="accent-braise-500" />
            Lire automatiquement chaque réponse du MJ
          </label>
          <Button variant="ghost" onClick={() => narrate('essai-voix', 'La nuit tombe sur la forêt. Au loin, une lueur vacille entre les arbres… Que faites-vous ?')}>
            🔊 Essayer la voix
          </Button>
        </fieldset>
        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}

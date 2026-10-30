import { useState } from 'react';
import {
  ABILITIES,
  ABILITY_LABELS,
  ABILITY_POINTS,
  MOD_MAX,
  MOD_MIN,
  STARTING_WEAPONS,
  abilityPointsUsed,
  createCharacter,
  defenseFor,
  maxHpFor,
  validateAbilities,
  type Abilities,
  type Character,
  type NewCharacterInput,
} from '@veillee/engine';
import { Button, Card, Field, Input, TextArea } from '../components/ui';

const DESCRIPTIONS: Record<string, string> = {
  force: 'Frapper, soulever, enfoncer',
  agilite: 'Esquiver, grimper, initiative, défense',
  endurance: 'Points de vie, résister',
  intelligence: 'Savoir, déchiffrer, magie',
  perception: 'Remarquer, viser, intuition',
  charisme: 'Convaincre, mentir, impressionner',
};

const PRESETS: Array<{ label: string; concept: string; abilities: Abilities; weaponId: string }> = [
  { label: 'Combattant', concept: 'Mercenaire', abilities: { force: 3, agilite: 1, endurance: 2, intelligence: -1, perception: 1, charisme: 0 }, weaponId: 'arme-hache' },
  { label: 'Rôdeur', concept: 'Éclaireuse', abilities: { force: 0, agilite: 3, endurance: 1, intelligence: 0, perception: 2, charisme: 0 }, weaponId: 'arme-arc' },
  { label: 'Érudit', concept: 'Mage errant', abilities: { force: -1, agilite: 1, endurance: 0, intelligence: 3, perception: 2, charisme: 1 }, weaponId: 'arme-baton' },
  { label: 'Beau parleur', concept: 'Escroc charmeur', abilities: { force: -1, agilite: 2, endurance: 0, intelligence: 1, perception: 1, charisme: 3 }, weaponId: 'arme-dague' },
];

export function CharacterCreator({
  campaignTitle,
  onDone,
  onCancel,
  submitLabel = 'Commencer l\'aventure →',
  playerName,
}: {
  campaignTitle: string;
  onDone: (input: NewCharacterInput, character: Character) => void;
  onCancel?: () => void;
  submitLabel?: string;
  playerName?: string;
}) {
  const [name, setName] = useState('');
  const [concept, setConcept] = useState('');
  const [background, setBackground] = useState('');
  const [abilities, setAbilities] = useState<Abilities>({ force: 1, agilite: 1, endurance: 1, intelligence: 1, perception: 1, charisme: 1 });
  const [weaponId, setWeaponId] = useState(STARTING_WEAPONS[0].id);

  const used = abilityPointsUsed(abilities);
  const errors = validateAbilities(abilities);
  const valid = errors.length === 0 && name.trim().length > 0;

  const bump = (a: keyof Abilities, d: number) => setAbilities((s) => ({ ...s, [a]: Math.max(MOD_MIN, Math.min(MOD_MAX, s[a] + d)) }));

  const submit = () => {
    const input: NewCharacterInput = { name, concept, background, abilities, weaponId, playerName };
    onDone(input, createCharacter(input));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <h1 className="font-titre text-4xl font-bold text-parchemin-100">Votre personnage</h1>
      <p className="text-parchemin-300">Pour la campagne « {campaignTitle} ». La classe est libre : décrivez qui vous êtes.</p>
      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nom">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lyra Corbeaumer" autoFocus />
          </Field>
          <Field label="Concept / classe libre">
            <Input value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="Contrebandière repentie" />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Historique" hint="Quelques phrases : d'où vient votre personnage, ce qu'il cherche, ce qu'il craint.">
            <TextArea rows={3} value={background} onChange={(e) => setBackground(e.target.value)} />
          </Field>
        </div>
      </Card>
      <Card
        title="Caractéristiques"
        actions={
          <span className={`text-sm ${used === ABILITY_POINTS ? 'text-mousse-400' : 'text-braise-300'}`}>
            Points répartis : {used} / {ABILITY_POINTS}
          </span>
        }
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="text-xs text-parchemin-300">Modèles :</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              className="rounded-full border border-nuit-600 px-2 py-0.5 text-xs text-parchemin-200 hover:border-braise-500"
              onClick={() => {
                setAbilities(p.abilities);
                setWeaponId(p.weaponId);
                if (!concept) setConcept(p.concept);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="mb-3 text-xs text-parchemin-300">
          Chaque modificateur va de {MOD_MIN} à +{MOD_MAX} ; leur somme doit valoir {ABILITY_POINTS}. Un test réussit si 1d20 + modificateur atteint la difficulté (8, 12, 16 ou 20).
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {ABILITIES.map((a) => (
            <div key={a} className="flex items-center justify-between rounded-lg bg-nuit-950/60 px-3 py-2">
              <div>
                <p className="text-parchemin-100">{ABILITY_LABELS[a]}</p>
                <p className="text-xs text-parchemin-300">{DESCRIPTIONS[a]}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="h-8 w-8 p-0" aria-label={`Diminuer ${ABILITY_LABELS[a]}`} disabled={abilities[a] <= MOD_MIN} onClick={() => bump(a, -1)}>
                  −
                </Button>
                <span className="w-8 text-center font-titre text-xl font-semibold text-parchemin-100">{abilities[a] >= 0 ? `+${abilities[a]}` : abilities[a]}</span>
                <Button variant="ghost" className="h-8 w-8 p-0" aria-label={`Augmenter ${ABILITY_LABELS[a]}`} disabled={abilities[a] >= MOD_MAX} onClick={() => bump(a, 1)}>
                  +
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-parchemin-200">
          PV : <strong>{maxHpFor(1, abilities.endurance)}</strong> · Défense : <strong>{defenseFor(abilities.agilite)}</strong> · Initiative : 1d20 {abilities.agilite >= 0 ? '+' : ''}
          {abilities.agilite}
        </p>
      </Card>
      <Card title="Arme de départ">
        <div className="grid gap-2 sm:grid-cols-2">
          {STARTING_WEAPONS.map((w) => (
            <label key={w.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2 ${weaponId === w.id ? 'border-braise-500 bg-braise-500/5' : 'border-nuit-700'}`}>
              <input type="radio" name="arme" checked={weaponId === w.id} onChange={() => setWeaponId(w.id)} className="accent-braise-500" />
              <span>
                <span className="block text-parchemin-100">
                  {w.name} <span className="text-xs text-parchemin-300">({w.damage}, {ABILITY_LABELS[w.ability!]})</span>
                </span>
                <span className="block text-xs text-parchemin-300">{w.description}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-parchemin-300">Vous partez aussi avec un sac de voyage, une potion de soin et 10 pièces d'or.</p>
      </Card>
      {errors.length > 0 && <p className="text-sm text-braise-300">{errors.join(' · ')}</p>}
      <div className="flex justify-between">
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        ) : (
          <span />
        )}
        <Button variant="primary" disabled={!valid} onClick={submit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

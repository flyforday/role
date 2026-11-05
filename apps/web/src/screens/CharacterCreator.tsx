import { useState } from 'react';
import {
  ABILITIES,
  ABILITY_LABELS,
  ABILITY_POINTS,
  CHARACTER_CLASSES,
  CHARACTER_RACES,
  CUSTOM_CLASS_ID,
  MOD_MAX,
  MOD_MIN,
  STARTING_WEAPONS,
  abilityPointsUsed,
  characterClass,
  characterRace,
  createCharacter,
  defenseFor,
  maxHpFor,
  portraitsForRace,
  validateAbilities,
  type Abilities,
  type Character,
  type NewCharacterInput,
} from '@veillee/engine';
import { Button, Card, Field, Input, TextArea } from '../components/ui';
import { CharacterPortrait } from '../components/CharacterPortrait';

const DESCRIPTIONS: Record<string, string> = {
  force: 'Frapper, soulever, enfoncer',
  agilite: 'Esquiver, grimper, initiative, défense',
  endurance: 'Points de vie, résister',
  intelligence: 'Savoir, déchiffrer, magie',
  perception: 'Remarquer, viser, intuition',
  charisme: 'Convaincre, mentir, impressionner',
};

const selectClassName = 'w-full rounded-lg border border-nuit-600 bg-nuit-950 px-3 py-2 text-parchemin-100 focus:border-braise-500 focus:outline-none focus:ring-1 focus:ring-braise-500';

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
  const [classId, setClassId] = useState(CHARACTER_CLASSES[0].id);
  const [raceId, setRaceId] = useState(CHARACTER_RACES[0].id);
  const [portraitIndex, setPortraitIndex] = useState(0);
  const [background, setBackground] = useState('');
  const [abilities, setAbilities] = useState<Abilities>({ force: 1, agilite: 1, endurance: 1, intelligence: 1, perception: 1, charisme: 1 });
  const [weaponId, setWeaponId] = useState(STARTING_WEAPONS[0].id);

  const used = abilityPointsUsed(abilities);
  const errors = validateAbilities(abilities);
  const selectedClass = characterClass(classId);
  const selectedRace = characterRace(raceId)!;
  const portraits = portraitsForRace(raceId);
  const portraitId = portraits[portraitIndex];
  const customClass = classId === CUSTOM_CLASS_ID;
  const valid = errors.length === 0 && name.trim().length > 0 && (!customClass || concept.trim().length > 0);

  const bump = (a: keyof Abilities, d: number) => setAbilities((s) => ({ ...s, [a]: Math.max(MOD_MIN, Math.min(MOD_MAX, s[a] + d)) }));

  const submit = () => {
    if (!valid) return;
    const identity = customClass ? concept : `${selectedClass!.name}${concept.trim() ? ` — ${concept.trim()}` : ''}`;
    const input: NewCharacterInput = { name, concept: identity, classId, raceId, portraitId, background, abilities, weaponId, playerName };
    onDone(input, createCharacter(input));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <h1 className="font-titre text-4xl font-bold text-parchemin-100">Votre personnage</h1>
      <p className="text-parchemin-300">Pour la campagne « {campaignTitle} ». Choisissez votre classe, votre race et le visage de votre aventure.</p>
      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nom">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lyra Corbeaumer" autoFocus />
          </Field>
          <Field label="Classe">
            <select value={classId} onChange={(e) => { setClassId(e.target.value); setConcept(''); }} className={selectClassName}>
              {CHARACTER_CLASSES.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
              <option value={CUSTOM_CLASS_ID}>Classe personnalisée</option>
            </select>
          </Field>
        </div>
        <p className="mt-3 text-sm text-parchemin-300">{selectedClass?.description ?? 'Inventez votre propre voie : la classe reste libre.'}</p>
        <div className="mt-3">
          <Field label={customClass ? 'Votre classe personnalisée' : 'Votre approche (facultatif)'} hint={customClass ? 'Donnez un nom ou un concept à votre classe.' : 'Une précision pour le MJ : garde en exil, savante distraite, mercenaire repenti…'}>
            <Input value={concept} onChange={(e) => setConcept(e.target.value)} placeholder={customClass ? 'Contrebandière repentie' : 'Ancien garde de caravane'} />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Historique" hint="Quelques phrases : d'où vient votre personnage, ce qu'il cherche, ce qu'il craint.">
            <TextArea rows={3} value={background} onChange={(e) => setBackground(e.target.value)} />
          </Field>
        </div>
      </Card>
      <Card title="Race et portrait">
        <div className="grid gap-5 sm:grid-cols-[1fr_1.2fr]">
          <div className="space-y-3">
            <Field label="Race" hint="La race est indépendante de la classe et n’ajoute aucun bonus de caractéristiques.">
              <select value={raceId} onChange={(e) => setRaceId(e.target.value)} className={selectClassName}>
                {CHARACTER_RACES.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
              </select>
            </Field>
            <p className="text-sm text-parchemin-300">{selectedRace.description}</p>
            <p className="text-xs text-parchemin-300">Deux portraits par race, utilisables avec toutes les classes. Vous pouvez préciser votre apparence dans l’historique.</p>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-parchemin-200">Choisissez votre portrait</legend>
            <div className="grid grid-cols-2 gap-3">
              {portraits.map((id, index) => (
                <label key={id} className={`relative cursor-pointer rounded-xl border-2 p-1 focus-within:ring-2 focus-within:ring-braise-300 ${portraitId === id ? 'border-braise-500 bg-braise-500/10' : 'border-nuit-700 hover:border-nuit-600'}`}>
                  <input type="radio" name="portrait" value={id} checked={portraitId === id} onChange={() => setPortraitIndex(index)} aria-label={`Portrait ${index + 1} — ${selectedRace.name}`} className="sr-only" />
                  <CharacterPortrait portraitId={id} name={`${selectedRace.name}, portrait ${index + 1}`} className="aspect-square w-full" />
                  <span className="mt-1 flex items-center justify-center gap-1 text-xs text-parchemin-200">
                    {portraitId === id ? '✓ ' : ''}Portrait {index + 1}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
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
        {selectedClass && (
          <div className="mb-3">
            <Button onClick={() => { setAbilities({ ...selectedClass.abilities }); setWeaponId(selectedClass.weaponId); }}>
              Utiliser les caractéristiques conseillées : {selectedClass.name}
            </Button>
            <p className="mt-2 text-xs text-parchemin-300">Vous pouvez ensuite ajuster librement les caractéristiques et l’arme.</p>
          </div>
        )}
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

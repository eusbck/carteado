// Padrões compartilhados pelas cartas de Keen Engineering. Uma definição por carta continua em defs/.
import { and, anthem, controlledBy, draw, is, isType, lkiChars, on, selfGets, staticAbility, triggered } from '../motor/api.ts';
import type { SCtx } from '../motor/defs.ts';

export function artifacts(c: SCtx, includeEnchantments = false): number[] {
  return controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact') || (includeEnchantments && isType(c.g, id, 'Enchantment')));
}

export function affinity(c: SCtx): { reduce: number } { return { reduce: artifacts(c).length }; }

export function artifactSize() {
  return selfGets((c) => { const n = artifacts(c).length; return [{ k: 'setPT', p: n, t: n }]; }, 'Força e resistência iguais ao número de artefatos que você controla.', { cda: true });
}

export function artifactReduction() {
  return staticAbility({ rules: { costModifier: (c, spell) => spell.controller === c.you && spell.chars.types.includes('Artifact') ? { reduce: 1 } : null }, text: 'Mágicas de artefato que você conjura custam {1} menos.' });
}

export function otherArtifactAnthem() {
  return anthem(and(is.creature, is.artifact, is.yours, is.other), () => [{ k: 'pt', p: 1, t: 1 }], 'Outras criaturas artefato que você controla recebem +1/+1.');
}

export function artifactCombatDraw(batch: boolean) {
  const matches = (e: import('../motor/events.ts').GameEvent, c: SCtx) => {
    if (e.type !== 'damage' || !e.combat || e.target.kind !== 'player' || e.controller !== c.you) return false;
    const source = lkiChars(c.g, e.source);
    return !!source?.types.includes('Artifact') && source.types.includes('Creature');
  };
  const trigger = batch ? on.batch((evs, c) => [...new Set(evs.flatMap((e) => matches(e, c) && e.type === 'damage' ? [e.target.id] : []))].map((player) => ({ player }))) : on.custom(matches);
  return triggered(trigger, function* (c) { yield* draw(c.g, c.you, 1); }, { text: batch ? 'Sempre que uma ou mais criaturas artefato suas causam dano de combate a um jogador, compre uma carta.' : 'Sempre que uma criatura artefato sua causa dano de combate a um jogador, compre uma carta.' });
}

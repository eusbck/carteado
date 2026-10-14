// Peças repetidas nas cartas do deck Squirreled Away (Bloomburrow Commander): Squirrels, Foods e fichas, tempestade
// (CR 702.40), esvanecer (CR 702.63), passo da floresta (CR 702.14) e o nível de Classe (CR 716.2a).
import {
  activated, chars, controlledBy, controllerOf, copySpell, emit, entersWithCounters, isLand, on, onCastThis, removeCounters,
  sacrifice, triggered,
} from '../motor/api.ts';
import type { AbilityDef, ActivatedDef, StaticDef, TriggeredDef } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/** é um Squirrel (tipo de criatura, nas características atuais)? */
export function ehEsquilo(g: G, id: ObjId): boolean {
  return chars(g, id).subtypes.includes('Squirrel');
}

/** é uma Food? "Food" é um tipo de artefato (rulings de Food: qualquer artefato Food, ficha ou não) */
export function ehComida(g: G, id: ObjId): boolean {
  const c = chars(g, id);
  return c.types.includes('Artifact') && c.subtypes.includes('Food');
}

/** é uma ficha? */
export function ehFicha(g: G, id: ObjId): boolean {
  return !!g.state.objects[id]?.isToken;
}

/** fichas que o jogador controla */
export function fichasDe(g: G, p: PlayerId): ObjId[] {
  return controlledBy(g, p, (id) => ehFicha(g, id));
}

/**
 * CR 702.40a: Tempestade — "quando você conjura esta mágica, copie-a para cada outra mágica conjurada antes dela neste
 * turno; se ela tiver alvos, você pode escolher novos alvos para as cópias". Conta as mágicas de todos os jogadores,
 * inclusive anuladas e conjuradas de outras zonas (ruling 2 de Chatterstorm); cópias não contam (ruling 1).
 */
export function storm(): TriggeredDef {
  const a = onCastThis(function* (c) {
    const total = c.g.state.players.reduce((t, p) => t + (c.g.state.turnStats[p.id]?.spellsCast ?? 0), 0);
    // a contagem do turno já inclui esta mágica
    for (let i = 0; i < total - 1; i++) yield* copySpell(c.g, c.source, c.you, { newTargets: true, semExtra: i > 0 });
  }, 'Tempestade (quando você conjura esta mágica, copie-a para cada mágica conjurada antes dela neste turno).');
  a.kw = 'storm';
  return a;
}

/**
 * CR 702.63a: Esvanecer N — entra com N marcadores de tempo; no início da sua manutenção, se tiver marcador de tempo,
 * remova um; quando o último for removido, sacrifique-o.
 */
export function vanishing(n: number): AbilityDef[] {
  const entra = entersWithCounters('time', n);
  entra.kw = 'vanishing';
  entra.param = n;
  entra.text = `Esvanecer ${n} (esta permanente entra com ${n} marcadores de tempo; no início da sua manutenção, remova um; quando o último for removido, sacrifique-a)`;
  return [
    entra,
    triggered(on.upkeep('you'), function* (c) {
      removeCounters(c.g, { kind: 'obj', id: c.source }, 'time', 1);
    }, {
      condition: (c) => (c.g.state.objects[c.source]?.counters.time ?? 0) > 0,
      text: 'No início da sua manutenção, se esta permanente tiver um marcador de tempo, remova um marcador de tempo dela.',
    }),
    triggered(on.custom((e, c) => e.type === 'countersRemoved' && e.kind === 'time' && e.target.kind === 'obj' && e.target.id === c.source && (c.g.state.objects[c.source]?.counters.time ?? 0) === 0), function* (c) {
      if (c.g.state.objects[c.source]?.zone === 'battlefield') yield* sacrifice(c.g, [c.source]);
    }, { text: 'Quando o último marcador de tempo for removido desta permanente, sacrifique-a.' }),
  ];
}

/** CR 702.14c: passo da floresta — não pode ser bloqueada enquanto o jogador defensor controlar uma Forest */
export function forestwalk(): StaticDef {
  return {
    kind: 'static', kw: 'forestwalk',
    text: 'Passo da floresta (esta criatura não pode ser bloqueada enquanto o jogador defensor controlar uma Forest).',
    rules: {
      canBeBlockedBy: (c, atacante, bloqueador) => atacante !== c.source
        || controlledBy(c.g, controllerOf(c.g, bloqueador), (id) => isLand(c.g, id) && chars(c.g, id).subtypes.includes('Forest')).length === 0,
    },
  };
}

/** CR 716.2a: "[custo]: Nível N" — a Classe passa ao nível N; só no nível N-1 e só como feitiço */
export function nivelDeClasse(nome: string, custo: string, n: number): ActivatedDef {
  return activated(custo, function* (c) {
    const o = c.g.state.objects[c.source];
    if (!o || o.zone !== 'battlefield' || o.classLevel !== n - 1) return;
    o.classLevel = n;
    c.g.bump();
    c.g.log(`${nome} passa ao nível ${n}.`, { rule: '716.2a' });
    emit(c.g, [{ type: 'levelUp', obj: c.source, level: n }]);
  }, { timing: 'sorcery', condition: (c) => c.g.state.objects[c.source]?.classLevel === n - 1, text: `${custo}: Nível ${n}` });
}

/** notas dos rulings de Food, repetidas em várias cartas do deck */
export const COMIDA = {
  qualquer: 'regra geral: "uma Food" é qualquer artefato Food, ficha ou não (cartas/esquilos.ts ehComida)',
  umCusto: 'regra geral: CR 601.2h — uma permanente sacrificada paga um custo só',
  piada: 'não se aplica: ruling sem efeito de jogo',
  tipo: 'regra geral: CR 205.3g — Food é tipo de artefato, nunca tipo de criatura',
};

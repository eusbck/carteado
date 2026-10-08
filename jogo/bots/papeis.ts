// Papel de cada carta (fase 9, nível Difícil em diante): remoção, anular, compra, rampa, varredura, tutor, proteção,
// fichas. Sai do texto Oracle (inglês, padronizado pela Wizards) uma vez por carta, e não do texto das perguntas.

import { oracle } from '../motor/oracle.ts';

export type Papel = 'remocao' | 'anula' | 'compra' | 'rampa' | 'varredura' | 'tutor' | 'protecao' | 'fichas';

const PADROES: [Papel, RegExp][] = [
  ['remocao', /(destroy|exile) (up to (one|two) )?target|deals? (\d+|x) damage to (any target|target creature|target (creature or )?planeswalker)|target creature (an opponent controls )?gets -\d|return target (creature|nonland permanent|permanent).{0,40}to (its|their) owner'?s? hand|fights? target|target player sacrifices/],
  ['anula', /counter target/],
  ['compra', /draw (a|two|three|four|x|\w+) cards?|draws? cards? equal/],
  ['rampa', /add \{|add (one|two|three) mana|search your library for (a|up to \w+) basic land|land cards?.{0,40}onto the battlefield|put (a|up to \w+) land/],
  ['varredura', /(destroy|exile) all|each creature (gets|deals)|deals? \d+ damage to each/],
  ['tutor', /search your library for (a|an|up to \w+) (card|creature|artifact|enchantment|instant|sorcery)/],
  ['protecao', /(gains?|have|has) (hexproof|indestructible|protection|shroud)/],
  ['fichas', /create (a|an|two|three|x|\w+) .{0,40}tokens?/],
];

export interface InfoPapel {
  papeis: Set<Papel>;
  terreno: boolean;
  /** dá para usar no turno dos outros (instantânea ou lampejo) */
  instante: boolean;
}

const cache = new Map<string, InfoPapel>();

export function papelDe(def: string): InfoPapel {
  let r = cache.get(def);
  if (r) return r;
  const papeis = new Set<Papel>();
  let terreno = false;
  let instante = false;
  try {
    const o = oracle(def);
    const texto = o.faces.map((f) => f.oracleText).join('\n').toLowerCase();
    terreno = o.faces[0]?.types.includes('Land') ?? false;
    instante = !!o.faces[0]?.types.includes('Instant') || o.keywords.includes('Flash');
    for (const [p, re] of PADROES) if (re.test(texto)) papeis.add(p);
    if (terreno) papeis.delete('rampa');
  } catch { /* ficha ou carta sem Oracle: sem papel */ }
  r = { papeis, terreno, instante };
  cache.set(def, r);
  return r;
}

export const tem = (def: string, p: Papel): boolean => papelDe(def).papeis.has(p);

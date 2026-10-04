// Validação de deck de Commander (CR 903.3, 903.4, 903.5).

import { BASIC_LAND_MANA, oracle } from './oracle.ts';
import type { DeckList } from './state.ts';
import type { Color } from './types.ts';

export interface DeckProblem { rule: string; message: string }

export function validateDeck(deck: DeckList): DeckProblem[] {
  const out: DeckProblem[] = [];
  const cmd = oracle(deck.comandante);
  const f = cmd.faces[0];
  // CR 903.3: comandante lendário e criatura (ou "pode ser seu comandante", 903.3a)
  const canBe = f.oracleText.includes('can be your commander');
  if (!(f.supertypes.includes('Legendary') && (f.types.includes('Creature') || canBe))) {
    out.push({ rule: '903.3', message: `${deck.comandante} não pode ser comandante` });
  }
  // CR 903.5a: exatamente 100 cartas com o comandante
  const total = 1 + deck.cartas.reduce((n, e) => n + e.quantidade, 0);
  if (total !== 100) out.push({ rule: '903.5a', message: `O deck tem ${total} cartas (precisa de 100)` });
  const identity = new Set<Color>(cmd.colorIdentity);
  for (const e of deck.cartas) {
    const c = oracle(e.nome);
    const basic = c.faces[0].supertypes.includes('Basic') && c.faces[0].types.includes('Land');
    // CR 903.5b: singleton, exceto terrenos básicos
    if (!basic && e.quantidade > 1) out.push({ rule: '903.5b', message: `${e.nome} aparece ${e.quantidade} vezes` });
    if (e.nome === deck.comandante) out.push({ rule: '903.5b', message: `${e.nome} repete o comandante` });
    // CR 903.5c: identidade de cor dentro da do comandante
    for (const col of c.colorIdentity) if (!identity.has(col)) out.push({ rule: '903.5c', message: `${e.nome} tem ${col}, fora da identidade de ${deck.comandante}` });
    // CR 903.5d: tipos básicos de terreno só se a cor que produzem estiver na identidade
    for (const face of c.faces) for (const st of face.types.includes('Land') ? face.subtypes : []) {
      const col = BASIC_LAND_MANA[st];
      if (col && !identity.has(col)) out.push({ rule: '903.5d', message: `${e.nome} é ${st}, que produz ${col}` });
    }
  }
  return out;
}

// Skins das cartas próprias da mesa: uma carta de proprias/cartas.json com "skinDe" tem as mesmas regras da carta
// copiada e só muda de nome, arte e frase. Carregado por cartas/index.ts depois de todas as definições.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineCard, registry, type CardDef } from '../motor/defs.ts';
import { hasOracle } from '../motor/oracle.ts';

const arq = join(dirname(fileURLToPath(import.meta.url)), '..', 'proprias', 'cartas.json');

/** cada skin e a carta de onde vêm as regras */
export const SKINS: { nome: string; de: string }[] = (JSON.parse(readFileSync(arq, 'utf8')) as { cartas: { nome: string; skinDe?: string }[] }).cartas
  .filter((c) => c.skinDe).map((c) => ({ nome: c.nome, de: c.skinDe! }));

for (const { nome, de } of SKINS) {
  const original = registry.cards.get(de);
  // sem os dados Oracle (falta rodar ferramentas/cartas-proprias.ts) ou sem a carta copiada, a skin fica de fora
  if (!original || original.pending || !hasOracle(nome)) continue;
  // as habilidades ganham ids próprios (defineCard os grava no objeto): cópia rasa de cada uma, sem mexer na original
  const faces = original.faces.map((f) => ({ ...f, abilities: f.abilities?.map((a) => ({ ...a })) }));
  defineCard({ ...original, name: nome, faces, rulings: {} } as CardDef);
}

// Queen's Diamond
// {T}: Choose a color. Add one mana of that color for each charge counter on Queen's Diamond. Spend this mana only to
// cast your commander.
// Station (It's an artifact creature at 8+.)
// 8+ | Flying, vigilance, haste
import { defineCard, defineFn, mana, type G } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';
import { ehComandante } from '../vingadores.ts';
import { cargas, estacao, nivelDeEstacao } from '../estacao.ts';

const RESTRICAO = "Queen's Diamond:comandante";
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) => purpose.kind === 'spell' && purpose.obj !== undefined && ehComandante(g, purpose.obj));

export default defineCard({
  name: "Queen's Diamond",
  faces: [{
    abilities: [
      mana((c) => {
        const n = cargas(c.g, c.source);
        return n > 0 ? (['W', 'U', 'B', 'R', 'G'] as ManaType[]).map((cor) => Array<ManaType>(n).fill(cor)) : [];
      }, { restriction: RESTRICAO, text: "{T}: Escolha uma cor. Adicione uma mana dessa cor para cada marcador de carga em Queen's Diamond. Gaste essa mana apenas para conjurar o seu comandante." }),
      estacao(),
      nivelDeEstacao(8, { criatura: true, mods: ['flying', 'vigilance', 'haste'].map((kw) => ({ k: 'addKeyword' as const, kw })) }, '8+ | Voar, vigilância, ímpeto. É uma criatura-artefato.'),
    ],
  }],
  rulings: {},
});

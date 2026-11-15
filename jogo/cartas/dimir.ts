// Seleção de cartas do topo compartilhada por Consult the Star Charts e Stock Up.
import { chooseItems, moveObjects, nameOf, objItem } from '../motor/api.ts';
import type { Ctx, Gen } from '../motor/defs.ts';
import { restoNoFundo } from './veiculos.ts';

/** Olhar não é comprar nem revelar (CR 121.5, 701.20e); faz tanto quanto possível (CR 609.3). */
export function* olhaTopoParaMao(c: Ctx, n: number, quantidade: number, fundo: 'random' | 'ordered', nome: string): Gen<void> {
  const topo = c.g.state.zones.library[c.you].slice(0, n);
  if (!topo.length) return;
  const pegar = Math.min(quantidade, topo.length);
  const itens = (ids: number[]) => ids.map((id) => ({ ...objItem(c.g, id, nameOf(c.g, id)), card: { def: c.g.state.objects[id].def } }));
  const mao = (yield* chooseItems(c.g, c.you, `${nome}: escolha ${pegar} carta(s) para a sua mão`, itens(topo), pegar, pegar)).map(Number);
  yield* moveObjects(c.g, mao.map((id) => ({ id, to: 'hand' as const })), 'effect');
  const resto = topo.filter((id) => !mao.includes(id) && c.g.state.objects[id]?.zone === 'library');
  if (fundo === 'random') {
    restoNoFundo(c.g, c.you, resto);
  } else {
    // CR 401.4: o controlador escolhe a ordem; a primeira fica mais perto do topo.
    const ordem = resto.length > 1
      ? (yield* chooseItems(c.g, c.you, `${nome}: ordem das cartas no fundo (a primeira fica mais em cima)`, itens(resto), resto.length, resto.length, true)).map(Number)
      : resto;
    const lib = c.g.state.zones.library[c.you];
    c.g.state.zones.library[c.you] = [...lib.filter((id) => !ordem.includes(id)), ...ordem];
    c.g.bump();
  }
}

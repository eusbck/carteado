// lote4-c: modos com patinhas (pawprint, CR 107.18, 700.2i) — "Escolha até N {P} em modos" (Season of Gathering e os
// outros "Season of"). Cada modo custa um número de patinhas; o controlador escolhe quantos modos quiser, inclusive o
// mesmo mais de uma vez quando a carta permite, desde que a soma não passe de N. As patinhas não são custo nem recurso
// (CR 107.18): nada é pago.
import { chooseItems } from './ask.ts';
import type { Gen, ModeSpec } from './defs.ts';
import type { G } from './game-context.ts';
import type { PlayerId } from './types.ts';

/** os dados das patinhas de um ModeSpec: quanto custa cada modo e o total */
export interface Patinhas {
  /** patinhas de cada modo, na ordem dos modos */
  per: number[];
  /** "até N {P}" */
  max: number;
  /** "Você pode escolher o mesmo modo mais de uma vez" (CR 700.2d) */
  repeat?: boolean;
}

/** modal com patinhas: `patinhas([1, 2, 3], 5, [...modos], { repeat: true })` */
export function modalPatinhas(per: number[], max: number, modes: ModeSpec['modes'], opts: { repeat?: boolean } = {}): ModeSpec {
  return { min: 0, max: modes.length * max, modes, pawprints: { per, max, repeat: opts.repeat } };
}

const PATA = (n: number) => '{P}'.repeat(n);

/**
 * CR 700.2i: escolhe os modos um por vez, mostrando as patinhas que sobram; parar é escolher nenhum. Devolve os modos
 * na ordem em que estão escritos (CR 700.2: as instruções seguem a ordem do texto; o mesmo modo repetido fica junto).
 * `disponivel` diz se o modo pode ser escolhido (alvo legal, CR 700.2a).
 */
export function* escolherModosComPatinhas(g: G, player: PlayerId, ms: ModeSpec, disponivel: (i: number) => boolean, label: string): Gen<number[]> {
  const p = ms.pawprints!;
  const escolhidos: number[] = [];
  let resta = p.max;
  for (;;) {
    const itens = ms.modes.map((m, i) => ({
      id: String(i),
      label: `${PATA(p.per[i] ?? 1)} — ${m.text}`,
      disabled: (p.per[i] ?? 1) > resta || !disponivel(i) || (!p.repeat && escolhidos.includes(i)),
    }));
    if (!itens.some((x) => !x.disabled)) break;
    const r = yield* chooseItems(g, player, `${label}: escolha um modo (restam ${resta} ${resta === 1 ? 'patinha' : 'patinhas'}; nenhum para terminar)`, itens, 0, 1);
    if (!r.length) break;
    const i = Number(r[0]);
    escolhidos.push(i);
    resta -= p.per[i] ?? 1;
  }
  return escolhidos.sort((a, b) => a - b);
}

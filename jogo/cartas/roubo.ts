// Peças repetidas nas cartas do deck Grand Larceny (roubar cartas dos oponentes e jogá-las).
import { allowPlay, castSpell, chooseItems, isLand, moveObjects, nameOf, putOntoBattlefield } from '../motor/api.ts';
import type { Ctx, Gen, SCtx } from '../motor/defs.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/**
 * "Olhe a carta do topo do grimório desse jogador e exile-a virada para baixo. Você pode jogar essa carta enquanto ela
 * continuar exilada, e mana de qualquer tipo pode ser gasta para conjurá-la" (Gonti, Canny Acquisitor; Dream-Thief's
 * Bandana). Só quem controlava a habilidade pode olhá-la e jogá-la, mesmo que a fonte saia do campo ou mude de
 * controlador (CR 406.3, 601.2a). Devolve a carta exilada.
 */
export function* exilaTopoViradoJogavel(c: Ctx, jogador: PlayerId): Gen<ObjId | null> {
  const s = c.g.state;
  if (s.players[jogador].left) return null;
  const topo = s.zones.library[jogador][0];
  if (topo === undefined) return null;
  const [ex] = yield* moveObjects(c.g, [{ id: topo, to: 'exile', faceDown: true, visibleTo: [c.you] }], 'exile');
  if (ex === null || ex === undefined || s.objects[ex]?.zone !== 'exile') return null;
  c.g.log(`${s.players[c.you].name} exila virada para baixo a carta do topo do grimório de ${s.players[jogador].name}.`);
  allowPlay(c.g, c.you, c.source, [ex], { kind: 'permanent' }, { anyType: true });
  return ex;
}

/**
 * "Você pode conjurar [quantas quiser / uma] mágica(s) dentre essas cartas sem pagar o custo de mana" durante a
 * resolução (CR 608.2g, 118.9): uma de cada vez, na ordem que o jogador escolher; terrenos não (CR 305.9). Devolve
 * quantas foram conjuradas.
 *
 * Com `olhar` ("olhe a mão desse jogador": Silent-Blade Oni, Extract Brain), as cartas que não podem ser conjuradas
 * assim (terrenos) aparecem também, indisponíveis, para a pessoa ver todas as que olhou, mesmo sem nada para conjurar.
 */
export function* conjuraDentreGratis(c: Ctx, cartas: ObjId[], opts: { rotulo: string; varias: boolean; filtro?: (id: ObjId) => boolean; exilaEmVezDoCemiterio?: boolean; olhar?: boolean }): Gen<number> {
  const s = c.g.state;
  let n = 0;
  const tentadas = new Set<ObjId>();
  let mostrou = false;
  for (;;) {
    const vivas = cartas.filter((id) => !tentadas.has(id) && !!s.objects[id]);
    const podem = vivas.filter((id) => !isLand(c.g, id) && (!opts.filtro || opts.filtro(id)));
    const soVistas = opts.olhar ? vivas.filter((id) => !podem.includes(id)) : [];
    if (!podem.length && (!soVistas.length || mostrou)) return n;
    mostrou = true;
    const [esc] = yield* chooseItems(c.g, c.you, podem.length ? `${opts.rotulo}: escolha uma mágica para conjurar sem pagar o custo de mana` : `${opts.rotulo}: nenhuma destas cartas pode ser conjurada assim`, [
      { id: '', label: n > 0 ? 'Parar de conjurar' : 'Não conjurar' },
      ...podem.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } })),
      ...soVistas.map((id) => ({ id: `v${id}`, label: `${nameOf(c.g, id)} (${isLand(c.g, id) ? 'terreno' : 'não pode ser conjurada assim'})`, card: { def: s.objects[id].def }, disabled: true })),
    ], 1, 1);
    if (!esc) return n;
    const id = Number(esc);
    tentadas.add(id);
    // se não der para conjurar (sem alvos, por exemplo), a carta fica onde está
    if ((yield* conjuraGratis(c, id, { exilaEmVezDoCemiterio: opts.exilaEmVezDoCemiterio })) !== null) n++;
    if (!opts.varias && n > 0) return n;
  }
}

/**
 * Conjura a carta agora, durante a resolução, sem pagar o custo de mana (CR 608.2g, 118.9). Com `exilaEmVezDoCemiterio`,
 * "se essa mágica fosse para o cemitério, exile-a em vez disso" (Diluvian Primordial, Arcane Heist). Devolve a mágica.
 */
export function* conjuraGratis(c: Ctx, carta: ObjId, opts: { exilaEmVezDoCemiterio?: boolean } = {}): Gen<ObjId | null> {
  const o = c.g.state.objects[carta];
  if (!o || isLand(c.g, carta)) return null;
  return yield* castSpell(c.g, c.you, carta, {
    key: 'free', label: 'sem pagar o custo de mana', zone: o.zone, free: true, duringResolution: true,
    ...(opts.exilaEmVezDoCemiterio ? { permission: { key: 'exilar', label: 'sem pagar o custo de mana', free: true, exileInstead: true } } : {}),
  });
}

/**
 * "Você manifesta a carta do topo do grimório desse jogador" (CR 701.40a): a carta de outro dono entra virada para baixo
 * como criatura 2/2 sob o seu controle; só você pode olhá-la (CR 708.6). Thieving Amalgam, Orochi Soul-Reaver.
 */
export function* manifestaTopoDe(c: Ctx, dono: PlayerId): Gen<ObjId | null> {
  const s = c.g.state;
  const topo = s.zones.library[dono]?.[0];
  if (topo === undefined || s.players[dono].left || s.players[c.you].left) return null;
  const [id] = yield* putOntoBattlefield(c.g, [{ id: topo, controller: c.you, faceDown: true, data: { manifestada: true } }], 'manifest');
  if (id !== undefined) c.g.log(`${s.players[c.you].name} manifesta a carta do topo do grimório de ${s.players[dono].name}.`, { rule: '701.40a' });
  return id ?? null;
}

/** a mágica que um jogador conjura é de outro dono ("mágicas que você conjura mas não possui": Gonti, Thieving Varmint) */
export function magicaDeOutroDono(c: SCtx, magica: ObjId): boolean {
  const o = c.g.state.objects[magica];
  return !!o && o.owner !== c.you;
}

/** notas de rulings que se repetem nas cartas de roubo */
export const ROUBO = {
  tempo: 'regra geral: CR 601.3, 305.1 — a carta exilada é jogada no tempo normal dela, pagando os custos (motor/priority.ts rule:mayPlay)',
  sai: 'regra geral: CR 400.7 — jogada, a carta sai do exílio e vira um objeto novo; a permissão não vale para ele',
  saiuDaPartida: 'regra geral: CR 800.4a — quem sai da partida leva o que é dele; as cartas viradas para baixo ficam no exílio',
  gratisAlternativo: 'regra geral: CR 118.9a — sem pagar o custo de mana não se escolhe custo alternativo; custos adicionais continuam (motor/stack.ts)',
  gratisX: 'regra geral: CR 107.3b — sem pagar o custo de mana, X vale 0 (motor/stack.ts)',
  durante: 'regra geral: CR 608.2g — conjurada durante a resolução, ignora o tempo de feitiço; outras restrições valem (motor/stack.ts castSpell)',
  qualquerTipo: 'regra geral: CR 609.4b — mana de qualquer tipo só muda como o custo é pago (motor/mana.ts anyType)',
};

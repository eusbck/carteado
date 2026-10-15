// Peças repetidas nas cartas do deck Miracle Worker (Duskmourn Commander): notas dos rulings de milagre, "ponha no
// fundo do grimório do dono" com a ordem escolhida por cada dono, reordenar o topo de um grimório, devoção a duas cores
// e encantamentos de um jogador.
import { chars, chooseItems, controlledBy, gainLife, isLand, isType, loseLife, manaValue, mayPay, moveObjects, nameOf, on, triggered } from '../motor/api.ts';
import type { AbilityDef, Ctx, Gen, SCtx, StaticDef, TriggerSpec } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { Color, ManaSymbol, ObjId, PlayerId } from '../motor/types.ts';

/** notas dos rulings de milagre, repetidos em todas as cartas com milagre (motor/milagre.ts, testes/regras-milagre.test.ts) */
export const MILAGRE = {
  revelarAntes: 'regra geral: CR 702.94a — a pergunta de revelar vem na própria compra, antes de a carta se misturar com a mão (motor/actions.ts revelaMilagre)',
  qualquerTurno: 'regra geral: CR 702.94a — vale em qualquer turno, se for a primeira carta comprada nele (testes/regras-milagre.test.ts)',
  primeiraDaSequencia: 'regra geral: CR 121.2, 702.94a — "compre três" são três compras: só a primeira pode ser revelada (testes/regras-milagre.test.ts)',
  semComprar: 'regra geral: CR 121.1 — pôr na mão sem a palavra "comprar" não é comprar: nada é perguntado (só draw chama revelaMilagre)',
  naoPrecisaRevelar: 'regra geral: CR 702.94a — revelar é opcional (testes/regras-milagre.test.ts)',
  soNaResolucao: 'regra geral: CR 702.94a — só se conjura pelo custo de milagre enquanto o gatilho resolve; depois, só pelo custo normal (testes/regras-milagre.test.ts)',
  ignoraTempo: 'regra geral: CR 608.2g — conjurada durante a resolução do gatilho, sem olhar o tempo do tipo (testes/regras-milagre.test.ts)',
  custoAlternativo: 'regra geral: CR 118.9, 702.94a — milagre é custo alternativo: não se junta a outro; custos adicionais continuam (motor/stack.ts)',
  custoTotal: 'regra geral: CR 601.2f — aumentos e reduções se aplicam ao custo de milagre; o valor de mana não muda (motor/stack.ts totalSpellCost)',
  saiuDaMao: 'regra geral: CR 702.94a — se a carta sai da mão antes de o gatilho resolver, não há o que conjurar (testes/regras-milagre.test.ts)',
  continuaComprada: 'regra geral: CR 702.94a — a compra acontece de qualquer jeito (gatilhos de comprar disparam); sem conjurar, a carta fica na mão (testes/regras-milagre.test.ts)',
};

/** notas dos rulings gerais das Salas (CR 709.5), repetidos nas Salas do deck */
export const SALA = {
  conjurarUmaPorta: 'regra geral: CR 709.3, 709.5d — conjura-se uma porta só, que entra destrancada (cartas/defs/dazzling-theater-prop-room.test.ts)',
  portaNaoConjurada: 'regra geral: CR 709.3b — na pilha só existe a porta conjurada (cartas/defs/dazzling-theater-prop-room.test.ts)',
  cartaSo: 'regra geral: CR 709.2 — a Sala é uma carta só (um objeto no motor)',
  doisNomes: 'não se aplica: nenhuma carta dos decks manda escolher um nome',
  caracteristicasDaPorta: 'regra geral: CR 709.3a — só a porta conjurada conta para ver se pode ser conjurada (cartas/defs/dazzling-theater-prop-room.test.ts)',
  foraDaPilha: 'regra geral: CR 709.4 — fora da pilha e do campo, as duas portas juntas (motor/chars.ts)',
  noCampo: 'regra geral: CR 709.5 — no campo, as características das portas destrancadas (motor/chars.ts)',
  copia: 'regra geral: CR 707.10, 709.5b — a cópia da mágica fica com a porta escolhida (motor/stack.ts copySpell)',
  vindaDeFora: 'regra geral: CR 709.5d — vinda de fora da pilha, entra com as duas portas trancadas (motor/actions.ts)',
  semPorta: 'regra geral: CR 709.5 — sem porta destrancada, não tem nome nem habilidades (motor/chars.ts)',
  destrancar: 'regra geral: CR 116.2m, 709.5e — destrancar é ação especial, só como feitiço (motor/priority.ts unlockDoor)',
  mandaDestrancar: 'não se aplica: nenhuma carta dos decks manda destrancar uma porta',
  mandaTrancar: 'não se aplica: nenhuma carta dos decks manda trancar uma porta',
  semAlvo: 'regra geral: CR 603.3d — o gatilho de destrancar sem alvo legal sai da pilha; destrancar continua permitido',
  totalmente: 'regra geral: CR 709.5i — o evento unlock diz se a Sala ficou totalmente destrancada (cartas/defs/fear-of-sleep-paralysis.test.ts)',
};

/** "Quando você destranca esta porta" (CR 709.5h): ao entrar com a porta destrancada ou ao destrancá-la depois */
export function aoDestrancar(porta: number): TriggerSpec {
  return on.custom((e, c) => e.type === 'unlock' && e.obj === c.source && e.player === c.you && e.halves.includes(porta));
}

/**
 * "Ponha [esses permanentes] no fundo do grimório dos donos": cada dono escolhe a ordem dos seus, em segredo (ruling de
 * Terminus), na ordem APNAP, e todos vão ao mesmo tempo (CR 101.4). A primeira escolhida fica mais acima.
 */
export function* poeNoFundoDosDonos(c: Ctx, ids: ObjId[]): Gen<void> {
  const s = c.g.state;
  const ordem: ObjId[] = [];
  for (const p of c.g.apnap()) {
    let deles = ids.filter((id) => s.objects[id]?.owner === p);
    if (deles.length > 1) {
      const r = yield* chooseItems(c.g, p, 'Ordene as suas permanentes para o fundo do grimório: a primeira fica mais acima, a última fica no fundo',
        deles.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id })), deles.length, deles.length, true);
      deles = r.map(Number);
    }
    ordem.push(...deles);
  }
  if (ordem.length) yield* moveObjects(c.g, ordem.map((id) => ({ id, to: 'library' as const, position: 'bottom' as const })), 'effect');
}

/** "olhe as N cartas do topo do grimório do jogador e ponha-as de volta em qualquer ordem" (CR 401.4): você escolhe */
export function* reordenaTopoDe(c: Ctx, dono: PlayerId, n: number, rotulo: string): Gen<void> {
  const s = c.g.state;
  const topo = s.zones.library[dono].slice(0, Math.max(0, n));
  if (topo.length === 0) return;
  // quem olha vê as cartas (CR 401.4: olhar não revela aos outros)
  for (const id of topo) {
    const o = s.objects[id];
    if (o.visibleTo !== 'all') o.visibleTo = [...new Set([...(Array.isArray(o.visibleTo) ? o.visibleTo : []), c.you])];
  }
  c.g.bump();
  if (topo.length < 2) return;
  const ordem = (yield* chooseItems(c.g, c.you, `${rotulo}: ponha as cartas de volta no topo na ordem que quiser (a primeira escolhida fica no topo)`,
    topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } })), topo.length, topo.length, true)).map(Number);
  const lib = s.zones.library[dono];
  s.zones.library[dono] = [...ordem, ...lib.filter((id) => !ordem.includes(id))];
  c.g.bump();
}

/** o símbolo de mana tem alguma destas cores? (híbridos, {2/B} e phyrexianos contam; genérico, {X} e {C} não, CR 700.5) */
function temCor(s: ManaSymbol, cores: Color[]): boolean {
  if (s.k === 'color' || s.k === 'monohybrid' || s.k === 'phyrexian') return cores.includes(s.c as Color);
  if (s.k === 'hybrid') return cores.includes(s.a as Color) || cores.includes(s.b as Color);
  return false;
}

/** notas dos rulings gerais de devoção (CR 700.5) */
export const DEVOCAO = {
  semGenerico: 'regra geral: CR 700.5 — {C}, genéricos e {X} não contam (cartas/milagres.ts devocao)',
  soCusto: 'regra geral: CR 700.5 — só o custo de mana conta, não o texto (cartas/milagres.ts devocao)',
  hibridos: 'regra geral: CR 700.5 — híbridos, {2/B} e phyrexianos contam (cartas/milagres.ts devocao)',
  naResolucao: 'regra geral: CR 700.5 — a devoção é contada quando é usada, com a própria permanente se ela estiver no campo',
  aura: 'regra geral: CR 700.5 — conta o que você controla, até a sua Aura presa à permanente de outro jogador',
};

/** CR 700.5, 700.5a: devoção a uma ou duas cores; um símbolo híbrido das duas conta uma vez só (ruling de Athreos) */
export function devocao(g: G, p: PlayerId, cores: Color[]): number {
  return controlledBy(g, p).reduce((n, id) => n + (chars(g, id).manaCost ?? []).filter((s) => temCor(s, cores)).length, 0);
}

/**
 * Extorquir (CR 702.101a): "Sempre que você conjura uma mágica, você pode pagar {W/B}. Se fizer isso, cada oponente perde
 * 1 ponto de vida e você ganha vida igual ao total perdido assim." Cada instância dispara à parte (702.101b); a decisão
 * de pagar é na resolução e não mira ninguém (rulings).
 */
export function extort(): AbilityDef[] {
  return [
    { kind: 'static', kw: 'extort', text: 'Extorquir' },
    triggered(on.youCast(), function* (c) {
      if (!(yield* mayPay(c, c.you, '{W/B}', 'extorquir (cada oponente perde 1 de vida e você ganha o total perdido)'))) return;
      let perdida = 0;
      for (const p of c.g.apnap().filter((x) => c.g.isOpponent(c.you, x))) perdida += loseLife(c.g, p, 1, c.source);
      if (perdida > 0) gainLife(c.g, c.you, perdida, c.source);
    }, { text: 'Extorquir (sempre que você conjura uma mágica, você pode pagar {W/B}; se pagar, cada oponente perde 1 de vida e você ganha a vida perdida assim)' }),
  ];
}

/**
 * "Uma vez durante cada um dos seus turnos, você pode conjurar [uma mágica] da sua mão pagando vida igual ao valor de
 * mana dela em vez de pagar o custo de mana" (Access Maze, Demon of Fate's Design). É custo alternativo (CR 118.9): não
 * se junta a outro, custos adicionais continuam, e com {X} o X só pode ser 0 (CR 107.3b). O uso fica marcado na
 * permanente que dá a permissão (GameObject.usedThisTurn). Simplificação: só cartas da mão (as cartas desses decks não
 * conjuram de outras zonas por outra permissão ao mesmo tempo).
 */
export function vidaEmVezDeMana(chave: string, texto: string, filtro: (g: G, carta: ObjId) => boolean = () => true): StaticDef {
  return {
    kind: 'static', text: texto,
    rules: {
      mayPlayFrom: (c, p, carta) => {
        const s = c.g.state;
        const fonte = s.objects[c.source];
        if (p !== c.you || s.turn.active !== p || !fonte || fonte.usedThisTurn[chave] === s.turn.number) return null;
        const o = s.objects[carta];
        if (!o || o.zone !== 'hand' || o.owner !== p || isLand(c.g, carta) || !filtro(c.g, carta)) return null;
        const id = c.source;
        return {
          key: `${chave}:${id}`, label: 'pagando vida igual ao valor de mana', free: true, fromHand: true,
          parts: [{ k: 'life', n: (cc: SCtx) => manaValue(cc.g, cc.source) }],
          onUse: (cc) => { const x = cc.g.state.objects[id]; if (x) { x.usedThisTurn[chave] = cc.g.state.turn.number; cc.g.bump(); } },
        };
      },
    },
  };
}

/** encantamentos que o jogador controla */
export function encantamentosDe(g: G, p: PlayerId): ObjId[] {
  return controlledBy(g, p, (id) => isType(g, id, 'Enchantment'));
}

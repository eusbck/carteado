// Jeskai Infiltrator
// This creature can't be blocked as long as you control no other creatures.
// When this creature deals combat damage to a player, exile it and the top card of your library in a face-down pile,
// shuffle that pile, then manifest those cards. (To manifest a card, put it onto the battlefield face down as a 2/2
// creature. Turn it face up any time for its mana cost if it's a creature card.)
import { creaturesOf, defineCard, moveObjects, on, putOntoBattlefield, staticAbility, triggered } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Jeskai Infiltrator',
  faces: [{
    abilities: [
      staticAbility({
        rules: { canBeBlockedBy: (c, atacante) => atacante !== c.source || creaturesOf(c.g, c.you).some((id) => id !== c.source) },
        text: 'Esta criatura não pode ser bloqueada enquanto você não controlar outras criaturas.',
      }),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const s = c.g.state;
        // ruling 19: se ela já não está no campo, só a carta do topo do grimório é manifestada
        const pilha: ObjId[] = [];
        if (s.objects[c.source]?.zone === 'battlefield') pilha.push(c.source);
        const topo = s.zones.library[c.you][0];
        if (topo !== undefined) pilha.push(topo);
        if (!pilha.length) return;
        // exiladas viradas para baixo e embaralhadas: os oponentes não sabem qual é qual (ruling 16)
        const exiladas = (yield* moveObjects(c.g, pilha.map((id) => ({ id, to: 'exile' as const, faceDown: true, visibleTo: [] })), 'exile'))
          .filter((x): x is ObjId => x !== null && x !== undefined && s.objects[x]?.zone === 'exile');
        // CR 701.40e: manifestadas uma de cada vez
        for (const id of shuffle(s.rng, [...exiladas])) {
          yield* putOntoBattlefield(c.g, [{ id, controller: c.you, faceDown: true, data: { manifestada: true } }], 'manifest');
        }
        c.g.log(`${s.players[c.you].name} manifesta ${exiladas.length} carta(s).`, { rule: '701.40' });
      }, { text: 'Quando esta criatura causa dano de combate a um jogador, exile-a com a carta do topo do seu grimório numa pilha virada para baixo, embaralhe essa pilha e manifeste essas cartas. (Para manifestar uma carta, coloque-a no campo virada para baixo como uma criatura 2/2. Vire-a para cima a qualquer momento pelo custo de mana dela, se for uma carta de criatura.)' }),
    ],
  }],
  rulings: {
    1: 'teste: causando dano de combate, ela e a carta do topo do grimório viram duas criaturas 2/2 viradas para baixo',
    2: 'regra geral: CR 708.2 — as características da permanente virada para baixo são os valores copiáveis dela (motor/chars.ts)',
    3: 'teste: a carta de criatura manifestada pode ser virada para cima pelo custo de mana; a que não é de criatura, não',
    4: 'regra geral: CR 708.2 — a criatura virada para baixo não tem nome nem tipos de criatura (motor/chars.ts)',
    5: 'regra geral: CR 708.8 — virar para cima não é entrar no campo (motor/mecanicas.ts turnFaceUp)',
    6: 'regra geral: CR 708.8 — é a mesma permanente: alvos, Auras e Equipamentos continuam (motor/mecanicas.ts turnFaceUp)',
    7: 'regra geral: CR 708.8 — virar para cima não muda se está virada ou desvirada (motor/mecanicas.ts turnFaceUp)',
    8: 'regra geral: CR 708.5 — você pode olhar as permanentes viradas para baixo que controla (motor/view.ts)',
    9: 'regra geral: CR 708.9 — ao sair do campo, a carta é revelada (motor/state.ts moveRaw)',
    10: 'não se aplica: regra de mesa presencial; o jogo guarda como cada permanente ficou virada para baixo (data.manifestada)',
    11: 'regra geral: CR 701.40g — instantânea ou feitiço manifestado não vira para cima (motor/mecanicas.ts manifestFaceUpCost)',
    12: 'regra geral: CR 400.7 — a carta que sai e volta ao campo é um objeto novo e entra virada para cima (motor/actions.ts putOntoBattlefield)',
    13: 'não se aplica: o deck não tem cartas de duas faces que transformam para manifestar',
    14: 'regra geral: CR 708.9 — ao sair do campo, a carta é revelada (motor/state.ts moveRaw)',
    15: 'não se aplica: regra de mesa presencial; o jogo guarda como cada permanente ficou virada para baixo (data.manifestada)',
    16: 'teste: causando dano de combate, ela e a carta do topo do grimório viram duas criaturas 2/2 viradas para baixo',
    17: 'não se aplica: o deck não tem cartas de duas faces que transformam para manifestar',
    18: 'regra geral: CR 701.40g — instantânea ou feitiço manifestado não vira para cima (motor/mecanicas.ts manifestFaceUpCost)',
    19: 'teste: se ela já saiu do campo, só a carta do topo do grimório é manifestada',
    20: 'regra geral: CR 108.3 — o dono de cada carta é informação pública (motor/view.ts mostra o dono)',
    21: 'regra geral: CR 800.4a — quando você sai da partida, o que você controla de outros donos é exilado (motor/sba.ts leaveGame)',
    22: 'teste: causando dano de combate, ela e a carta do topo do grimório viram duas criaturas 2/2 viradas para baixo',
    23: 'teste: a carta de criatura manifestada pode ser virada para cima pelo custo de mana; a que não é de criatura, não',
    24: 'regra geral: CR 701.40c — a carta com metamorfose manifestada também vira pelo custo de metamorfose (motor/conjurar-alternativo.ts)',
    25: 'regra geral: CR 701.40b — o que conta é a carta ser de criatura, mesmo sem habilidades (motor/mecanicas.ts manifestFaceUpCost)',
    26: 'regra geral: CR 708.8 — virar para cima não é entrar no campo (motor/mecanicas.ts turnFaceUp)',
    27: 'regra geral: CR 708.2 — a criatura virada para baixo não tem nome (motor/chars.ts)',
    28: 'regra geral: CR 708.8 — é a mesma permanente: alvos, Auras e Equipamentos continuam (motor/mecanicas.ts turnFaceUp)',
    29: 'regra geral: CR 708.8 — virar para cima não muda se está virada ou desvirada (motor/mecanicas.ts turnFaceUp)',
    30: 'regra geral: CR 708.5 — você pode olhar as permanentes viradas para baixo que controla (motor/view.ts)',
  },
});

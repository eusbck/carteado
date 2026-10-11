// Timothar, Baron of Bats
// Ward—Discard a card.
// Whenever another nontoken Vampire you control dies, you may pay {1} and exile it. If you do, create a 1/1 black Bat
// creature token with flying. It gains "When this token deals combat damage to a player, sacrifice it and return the
// exiled card to the battlefield tapped."
import { addEffect, createTokens, defineAbility, defineCard, exile, lkiObj, mayPay, on, putOntoBattlefield, sacrifice, triggered, ward } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// ruling 4: cada Bat guarda só a carta exilada pela habilidade que o criou; ruling 7: quem controla o Bat controla o
// gatilho e recebe a carta
const VOLTA = defineAbility('Timothar, Baron of Bats:volta', triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
  const eu = c.g.state.objects[c.source] ?? lkiObj(c.g, c.source);
  const carta = eu?.data.timotharCarta as ObjId | undefined;
  // ruling 2: sacrifica o Bat mesmo que a carta já não esteja no exílio
  if (c.g.state.objects[c.source]?.zone === 'battlefield') yield* sacrifice(c.g, [c.source]);
  if (carta !== undefined && c.g.state.objects[carta]?.zone === 'exile') yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you, tapped: true }], 'effect');
}, { text: 'Quando esta ficha causa dano de combate a um jogador, sacrifique-a e devolva a carta exilada ao campo de batalha virada.' }));

export default defineCard({
  name: 'Timothar, Baron of Bats',
  faces: [{
    abilities: [
      // CR 702.21a: o custo do resguardo é descartar uma carta
      ...ward('discard'),
      // ruling 6: qualquer Vampire que não é ficha que você controla, mesmo de outro dono
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard' || e.old === c.source) return false;
        const l = c.g.state.lki[e.old];
        return !!l && l.chars.types.includes('Creature') && l.chars.controller === c.you && l.chars.subtypes.includes('Vampire') && !l.obj.isToken ? { carta: e.obj } : false;
      }), function* (c) {
        const carta = c.event.carta as ObjId;
        // ruling 5: sem poder exilar a carta, não dá para pagar
        if (c.g.state.objects[carta]?.zone !== 'graveyard') return;
        if (!(yield* mayPay(c, c.you, '{1}', 'exilar o Vampire que morreu e criar um Bat 1/1 com voar'))) return;
        const [ex] = yield* exile(c.g, [carta]);
        if (ex === null || ex === undefined || c.g.state.objects[ex]?.zone !== 'exile') return;
        // ruling 1: todos os Bats criados por este efeito ficam ligados à mesma carta
        const fichas = yield* createTokens(c.g, c.you, 'Bat', 1, { data: { timotharCarta: ex } });
        for (const f of fichas) addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: f }, affected: [f], mods: [{ k: 'addAbility', id: VOLTA.id! }] });
      }, { text: 'Sempre que outro Vampire que não é ficha que você controla morre, você pode pagar {1} e exilá-lo. Se fizer isso, crie uma ficha de criatura Bat 1/1 preta com voar. Ela ganha "Quando esta ficha causa dano de combate a um jogador, sacrifique-a e devolva a carta exilada ao campo de batalha virada."' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 607.2a — cada Bat criado pelo efeito guarda a mesma carta exilada (cartas/defs/timothar-baron-of-bats.ts)',
    2: 'regra geral: CR 608.2c — o Bat é sacrificado mesmo que a carta já não esteja no exílio (cartas/defs/timothar-baron-of-bats.ts)',
    3: 'regra geral: CR 707.2 — a habilidade dada ao Bat não é valor copiável: a cópia do Bat não a tem',
    4: 'teste: pagando {1}, exila o Vampire que morreu e cria um Bat; o dano de combate do Bat o sacrifica e devolve a carta virada',
    5: 'teste: se a carta já saiu do cemitério, nada é pago nem criado',
    6: 'regra geral: CR 603.10a — vale para qualquer Vampire que não é ficha que você controlava, mesmo de outro dono',
    7: 'regra geral: CR 603.3a — quem controla o Bat controla o gatilho e recebe a carta (cartas/defs/timothar-baron-of-bats.ts)',
  },
});

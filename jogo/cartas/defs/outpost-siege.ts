// Outpost Siege
// As this enchantment enters, choose Khans or Dragons.
// • Khans — At the beginning of your upkeep, exile the top card of your library. Until end of turn, you may play that
// card.
// • Dragons — Whenever a creature you control leaves the battlefield, this enchantment deals 1 damage to any target.
import { allowPlay, asEnters, chooseOne, dealDamage, defineAbility, defineCard, exile, nameOf, on, selfGets, t, tgtRef, triggered } from '../../motor/api.ts';

const KHANS = defineAbility('Outpost Siege:khans', triggered(on.upkeep('you'), function* (c) {
  const topo = c.g.state.zones.library[c.you][0];
  if (topo === undefined) return;
  // ruling 1: exilada com a face para cima; jogar segue as regras normais (custos, momento, jogada de terreno)
  c.g.log(`${c.g.state.players[c.you].name} exila ${nameOf(c.g, topo)} do topo do grimório (Outpost Siege).`);
  const [ex] = yield* exile(c.g, [topo]);
  if (ex !== null && ex !== undefined) allowPlay(c.g, c.you, c.source, [ex], { kind: 'endOfTurn' });
}, { text: 'Khans — No início da sua manutenção, exile a carta do topo do seu grimório. Até o fim do turno, você pode jogar aquela carta.' }));

const DRAGONS = defineAbility('Outpost Siege:dragons', triggered(on.custom((e, c) => {
  // CR 603.10a: olha para trás — era uma criatura sua no campo (ruling 3: a manifestada com a face para baixo também)
  if (e.type !== 'zone' || e.from !== 'battlefield') return false;
  const l = c.g.state.lki[e.old];
  return !!l && l.chars.types.includes('Creature') && l.chars.controller === c.you;
}), function* (c) {
  const alvo = tgtRef(c);
  if (alvo) dealDamage(c.g, [{ source: c.source, target: alvo, amount: 1, combat: false }]);
}, {
  targets: [t.any()],
  text: 'Dragons — Sempre que uma criatura que você controla sai do campo, este encantamento causa 1 de dano a qualquer alvo.',
}));

export default defineCard({
  name: 'Outpost Siege',
  faces: [{
    abilities: [
      // CR 614.12a: a escolha é feita antes de entrar e fica gravada no objeto
      asEnters(function* (c, ev) {
        ev.choices.siege = yield* chooseOne(c.g, c.you, 'Outpost Siege: escolha Khans ou Dragons', [
          { id: 'khans', label: 'Khans — exilar a carta do topo na sua manutenção e poder jogá-la neste turno' },
          { id: 'dragons', label: 'Dragons — 1 de dano a qualquer alvo quando uma criatura sua sai do campo' },
        ]);
      }, 'Ao entrar, escolha Khans ou Dragons.'),
      // rulings 4-6 / CR 614.12c, 607.2m: "[palavra-âncora] — [habilidade]" = enquanto essa foi a escolha, tem a habilidade
      selfGets((c) => {
        const escolha = c.g.state.objects[c.source]?.choices.siege;
        return escolha === 'khans' ? [{ k: 'addAbility', id: KHANS.id! }] : escolha === 'dragons' ? [{ k: 'addAbility', id: DRAGONS.id! }] : [];
      }, 'Khans ou Dragons: este encantamento tem a habilidade escolhida ao entrar.'),
    ],
  }],
  rulings: {
    1: 'teste: Khans: a carta exilada é jogada pelas regras normais e só até o fim do turno',
    2: 'teste: Khans: um terreno exilado só pode ser jogado com jogada de terreno disponível',
    3: 'teste: Dragons: a manifestada com a face para baixo que sai do campo dispara',
    4: 'teste: cada escolha dá só uma das duas habilidades',
    5: 'teste: cada escolha dá só uma das duas habilidades',
    6: 'regra geral: CR 607.2m, 614.12c — uma cópia que entra faz a própria escolha (a substituição "ao entrar" roda para o objeto que entra)',
  },
});

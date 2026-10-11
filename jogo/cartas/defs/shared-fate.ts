// Shared Fate
// If a player would draw a card, that player exiles the top card of one of their opponents' libraries face down instead.
// Each player may look at cards they exiled with this enchantment, and they may play lands and cast spells from among
// those cards.
import { chooseItems, defineCard, linkedExiled, moveObjects, playerItem, staticAbility } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

// ruling 1: cada Shared Fate guarda as cartas que ela exilou, separadas por jogador (CR 607.2a)
const chave = (p: PlayerId) => `destino:${p}`;

export default defineCard({
  name: 'Shared Fate',
  faces: [{
    abilities: [
      staticAbility({
        rules: {
          // ruling 3: não é opcional; com os grimórios dos oponentes vazios, o jogador não compra nem exila nada
          drawReplace: function* (c, jogador) {
            const s = c.g.state;
            const comCartas = c.g.opponents(jogador).filter((p) => s.zones.library[p].length > 0);
            if (!comCartas.length) { c.g.log(`Shared Fate: ${s.players[jogador].name} não compra, e os oponentes não têm cartas no grimório para exilar.`, { rule: '614.1a' }); return; }
            let de = comCartas[0];
            if (comCartas.length > 1) {
              const [esc] = yield* chooseItems(c.g, jogador, 'Shared Fate: em vez de comprar, exile a carta do topo do grimório de qual oponente?', comCartas.map((p) => playerItem(c.g, p)), 1, 1);
              de = Number(esc.slice(1));
            }
            // virada para baixo; só quem exilou pode olhá-la (CR 406.3)
            const [ex] = yield* moveObjects(c.g, [{ id: s.zones.library[de][0], to: 'exile', faceDown: true, visibleTo: [jogador] }], 'exile');
            const fonte = s.objects[c.source];
            if (ex !== null && ex !== undefined && s.objects[ex]?.zone === 'exile' && fonte) {
              fonte.linked[chave(jogador)] = [...(fonte.linked[chave(jogador)] ?? []), ex];
              c.g.bump();
            }
            c.g.log(`Shared Fate: em vez de comprar, ${s.players[jogador].name} exila virada para baixo a carta do topo do grimório de ${s.players[de].name}.`, { rule: '614.1a' });
          },
          // rulings 2 e 5: joga o terreno ou conjura a mágica pagando os custos, no tempo normal; a carta não está na mão
          mayPlayFrom: (c, jogador, carta) => (linkedExiled(c.g, c.source, chave(jogador)).includes(carta) ? { key: `shared-fate:${c.source}`, label: 'Shared Fate', land: true } : null),
        },
        text: 'Se um jogador fosse comprar uma carta, em vez disso esse jogador exila virada para baixo a carta do topo do grimório de um dos oponentes dele. Cada jogador pode olhar as cartas que exilou com este encantamento, e pode jogar terrenos e conjurar mágicas dentre elas.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: saindo Shared Fate do campo, as cartas exiladas com ela não podem mais ser jogadas',
    2: 'teste: a mágica exilada é conjurada pagando o custo, e o terreno exilado pode ser jogado',
    3: 'teste: com os grimórios dos oponentes vazios, o jogador não compra nem exila',
    4: 'regra geral: CR 616.1 — com mais de uma Shared Fate, quem compraria escolhe qual substitui a compra, uma vez só (motor/actions.ts draw)',
    5: 'teste: em vez de comprar, o jogador exila virada para baixo a carta do topo do grimório de um oponente',
  },
});

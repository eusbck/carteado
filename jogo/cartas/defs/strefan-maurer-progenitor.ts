// Strefan, Maurer Progenitor
// Flying
// At the beginning of your end step, create a Blood token for each player who lost life this turn.
// Whenever Strefan attacks, you may sacrifice two Blood tokens. If you do, you may put a Vampire card from your hand onto
// the battlefield tapped and attacking. It gains indestructible until end of turn.
import { chooseItems, createTokens, defineCard, isSubtype, keyword, nameOf, objItem, on, putOntoBattlefield, sacrifice, triggered, untilEndOfTurn, yesNo } from '../../motor/api.ts';
import { escolheAtacado } from '../viloes.ts';
import { fichasDeSangue } from '../vampiros.ts';

export default defineCard({
  name: 'Strefan, Maurer Progenitor',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: conta quem perdeu qualquer quantidade de vida no turno, mesmo que tenha ganhado depois
      triggered(on.endStep('you'), function* (c) {
        const n = c.g.playersInGame().filter((p) => (c.g.state.turnStats[p]?.lifeLost ?? 0) > 0).length;
        if (n > 0) yield* createTokens(c.g, c.you, 'Blood', n);
      }, { text: 'No início da sua etapa final, crie uma ficha de Blood para cada jogador que perdeu vida neste turno.' }),
      triggered(on.selfAttacks(), function* (c) {
        const s = c.g.state;
        const sangue = fichasDeSangue(c.g, c.you);
        if (sangue.length < 2) return;
        if (!(yield* yesNo(c.g, c.you, 'Strefan: sacrificar duas fichas de Blood?'))) return;
        const esc = sangue.length === 2 ? sangue.map(String) : yield* chooseItems(c.g, c.you, 'Strefan: escolha duas fichas de Blood para sacrificar', sangue.map((id) => objItem(c.g, id, nameOf(c.g, id))), 2, 2);
        const foram = (yield* sacrifice(c.g, esc.map(Number))).filter((x) => x !== null);
        if (foram.length < 2) return;
        const vampiros = s.zones.hand[c.you].filter((id) => isSubtype(c.g, id, 'Vampire'));
        if (!vampiros.length) return;
        const [qual] = yield* chooseItems(c.g, c.you, 'Strefan: pôr um Vampire da sua mão no campo, virado e atacando?', [{ id: '', label: 'Nenhum' }, ...vampiros.map((id) => objItem(c.g, id, nameOf(c.g, id)))], 1, 1);
        if (!qual) return;
        const alvo = yield* escolheAtacado(c, 'Strefan');
        const [novo] = yield* putOntoBattlefield(c.g, [{ id: Number(qual), controller: c.you, tapped: true, attacking: alvo ?? undefined }], 'effect');
        if (novo !== undefined) untilEndOfTurn(c, [novo], [{ k: 'addKeyword', kw: 'indestructible' }]);
      }, { text: 'Sempre que Strefan ataca, você pode sacrificar duas fichas de Blood. Se fizer isso, você pode pôr uma carta de Vampire da sua mão no campo de batalha virada e atacando. Ela ganha indestrutível até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: na sua etapa final, cria um Blood para cada jogador que perdeu vida no turno, mesmo que tenha ganhado depois',
  },
});

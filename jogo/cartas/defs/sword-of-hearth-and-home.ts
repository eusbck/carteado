// Sword of Hearth and Home
// Equipped creature gets +2/+2 and has protection from green and from white.
// Whenever equipped creature deals combat damage to a player, exile up to one target creature you own, then search your
// library for a basic land card. Put both cards onto the battlefield under your control, then shuffle.
// Equip {2}
import { attachedGets, defineCard, equip, exile, isBasicLand, putOntoBattlefield, searchLibrary, shuffleLibrary, t, triggered, upTo } from '../../motor/api.ts';
import { anexadaCausaDanoDeCombateAJogador } from '../jin.ts';

export default defineCard({
  name: 'Sword of Hearth and Home',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'protection', param: 'color:G' }, { k: 'addKeyword', kw: 'protection', param: 'color:W' }], 'A criatura equipada recebe +2/+2 e tem proteção contra o verde e contra o branco.'),
      triggered(anexadaCausaDanoDeCombateAJogador(), function* (c) {
        const r = c.targets[0]?.[0];
        let exilada: number | null = null;
        if (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield') {
          const [ex] = yield* exile(c.g, [r.id]);
          // ruling 3: a ficha fica no exílio e deixa de existir
          if (ex !== null && ex !== undefined && c.g.state.objects[ex]?.zone === 'exile') exilada = ex;
        }
        const terrenos = yield* searchLibrary(c.g, c.you, c.you, { max: 1, filter: (id) => isBasicLand(c.g, id), prompt: 'Procure uma carta de terreno básico' });
        // ruling 1: as duas cartas entram ao mesmo tempo
        const entram = [...(exilada !== null ? [exilada] : []), ...terrenos];
        if (entram.length) yield* putOntoBattlefield(c.g, entram.map((id) => ({ id, controller: c.you })), 'effect');
        shuffleLibrary(c.g, c.you);
      }, {
        targets: [upTo(1, t.creature((c, id) => c.g.state.objects[id]?.owner === c.you, 'criatura alvo de que você é dono'))],
        text: 'Sempre que a criatura equipada causa dano de combate a um jogador, exile até uma criatura alvo de que você é dono e depois procure no seu grimório uma carta de terreno básico. Coloque as duas cartas no campo de batalha sob o seu controle e depois embaralhe.',
      }),
      equip('{2}'),
    ],
  }],
  rulings: {
    1: 'teste: exila uma criatura sua, busca um terreno básico e as duas cartas entram juntas no campo',
    2: 'regra geral: CR 608.2b — com o alvo escolhido ilegal na resolução, a habilidade não resolve e não há busca (motor/stack.ts)',
    3: 'regra geral: CR 111.8 — a ficha exilada não volta: fica no exílio e deixa de existir (motor/sba.ts)',
  },
});
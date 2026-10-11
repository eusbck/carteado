// Palace Jailer
// When this creature enters, you become the monarch.
// When this creature enters, exile target creature an opponent controls until an opponent becomes the monarch.
import { becomeMonarch, defineAbility, defineCard, delayed, etb, exile, is, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// rulings 1, 5 e 8: o jogo espera a próxima vez em que um oponente seu se torna o monarca, qualquer um deles, com
// Palace Jailer no campo ou não
const VOLTA = defineAbility('Palace Jailer:volta', triggered(on.custom((e, c) => e.type === 'monarch' && c.g.isOpponent(c.you, e.player)), function* (c) {
  const carta = c.data.carta as ObjId;
  const o = c.g.state.objects[carta];
  if (o && o.zone === 'exile') yield* putOntoBattlefield(c.g, [{ id: carta, controller: o.owner }], 'effect');
}, { text: 'Quando um oponente se torna o monarca, a carta exilada com Palace Jailer volta ao campo sob o controle do dono.' }));

export default defineCard({
  name: 'Palace Jailer',
  faces: [{
    abilities: [
      etb(function* (c) { becomeMonarch(c.g, c.you); }, { text: 'Quando esta criatura entra, você se torna o monarca.' }),
      etb(function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // rulings 6-7: a ficha deixa de existir; a carta volta como objeto novo
        const [ex] = yield* exile(c.g, [id]);
        if (ex !== null && ex !== undefined && c.g.state.objects[ex]?.zone === 'exile') delayed(c, VOLTA.id!, { data: { carta: ex } });
      }, { targets: [t.creature(is.opponents, 'criatura alvo que um oponente controla')], text: 'Quando esta criatura entra, exile a criatura alvo que um oponente controla até um oponente se tornar o monarca.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 610.3 — a carta espera a próxima vez em que um oponente se torna o monarca, mesmo que um já seja (cartas/defs/palace-jailer.ts)',
    2: 'regra geral: CR 725.4 — se o monarca sai da partida, o jogador ativo passa a ser o monarca (motor/sba.ts leaveGame)',
    3: 'regra geral: CR 725.1 — a partida começa sem monarca (motor/state.ts)',
    4: 'regra geral: CR 725.2 — o monarca compra na etapa final dele, e quem causa dano de combate a ele toma a coroa (motor/triggers.ts)',
    5: 'teste: Palace Jailer saindo do campo não devolve a criatura; um oponente virando o monarca, sim',
    6: 'regra geral: CR 111.7 — a ficha exilada deixa de existir e não volta (motor/sba.ts)',
    7: 'regra geral: CR 400.7 — a carta exilada é um objeto novo: Auras caem, Equipamentos soltam e marcadores somem',
    8: 'regra geral: CR 610.3 — qualquer oponente virando o monarca devolve a carta (cartas/defs/palace-jailer.ts)',
  },
});
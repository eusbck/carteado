// Cryptek
// {1}{B}, {T}: Choose another target artifact creature you control. When that creature dies this turn, return it to the
// battlefield tapped under your control.
import { activated, and, defineAbility, defineCard, delayed, is, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';
import { ehCriaturaArtefato } from '../necrons.ts';

// ruling 1: a habilidade só arma o gatilho atrasado; se a criatura não morrer neste turno, ele nunca dispara
const VOLTA = defineAbility('Cryptek:volta', triggered(on.custom((e, c) => {
  const criatura = (c as unknown as { delayed?: { data: { criatura?: number } } }).delayed?.data.criatura;
  return e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && e.old === criatura ? { carta: e.obj } : false;
}), function* (c) {
  const carta = c.event.carta as number;
  if (c.g.state.objects[carta]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you, tapped: true }], 'effect');
}, { text: 'Quando essa criatura morrer neste turno, devolva-a ao campo de batalha virada sob o seu controle.' }));

export default defineCard({
  name: 'Cryptek',
  faces: [{
    abilities: [
      activated('{1}{B}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) delayed(c, VOLTA.id!, { data: { criatura: id }, expiresTurn: c.g.state.turn.number });
      }, {
        targets: [t.creature(and(is.yours, is.other, (c, id) => ehCriaturaArtefato(c.g, id)), 'outra criatura artefato alvo que você controla')],
        text: '{1}{B}, {T}: Escolha outra criatura artefato alvo que você controla. Quando essa criatura morrer neste turno, devolva-a ao campo de batalha virada sob o seu controle.',
      }),
    ],
  }],
  rulings: { 1: 'teste: a criatura artefato escolhida que morre neste turno volta ao campo virada' },
});
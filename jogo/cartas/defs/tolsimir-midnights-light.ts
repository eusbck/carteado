// Tolsimir, Midnight's Light
// Lifelink
// When Tolsimir enters, create Voja Fenstalker, a legendary 5/5 green and white Wolf creature token with trample.
// Whenever a Wolf you control attacks, if Tolsimir attacked this combat, target creature an opponent controls blocks
// that Wolf this combat if able.
import { controllerOf, createTokens, defineCard, etb, exigeBloqueio, isSubtype, keyword, on, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Tolsimir, Midnight's Light",
  faces: [{
    abilities: [
      keyword('lifelink'),
      etb(function* (c) {
        yield* createTokens(c.g, c.you, 'Voja Fenstalker', 1);
      }, { text: 'Quando Tolsimir entra, crie Voja Fenstalker, uma ficha de criatura Lobo lendária 5/5 verde e branca com atropelar.' }),
      // um gatilho por Lobo atacante (CR 508.3a); "se Tolsimir atacou neste combate" é condição interveniente (CR 603.4)
      triggered(on.custom((e, c) => (e.type === 'attackers'
        ? e.attackers.filter((a) => !!c.g.state.objects[a.obj] && controllerOf(c.g, a.obj) === c.you && isSubtype(c.g, a.obj, 'Wolf')).map((a) => ({ lobo: a.obj }))
        : false)), function* (c) {
        const alvo = tgt(c);
        const lobo = c.event.lobo as number;
        // CR 509.1c: a exigência vale se as duas ainda estiverem no campo na declaração de bloqueadores
        if (alvo !== null && c.g.state.objects[lobo]?.zone === 'battlefield') exigeBloqueio(c, alvo, lobo);
      }, {
        condition: (c) => (c.g.state.combat?.attackers ?? []).some((a) => a.id === c.source),
        targets: [t.creature((c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id)), 'criatura alvo que um oponente controla')],
        text: 'Sempre que um Lobo que você controla ataca, se Tolsimir atacou neste combate, a criatura alvo que um oponente controla bloqueia esse Lobo neste combate se puder.',
      }),
    ],
  }],
  rulings: {},
});

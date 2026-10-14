// Bloodthirsty Blade
// Equipped creature gets +2/+0 and is goaded. (It attacks each combat if able and attacks a player other than you if
// able.)
// {1}: Attach this Equipment to target creature an opponent controls. Activate only as a sorcery.
import { activated, attach, attachedGets, controllerOf, defineCard, staticAbility, t, tgt } from '../../motor/api.ts';
import { GOAD } from '../culpa.ts';

export default defineCard({
  name: 'Bloodthirsty Blade',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 2, t: 0 }], 'A criatura equipada recebe +2/+0.'),
      // CR 701.15: goadada pelo controlador do Equipamento enquanto estiver equipada
      staticAbility({
        rules: { goads: (c, obj) => c.g.state.objects[c.source]?.attachedTo === obj },
        text: 'A criatura equipada está goadada (ataca a cada combate se puder, e ataca um jogador que não você se puder).',
      }),
      // ruling 6: só quem controla o Equipamento o move, como feitiço; ruling 7: não tem equipar
      activated('{1}', function* (c) {
        const id = tgt(c);
        if (id !== null && c.g.state.objects[c.source]?.zone === 'battlefield') attach(c.g, c.source, id);
      }, {
        timing: 'sorcery',
        targets: [t.creature((c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id)), 'criatura alvo que um oponente controla')],
        text: '{1}: Anexe este Equipamento à criatura alvo que um oponente controla. Ative somente como feitiço.',
      }),
    ],
  }],
  rulings: {
    1: GOAD.outroJogador,
    2: GOAD.continua,
    3: GOAD.varios,
    4: GOAD.excecoes,
    5: GOAD.naoEHabilidade,
    6: 'teste: {1}: anexa à criatura de um oponente, que recebe +2/+0 e precisa atacar alguém que não você',
    7: 'teste: só mira criaturas de oponentes',
  },
});

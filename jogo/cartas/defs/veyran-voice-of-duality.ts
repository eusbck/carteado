// Veyran, Voice of Duality
// Magecraft — Whenever you cast or copy an instant or sorcery spell, Veyran gets +1/+1 until end of turn.
// If you casting or copying an instant or sorcery spell causes a triggered ability of a permanent you control to trigger,
// that ability triggers an additional time.
import { controllerOf, defineCard, is, magecraft, staticAbility, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Veyran, Voice of Duality',
  faces: [{
    abilities: [
      // rulings 1-3, 5: magecraft dispara por conjurar ou copiar uma mágica (não por copiar uma carta)
      magecraft(function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p: 1, t: 1 }]);
      }, 'Magecraft — Sempre que você conjura ou copia uma mágica instantânea ou de feitiço, Veyran recebe +1/+1 até o fim do turno.'),
      // rulings 4, 6-7: cada Veyran soma um disparo; as escolhas são feitas para cada instância
      staticAbility({
        rules: {
          extraTriggers: (c, t) => {
            const e = t.cause;
            if (!e || t.controller !== c.you || c.g.state.objects[t.source]?.zone !== 'battlefield' || controllerOf(c.g, t.source) !== c.you) return 0;
            if (e.type === 'cast' && e.player === c.you && !!c.g.state.objects[e.obj] && is.instantOrSorcery(c, e.obj)) return 1;
            if (e.type === 'copySpell' && e.player === c.you && !!c.g.state.objects[e.obj] && is.instantOrSorcery(c, e.obj)) return 1;
            return 0;
          },
        },
        text: 'Se você conjurar ou copiar uma mágica instantânea ou de feitiço fizer disparar uma habilidade de um permanente que você controla, ela dispara uma vez a mais.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: cada magecraft tem seu efeito',
    2: 'regra geral: CR 707.10 — cada cópia dispara magecraft',
    3: 'regra geral: copiar uma mágica dispara magecraft',
    4: 'regra geral: cada Veyran soma um disparo',
    5: 'regra geral: CR 707.12 — copiar uma carta em outra zona não dispara',
    6: 'regra geral: CR 603.2 — as escolhas são feitas por instância',
    7: 'teste: o próprio magecraft de Veyran dispara duas vezes',
  },
});

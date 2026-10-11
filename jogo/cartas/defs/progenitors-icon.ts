// Progenitor's Icon
// As this artifact enters, choose a creature type.
// {T}: Add one mana of any color.
// {T}: The next spell of the chosen type you cast this turn can be cast as though it had flash.
import { activated, asEnters, chooseCreatureType, defineCard, mana, ruleEffect } from '../../motor/api.ts';

export default defineCard({
  name: "Progenitor's Icon",
  faces: [{
    abilities: [
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, c.you, "Progenitor's Icon: escolha um tipo de criatura");
      }, 'Ao entrar, escolha um tipo de criatura.'),
      mana('any'),
      activated('{T}', function* (c) {
        // ruling 1: sem tipo escolhido, não faz nada
        const tipo = (c.g.state.objects[c.source] ?? c.g.state.lki[c.source]?.obj)?.choices.creatureType as string | undefined;
        if (!tipo) return;
        // o motor tira o efeito quando você conjura a próxima mágica desse tipo (motor/stack.ts)
        ruleEffect(c, 'rule:flashNext', { kind: 'endOfTurn' }, { params: { player: c.you, tipo } });
      }, { text: '{T}: A próxima mágica do tipo escolhido que você conjurar neste turno pode ser conjurada como se tivesse lampejo.' }),
    ],
  }],
  rulings: {
    1: 'teste: sem tipo escolhido, a última habilidade não faz nada',
  },
});

// The Black Gate
// As The Black Gate enters, you may pay 3 life. If you don't, it enters tapped.
// {T}: Add {B}.
// {1}{B}, {T}: Choose a player with the most life or tied for most life. Target creature can't be blocked by creatures
// that player controls this turn.
import { activated, asEnters, chooseItems, controllerOf, defineAbility, defineCard, loseLife, mana, playerItem, ruleEffect, staticAbility, t, tgt, yesNo } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

// a restrição de bloqueio criada pela habilidade: vale para a criatura alvo até o fim do turno, contra as criaturas
// do jogador escolhido, inclusive as que entrarem depois (ruling 2)
const BLOQUEIO = defineAbility('The Black Gate:bloqueio', staticAbility({
  rules: {
    canBeBlockedBy: (c, atacante, bloqueadora) => {
      const x = c as unknown as { effect?: { affected?: ObjId[] }; params?: { jogador?: PlayerId } };
      if (!x.effect?.affected?.includes(atacante)) return true;
      return controllerOf(c.g, bloqueadora) !== x.params?.jogador;
    },
  },
  text: 'Não pode ser bloqueada por criaturas do jogador escolhido neste turno.',
}));

export default defineCard({
  name: 'The Black Gate',
  faces: [{ abilities: [
    // CR 614.1c; CR 119.4: só paga quem tem pelo menos 3 de vida
    asEnters(function* (c, ev) {
      const paga = c.g.state.players[c.you].life >= 3 && (yield* yesNo(c.g, c.you, 'The Black Gate: pagar 3 de vida para entrar desvirado?'));
      if (paga) loseLife(c.g, c.you, 3, c.source);
      else ev.tapped = true;
    }, 'Ao entrar, você pode pagar 3 de vida. Se não pagar, entra virado.'),
    mana('B'),
    activated('{1}{B}, {T}', function* (c) {
      const id = tgt(c);
      if (id === null) return;
      // ruling 1: o jogador é escolhido na resolução, com as vidas de agora; depois, mudar a vida não muda nada
      const vivos = c.g.playersInGame();
      const maior = Math.max(...vivos.map((p) => c.g.state.players[p].life));
      const empatados = vivos.filter((p) => c.g.state.players[p].life === maior);
      let jogador = empatados[0];
      if (empatados.length > 1) {
        const [esc] = yield* chooseItems(c.g, c.you, 'The Black Gate: escolha um jogador com mais vida (ou empatado)', empatados.map((p) => playerItem(c.g, p)), 1, 1);
        jogador = Number(esc.replace(/^p/, ''));
      }
      c.g.log(`The Black Gate: ${c.g.state.players[jogador].name} é o jogador escolhido.`);
      ruleEffect(c, BLOQUEIO.id!, { kind: 'endOfTurn' }, { objs: [id], params: { jogador } });
    }, {
      targets: [t.creature()],
      text: '{1}{B}, {T}: Escolha um jogador com mais vida ou empatado com mais vida. A criatura alvo não pode ser bloqueada por criaturas que esse jogador controla neste turno.',
    }),
  ] }],
  rulings: {
    1: 'teste: o jogador é escolhido na resolução; mudar a vida depois não muda o efeito',
    2: 'teste: vale também contra criaturas que o jogador escolhido põe no campo depois',
  },
});

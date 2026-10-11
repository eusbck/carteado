// Zndrsplt's Judgment
// For each player, choose friend or foe. Each friend creates a token that's a copy of a creature they control. Each foe
// returns a creature they control to its owner's hand.
import { chooseItems, copiableValues, creaturesOf, defineCard, nameOf, objItem, putOntoBattlefield, returnToHand } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: "Zndrsplt's Judgment",
  faces: [{
    spell: {
      *effect(c) {
        const g = c.g;
        const s = g.state;
        const amigos: PlayerId[] = [];
        const inimigos: PlayerId[] = [];
        // rulings 7-8: você decide para cada jogador, inclusive você; vale só para esta mágica
        for (const p of g.apnap()) {
          const [esc] = yield* chooseItems(g, c.you, `Zndrsplt's Judgment: ${s.players[p].name} é amigo ou inimigo?`, [
            { id: 'amigo', label: 'Amigo (cria uma ficha cópia de uma criatura dele)' },
            { id: 'inimigo', label: 'Inimigo (devolve uma criatura dele para a mão do dono)' },
          ], 1, 1);
          (esc === 'amigo' ? amigos : inimigos).push(p);
        }
        // ruling 1: os amigos escolhem em ordem de turno e criam as fichas ao mesmo tempo; ruling 9: sem criatura, nada
        const copias: { p: PlayerId; id: ObjId }[] = [];
        for (const p of amigos) {
          const criaturas = creaturesOf(g, p);
          if (!criaturas.length) continue;
          const [esc] = criaturas.length === 1 ? [String(criaturas[0])] : yield* chooseItems(g, p, "Zndrsplt's Judgment: escolha uma criatura sua para criar uma ficha cópia dela", criaturas.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
          copias.push({ p, id: Number(esc) });
        }
        if (copias.length) yield* putOntoBattlefield(g, copias.map(({ p, id }) => ({ controller: p, token: { copyOf: copiableValues(g, id) } })), 'token');
        // ruling 10: os inimigos agem depois dos amigos, e devolvem ao mesmo tempo
        const devolver: ObjId[] = [];
        for (const p of inimigos) {
          const criaturas = creaturesOf(g, p);
          if (!criaturas.length) continue;
          const [esc] = criaturas.length === 1 ? [String(criaturas[0])] : yield* chooseItems(g, p, "Zndrsplt's Judgment: escolha uma criatura sua para devolver para a mão do dono", criaturas.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
          devolver.push(Number(esc));
        }
        if (devolver.length) yield* returnToHand(g, devolver);
      },
    },
  }],
  rulings: {
    1: 'teste: cada amigo cria uma ficha cópia de uma criatura dele; cada inimigo devolve uma criatura dele para a mão',
    2: 'regra geral: CR 707.2 — a ficha copia só os valores copiáveis (motor/mecanicas.ts copiableValues)',
    3: 'regra geral: CR 107.3 — X de uma cópia de permanente vale 0 (motor/chars.ts)',
    4: 'regra geral: CR 707.2 — copiando uma ficha, valem as características dadas pelo efeito que a criou (motor/mecanicas.ts copiableValues)',
    5: 'regra geral: CR 707.3 — copiando uma cópia, a ficha entra como o que a criatura copiava (motor/mecanicas.ts copiableValues)',
    6: 'regra geral: CR 603.6a — as habilidades de entrar da criatura copiada disparam para a ficha (cartas/defs/clone-legion.test.ts)',
    7: 'teste: você pode se declarar inimigo',
    8: 'regra geral: a escolha de amigo ou inimigo fica só nesta resolução (nada é guardado no estado)',
    9: 'teste: jogador sem criaturas não faz nada, seja amigo ou inimigo',
    10: 'teste: cada amigo cria uma ficha cópia de uma criatura dele; cada inimigo devolve uma criatura dele para a mão',
    11: 'regra geral: CR 608.2 — ninguém age entre as duas partes de uma mágica resolvendo (motor/stack.ts)',
  },
});

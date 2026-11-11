// Kinnan, Bonder Prodigy
// Whenever you tap a nonland permanent for mana, add one mana of any type that permanent produced.
// {5}{G}{U}: Look at the top five cards of your library. You may put a non-Human creature card from among them onto
// the battlefield. Put the rest on the bottom of your library in a random order.
import {
  activated, addMana, chars, chooseItems, chooseOne, defineCard, isCreature, isLand, moveObjects, nameOf, objItem, on, putOntoBattlefield,
  staticAbility, triggered,
} from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { ManaType } from '../../motor/types.ts';

const NOME_MANA: Record<string, string> = { W: '{W}', U: '{U}', B: '{B}', R: '{R}', G: '{G}', C: '{C}' };

export default defineCard({
  name: 'Kinnan, Bonder Prodigy',
  faces: [{
    abilities: [
      // ruling 1: só habilidades de mana com {T} no custo; previsão para o pagamento automático
      staticAbility({
        rules: {
          extraManaForPlanning: (c, jogador, fonte, produzida, virou) => (jogador === c.you && virou && produzida.length > 0 && !!c.g.state.objects[fonte] && !isLand(c.g, fonte) ? [produzida[0]] : []),
        },
      }),
      // CR 605.1b: habilidade de mana desencadeada, resolve na hora; ruling 3: a mana vem de Kinnan; ruling 4: sem restrições
      triggered(on.custom((e, c) => e.type === 'mana' && e.player === c.you && !!e.tappedForMana && e.produced.length > 0 && !!c.g.state.objects[e.source] && !isLand(c.g, e.source)
        ? { tipos: [...new Set(e.produced.filter((t) => (t as string) !== '*'))] } : false), function* (c) {
        const tipos = c.event.tipos as ManaType[];
        if (!tipos.length) return;
        // ruling 2: tipos são as cinco cores e incolor
        const tipo = tipos.length === 1 ? tipos[0] : (yield* chooseOne(c.g, c.you, 'Kinnan: que tipo de mana adicionar?', tipos.map((t) => ({ id: t, label: NOME_MANA[t] ?? t })))) as ManaType;
        addMana(c.g, c.you, [tipo], { source: c.source });
      }, { mana: true, text: 'Sempre que você vira um permanente que não é terreno para obter mana, adicione uma mana de qualquer tipo que esse permanente produziu.' }),
      activated('{5}{G}{U}', function* (c) {
        const g = c.g;
        const topo = g.state.zones.library[c.you].slice(0, 5);
        if (!topo.length) return;
        const cands = topo.filter((id) => isCreature(g, id) && !chars(g, id).subtypes.includes('Human'));
        let posta: number | null = null;
        if (cands.length) {
          const esc = yield* chooseItems(g, c.you, 'Kinnan: você pode colocar no campo uma carta de criatura que não seja Human', cands.map((id) => objItem(g, id, nameOf(g, id))), 0, 1);
          if (esc.length) posta = Number(esc[0]);
        }
        if (posta !== null) yield* putOntoBattlefield(g, [{ id: posta, controller: c.you }], 'effect');
        const resto = shuffle(g.state.rng, topo.filter((id) => id !== posta && g.state.objects[id]?.zone === 'library'));
        if (resto.length) yield* moveObjects(g, resto.map((id) => ({ id, to: 'library' as const, position: 'bottom' as const })), 'effect');
      }, { text: '{5}{G}{U}: Olhe as cinco cartas do topo do seu grimório. Você pode colocar no campo uma carta de criatura que não seja Human dentre elas. Coloque o resto no fundo do seu grimório em ordem aleatória.' }),
    ],
  }],
  rulings: {
    1: 'teste: virar um permanente que não é terreno para obter mana dá uma mana a mais; terreno não',
    2: 'teste: escolhe o tipo entre os que o permanente produziu',
    3: 'regra geral: CR 605.1b — a mana a mais é adicionada pela habilidade de Kinnan (motor/costs.ts resolveTriggeredMana)',
    4: 'teste: virar um permanente que não é terreno para obter mana dá uma mana a mais; terreno não',
  },
});

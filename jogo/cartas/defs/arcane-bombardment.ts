// Arcane Bombardment
// Whenever you cast your first instant or sorcery spell each turn, exile an instant or sorcery card at random from your
// graveyard. Then copy each card exiled with this enchantment. You may cast any number of the copies without paying
// their mana costs.
import { defineCard, exile, is, linkedExiled, on, triggered } from '../../motor/api.ts';
import { int } from '../../motor/rng.ts';
import { conjuraCopiasGratis, instantesEFeiticosNoCemiterio } from '../saque.ts';

const CHAVE = 'bombardeio';

export default defineCard({
  name: 'Arcane Bombardment',
  faces: [{
    abilities: [
      // ruling 2: se você já conjurou uma instantânea ou feitiço no turno em que ela entrou, só dispara num turno posterior
      triggered(on.custom((e, c) => e.type === 'cast' && e.player === c.you && !!c.g.state.objects[e.obj] && is.instantOrSorcery(c, e.obj)
        && c.g.state.turnStats[c.you]?.instantSorceryCast === 1), function* (c) {
        const g = c.g;
        // ruling 1: a mágica que disparou ainda está na pilha, não no cemitério
        const cem = instantesEFeiticosNoCemiterio(g, c.you);
        if (cem.length) {
          const sorteada = cem[int(g.state.rng, cem.length)];
          yield* exile(g, [sorteada], { linkTo: { obj: c.source, key: CHAVE } });
        }
        // CR 607.2a: as cartas exiladas com este encantamento; ruling 5: um encantamento novo não vê as antigas
        // ruling 3: as cópias são conjuradas agora, na ordem que você escolher
        yield* conjuraCopiasGratis(c, linkedExiled(g, c.source, CHAVE), 'Arcane Bombardment');
      }, { text: 'Sempre que você conjura a sua primeira mágica instantânea ou de feitiço em cada turno, exile uma carta de instantânea ou de feitiço aleatória do seu cemitério. Depois, copie cada carta exilada com este encantamento. Você pode conjurar quantas cópias quiser sem pagar os custos de mana delas.' }),
    ],
  }],
  rulings: {
    1: 'teste: a primeira instantânea do turno exila uma carta do cemitério e conjura a cópia; a segunda não dispara',
    2: 'teste: a primeira instantânea do turno exila uma carta do cemitério e conjura a cópia; a segunda não dispara',
    3: 'teste: no turno seguinte, copia todas as cartas exiladas com ele',
    4: 'regra geral: CR 107.3b — sem pagar o custo de mana, X vale 0 (motor/stack.ts)',
    5: 'regra geral: CR 607.2a, 400.7 — o encantamento que volta ao campo é um objeto novo, sem as cartas vinculadas',
  },
});

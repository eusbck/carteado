// Sink into Stupor // Soporific Springs (modal de duas faces)
// Sink into Stupor {1}{U}{U} — Instant
// Return target spell or nonland permanent an opponent controls to its owner's hand.
// Soporific Springs — Land
// As this land enters, you may pay 3 life. If you don't, it enters tapped.
// {T}: Add {U}.
import { controllerOf, defineCard, isLand, land, mana, returnToHand, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Sink into Stupor // Soporific Springs',
  faces: [
    {
      spell: {
        // um alvo só: mágica na pilha ou permanente não terreno no campo, de um oponente (CR 115.1)
        targets: [{
          what: 'spellOrPermanent', label: 'mágica ou permanente não terreno alvo que um oponente controla',
          filter: (c, t) => {
            if (t.kind !== 'obj') return false;
            const o = c.g.state.objects[t.id];
            if (!o) return false;
            if (o.zone === 'stack') return c.g.isOpponent(c.you, o.stack?.controller ?? o.controller);
            return !isLand(c.g, t.id) && c.g.isOpponent(c.you, controllerOf(c.g, t.id));
          },
        }],
        *effect(c) {
          // ruling 1: a mágica sai da pilha (não é anulada); ruling 2: a cópia deixa de existir na mão (CR 704.5e)
          const id = tgt(c);
          if (id !== null) yield* returnToHand(c.g, [id]);
        },
      },
    },
    { abilities: [land.payLifeOrTapped(3), mana('U')] },
  ],
  rulings: {
    1: 'teste: a mágica devolvida sai da pilha sem ser anulada, mesmo a que não pode ser anulada',
    2: 'regra geral: CR 704.5e — a cópia de mágica fora da pilha deixa de existir (motor/sba.ts)',
    3: 'teste: CR 712.11c — conjurar ou jogar olha só a face escolhida',
    4: 'regra geral: CR 712.12 — permissão de jogar oferece as duas faces; de conjurar, só a de mágica (testes/regras-formatos.test.ts)',
    5: 'regra geral: CR 712.12 — a face que se encaixa no efeito (testes/regras-formatos.test.ts)',
    6: 'regra geral: CR 712.8a, 712.14 — fora do campo só a frente; posta no campo, entra com a frente (testes/regras-formatos.test.ts)',
    7: 'regra geral: CR 712.8a, 712.8f — valor de mana da face considerada (testes/regras-formatos.test.ts)',
    8: 'regra geral: CR 712.3, 712.9 — só transforma quando uma habilidade manda (testes/regras-formatos.test.ts)',
  },
});

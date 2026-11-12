// Heartwood Crafter // Soul Tether
// Heartwood Crafter — This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so
// unprepares it.) {T}: Add {C}. This mana can't be spent to cast spells from your hand.
// Soul Tether (feitiço preparado) {2}{R/G} — Create a Heartwood token. (It's a red and green artifact with "{T}: Add {R}
// or {G}.")
import { asEnters, createTokens, defineCard, defineFn, mana, type G } from '../../motor/api.ts';

// "essa mana não pode ser gasta para conjurar mágicas da sua mão": vale para mágicas de outras zonas e para habilidades
const RESTRICAO = 'Heartwood Crafter:naoDaMao';
// (na estimativa de "dá para conjurar?" a carta ainda está na mão; na pilha, vale de onde foi conjurada)
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) => {
  if (purpose.kind !== 'spell' || purpose.obj === undefined) return true;
  const o = g.state.objects[purpose.obj];
  return (o?.stack?.castFrom ?? o?.zone) !== 'hand';
});

export default defineCard({
  name: 'Heartwood Crafter // Soul Tether',
  faces: [
    {
      abilities: [
        // CR 722.3a: "entra preparado"
        asEnters((_c, ev) => { ev.choices.prepared = true; }, 'Esta criatura entra preparada.'),
        mana('C', { restriction: RESTRICAO, text: '{T}: Adicione {C}. Essa mana não pode ser gasta para conjurar mágicas da sua mão.' }),
      ],
    },
    { spell: { *effect(c) { yield* createTokens(c.g, c.you, 'Heartwood', 1); } } },
  ],
  rulings: {
    1: 'regra geral: CR 722.3c — exceção a 704.5e (motor/sba.ts)',
    2: 'regra geral: CR 722.3c — a cópia usa só as características do feitiço preparado',
    3: 'regra geral: CR 722.3c — conjura pela permissão, pagando o custo normal',
    4: 'regra geral: CR 722.3b — sem a designação, a cópia no exílio deixa de existir (704.5e)',
    5: 'regra geral: CR 722.4 — fora do campo, só as características normais',
    6: 'regra geral: CR 722.3a — preparado é designação, não habilidade',
    7: 'regra geral: CR 722.3a — prepare() exige feitiço preparado',
    8: 'regra geral: CR 722.2b e 722.3a — preparado é designação do objeto, não valor copiável',
    9: 'teste: entra preparado; Soul Tether, conjurada do exílio, cria um Heartwood',
    10: 'regra geral: CR 722.3a — prepare() não age em quem já está preparado',
    11: 'teste: entra preparado; Soul Tether, conjurada do exílio, cria um Heartwood',
    12: 'regra geral: CR 608.2b — não resolve; a designação já saiu ao conjurar (601.2i)',
    13: 'regra geral: CR 722.3c — só o controlador atual (motor/priority.ts)',
    14: 'não se aplica: nenhuma carta dos decks desta frente pede para nomear uma carta',
    15: 'regra geral: CR 722.3 — a carta é conjurada só pela frente',
    16: 'regra geral: CR 722.3a — a designação continua',
  },
});

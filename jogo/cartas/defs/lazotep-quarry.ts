// Lazotep Quarry
// {T}: Add {C}.
// {T}, Sacrifice a creature: Add one mana of any color.
// {X}{2}, {T}, Sacrifice a Desert: Exile target creature card with mana value X from your graveyard. Create a token
// that's a copy of it, except it's a 4/4 black Zombie. Activate only as a sorcery.
import { activated, createTokens, defineCard, exile, isCreature, isSubtype, mana, manaValue, printedChars, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Lazotep Quarry',
  faces: [{
    abilities: [
      mana('C'),
      mana('any', { cost: '{T}, Sacrifice a creature', text: '{T}, Sacrifique uma criatura: Adicione uma mana de qualquer cor.' }),
      // o Desert sacrificado pode ser este mesmo terreno
      activated([{ k: 'mana', cost: '{X}{2}' }, { k: 'tap' }, { k: 'sacrifice', n: 1, filter: (c, id) => isSubtype(c.g, id, 'Desert'), label: 'um Desert' }], function* (c) {
        const s = c.g.state;
        const carta = tgt(c);
        if (carta === null || s.objects[carta]?.zone !== 'graveyard' || manaValue(c.g, carta) !== c.x) return;
        const o = s.objects[carta];
        const def = o.def;
        // ruling 1: copia a carta impressa; ruling 2: é Zombie no lugar dos outros tipos de criatura e preta no lugar das outras cores
        const tipos = printedChars(def, 0, o.owner).types;
        yield* exile(c.g, [carta]);
        yield* createTokens(c.g, c.you, { copyOf: { def, face: 0, except: { power: 4, toughness: 4, colors: ['B'], addTypes: tipos, removeOtherTypes: true, addSubtypes: ['Zombie'] } } }, 1);
      }, {
        timing: 'sorcery',
        targets: [t.card('graveyard', (c, id) => isCreature(c.g, id) && manaValue(c.g, id) === ((c as { x?: number }).x ?? manaValue(c.g, id)), 'carta de criatura alvo com valor de mana X do seu cemitério', 'you')],
        text: '{X}{2}, {T}, Sacrifique um Desert: Exile a carta de criatura alvo com valor de mana X do seu cemitério. Crie uma ficha que é uma cópia dela, exceto que é um Zombie 4/4 preto. Ative somente como feitiço.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.2 — a ficha copia só o que está impresso na carta, com as exceções listadas (cartas/defs/lazotep-quarry.ts)',
    2: 'teste: exila a carta de criatura de valor de mana X do cemitério e cria uma cópia Zombie 4/4 preta',
    3: 'regra geral: CR 107.3g — fora da pilha, o X do custo de mana da carta conta 0 (motor/chars.ts)',
    4: 'regra geral: CR 603.6a — as habilidades de entrar da carta copiada disparam para a ficha (motor/triggers.ts)',
  },
});
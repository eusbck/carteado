// Excava, the Risen Past
// Flying, haste
// Whenever Excava attacks, return up to one target artifact, creature, or non-Aura enchantment card with mana value 3 or
// less from your graveyard to the battlefield with a finality counter on it. It's a 1/1 Spirit creature with flying in
// addition to its other types.
import { addEffect, and, defineCard, is, keywords, not, on, or, putOntoBattlefield, t, tgt, triggered, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Excava, the Risen Past',
  faces: [{
    abilities: [
      ...keywords('flying', 'haste'),
      triggered(on.selfAttacks(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const [novo] = yield* putOntoBattlefield(c.g, [{ id, controller: c.you, counters: { finality: 1 } }], 'effect');
        if (novo === undefined) return;
        // efeito da habilidade que resolveu: dura enquanto o permanente estiver no campo
        addEffect(c.g, {
          source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: novo }, affected: [novo],
          mods: [{ k: 'addTypes', types: ['Creature'], subtypes: ['Spirit'] }, { k: 'setPT', p: 1, t: 1 }, { k: 'addKeyword', kw: 'flying' }],
        });
      }, {
        targets: [upTo(1, t.card('graveyard', and(or(is.artifact, is.creature, and(is.enchantment, not(is.subtype('Aura')))), is.mvAtMost(3)), 'até uma carta alvo de artefato, criatura ou encantamento que não seja Aura, com valor de mana 3 ou menos'))],
        text: 'Sempre que Excava ataca, devolva até uma carta alvo de artefato, criatura ou encantamento (não Aura) com valor de mana 3 ou menos do seu cemitério para o campo com um marcador de finalidade. Ela é uma criatura Spirit 1/1 com voar além dos outros tipos.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 107.3g — X vale 0 no cemitério',
    2: 'não se aplica: nenhum Equipamento criatura nos decks',
    3: 'teste: artefato devolvido vira criatura 1/1',
    4: 'não se aplica: nenhum Veículo ou Espaçonave nos decks',
  },
});

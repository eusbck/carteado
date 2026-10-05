// The Warring Triad
// Flying, trample, haste
// As long as there are fewer than eight cards in your graveyard, The Warring Triad isn't a creature.
// {T}, Mill a card: Target player adds one mana of any color. (Activate only as an instant.)
import { activated, addMana, chooseColor, defineCard, keywords, staticAbility, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'The Warring Triad',
  faces: [{
    abilities: [
      ...keywords('flying', 'trample', 'haste'),
      staticAbility({
        affects: (c, o) => o.id === c.source && o.zone === 'battlefield' && c.g.state.zones.graveyard[c.you].length < 8,
        // CR 205.1b: deixa de ser criatura e perde os subtipos de criatura (God)
        mods: () => [{ k: 'setTypes', types: ['Artifact'], subtypes: [], keepSupertypes: true }],
        text: 'Enquanto houver menos de oito cartas no seu cemitério, The Warring Triad não é uma criatura.',
      }),
      // tem alvo: não é habilidade de mana (CR 605.1a), usa a pilha; o jogador alvo escolhe a cor
      activated('{T}, Mill a card', function* (c) {
        const p = tgtPlayer(c);
        if (p === null) return;
        const cor = yield* chooseColor(c.g, p, 'The Warring Triad: escolha a cor da mana');
        addMana(c.g, p, [cor], { source: c.source });
      }, { targets: [t.player()], text: '{T}, Moa uma carta: O jogador alvo adiciona uma mana de qualquer cor.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.6a — o número de cartas no cemitério ao entrar decide se entra como criatura',
    2: 'regra geral: CR 506.4 — se deixar de ser criatura, sai do combate',
    3: 'regra geral: CR 122.1 — os marcadores ficam mesmo sem ser criatura',
    4: 'teste: não é habilidade de mana; usa a pilha e o jogador alvo escolhe a cor',
    5: 'regra geral: CR 113.6 — as habilidades funcionam no campo, criatura ou não',
    6: 'regra geral: CR 113.6 — fora do campo é uma carta de criatura',
    7: 'teste: deixa de ser criatura e perde o tipo God',
    8: 'regra geral: CR 613.6 — a mudança de tipo (camada 4) já se aplicou antes da perda de habilidades (camada 6)',
    9: 'regra geral: CR 603.6a — gatilhos de criatura entrando olham a característica ao entrar',
  },
});

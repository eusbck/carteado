// Arterial Alchemy
// When this enchantment enters, create a Blood token for each opponent you have. (It's an artifact with "{1}, {T}, Discard
// a card, Sacrifice this token: Draw a card.")
// Blood tokens you control are Equipment in addition to their other types and have "Equipped creature gets +2/+0" and
// equip {2}.
import { and, anthem, attachedGets, createTokens, defineAbility, defineCard, equip, etb, is } from '../../motor/api.ts';

const BONUS = defineAbility('Arterial Alchemy:bonus', attachedGets(() => [{ k: 'pt', p: 2, t: 0 }], 'A criatura equipada recebe +2/+0.'));
const EQUIPAR = defineAbility('Arterial Alchemy:equipar', equip('{2}'));

export default defineCard({
  name: 'Arterial Alchemy',
  faces: [{
    abilities: [
      etb(function* (c) {
        const n = c.g.opponents(c.you).length;
        if (n > 0) yield* createTokens(c.g, c.you, 'Blood', n);
      }, { text: 'Quando este encantamento entra, crie uma ficha de Blood para cada oponente que você tem.' }),
      // ruling 4: deixam de ser Equipamento quando Arterial Alchemy sai; ruling 5: com dois, o bônus soma e equipar continua {2}
      anthem(and(is.token, is.subtype('Blood'), is.yours), () => [{ k: 'addTypes', subtypes: ['Equipment'] }, { k: 'addAbility', id: BONUS.id! }, { k: 'addAbility', id: EQUIPAR.id! }],
        'As fichas de Blood que você controla são Equipamento além dos outros tipos e têm "A criatura equipada recebe +2/+0" e equipar {2}.'),
    ],
  }],
  rulings: {
    1: 'regra geral: ficha de Blood é qualquer ficha de artefato com o subtipo Blood, mesmo com outros subtipos (o efeito filtra por ficha e subtipo)',
    2: 'regra geral: CR 118.3 — um permanente sacrificado paga um custo só (motor/costs.ts)',
    3: 'não se aplica: nenhuma carta dos decks dispara ao sacrificar uma ficha de Blood',
    4: 'teste: os Blood viram Equipamento com +2/+0 e equipar {2}; saindo Arterial Alchemy, deixam de ser e soltam',
    5: 'regra geral: CR 613.1f — cada Arterial Alchemy dá a habilidade de +2/+0 uma vez; o custo de equipar não muda',
    6: 'regra geral: CR 301.5c — o Blood que também for criatura não pode ser anexado (motor/sba.ts)',
  },
});

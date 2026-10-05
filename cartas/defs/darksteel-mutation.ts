// Darksteel Mutation
// Enchant creature
// Enchanted creature is an Insect artifact creature with base power and toughness 0/1 and has indestructible, and it
// loses all other abilities, card types, and creature types.
import { attachedGets, defineCard, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Darksteel Mutation',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      // camada 4 (tipos), 6 (perde habilidades, depois ganha indestrutível), 7b (base 0/1)
      attachedGets(() => [
        { k: 'setTypes', types: ['Artifact', 'Creature'], subtypes: ['Insect'], keepSupertypes: true },
        { k: 'loseAllAbilities' },
        { k: 'addKeyword', kw: 'indestructible' },
        { k: 'setPT', p: 0, t: 1 },
      ], 'A criatura encantada é uma criatura artefato Insect com força e resistência base 0/1 e indestrutível, e perde todas as outras habilidades, tipos de carta e tipos de criatura.'),
    ],
  }],
  rulings: {
    1: 'teste: só artefato e criatura, só Insect',
    2: 'não se aplica: nenhuma criatura dos decks tem subtipos de artefato',
    3: 'regra geral: CR 613.7 — efeitos de base posteriores valem por ordem de registro',
    4: 'teste: troca a força e resistência impressas',
    5: 'teste: marcadores continuam valendo',
    6: 'teste: continua lendária',
    7: 'teste: perde as habilidades',
    8: 'teste: as cores continuam',
  },
});

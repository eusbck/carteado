// Shuri's Fabricator
// When this artifact enters, create two tapped Vibranium tokens. (They're artifacts with indestructible and "{T}: Add
// {C}. This mana can't be spent to cast a nonartifact spell.")
// {6}, {T}: Return target artifact card from your graveyard to the battlefield with a finality counter on it. Activate
// only as a sorcery. (If a permanent with a finality counter on it would be put into a graveyard, exile it instead.)
import { activated, defineCard, etb, isType, putOntoBattlefield, t, tgt } from '../../motor/api.ts';
import { criaVibraniumVirado } from '../wakanda.ts';

export default defineCard({
  name: "Shuri's Fabricator",
  faces: [{
    abilities: [
      etb(function* (c) { yield* criaVibraniumVirado(c, 2); }, { text: 'Quando este artefato entra, crie duas fichas de Vibranium viradas.' }),
      activated('{6}, {T}', function* (c) {
        const id = tgt(c);
        // CR 122.1h: com o marcador de finalidade, se fosse para o cemitério, é exilada
        if (id !== null && c.g.state.objects[id]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id, controller: c.you, counters: { finality: 1 } }], 'effect');
      }, {
        timing: 'sorcery',
        targets: [t.card('graveyard', (c, id) => isType(c.g, id, 'Artifact'), 'carta de artefato alvo do seu cemitério', 'you')],
        text: '{6}, {T}: Devolva ao campo a carta de artefato alvo do seu cemitério com um marcador de finalidade. Ative somente como feitiço.',
      }),
    ],
  }],
  rulings: {},
});
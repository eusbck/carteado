// Steel Overseer
// {T}: Put a +1/+1 counter on each artifact creature you control.
import { activated, addCounters, defineCard, isCreature } from '../../motor/api.ts';
import { artifacts } from '../artefatos.ts';

export default defineCard({
  name: "Steel Overseer",
  faces: [{ abilities: [activated('{T}', function*(c) { for (const id of artifacts(c).filter((id) => isCreature(c.g, id))) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you); }, { text: '{T}: coloque um marcador +1/+1 em cada criatura artefato que você controla.' })] }],
  rulings: {
    "1": "teste: inclui o próprio Steel Overseer e exclui artefatos não criatura e artefatos adversários."
  },
});

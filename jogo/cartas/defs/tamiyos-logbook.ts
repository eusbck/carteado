// Tamiyo's Logbook
// {5}{U}, {T}: Draw a card. This ability costs {1} less to activate for each other artifact you control.
import { activated, defineCard, draw } from '../../motor/api.ts';
import { artifacts } from '../artefatos.ts';

export default defineCard({
  name: "Tamiyo's Logbook",
  faces: [{ abilities: [activated('{5}{U}, {T}', function*(c) { yield* draw(c.g, c.you, 1); }, { selfCost: (c) => ({ reduce: artifacts(c).filter((id) => id !== c.source).length }), text: '{5}{U}, {T}: compre uma carta. Custa {1} menos por outro artefato seu.' })] }],
  rulings: {
    "1": "CR 118.7a: teste: conta só outros artefatos e reduz apenas genérico; com cinco outros, ainda paga {U}."
  },
});

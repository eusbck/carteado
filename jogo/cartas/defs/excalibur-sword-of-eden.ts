// Excalibur, Sword of Eden
// This spell costs {X} less to cast, where X is the total mana value of historic permanents you control. (Artifacts,
// legendaries, and Sagas are historic.)
// Equipped creature gets +10/+0 and has vigilance.
// Equip legendary creature {2}
import { and, attachedGets, controllerOf, defineCard, equip, is, manaValue, t } from '../../motor/api.ts';
import { ehHistorica } from '../jin.ts';

export default defineCard({
  name: 'Excalibur, Sword of Eden',
  faces: [{
    // rulings 1-3: só o custo total muda, fixado ao conjurar; o valor de mana continua 12
    selfCost: (c) => ({ reduce: c.g.state.zones.battlefield.filter((id) => controllerOf(c.g, id) === c.you && ehHistorica(c.g, id)).reduce((n, id) => n + manaValue(c.g, id), 0) }),
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 10, t: 0 }, { k: 'addKeyword', kw: 'vigilance' }], 'A criatura equipada recebe +10/+0 e tem vigilância.'),
      // CR 702.6c: equipar com restrição no alvo
      { ...equip('{2}'), targets: [t.creature(and(is.yours, is.legendary), 'criatura lendária alvo que você controla')], text: 'Equipar criatura lendária {2}' },
    ],
  }],
  rulings: {
    1: 'regra geral: CR 202.3 — o valor de mana vem do custo de mana impresso e não muda com a redução (motor/chars.ts manaValue)',
    2: 'regra geral: CR 601.2f — o custo total é fixado antes de pagar; mudar as permanentes históricas depois não o altera (motor/stack.ts)',
    3: 'regra geral: CR 601.2 — depois de anunciada a mágica, ninguém age até ela ser paga (motor/stack.ts)',
    4: 'regra geral: CR 700.6 — histórica é a que é lendária, artefato ou Saga (cartas/jin.ts ehHistorica)',
    5: 'não se aplica: Excalibur não tem habilidade de "sempre que você conjura uma mágica histórica"',
    6: 'não se aplica: Excalibur não tem habilidade de "sempre que você conjura uma mágica histórica"',
    7: 'não se aplica: Excalibur não tem habilidade de "sempre que você conjura uma mágica histórica"',
  },
});
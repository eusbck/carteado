// Pyrohemia
// At the beginning of the end step, if no creatures are on the battlefield, sacrifice this enchantment.
// {R}: This enchantment deals 1 damage to each creature and each player.
import { activated, allCreatures, dealDamage, defineCard, on, sacrifice, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Pyrohemia',
  faces: [{
    abilities: [
      triggered(on.endStep('each'), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') yield* sacrifice(c.g, [c.source]);
      }, {
        // rulings 1-2 (CR 603.4): cláusula "se" interveniente, vista no começo da etapa final e na resolução
        condition: (c) => allCreatures(c.g).length === 0,
        text: 'No início da etapa final, se não houver criaturas no campo, sacrifique este encantamento.',
      }),
      // ruling 3: cada ativação é 1 de dano
      activated('{R}', function* (c) {
        dealDamage(c.g, [
          ...allCreatures(c.g).map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: 1, combat: false })),
          ...c.g.playersInGame().map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 1, combat: false })),
        ]);
      }, { text: '{R}: Este encantamento causa 1 de dano a cada criatura e a cada jogador.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 514.2 — os efeitos "até o fim do turno" acabam na limpeza, depois dos gatilhos da etapa final (motor/turn.ts)',
    2: 'teste: com uma criatura no campo no início da etapa final, fica; sem nenhuma, é sacrificada',
    3: 'teste: {R}: 1 de dano a cada criatura e a cada jogador',
  },
});
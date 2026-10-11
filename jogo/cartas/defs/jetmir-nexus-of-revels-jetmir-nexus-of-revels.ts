// Jetmir, Nexus of Revels // Jetmir, Nexus of Revels (carta reversível: as duas faces são iguais e vale a da frente)
// Jetmir, Nexus of Revels {1}{R}{G}{W} — Legendary Creature — Cat Demon 5/4
// Creatures you control get +1/+0 and have vigilance as long as you control three or more creatures.
// Creatures you control also get +1/+0 and have trample as long as you control six or more creatures.
// Creatures you control also get +1/+0 and have double strike as long as you control nine or more creatures.
import { and, anthem, creaturesOf, defineCard, is } from '../../motor/api.ts';
import type { StaticDef } from '../../motor/defs.ts';

/** "enquanto você controlar N ou mais criaturas": +1/+0 e a palavra-chave para as suas criaturas */
function nivel(n: number, kw: string, texto: string): StaticDef {
  return { ...anthem(and(is.yours, is.creature), () => [{ k: 'pt', p: 1, t: 0 }, { k: 'addKeyword', kw }], texto), condition: (c) => creaturesOf(c.g, c.you).length >= n };
}

export default defineCard({
  name: 'Jetmir, Nexus of Revels // Jetmir, Nexus of Revels',
  faces: [{
    abilities: [
      nivel(3, 'vigilance', 'As criaturas que você controla recebem +1/+0 e têm vigilância enquanto você controlar três ou mais criaturas.'),
      nivel(6, 'trample', 'As criaturas que você controla também recebem +1/+0 e têm atropelar enquanto você controlar seis ou mais criaturas.'),
      nivel(9, 'double strike', 'As criaturas que você controla também recebem +1/+0 e têm golpe duplo enquanto você controlar nove ou mais criaturas.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.4c — quem perde o golpe duplo depois do primeiro dano não causa dano de novo (motor/combat.ts)',
  },
});

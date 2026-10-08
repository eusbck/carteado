// Soulless One
// Soulless One's power and toughness are each equal to the number of Zombies on the battlefield plus the number of
// Zombie cards in all graveyards.
import { defineCard, isSubtype, selfGets } from '../../motor/api.ts';
import type { SCtx } from '../../motor/api.ts';

function contagem(c: SCtx): number {
  const s = c.g.state;
  // Zombies no campo de qualquer jogador (fora de fase não existe, CR 702.26b), contando ela mesma
  const campo = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && isSubtype(c.g, id, 'Zombie')).length;
  const cemiterios = s.zones.graveyard.flat().filter((id) => isSubtype(c.g, id, 'Zombie')).length;
  return campo + cemiterios;
}

export default defineCard({
  name: 'Soulless One',
  faces: [{
    abilities: [
      // habilidade que define característica: camada 7a (CR 604.3, 613.4a); efeitos de outras camadas vêm depois.
      // O motor aplica estáticas só a permanentes: fora do campo a força/resistência fica sem valor (ver relatório)
      selfGets((c) => { const n = contagem(c); return [{ k: 'setPT', p: n, t: n }]; },
        'A força e a resistência de Soulless One são iguais ao número de Zombies no campo mais o número de cartas de Zombie em todos os cemitérios.',
        { cda: true }),
    ],
  }],
  rulings: {},
});

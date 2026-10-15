// Mirrormade
// You may have this enchantment enter as a copy of any artifact or enchantment on the battlefield.
import { defineCard, entersAsCopy, isType } from '../../motor/api.ts';

export default defineCard({
  name: 'Mirrormade',
  faces: [{
    abilities: [
      // CR 707.5, 614.1c: só o que já está no campo (ruling 6)
      entersAsCopy({
        label: 'Mirrormade', what: 'um artefato ou encantamento', text: 'Você pode fazer este encantamento entrar como uma cópia de qualquer artefato ou encantamento no campo.',
        candidates: (c) => c.g.state.zones.battlefield.filter((id) => isType(c.g, id, 'Artifact') || isType(c.g, id, 'Enchantment')),
      }),
    ],
  }],
  rulings: {
    1: 'teste: entra como cópia de um artefato do oponente, sem os marcadores dele',
    2: 'regra geral: CR 707.2 — o X do custo de mana conta 0 na cópia',
    3: 'regra geral: CR 707.3 — se o escolhido copiava outro, Mirrormade entra como esse outro (motor/mecanicas.ts copiableValues)',
    4: 'regra geral: CR 707.2, 111.4 — cópia de ficha usa os valores da ficha, e Mirrormade não vira ficha',
    5: 'regra geral: CR 707.5 — as habilidades de entrar e "entra com" do copiado valem (motor/criaturas.ts entersAsCopy)',
    6: 'regra geral: CR 614.12 — só os que já estão no campo podem ser escolhidos (motor/criaturas.ts entersAsCopy)',
    7: 'não se aplica: o deck não tem Aura que valha copiar com Mirrormade (simplificação: a cópia de Aura não escolhe o que encantar)',
  },
});

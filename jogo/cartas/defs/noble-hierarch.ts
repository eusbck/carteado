// Noble Hierarch
// Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)
// {T}: Add {G}, {W}, or {U}.
import { defineCard, exalted, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Noble Hierarch',
  faces: [{ abilities: [exalted(), mana(['G', 'W', 'U'])] }],
  rulings: {
    1: 'teste: exaltado: a criatura que ataca sozinha recebe +1/+1',
    2: 'regra geral: CR 702.83b — atacando com duas, o exaltado não dispara (testado em Ignoble Hierarch)',
    3: 'regra geral: CR 702.83b — quem entra atacando não foi declarado atacante (motor/combat.ts)',
    4: 'não se aplica: a mesa não tem Gigante de Duas Cabeças',
  },
});

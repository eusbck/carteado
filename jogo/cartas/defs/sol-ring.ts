// Sol Ring — {T}: Add {C}{C}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({ name: 'Sol Ring', faces: [{ abilities: [mana('CC', { text: '{T}: Adicione {C}{C}.' })] }] });

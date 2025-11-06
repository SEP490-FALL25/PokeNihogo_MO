import { at, byUser } from "@models/common/common.request";
import { TranslationSchema } from "@models/pokemon/pokemon.common";
import { z } from "zod";

/**
 * Elemental Entity Schema
 */
export const ElementalEntitySchema = z.object({
    id: z.number(),
    type_name: z.string(),
    display_name: TranslationSchema,
    color_hex: z.string(),
    ...byUser,
    ...at,
});

export type IElementalEntity = z.infer<typeof ElementalEntitySchema>;
//------------------------End------------------------//
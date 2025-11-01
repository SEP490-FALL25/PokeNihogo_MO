import { BackendResponseModel } from "@models/backend/common";
import { z } from "zod";
import { GachaBannerSchema } from "./gacha.entity";

/**
 * Gacha Banner List Response Schema
 */
export const GachaBannerListResponseSchema = BackendResponseModel(z.array(GachaBannerSchema));
export type IGachaBannerListResponse = z.infer<typeof GachaBannerListResponseSchema>;
//------------------------End------------------------//


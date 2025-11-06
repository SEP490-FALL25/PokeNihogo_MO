import { BackendResponsePaginationModel } from "@models/backend/common";
import { ElementalEntitySchema } from "@models/elemental/elemental.entity";
import z from "zod";

/**
 * List Elemental Response Schema
 */
export const ListElementalResponseSchema = BackendResponsePaginationModel(ElementalEntitySchema);
//------------------------End------------------------//
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { repairLocations } from "@/lib/repair-workflow";
import { repairStatusLabels } from "@/lib/site-data";
import { apiPost } from "@/integrations/mysql/client";

export const repairRequestSchema = z.object({
  full_name: z.string().trim().min(2, "Name required").max(120),
  organisation: z.string().max(200).optional().or(z.literal("")),
  mobile: z.string().trim().min(7, "Mobile required").max(20),
  whatsapp: z.string().max(20).optional().or(z.literal("")),
  email: z.string().trim().email("Valid email required").max(200),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  equipment_category: z.string().max(100).optional().or(z.literal("")),
  equipment_name: z.string().trim().min(2, "Equipment name required").max(200),
  brand: z.string().max(100).optional().or(z.literal("")),
  model_no: z.string().max(100).optional().or(z.literal("")),
  serial_no: z.string().max(100).optional().or(z.literal("")),
  problem_description: z.string().trim().min(10, "Please describe the problem").max(2000),
  urgency: z.enum(["low", "normal", "urgent"]).default("normal"),
  preferred_contact: z.enum(["phone", "whatsapp", "email"]).default("phone"),
  pickup_required: z.boolean().default(false),
  status: z
    .string()
    .default("request_received")
    .refine(s => Object.prototype.hasOwnProperty.call(repairStatusLabels, s), {
      message: "Invalid status",
    }),
  current_location: z
    .string()
    .default("Office")
    .refine(l => repairLocations.includes(l as any), { message: "Invalid location" }),
  admin_notes: z.string().max(2000).optional().or(z.literal("")),
  request_source: z.string().default("Website"),
});

export type RepairRequestInput = z.input<typeof repairRequestSchema>;

export async function createRepairRequest(input: RepairRequestInput): Promise<string> {
  const parsed = repairRequestSchema.parse(input);
  const { data, error } = await apiPost<{ request_code: string }>("/api/repair-requests", parsed);
  if (error) throw new Error(error.message);
  return data.request_code;
}

export async function createRepairRequests(inputs: RepairRequestInput[]): Promise<string[]> {
  const parsed = inputs.map(i => repairRequestSchema.parse(i));
  const { data, error } = await apiPost<{
    imported: number;
    skipped: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  }>("/api/repair-requests/bulk", { rows: parsed });
  if (error) throw new Error(error.message);
  // Return placeholder codes — the bulk import doesn't return individual codes
  // (codes are generated server-side). Return count summary.
  return Array.from({ length: data.imported }, (_, i) => `imported-${i}`);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { repairLocations } from "@/lib/repair-workflow";
import { repairStatusLabels } from "@/lib/site-data";

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
    .refine((status) => Object.prototype.hasOwnProperty.call(repairStatusLabels, status), {
      message: "Invalid status",
    }),
  current_location: z
    .string()
    .default("Office")
    .refine((location) => repairLocations.includes(location as (typeof repairLocations)[number]), {
      message: "Invalid location",
    }),
  admin_notes: z.string().max(2000).optional().or(z.literal("")),
  request_source: z.string().default("Website"),
});

export type RepairRequestInput = z.input<typeof repairRequestSchema>;

export function makeRepairRequestCode() {
  const y = new Date().getFullYear();
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `AR-${y}-${rnd}`;
}

export async function createRepairRequest(input: RepairRequestInput) {
  const parsed = repairRequestSchema.parse(input);
  let request_code = makeRepairRequestCode();
  let error: any = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    request_code = makeRepairRequestCode();
    const result = await insertRepairRows([toRepairInsertRow(parsed, request_code)]);
    error = result.error;
    if (!error || error.code !== "23505") break;
  }

  if (error) throw error;
  return request_code;
}

export async function createRepairRequests(inputs: RepairRequestInput[]) {
  const parsed = inputs.map((input) => repairRequestSchema.parse(input));
  let rows: ReturnType<typeof toRepairInsertRow>[] = [];
  let error: any = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    rows = parsed.map((input) => toRepairInsertRow(input, makeRepairRequestCode()));
    const result = await insertRepairRows(rows);
    error = result.error;
    if (!error || error.code !== "23505") break;
  }

  if (error) throw error;
  return rows.map((row) => row.request_code);
}

function toRepairInsertRow(input: z.infer<typeof repairRequestSchema>, request_code: string) {
  return {
    request_code,
    full_name: input.full_name,
    organisation: input.organisation || null,
    mobile: input.mobile,
    whatsapp: input.whatsapp || null,
    email: input.email,
    city: input.city || null,
    state: input.state || null,
    equipment_category: input.equipment_category || null,
    equipment_name: input.equipment_name,
    brand: input.brand || null,
    model_no: input.model_no || null,
    serial_no: input.serial_no || null,
    problem_description: input.problem_description,
    urgency: input.urgency,
    preferred_contact: input.preferred_contact,
    pickup_required: input.pickup_required,
    consent: true,
    status: input.status,
    current_location: input.current_location,
    admin_notes: input.admin_notes || null,
  };
}

async function insertRepairRows(rows: ReturnType<typeof toRepairInsertRow>[]) {
  const result = await (supabase as any).from("repair_requests").insert(rows);
  if (!isMissingColumnError(result.error, "current_location")) return result;

  console.error("[Repair request insert failed: current_location column missing]", {
    error: result.error,
    payload: rows,
  });

  const fallbackRows = rows.map(({ current_location: _current_location, ...row }) => row);
  return (supabase as any).from("repair_requests").insert(fallbackRows);
}

function isMissingColumnError(error: any, column: string) {
  const text = `${error?.message ?? ""} ${error?.details ?? ""} ${error?.hint ?? ""}`;
  return Boolean(error && text.toLowerCase().includes(column.toLowerCase()));
}

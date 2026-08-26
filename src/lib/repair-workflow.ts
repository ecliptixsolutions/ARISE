export const repairLocations = ["Office", "LAB 1", "LAB 2"] as const;

export function locationLabel(location?: string | null) {
  return location || "Location Not Assigned";
}

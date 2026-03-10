export function checkPlanningExemption(type: string, sizeSqm: number, gardenSqm?: number) {
  switch (type) {
    case "rear_extension":
      if (sizeSqm > 40) return { exempt: false, reason: "Exceeds 40sqm rear exemption limit" };
      if (gardenSqm && gardenSqm - sizeSqm < 25) return { exempt: false, reason: "Remaining garden would be under 25sqm" };
      return { exempt: true, reason: "Within 40sqm rear exemption", conditions: ["Single storey only", "Max 3.5m eaves height", "Garden must remain ≥25sqm"] };
    case "garage_shed":
      if (sizeSqm > 25) return { exempt: false, reason: "Exceeds 25sqm limit for garage/shed" };
      return { exempt: true, reason: "Within 25sqm exemption", conditions: ["Max 4m height (3m if within 2m of boundary)", "Within curtilage of house"] };
    case "porch":
      if (sizeSqm > 2) return { exempt: false, reason: "Exceeds 2sqm porch exemption" };
      return { exempt: true, reason: "Within 2sqm porch exemption", conditions: ["Max 2m height if within 2m of road"] };
    case "attic_conversion":
      return { exempt: true, reason: "No increase in floor area — generally exempt", conditions: ["Dormer to rear only", "No increase in overall floor area", "Velux to front only"] };
    default:
      return { exempt: false, reason: "Unknown extension type — planning permission likely required" };
  }
}

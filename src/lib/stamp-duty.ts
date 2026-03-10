export function calculateStampDuty(price: number, isNewBuild: boolean) {
  const stampable = isNewBuild ? price / 1.135 : price;
  let duty = 0;
  if (stampable <= 1_000_000) duty = stampable * 0.01;
  else if (stampable <= 1_500_000) duty = 10_000 + (stampable - 1_000_000) * 0.02;
  else duty = 10_000 + 10_000 + (stampable - 1_500_000) * 0.06;
  return { stampableAmount: Math.round(stampable), stampDuty: Math.round(duty) };
}

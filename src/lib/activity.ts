import { prisma } from "./db";

export async function logActivity(
  user: string,
  action: string,
  entity: string,
  entityId?: string,
  detail?: string
) {
  await prisma.activityLog.create({
    data: { user, action, entity, entityId, detail },
  });
}

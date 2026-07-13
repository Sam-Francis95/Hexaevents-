import certificatesData from '../data/certificates.json';
import { mockDelay } from '../../../shared/services/apiClient';
import { ok } from '../../../shared/schema/ApiResponse';

export async function getCertificates(userId) {
  await mockDelay();
  const mine = certificatesData.filter((c) => c.userId === userId);
  return ok(mine);
}

import certificatesData from '../data/certificates.json';
import { mockDelay, apiClient, USE_MOCK } from '../../../shared/services/apiClient';
import { ok, fail } from '../../../shared/schema/ApiResponse';

async function mockGetCertificates() {
  await mockDelay();
  return ok(certificatesData);
}

async function realGetCertificates() {
  try {
    const res = await apiClient.get('/certificates');
    return ok(res.data);
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('unexpected response') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      return mockGetCertificates();
    }
    return fail(err.message, err.code);
  }
}

export const getCertificates = USE_MOCK ? mockGetCertificates : realGetCertificates;

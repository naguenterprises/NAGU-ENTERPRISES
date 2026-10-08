import { ConsultancyRecord, ConsultancyStatus } from '../types/consultancy';
import { SEED_CONSULTANCY_REQUESTS } from '../data/seedConsultancy';

const CONSULTANCY_STORAGE_KEY = 'nagu_enterprises_consultancy_v1';

export function getStoredConsultancyRequests(): ConsultancyRecord[] {
  try {
    const raw = localStorage.getItem(CONSULTANCY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONSULTANCY_STORAGE_KEY, JSON.stringify(SEED_CONSULTANCY_REQUESTS));
      return SEED_CONSULTANCY_REQUESTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(CONSULTANCY_STORAGE_KEY, JSON.stringify(SEED_CONSULTANCY_REQUESTS));
      return SEED_CONSULTANCY_REQUESTS;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading stored consultancy requests:', err);
    return SEED_CONSULTANCY_REQUESTS;
  }
}

export function saveConsultancyRequests(requests: ConsultancyRecord[]): void {
  try {
    localStorage.setItem(CONSULTANCY_STORAGE_KEY, JSON.stringify(requests));
  } catch (err: any) {
    console.error('Error saving consultancy requests:', err);
    throw new Error(err?.message || 'Storage write failed: Local storage is unavailable.');
  }
}

export function getConsultancyRequestById(id: string): ConsultancyRecord | undefined {
  const list = getStoredConsultancyRequests();
  const normalized = id.trim().toUpperCase();
  return list.find(r => r.id.toUpperCase() === normalized);
}

export function generateConsultancyId(): string {
  const currentYear = new Date().getFullYear();
  const list = getStoredConsultancyRequests();

  let maxNum = 3; // Seed starts with 0001 to 0003
  const pattern = new RegExp(`^NE-CON-${currentYear}-(\\d{4})$`, 'i');

  list.forEach(item => {
    const match = item.id.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = (maxNum + 1).toString().padStart(4, '0');
  return `NE-CON-${currentYear}-${nextNum}`;
}

export interface ConsultancySubmissionPayload {
  client: ConsultancyRecord['client'];
  business: ConsultancyRecord['business'];
  requirement: ConsultancyRecord['requirement'];
  documents: ConsultancyRecord['documents'];
  preference: ConsultancyRecord['preference'];
  additionalNotes?: string;
  declaration: ConsultancyRecord['declaration'];
}

export interface ConsultancySubmissionResponse {
  success: boolean;
  record?: ConsultancyRecord;
  error?: string;
}

export async function submitConsultancyRequest(
  payload: ConsultancySubmissionPayload
): Promise<ConsultancySubmissionResponse> {
  try {
    // Basic validation
    if (!payload.client.fullName.trim()) {
      return { success: false, error: 'Client full name is required.' };
    }
    if (!payload.client.mobile.trim() || payload.client.mobile.replace(/\D/g, '').length < 10) {
      return { success: false, error: 'A valid 10-digit mobile number is required.' };
    }
    if (!payload.client.email.trim() || !/^\S+@\S+\.\S+$/.test(payload.client.email)) {
      return { success: false, error: 'A valid email address is required.' };
    }
    if (!payload.business.businessName.trim()) {
      return { success: false, error: 'Business name is required.' };
    }
    if (!payload.requirement.subServiceName) {
      return { success: false, error: 'Please select a specific consultancy service.' };
    }
    if (!payload.declaration.confirmed) {
      return { success: false, error: 'Please accept the declaration checkbox.' };
    }

    const newId = generateConsultancyId();
    const timestamp = new Date().toISOString();

    const newRecord: ConsultancyRecord = {
      id: newId,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'New',
      client: { ...payload.client },
      business: { ...payload.business },
      requirement: { ...payload.requirement },
      documents: [...payload.documents],
      preference: payload.preference,
      additionalNotes: payload.additionalNotes || '',
      declaration: { ...payload.declaration },
      paymentStatus: 'Unpaid',
      clientMessage: 'Your consultancy request has been received. Our senior business advisory desk will evaluate your requirements within 24 business hours.',
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'Consultancy Intake Desk',
          text: `Online consultancy request registered for "${payload.requirement.subServiceName}" in category "${payload.requirement.categoryName}". Preferred communication mode: ${payload.preference}.`,
          createdAt: timestamp,
          isInternal: true,
        },
      ],
      history: [
        {
          id: `hist-${Date.now()}`,
          status: 'New',
          timestamp: timestamp,
          updatedBy: 'Client Portal',
          remarks: `Consultancy request submitted online by ${payload.client.fullName}.`,
        },
      ],
    };

    const currentList = getStoredConsultancyRequests();
    const updatedList = [newRecord, ...currentList.filter(r => r.id !== newId)];
    saveConsultancyRequests(updatedList);

    return {
      success: true,
      record: newRecord,
    };
  } catch (err: any) {
    console.error('Error submitting consultancy request:', err);
    return {
      success: false,
      error: err?.message || 'Failed to submit consultancy request.',
    };
  }
}

export function updateSingleConsultancyRecord(updated: ConsultancyRecord): void {
  const current = getStoredConsultancyRequests();
  const index = current.findIndex(r => r.id === updated.id);
  if (index >= 0) {
    current[index] = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };
  } else {
    current.unshift(updated);
  }
  saveConsultancyRequests(current);
}

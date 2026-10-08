import { ApplicationRecord } from '../types';
import { SEED_APPLICATIONS } from '../data/seedApplications';

const STORAGE_KEY = 'nagu_enterprises_applications_v1';

export function getStoredApplications(): ApplicationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_APPLICATIONS));
      return SEED_APPLICATIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_APPLICATIONS));
      return SEED_APPLICATIONS;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading stored applications:', err);
    return SEED_APPLICATIONS;
  }
}

export function saveApplications(apps: ApplicationRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch (err: any) {
    console.error('Error saving applications to localStorage:', err);
    throw new Error(err?.message || 'Storage write failed: Local storage is unavailable or quota exceeded.');
  }
}

export function getApplicationById(id: string): ApplicationRecord | undefined {
  const apps = getStoredApplications();
  const normalizedSearch = id.trim().toUpperCase();
  return apps.find(app => app.id.toUpperCase() === normalizedSearch);
}

export function saveSingleApplication(app: ApplicationRecord): void {
  const apps = getStoredApplications();
  const idx = apps.findIndex(a => a.id === app.id);
  if (idx >= 0) {
    apps[idx] = app;
  } else {
    apps.unshift(app);
  }
  saveApplications(apps);
}

export function generateApplicationId(): string {
  const currentYear = new Date().getFullYear();
  const apps = getStoredApplications();
  
  // Find highest counter for current year
  let maxNum = 4; // Start above seed apps (0004)
  const pattern = new RegExp(`^NE-BR-${currentYear}-(\\d{4})$`);
  
  apps.forEach(app => {
    const match = app.id.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });

  const nextNum = (maxNum + 1).toString().padStart(4, '0');
  return `NE-BR-${currentYear}-${nextNum}`;
}

/**
 * Mask PAN according to statutory security requirement:
 * Example: ABCDE1234F -> ABCDE****F
 */
export function maskPAN(pan: string): string {
  if (!pan) return '';
  const clean = pan.trim().toUpperCase();
  if (clean.length !== 10) return clean;
  return `${clean.slice(0, 5)}****${clean.slice(9)}`;
}

/**
 * Mask Aadhaar according to UIDAI compliance:
 * Example: 123456789012 -> •••• •••• 9012
 */
export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar) return '';
  const digitsOnly = aadhaar.replace(/\D/g, '');
  if (digitsOnly.length !== 12) return aadhaar;
  return `•••• •••• ${digitsOnly.slice(8)}`;
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

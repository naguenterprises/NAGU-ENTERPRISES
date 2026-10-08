/**
 * Official Nagu Enterprises Corporate Directory & Contact Coordinates
 * 
 * Primary Company Mobile: +91 8489136084
 * Secondary Company Mobile: +91 9342323127
 * Official Email: naguenterprises84@gmail.com
 * 
 * IMPORTANT:
 * These are official company contact numbers for support and client inquiries.
 * They are NOT shared login credentials. Customer and Staff OTP must always be sent
 * to their own verified registered mobile number or email.
 */

export const COMPANY_CONTACT = {
  name: 'Nagu Enterprises',
  tagline: 'Premier Corporate Legal, Secretarial & Tax Advisory Services',
  primaryPhone: '+91 8489136084',
  primaryPhoneRaw: '8489136084',
  secondaryPhone: '+91 9342323127',
  secondaryPhoneRaw: '9342323127',
  displayPhones: '+91 8489136084 / +91 9342323127',
  adminEmail: 'naguenterprises84@gmail.com',
  registeredOffice: '0/C, Baby Cottage, Pattagasalian Villai, Nagercoil - 629002',
  city: 'Nagercoil',
  state: 'Tamil Nadu',
  pincode: '629002',
  operatingHours: 'Mon–Sat: 9:30 AM – 6:30 PM IST',
  mcaHelpdesk: 'National MCA Compliance & ROC Consultation Desk',
};

// Check if a number is an official company helpline
export function isCompanyContactNumber(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.endsWith(COMPANY_CONTACT.primaryPhoneRaw) || digits.endsWith(COMPANY_CONTACT.secondaryPhoneRaw);
}

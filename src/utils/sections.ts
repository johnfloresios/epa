import { ActivitySectionCode, CertificationSectionCode } from '@/types/content';

export const formatSectionName = (code: ActivitySectionCode): string => {
  if (code === 'CORE') {
    return 'Core';
  }

  if (code === 'TYPE_I') {
    return 'Type I';
  }

  if (code === 'TYPE_II') {
    return 'Type II';
  }

  if (code === 'TYPE_III') {
    return 'Type III';
  }

  return 'Universal';
};

export const formatSectionBadge = (code: ActivitySectionCode): string => {
  if (code === 'CORE') {
    return 'CORE';
  }

  if (code === 'TYPE_I') {
    return 'TYPE I';
  }

  if (code === 'TYPE_II') {
    return 'TYPE II';
  }

  if (code === 'TYPE_III') {
    return 'TYPE III';
  }

  return 'UNIVERSAL';
};

export const coerceActivitySectionCode = (
  code: string | null | undefined,
): ActivitySectionCode => {
  if (code === 'CORE' || code === 'TYPE_I' || code === 'TYPE_II' || code === 'TYPE_III') {
    return code as CertificationSectionCode;
  }

  return 'UNIVERSAL';
};

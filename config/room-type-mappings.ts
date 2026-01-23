/**
 * Room Type Mappings
 *
 * Maps room category names to room_type enum values for accurate
 * suite upgrade vs room upgrade tracking.
 */

import { Database } from '../lib/database.types';

type RoomType = Database['public']['Enums']['room_type'];

interface RoomMapping {
  pattern: string | RegExp;
  type: RoomType;
}

export const ROOM_TYPE_PATTERNS: RoomMapping[] = [
  { pattern: /presidential/i, type: 'specialty' },
  { pattern: /penthouse/i, type: 'specialty' },
  { pattern: /ambassador/i, type: 'specialty' },
  { pattern: /royal/i, type: 'specialty' },
  { pattern: /chairman/i, type: 'specialty' },
  { pattern: /one bedroom/i, type: 'suite' },
  { pattern: /two bedroom/i, type: 'suite' },
  { pattern: /1 bedroom/i, type: 'suite' },
  { pattern: /2 bedroom/i, type: 'suite' },
  { pattern: /executive suite/i, type: 'suite' },
  { pattern: /parlor suite/i, type: 'suite' },
  { pattern: /junior suite/i, type: 'junior_suite' },
  { pattern: /studio suite/i, type: 'junior_suite' },
  { pattern: /mini suite/i, type: 'junior_suite' },
  { pattern: /\bsuite\b/i, type: 'suite' },
  { pattern: /deluxe/i, type: 'premium' },
  { pattern: /club level/i, type: 'premium' },
  { pattern: /club floor/i, type: 'premium' },
  { pattern: /executive floor/i, type: 'premium' },
  { pattern: /concierge level/i, type: 'premium' },
  { pattern: /high floor/i, type: 'premium' },
  { pattern: /corner/i, type: 'premium' },
  { pattern: /premium/i, type: 'premium' },
  { pattern: /superior/i, type: 'premium' },
  { pattern: /standard/i, type: 'standard' },
  { pattern: /classic/i, type: 'standard' },
  { pattern: /traditional/i, type: 'standard' },
];

export const BRAND_SPECIFIC_MAPPINGS: Record<string, Record<string, RoomType>> = {
  marriott: {
    'M Club Room': 'premium',
    'Club Level Room': 'premium',
    'Grand Room': 'premium',
    'Premier Room': 'premium',
    'Junior King Suite': 'junior_suite',
    'Studio': 'junior_suite',
    'Marquis Suite': 'suite',
    'Vice Presidential': 'suite',
    'Presidential Suite': 'specialty',
    'Royal Suite': 'specialty',
  },
  hyatt: {
    'Regency Club': 'premium',
    'Club Access': 'premium',
    'Grand Club': 'premium',
    'Park King': 'premium',
    'Regency Suite': 'junior_suite',
    'Park Suite': 'junior_suite',
    'Diplomat Suite': 'suite',
    'Grand Suite': 'suite',
    'Presidential Suite': 'specialty',
    'Ambassador Suite': 'specialty',
  },
  hilton: {
    'Executive Room': 'premium',
    'Plus Room': 'premium',
    'Premium Room': 'premium',
    'Junior Suite': 'junior_suite',
    'Alcove Suite': 'junior_suite',
    'Executive Suite': 'suite',
    'Corner Suite': 'suite',
    'Presidential Suite': 'specialty',
    'Royal Suite': 'specialty',
  },
  ihg: {
    'Club Room': 'premium',
    'Club InterContinental': 'premium',
    'Executive Room': 'premium',
    'Junior Suite': 'junior_suite',
    'Studio Suite': 'junior_suite',
    'Executive Suite': 'suite',
    'Club Suite': 'suite',
    'Presidential Suite': 'specialty',
    'Royal Suite': 'specialty',
  },
};

export function classifyRoomType(categoryName: string, brandCode?: string): RoomType {
  if (brandCode && BRAND_SPECIFIC_MAPPINGS[brandCode]) {
    const brandMapping = BRAND_SPECIFIC_MAPPINGS[brandCode][categoryName];
    if (brandMapping) return brandMapping;
  }

  for (const mapping of ROOM_TYPE_PATTERNS) {
    const pattern = typeof mapping.pattern === 'string'
      ? new RegExp(mapping.pattern, 'i')
      : mapping.pattern;
    if (pattern.test(categoryName)) return mapping.type;
  }

  return 'standard';
}

export function isSuiteType(roomType: RoomType): boolean {
  return ['junior_suite', 'suite', 'specialty'].includes(roomType);
}

export function isSuiteUpgrade(bookedType: RoomType, receivedType: RoomType): boolean {
  return !isSuiteType(bookedType) && isSuiteType(receivedType);
}

export function isAnyUpgrade(bookedType: RoomType, receivedType: RoomType): boolean {
  const tierOrder: RoomType[] = ['standard', 'premium', 'junior_suite', 'suite', 'specialty'];
  return tierOrder.indexOf(receivedType) > tierOrder.indexOf(bookedType);
}

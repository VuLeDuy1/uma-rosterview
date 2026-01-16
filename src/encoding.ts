/**
 * URL Encoding/Decoding for Uma Musume Roster Viewer
 * 
 * Inspired by Wynnbuilder's encoding system.
 * Uses a compact binary format converted to Base64 for URL sharing.
 * 
 * ENCODING SPEC V1:
 * 
 * Header (8 bits):
 *   - Version: 8 bits (0-255)
 * 
 * Per Character:
 *   - card_id: 20 bits (supports up to 1M)
 *   - talent_level: 3 bits (1-5)
 *   - Stats (5 x 11 bits = 55 bits): speed, stamina, power, guts, wiz (0-2047)
 *   - Aptitudes (10 x 3 bits = 30 bits): each 1-8 mapped to 0-7
 *   - Factor count: 4 bits (0-15)
 *   - Factors: count x 24 bits (factor_id, supports up to 16M)
 *   - Skill count: 6 bits (0-63)
 *   - Skills: count x 17 bits (16 for skill_id + 1 for level>1 flag)
 *   - Parent count: 2 bits (0-3)
 *   - Per Parent:
 *     - card_id: 20 bits
 *     - Factor count: 4 bits
 *     - Factors: count x 24 bits
 */

const ENCODING_VERSION = 2;

// Custom Base64 alphabet (URL-safe)
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/**
 * BitVector class for efficient binary encoding/decoding
 */
class BitVector {
  private bits: number[] = [];
  private readPos = 0;

  /** Write a value with specified bit length */
  write(value: number, bitLength: number): void {
    for (let i = bitLength - 1; i >= 0; i--) {
      this.bits.push((value >> i) & 1);
    }
  }

  /** Read a value with specified bit length */
  read(bitLength: number): number {
    let value = 0;
    for (let i = 0; i < bitLength; i++) {
      value = (value << 1) | (this.bits[this.readPos++] ?? 0);
    }
    return value;
  }

  /** Read a signed value (2's complement) */
  readSigned(bitLength: number): number {
    const value = this.read(bitLength);
    const signBit = 1 << (bitLength - 1);
    if (value & signBit) {
      return value - (1 << bitLength);
    }
    return value;
  }

  /** Get remaining bits to read */
  remaining(): number {
    return this.bits.length - this.readPos;
  }

  /** Pad to multiple of 6 for Base64 */
  padToBase64(): void {
    while (this.bits.length % 6 !== 0) {
      this.bits.push(0);
    }
  }

  /** Convert to Base64 string */
  toBase64(): string {
    this.padToBase64();
    let result = '';
    for (let i = 0; i < this.bits.length; i += 6) {
      let value = 0;
      for (let j = 0; j < 6; j++) {
        value = (value << 1) | (this.bits[i + j] ?? 0);
      }
      result += BASE64_CHARS[value];
    }
    return result;
  }

  /** Load from Base64 string */
  static fromBase64(str: string): BitVector {
    const bv = new BitVector();
    for (const char of str) {
      const value = BASE64_CHARS.indexOf(char);
      if (value === -1) continue; // Skip invalid chars
      for (let i = 5; i >= 0; i--) {
        bv.bits.push((value >> i) & 1);
      }
    }
    return bv;
  }

  /** Get current length */
  get length(): number {
    return this.bits.length;
  }
}

// Type imports
import type { CharaData, SkillData, SuccessionCharaData } from './types';

/**
 * Encode a single character to BitVector
 */
function encodeChara(bv: BitVector, chara: CharaData): void {
  // card_id: 20 bits
  bv.write(chara.card_id, 20);

  // talent_level: 3 bits (1-5 stored as 0-4)
  bv.write(chara.talent_level - 1, 3);

  // Stats: 5 x 11 bits (0-2047)
  bv.write(Math.min(chara.speed, 2047), 11);
  bv.write(Math.min(chara.stamina, 2047), 11);
  bv.write(Math.min(chara.power, 2047), 11);
  bv.write(Math.min(chara.guts, 2047), 11);
  bv.write(Math.min(chara.wiz, 2047), 11);

  // Aptitudes: 10 x 3 bits (1-8 stored as 0-7)
  bv.write(chara.proper_distance_short - 1, 3);
  bv.write(chara.proper_distance_mile - 1, 3);
  bv.write(chara.proper_distance_middle - 1, 3);
  bv.write(chara.proper_distance_long - 1, 3);
  bv.write(chara.proper_ground_turf - 1, 3);
  bv.write(chara.proper_ground_dirt - 1, 3);
  bv.write(chara.proper_running_style_nige - 1, 3);
  bv.write(chara.proper_running_style_senko - 1, 3);
  bv.write(chara.proper_running_style_sashi - 1, 3);
  bv.write(chara.proper_running_style_oikomi - 1, 3);

  // Factors: 4-bit count + 24-bit IDs (supports IDs up to 16M)
  const factors = chara.factor_id_array.slice(0, 15); // Max 15
  bv.write(factors.length, 4);
  for (const factorId of factors) {
    bv.write(factorId, 24);
  }

  // Skills: 6-bit count + 17-bit entries (16 id + 1 level flag)
  const skills = chara.skill_array.slice(0, 63); // Max 63
  bv.write(skills.length, 6);
  for (const skill of skills) {
    bv.write(skill.skill_id, 16);
    bv.write(skill.level > 1 ? 1 : 0, 1); // Simplified: just store if level > 1
  }

  // Parents: 2-bit count
  const parents = chara.succession_chara_array.slice(0, 3);
  bv.write(parents.length, 2);
  for (const parent of parents) {
    bv.write(parent.card_id, 20);
    bv.write(parent.talent_level - 1, 3);
    const parentFactors = parent.factor_id_array.slice(0, 15);
    bv.write(parentFactors.length, 4);
    for (const factorId of parentFactors) {
      bv.write(factorId, 24);
    }
  }
}

/**
 * Decode a single character from BitVector
 */
function decodeChara(bv: BitVector): CharaData | null {
  if (bv.remaining() < 108) return null; // Minimum bits needed

  const card_id = bv.read(20);
  const talent_level = bv.read(3) + 1;

  const speed = bv.read(11);
  const stamina = bv.read(11);
  const power = bv.read(11);
  const guts = bv.read(11);
  const wiz = bv.read(11);

  const proper_distance_short = bv.read(3) + 1;
  const proper_distance_mile = bv.read(3) + 1;
  const proper_distance_middle = bv.read(3) + 1;
  const proper_distance_long = bv.read(3) + 1;
  const proper_ground_turf = bv.read(3) + 1;
  const proper_ground_dirt = bv.read(3) + 1;
  const proper_running_style_nige = bv.read(3) + 1;
  const proper_running_style_senko = bv.read(3) + 1;
  const proper_running_style_sashi = bv.read(3) + 1;
  const proper_running_style_oikomi = bv.read(3) + 1;

  const factorCount = bv.read(4);
  const factor_id_array: number[] = [];
  for (let i = 0; i < factorCount; i++) {
    factor_id_array.push(bv.read(24));
  }

  const skillCount = bv.read(6);
  const skill_array: SkillData[] = [];
  for (let i = 0; i < skillCount; i++) {
    const skill_id = bv.read(16);
    const levelFlag = bv.read(1);
    skill_array.push({ skill_id, level: levelFlag ? 2 : 1 });
  }

  const parentCount = bv.read(2);
  const succession_chara_array: SuccessionCharaData[] = [];
  for (let i = 0; i < parentCount; i++) {
    const parent_card_id = bv.read(20);
    const parent_talent_level = bv.read(3) + 1;
    const parentFactorCount = bv.read(4);
    const parent_factor_id_array: number[] = [];
    for (let j = 0; j < parentFactorCount; j++) {
      parent_factor_id_array.push(bv.read(24));
    }
    succession_chara_array.push({
      card_id: parent_card_id,
      talent_level: parent_talent_level,
      factor_id_array: parent_factor_id_array,
      position_id: i + 1,
    });
  }

  return {
    card_id,
    talent_level,
    create_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
    rarity: 3, // Default
    chara_seed: Math.floor(Math.random() * 1000000),
    speed,
    stamina,
    power,
    guts,
    wiz,
    proper_distance_short,
    proper_distance_mile,
    proper_distance_middle,
    proper_distance_long,
    proper_ground_turf,
    proper_ground_dirt,
    proper_running_style_nige,
    proper_running_style_senko,
    proper_running_style_sashi,
    proper_running_style_oikomi,
    factor_id_array,
    skill_array,
    succession_chara_array,
    support_card_list: [],
  };
}

/**
 * Encode multiple characters to a URL-safe string
 */
export function encodeCharas(charas: CharaData[]): string {
  const bv = new BitVector();

  // Version header
  bv.write(ENCODING_VERSION, 8);

  // Character count (8 bits, max 255)
  bv.write(Math.min(charas.length, 255), 8);

  // Encode each character
  for (const chara of charas.slice(0, 255)) {
    encodeChara(bv, chara);
  }

  return bv.toBase64();
}

/**
 * Decode characters from a URL-safe string
 */
export function decodeCharas(encoded: string): CharaData[] {
  try {
    console.log("decodeCharas input length:", encoded.length);
    const bv = BitVector.fromBase64(encoded);
    console.log("BitVector total bits:", bv.remaining());

    const version = bv.read(8);
    console.log("Decoded version:", version);
    if (version !== ENCODING_VERSION) {
      console.warn(`Encoding version mismatch: expected ${ENCODING_VERSION}, got ${version}`);
      // Could add version migration logic here
    }

    const count = bv.read(8);
    console.log("Decoded character count:", count);
    const charas: CharaData[] = [];

    for (let i = 0; i < count; i++) {
      console.log(`Decoding character ${i + 1}/${count}, remaining bits:`, bv.remaining());
      const chara = decodeChara(bv);
      if (chara) {
        console.log(`Character ${i + 1} decoded:`, chara.card_id);
        charas.push(chara);
      } else {
        console.log(`Character ${i + 1} failed to decode`);
      }
    }

    console.log("Total decoded characters:", charas.length);
    return charas;
  } catch (error) {
    console.error('Failed to decode characters:', error);
    return [];
  }
}

/**
 * Get/set the encoded data in URL hash
 */
export function getEncodedFromUrl(): string | null {
  const hash = window.location.hash.slice(1); // Remove #
  return hash || null;
}

export function setEncodedToUrl(encoded: string): void {
  window.history.replaceState(null, '', `#${encoded}`);
}

export function clearUrlEncoding(): void {
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
}

/**
 * Copy encoded string to clipboard
 */
export async function copyEncodedToClipboard(charas: CharaData[]): Promise<boolean> {
  try {
    const encoded = encodeCharas(charas);
    const url = `${window.location.origin}${window.location.pathname}#${encoded}`;
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculate approximate URL length for given characters
 */
export function estimateEncodedLength(charas: CharaData[]): number {
  // Rough estimate: header + per-chara overhead
  // Each character is roughly 150-400 bits depending on factors/skills
  const avgBitsPerChara = 300;
  const headerBits = 16;
  const totalBits = headerBits + charas.length * avgBitsPerChara;
  return Math.ceil(totalBits / 6); // Base64 chars
}

/**
 * Scoring Normalization Utilities
 * 
 * Provides utilities to normalize and clamp scores to PTE Academic's 0-90 scale.
 * These functions are used across deterministic and AI-based scoring modules.
 */

import { TestSection } from './types'

/**
 * Clamp a numeric value to the PTE scale of 0-90
 */
export function clampTo90(value: number): number {
  return Math.max(0, Math.min(90, Math.round(value)))
}

/**
 * Convert accuracy (0-1 range) to PTE scale (0-90)
 */
export function accuracyTo90(accuracy: number): number {
  return clampTo90(accuracy * 90)
}

/**
 * Convert Word Error Rate (WER) to PTE scale (0-90)
 * Lower WER is better, so we invert: score = (1 - WER) * 90
 * WER typically ranges from 0 (perfect) to 1+ (very poor)
 */
export function werTo90(wer: number): number {
  const normalized = Math.max(0, 1 - wer)
  return clampTo90(normalized * 90)
}

/**
 * Result structure for scoring operations
 */
export interface ScoringResult {
  overall: number // 0-90 scale
  subscores: {
    accuracy?: number // 0-90 scale
    wer?: number // 0-90 scale
    correctness?: number // 0-90 scale
    [key: string]: number | undefined
  }
  rationale: string
  meta?: Record<string, unknown>
}

/**
 * Build a deterministic scoring result from accuracy and/or WER
 */
export function buildDeterministicResult(params: {
  section: TestSection
  accuracy?: number // 0-1 range
  wer?: number // typically 0-1 range, can be higher
  rationale: string
  meta?: Record<string, unknown>
}): ScoringResult {
  const subscores: ScoringResult['subscores'] = {}
  let overall = 0

  // Process accuracy if provided
  if (params.accuracy !== undefined) {
    const accuracyScore = accuracyTo90(params.accuracy)
    subscores.accuracy = accuracyScore
    subscores.correctness = accuracyScore
    overall = accuracyScore
  }

  // Process WER if provided
  if (params.wer !== undefined) {
    const werScore = werTo90(params.wer)
    subscores.wer = werScore
    
    // If both accuracy and WER are provided, average them for overall
    if (params.accuracy !== undefined) {
      overall = Math.round((subscores.accuracy! + werScore) / 2)
    } else {
      overall = werScore
    }
  }

  return {
    overall: clampTo90(overall),
    subscores,
    rationale: params.rationale,
    meta: {
      section: params.section,
      provider: 'deterministic',
      ...params.meta,
    },
  }
}
// src/utils/calculateMarks.js

// This utility handles all mark calculation logic
// It checks degree type and applies the correct formula

export function calculateFinalMark(degree, internalMark, externalMark = null) {

  // Masters student — single examiner mark is the final mark
  if (degree === 'Masters') {
    return {
      finalMark: internalMark,
      status: 'Calculated',
      discrepancy: false,
      message: `Final mark: ${internalMark}/100`
    }
  }

  // PhD student — requires both marks
  if (degree === 'PhD') {

    // Check both marks exist
    if (externalMark === null) {
      return {
        finalMark: null,
        status: 'Pending',
        discrepancy: false,
        message: 'Waiting for external examiner mark'
      }
    }

    // Calculate difference between two marks
    const difference = Math.abs(internalMark - externalMark)

    // If difference is more than 10 — discrepancy!
    if (difference > 10) {
      return {
        finalMark: null,
        status: 'Discrepancy',
        discrepancy: true,
        difference: difference,
        message: `⚠️ Mark discrepancy of ${difference} points — requires review. Internal: ${internalMark}, External: ${externalMark}`
      }
    }

    // Marks are close enough — calculate average
    const average = Math.round((internalMark + externalMark) / 2)
    return {
      finalMark: average,
      status: 'Calculated',
      discrepancy: false,
      difference: difference,
      message: `Final mark: ${average}/100 (average of ${internalMark} and ${externalMark})`
    }
  }

}
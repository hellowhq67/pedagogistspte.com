/**
 * Database Cleanup Script - Remove Invalid Questions
 *
 * This script identifies and removes:
 * 1. Inactive questions with no attempts
 * 2. Duplicate questions (same promptText)
 * 3. Test/placeholder questions
 * 4. Questions missing critical data
 *
 * Usage: pnpm tsx scripts/cleanup-invalid-questions.ts
 */

import { db } from '../lib/db'
import { speakingQuestions, speakingAttempts } from '../lib/db/schema'
import { eq, sql, isNull, and, or, like } from 'drizzle-orm'

interface CleanupReport {
  category: string
  count: number
  questionIds: string[]
  reasons: string[]
}

async function main() {
  console.log('🧹 Starting Database Cleanup...\n')

  const report: CleanupReport[] = []
  let totalDeleted = 0

  try {
    // ============================================
    // 1. Find inactive questions with no attempts
    // ============================================
    console.log('📋 Checking for inactive questions with no attempts...')

    const inactiveWithNoAttempts = await db
      .select({
        id: speakingQuestions.id,
        title: speakingQuestions.title,
        type: speakingQuestions.type,
      })
      .from(speakingQuestions)
      .leftJoin(speakingAttempts, eq(speakingQuestions.id, speakingAttempts.questionId))
      .where(
        and(
          eq(speakingQuestions.isActive, false),
          isNull(speakingAttempts.id)
        )
      )

    if (inactiveWithNoAttempts.length > 0) {
      console.log(`  ❌ Found ${inactiveWithNoAttempts.length} inactive questions with no attempts`)

      report.push({
        category: 'Inactive with no attempts',
        count: inactiveWithNoAttempts.length,
        questionIds: inactiveWithNoAttempts.map(q => q.id),
        reasons: inactiveWithNoAttempts.map(q => `${q.title} (${q.type})`)
      })
    } else {
      console.log('  ✅ No inactive questions found')
    }

    // ============================================
    // 2. Find duplicate questions
    // ============================================
    console.log('\n📋 Checking for duplicate questions...')

    const duplicates = await db.execute<{ prompt_text: string; ids: string[]; count: number }>(sql`
      SELECT
        prompt_text,
        array_agg(id::text) as ids,
        COUNT(*) as count
      FROM speaking_questions
      WHERE prompt_text IS NOT NULL
      GROUP BY prompt_text
      HAVING COUNT(*) > 1
    `)

    if (duplicates.rows.length > 0) {
      console.log(`  ❌ Found ${duplicates.rows.length} sets of duplicate questions`)

      // Keep first, delete rest
      const duplicateIds: string[] = []
      duplicates.rows.forEach(row => {
        const ids = row.ids
        // Keep first, mark rest for deletion
        duplicateIds.push(...ids.slice(1))
      })

      report.push({
        category: 'Duplicate questions',
        count: duplicateIds.length,
        questionIds: duplicateIds,
        reasons: duplicates.rows.map(d => `"${d.prompt_text?.substring(0, 50)}..." (${d.count} copies)`)
      })
    } else {
      console.log('  ✅ No duplicate questions found')
    }

    // ============================================
    // 3. Find test/placeholder questions
    // ============================================
    console.log('\n📋 Checking for test/placeholder questions...')

    const testQuestions = await db
      .select({
        id: speakingQuestions.id,
        title: speakingQuestions.title,
      })
      .from(speakingQuestions)
      .where(
        or(
          like(speakingQuestions.title, '%test%'),
          like(speakingQuestions.title, '%placeholder%'),
          like(speakingQuestions.title, '%sample%'),
          like(speakingQuestions.title, '%demo%'),
          like(speakingQuestions.title, '%example%')
        )
      )

    if (testQuestions.length > 0) {
      console.log(`  ❌ Found ${testQuestions.length} test/placeholder questions`)

      report.push({
        category: 'Test/Placeholder questions',
        count: testQuestions.length,
        questionIds: testQuestions.map(q => q.id),
        reasons: testQuestions.map(q => q.title)
      })
    } else {
      console.log('  ✅ No test/placeholder questions found')
    }

    // ============================================
    // 4. Find questions missing critical data
    // ============================================
    console.log('\n📋 Checking for questions missing critical data...')

    const missingData = await db
      .select({
        id: speakingQuestions.id,
        title: speakingQuestions.title,
      })
      .from(speakingQuestions)
      .where(
        or(
          isNull(speakingQuestions.title),
          eq(speakingQuestions.title, ''),
          and(
            isNull(speakingQuestions.promptText),
            isNull(speakingQuestions.promptMediaUrl)
          )
        )
      )

    if (missingData.length > 0) {
      console.log(`  ❌ Found ${missingData.length} questions missing critical data`)

      report.push({
        category: 'Missing critical data',
        count: missingData.length,
        questionIds: missingData.map(q => q.id),
        reasons: missingData.map(q => `No title or prompt data`)
      })
    } else {
      console.log('  ✅ All questions have required data')
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60))
    console.log('📊 CLEANUP SUMMARY')
    console.log('='.repeat(60))

    if (report.length === 0) {
      console.log('✅ No invalid questions found. Database is clean!')
      return
    }

    report.forEach(item => {
      console.log(`\n${item.category}:`)
      console.log(`  Count: ${item.count}`)
      console.log(`  IDs: ${item.questionIds.slice(0, 3).join(', ')}${item.questionIds.length > 3 ? '...' : ''}`)
    })

    totalDeleted = report.reduce((sum, item) => sum + item.count, 0)
    console.log(`\n📝 Total questions to delete: ${totalDeleted}`)

    // ============================================
    // DELETION (with confirmation)
    // ============================================
    console.log('\n⚠️  WARNING: This will permanently delete invalid questions!')
    console.log('💾 Recommendation: Create a backup before proceeding.')
    console.log('\nTo proceed with deletion, run:')
    console.log('  pnpm tsx scripts/cleanup-invalid-questions.ts --confirm')

    // Check if --confirm flag is present
    const confirmFlag = process.argv.includes('--confirm')

    if (confirmFlag) {
      console.log('\n🗑️  Deleting invalid questions...')

      const allIdsToDelete = report.flatMap(item => item.questionIds)

      for (const id of allIdsToDelete) {
        await db
          .delete(speakingQuestions)
          .where(eq(speakingQuestions.id, id))
      }

      console.log(`✅ Successfully deleted ${totalDeleted} invalid questions`)

      // Save report
      const reportPath = `./cleanup-report-${new Date().toISOString().split('T')[0]}.json`
      const fs = await import('fs/promises')
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
      console.log(`📄 Cleanup report saved to: ${reportPath}`)
    } else {
      console.log('\n❌ Deletion skipped. Re-run with --confirm to delete.')
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  }
}

main()
  .then(() => {
    console.log('\n✅ Cleanup script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })

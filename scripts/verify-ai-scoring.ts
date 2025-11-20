
import { scoreWithOrchestrator } from '../lib/ai/orchestrator';
import { TestSection } from '../lib/pte/types';

async function main() {
    console.log('Starting AI Scoring Verification...');

    // 1. Test Reading (Deterministic)
    console.log('\n--- Testing Reading (Deterministic) ---');
    try {
        const readingResult = await scoreWithOrchestrator({
            section: TestSection.READING,
            questionType: 'multiple_choice_single',
            payload: {
                selectedOption: 'A',
                correctOption: 'A',
            },
            includeRationale: true,
        });
        console.log('Reading Result:', JSON.stringify(readingResult, null, 2));
    } catch (error) {
        console.error('Reading Scoring Failed:', error);
    }

    // 2. Test Speaking (AI - Mock/OpenAI)
    console.log('\n--- Testing Speaking (AI) ---');
    try {
        const speakingResult = await scoreWithOrchestrator({
            section: TestSection.SPEAKING,
            questionType: 'read_aloud',
            payload: {
                transcript: 'The quick brown fox jumps over the lazy dog.',
                referenceText: 'The quick brown fox jumps over the lazy dog.',
            },
            includeRationale: true,
            timeoutMs: 10000,
        });
        console.log('Speaking Result:', JSON.stringify(speakingResult, null, 2));
    } catch (error) {
        console.error('Speaking Scoring Failed:', error);
    }

    // 3. Test Writing (AI - Mock/OpenAI)
    console.log('\n--- Testing Writing (AI) ---');
    try {
        const writingResult = await scoreWithOrchestrator({
            section: TestSection.WRITING,
            questionType: 'write_essay',
            payload: {
                text: 'This is a test essay. It is short but demonstrates the point.',
                prompt: 'Write about testing.',
            },
            includeRationale: true,
            timeoutMs: 10000,
        });
        console.log('Writing Result:', JSON.stringify(writingResult, null, 2));
    } catch (error) {
        console.error('Writing Scoring Failed:', error);
    }
}

main().catch(console.error);

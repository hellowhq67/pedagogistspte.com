import { Headphones, BookOpen, Mic, PenTool } from 'lucide-react';

const sections = [
  {
    id: 'speaking',
    name: 'Speaking',
    icon: Mic,
    description: 'Practice speaking tasks with AI scoring',
    questionTypes: ['Read Aloud', 'Repeat Sentence', 'Describe Image', 'Re-tell Lecture', 'Answer Short Question'],
    color: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'writing',
    name: 'Writing',
    icon: PenTool,
    description: 'Improve your writing skills',
    questionTypes: ['Summarize Written Text', 'Write Essay'],
    color: 'from-green-600 to-emerald-600',
  },
  {
    id: 'reading',
    name: 'Reading',
    icon: BookOpen,
    description: 'Practice reading comprehension',
    questionTypes: ['Multiple Choice', 'Re-order Paragraphs', 'Fill in the Blanks', 'Multiple Choice (Multiple Answers)'],
    color: 'from-purple-600 to-pink-600',
  },
  {
    id: 'listening',
    name: 'Listening',
    icon: Headphones,
    description: 'Enhance your listening abilities',
    questionTypes: ['Summarize Spoken Text', 'Multiple Choice', 'Fill in the Blanks', 'Highlight Correct Summary', 'Select Missing Word', 'Highlight Incorrect Words', 'Write From Dictation'],
    color: 'from-orange-600 to-red-600',
  },
];

export default function SectionTestsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Section Practice</h1>
        <p className="mt-2 text-muted-foreground">
          Practice questions for PTE exam by section
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div className={`mb-4 inline-flex rounded-lg bg-gradient-to-r ${section.color} p-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-2xl font-semibold">{section.name}</h3>
              <p className="mb-4 text-sm text-muted-foreground">{section.description}</p>
              
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Question Types:</p>
                <div className="flex flex-wrap gap-2">
                  {section.questionTypes.map((type) => (
                    <span
                      key={type}
                      className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
                Start {section.name} Practice
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

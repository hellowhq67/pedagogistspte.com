import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { initialCategories } from '@/lib/pte/data'

export default function Page() {
  const parentCategories = initialCategories.filter((c) => c.parent === null)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Start Your PTE Academic Practice Test Online
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Prepare with targeted online PTE practice tests across all sections.
        </p>
      </div>

      {parentCategories.map((parent) => {
        const childCategories = initialCategories.filter(
          (c) => c.parent === parent.id
        )
        return (
          <section key={parent.id} className="mb-8">
            <div className="mb-4 flex items-center gap-4">
              <Image
                src={parent.icon}
                alt={parent.title}
                width={40}
                height={40}
              />
              <h2 className="text-xl font-semibold">{parent.title}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {childCategories.map((child) => (
                <Card key={child.id}>
                  <CardContent className="flex h-full flex-col p-4">
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        src={child.icon}
                        alt={child.title}
                        width={32}
                        height={32}
                      />
                      <div>
                        <p className="font-medium">{child.title}</p>
                        <p className="text-xs text-gray-500">
                          {child.question_count} questions available
                        </p>
                      </div>
                    </div>
                    <p className="flex-grow text-sm text-gray-600">
                      {child.description}
                    </p>
                    <div className="mt-4 flex justify-end">
                      <Button asChild variant="outline">
                        <Link
                          href={`/pte/practice/section-tests/${child.code}`}
                        >
                          Practice
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )
      })}
    </main>
  )
}

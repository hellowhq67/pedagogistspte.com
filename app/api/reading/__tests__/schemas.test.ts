import {
  ReadingQuestionTypeSchema,
  DifficultyFilterSchema,
  ReadingListQuerySchema,
  ReadingIdParamsSchema,
  MultipleChoiceSingleResponseSchema,
  MultipleChoiceMultipleResponseSchema,
  ReorderParagraphsResponseSchema,
} from '../schemas'

describe('app/api/reading/schemas', () => {
  describe('ReadingQuestionTypeSchema', () => {
    it('should accept valid reading types', () => {
      const validTypes = [
        'multiple_choice_single',
        'multiple_choice_multiple',
        'reorder_paragraphs',
        'fill_in_blanks',
        'reading_writing_fill_blanks',
      ]

      validTypes.forEach(type => {
        expect(() => ReadingQuestionTypeSchema.parse(type)).not.toThrow()
      })
    })

    it('should reject invalid reading types', () => {
      const invalidTypes = ['invalid', 'speaking', null, undefined]

      invalidTypes.forEach(type => {
        expect(() => ReadingQuestionTypeSchema.parse(type)).toThrow()
      })
    })
  })

  describe('ReadingListQuerySchema', () => {
    it('should parse valid query', () => {
      const validQuery = {
        type: 'multiple_choice_single',
        page: 1,
        pageSize: 20,
        search: 'test',
        difficulty: 'Medium',
        isActive: true,
        sortBy: 'difficulty',
        sortOrder: 'asc',
      }

      const result = ReadingListQuerySchema.parse(validQuery)
      expect(result).toEqual(validQuery)
    })

    it('should apply defaults', () => {
      const minimalQuery = {
        type: 'fill_in_blanks',
      }

      const result = ReadingListQuerySchema.parse(minimalQuery)
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(20)
      expect(result.difficulty).toBe('All')
    })
  })

  describe('MultipleChoiceSingleResponseSchema', () => {
    it('should accept valid response', () => {
      const validResponse = {
        selectedOption: 'A',
      }

      const result = MultipleChoiceSingleResponseSchema.parse(validResponse)
      expect(result.selectedOption).toBe('A')
    })

    it('should reject empty selectedOption', () => {
      const invalidResponse = {
        selectedOption: '',
      }

      expect(() => MultipleChoiceSingleResponseSchema.parse(invalidResponse)).toThrow()
    })

    it('should require selectedOption', () => {
      expect(() => MultipleChoiceSingleResponseSchema.parse({})).toThrow()
    })
  })

  describe('MultipleChoiceMultipleResponseSchema', () => {
    it('should accept valid response with multiple options', () => {
      const validResponse = {
        selectedOptions: ['A', 'B', 'C'],
      }

      const result = MultipleChoiceMultipleResponseSchema.parse(validResponse)
      expect(result.selectedOptions).toEqual(['A', 'B', 'C'])
    })

    it('should accept single option', () => {
      const validResponse = {
        selectedOptions: ['A'],
      }

      expect(() => MultipleChoiceMultipleResponseSchema.parse(validResponse)).not.toThrow()
    })

    it('should reject empty array', () => {
      const invalidResponse = {
        selectedOptions: [],
      }

      expect(() => MultipleChoiceMultipleResponseSchema.parse(invalidResponse)).toThrow()
    })

    it('should require selectedOptions field', () => {
      expect(() => MultipleChoiceMultipleResponseSchema.parse({})).toThrow()
    })

    it('should handle large arrays', () => {
      const validResponse = {
        selectedOptions: ['A', 'B', 'C', 'D', 'E', 'F'],
      }

      expect(() => MultipleChoiceMultipleResponseSchema.parse(validResponse)).not.toThrow()
    })
  })

  describe('ReorderParagraphsResponseSchema', () => {
    it('should accept valid paragraph order', () => {
      const validResponse = {
        order: [1, 3, 2, 4, 5],
      }

      const result = ReorderParagraphsResponseSchema.parse(validResponse)
      expect(result.order).toEqual([1, 3, 2, 4, 5])
    })

    it('should accept single paragraph', () => {
      const validResponse = {
        order: [1],
      }

      expect(() => ReorderParagraphsResponseSchema.parse(validResponse)).not.toThrow()
    })

    it('should enforce positive integers', () => {
      const invalidResponse = {
        order: [1, 0, 2],
      }

      expect(() => ReorderParagraphsResponseSchema.parse(invalidResponse)).toThrow()
    })

    it('should reject negative numbers', () => {
      const invalidResponse = {
        order: [1, -1, 2],
      }

      expect(() => ReorderParagraphsResponseSchema.parse(invalidResponse)).toThrow()
    })

    it('should reject decimals', () => {
      const invalidResponse = {
        order: [1, 2.5, 3],
      }

      expect(() => ReorderParagraphsResponseSchema.parse(invalidResponse)).toThrow()
    })

    it('should handle typical 5-paragraph question', () => {
      const validResponse = {
        order: [3, 1, 5, 2, 4],
      }

      const result = ReorderParagraphsResponseSchema.parse(validResponse)
      expect(result.order).toHaveLength(5)
    })
  })
})
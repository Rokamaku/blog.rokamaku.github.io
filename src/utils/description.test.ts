import { describe, expect, it } from 'vitest'
import { generateDescription, generateExcerpt } from './description'

// Type definition for test posts (avoiding astro:content import)
interface TestPost {
  id: string
  slug: string
  collection: 'posts'
  data: {
    title: string
    published: Date
    description: string
    updated?: Date
    tags: string[]
    draft: boolean
    pin: number
    toc: boolean
    lang: string
    abbrlink: string
  }
  body: string
}

// Helper function to create test posts with default values
function createTestPost(overrides: {
  body?: string
  title?: string
  description?: string
  lang?: string
  tags?: string[]
}): TestPost {
  return {
    id: 'test-post.md',
    slug: 'test-post',
    collection: 'posts',
    data: {
      title: overrides.title || 'Test Post',
      published: new Date('2024-01-01'),
      description: overrides.description || '',
      tags: overrides.tags || [],
      draft: false,
      pin: 0,
      toc: true,
      lang: overrides.lang || 'en',
      abbrlink: '',
    },
    body: overrides.body || '',
  }
}

describe('generateExcerpt', () => {
  describe('length handling', () => {
    it('should use CJK length for Chinese language', () => {
      const longText = '这是一个很长的中文文本'.repeat(20) // Create long Chinese text
      const excerpt = generateExcerpt(longText, 'list', 'zh')
      // CJK length for "list" scene is 120
      expect(excerpt.length).toBeLessThanOrEqual(124) // 120 + "..." (3 chars) + possible punctuation
    })

    it('should use non-CJK length for English language', () => {
      const longText = 'This is a very long English text that should be truncated properly. '.repeat(10)
      const excerpt = generateExcerpt(longText, 'list', 'en')
      // Non-CJK length for "list" scene is 240
      expect(excerpt.length).toBeLessThanOrEqual(244) // 240 + "..." (3 chars) + possible punctuation
    })

    it('should use different lengths for different scenes', () => {
      const longText = 'This is a very long text. '.repeat(20)

      const listExcerpt = generateExcerpt(longText, 'list', 'en')
      const ogExcerpt = generateExcerpt(longText, 'og', 'en')

      // list = 240, og = 140 for non-CJK
      expect(listExcerpt.length).toBeGreaterThan(ogExcerpt.length)
    })

    it('should handle CJK languages correctly (zh, zh-tw, ja)', () => {
      const text = 'これは日本語のテキストです。'.repeat(20)

      const zhExcerpt = generateExcerpt(text, 'list', 'zh')
      const zhtwExcerpt = generateExcerpt(text, 'list', 'zh-tw')
      const jaExcerpt = generateExcerpt(text, 'list', 'ja')

      // All should use CJK length (120 for list)
      expect(zhExcerpt.length).toBeLessThanOrEqual(124)
      expect(zhtwExcerpt.length).toBeLessThanOrEqual(124)
      expect(jaExcerpt.length).toBeLessThanOrEqual(124)
    })
  })

  describe('markdown processing', () => {
    it('should remove headings from content', () => {
      const markdown = '# Heading 1\n\nSome content here.\n\n## Heading 2\n\nMore content.'
      const excerpt = generateExcerpt(markdown, 'list', 'en')

      expect(excerpt).not.toContain('Heading 1')
      expect(excerpt).not.toContain('Heading 2')
      expect(excerpt).toContain('Some content here')
      expect(excerpt).toContain('More content')
    })

    it('should strip HTML tags', () => {
      const markdown = 'This is **bold** and this is *italic*.'
      const excerpt = generateExcerpt(markdown, 'list', 'en')

      expect(excerpt).not.toContain('<strong>')
      expect(excerpt).not.toContain('<em>')
      expect(excerpt).toContain('bold')
      expect(excerpt).toContain('italic')
    })

    it('should handle code blocks', () => {
      const markdown = 'Here is some code:\n\n```js\nconst x = 1;\n```\n\nMore text.'
      const excerpt = generateExcerpt(markdown, 'list', 'en')

      expect(excerpt).toContain('Here is some code')
      expect(excerpt).toContain('const x = 1')
    })

    it('should handle links', () => {
      const markdown = 'Check out [this link](https://example.com) for more info.'
      const excerpt = generateExcerpt(markdown, 'list', 'en')

      expect(excerpt).toContain('this link')
      expect(excerpt).toContain('for more info')
    })
  })

  describe('hTML entity decoding', () => {
    it('should decode &nbsp; to space', () => {
      const markdown = 'Word1&nbsp;Word2'
      const excerpt = generateExcerpt(markdown, 'list', 'en')

      expect(excerpt).toContain('Word1 Word2')
    })

    it('should decode &amp; to &', () => {
      const markdown = 'Rock &amp; Roll'
      const excerpt = generateExcerpt(markdown, 'list', 'en')

      expect(excerpt).toContain('Rock & Roll')
    })

    it('should decode &lt; and &gt;', () => {
      const markdown = 'Use &lt;div&gt; tags'
      const excerpt = generateExcerpt(markdown, 'list', 'en')

      expect(excerpt).toContain('<div>')
    })

    it('should decode &quot; and &apos;', () => {
      const markdown = 'He said &quot;Hello&quot; and &apos;Goodbye&apos;'
      const excerpt = generateExcerpt(markdown, 'list', 'en')

      expect(excerpt).toContain('"Hello"')
      expect(excerpt).toContain('\'Goodbye\'')
    })
  })

  describe('text normalization', () => {
    it('should replace multiple spaces with single space', () => {
      const markdown = 'Word1    Word2     Word3'
      const excerpt = generateExcerpt(markdown, 'list', 'en')

      expect(excerpt).toBe('Word1 Word2 Word3')
    })

    it('should replace line breaks with spaces', () => {
      const markdown = 'Line1\nLine2\nLine3'
      const excerpt = generateExcerpt(markdown, 'list', 'en')

      expect(excerpt).toBe('Line1 Line2 Line3')
    })

    it('should remove spaces after CJK punctuation', () => {
      const markdown = '这是第一句。 这是第二句？ 这是第三句！'
      const excerpt = generateExcerpt(markdown, 'list', 'zh')

      expect(excerpt).toContain('第一句。这是')
      expect(excerpt).toContain('第二句？这是')
      expect(excerpt).toContain('第三句！')
    })
  })

  describe('ellipsis handling', () => {
    it('should add ellipsis when text is truncated', () => {
      const longText = 'This is a very long text that will definitely be truncated. '.repeat(20)
      const excerpt = generateExcerpt(longText, 'og', 'en') // og has shorter limit (140)

      expect(excerpt).toMatch(/\.\.\.$/)
    })

    it('should not add ellipsis when text fits within limit', () => {
      const shortText = 'Short text.'
      const excerpt = generateExcerpt(shortText, 'list', 'en')

      expect(excerpt).toBe('Short text.')
      expect(excerpt).not.toMatch(/\.\.\.$/)
    })

    it('should remove trailing punctuation before adding ellipsis', () => {
      const longText = 'This is a very long text that will be truncated. '.repeat(20)
      const excerpt = generateExcerpt(longText, 'og', 'en')

      // Should not have double punctuation like "......"
      expect(excerpt).toMatch(/[^.]\.\.\.$|[^?]\.\.\.$/)
    })
  })

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const excerpt = generateExcerpt('', 'list', 'en')
      expect(excerpt).toBe('')
    })

    it('should handle content with only headings', () => {
      const markdown = '# Heading 1\n## Heading 2\n### Heading 3'
      const excerpt = generateExcerpt(markdown, 'list', 'en')

      // All headings should be removed, result might be empty or whitespace
      expect(excerpt.trim()).toBe('')
    })

    it('should handle content with only whitespace', () => {
      const markdown = '   \n\n   \n   '
      const excerpt = generateExcerpt(markdown, 'list', 'en')

      expect(excerpt.trim()).toBe('')
    })

    it('should handle mixed language content', () => {
      const markdown = 'This is English. これは日本語です。 This is more English.'
      const excerpt = generateExcerpt(markdown, 'list', 'en')

      expect(excerpt).toContain('English')
      expect(excerpt).toContain('日本語')
    })
  })
})

describe('generateDescription', () => {
  it('should return existing description when provided', () => {
    const post = createTestPost({
      description: 'Custom description',
      body: 'This is the post body content that should be ignored.',
    })

    const description = generateDescription(post, 'list')
    expect(description).toBe('Custom description')
  })

  it('should generate description from body when no description provided', () => {
    const post = createTestPost({
      body: 'This is the post body content that will be used for the description.',
    })

    const description = generateDescription(post, 'list')
    expect(description).toContain('post body content')
  })

  it('should use default locale when lang is empty', () => {
    const post = createTestPost({
      lang: '', // Empty lang should use defaultLocale
      body: 'This is a test post with universal language.',
    })

    const description = generateDescription(post, 'list')
    expect(description).toContain('test post')
  })

  it('should respect the scene parameter', () => {
    const longBody = 'This is a very long post body. '.repeat(50)
    const post = createTestPost({
      body: longBody,
    })

    const listDescription = generateDescription(post, 'list')
    const ogDescription = generateDescription(post, 'og')

    // list scene has longer limit than og scene
    expect(listDescription.length).toBeGreaterThan(ogDescription.length)
  })

  it('should handle empty body', () => {
    const post = createTestPost({
      body: '',
    })

    const description = generateDescription(post, 'list')
    expect(description).toBe('')
  })
})

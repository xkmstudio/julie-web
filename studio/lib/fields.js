/**
 * Shared anchor slug field for modules
 * Used to create linkable sections on pages
 */
export const anchorSlugField = {
  title: 'Anchor Slug',
  name: 'anchorSlug',
  type: 'string',
  description: 'Optional: Add a unique identifier to link directly to this section (e.g., "benefits", "how-it-works"). Use the same slug in your link to scroll to this section.',
  validation: Rule => Rule.custom((value) => {
    if (!value) return true
    // Only allow lowercase letters, numbers, and hyphens
    if (!/^[a-z0-9-]+$/.test(value)) {
      return 'Anchor slug must only contain lowercase letters, numbers, and hyphens (e.g., "my-section")'
    }
    return true
  }),
}


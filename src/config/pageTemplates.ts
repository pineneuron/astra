export type PageFieldType = 'text' | 'textarea' | 'richtext' | 'image' | 'url' | 'repeater'

export type PageFieldDefinition = {
  key: string
  label: string
  type: PageFieldType
  required?: boolean
  placeholder?: string
  helperText?: string
  defaultValue?: string
  itemLabel?: string
  fields?: PageFieldDefinition[]
}

export type PageContentSection = {
  key: string
  label: string
  fields: PageFieldDefinition[]
}

export type PageTemplateDefinition = {
  label: string
  description?: string
  fields?: PageFieldDefinition[] // Deprecated: use sections instead
  sections?: PageContentSection[] // New: explicit sections for tabs
  seo?: {
    enabled: boolean
  }
}

export const PAGE_TEMPLATES: Record<string, PageTemplateDefinition> = {
  home: {
    label: 'Home Page',
    description: 'Hero section and call-to-action content for the home page.',
    sections: [
      {
        key: 'bannerSlides',
        label: 'Banner Slides',
        fields: [
          {
            key: 'bannerSlides',
            label: 'Banner Slides',
            type: 'repeater',
            itemLabel: 'Slide',
            fields: [
              { key: 'desktopImage', label: 'Desktop Image', type: 'image', helperText: 'Recommended 1920x1080px JPG or PNG.' },
              { key: 'mobileImage', label: 'Mobile Image', type: 'image', helperText: 'Optional 1080x1350px JPG or PNG.' },
              { key: 'url', label: 'Slide URL', type: 'text', helperText: 'Optional link to navigate to when the slide is clicked.' },
            ],
          },
        ],
      },
      {
        key: 'howToOrder',
        label: 'How to Order?',
        fields: [
          { key: 'howToOrderTitle', label: 'Title', type: 'text', defaultValue: 'how to order?' },
          { key: 'howToOrderSubtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Supporting text for the section.' },
          {
            key: 'howToOrderSteps',
            label: 'Steps',
            type: 'repeater',
            itemLabel: 'Step',
            fields: [
              { key: 'title', label: 'Step Title', type: 'text', required: true },
              { key: 'description', label: 'Step Description', type: 'textarea', placeholder: 'Describe this step.' },
              { key: 'icon', label: 'Step Icon', type: 'image', helperText: 'Optional icon image (64x64px).' },
            ],
          },
        ],
      },
      {
        key: 'quality',
        label: 'Quality & Innovation',
        fields: [
          { key: 'qualityTitle', label: 'Title', type: 'text' },
          { key: 'qualitySubtitle', label: 'Subtitle', type: 'textarea' },
          { key: 'qualityMainImage', label: 'Main Image', type: 'image', helperText: 'Displayed on the left side.' },
          {
            key: 'qualityCards',
            label: 'Cards',
            type: 'repeater',
            itemLabel: 'Card',
            fields: [
              { key: 'badge', label: 'Badge Text / Number', type: 'text', placeholder: '01' },
              { key: 'badgeColor', label: 'Badge Color Class', type: 'text', helperText: 'Tailwind background class, e.g. tsf-bg-red' },
              { key: 'title', label: 'Card Title', type: 'text', required: true },
              { key: 'description', label: 'Card Description', type: 'textarea' },
              { key: 'icon', label: 'Card Icon', type: 'image', helperText: 'Optional icon image (64x64px).' },
            ],
          },
        ],
      },
      {
        key: 'testimonials',
        label: 'What Our Customer Say',
        fields: [
          { key: 'testimonialHeading', label: 'Heading', type: 'text' },
          { key: 'testimonialLeftImage', label: 'Left Image', type: 'image', helperText: 'Large image shown on the left.' },
          { key: 'testimonialRightImage', label: 'Right Image', type: 'image', helperText: 'Image displayed in the red card.' },
          { key: 'testimonialStatLabel', label: 'Stat Label', type: 'text', defaultValue: 'Satisfied Clients' },
          { key: 'testimonialStatValue', label: 'Stat Value', type: 'text', defaultValue: '99%' },
          {
            key: 'testimonials',
            label: 'Testimonial Items',
            type: 'repeater',
            itemLabel: 'Testimonial',
            fields: [
              { key: 'quote', label: 'Quote', type: 'textarea', required: true },
              { key: 'author', label: 'Author Name', type: 'text', required: true },
              { key: 'role', label: 'Author Role / Company', type: 'text' },
              { key: 'avatar', label: 'Author Avatar', type: 'image', helperText: 'Optional avatar image (80x80px).' },
            ],
          },
        ],
      },
      {
        key: 'faq',
        label: 'FAQ',
        fields: [
          { key: 'faqHeading', label: 'Heading', type: 'text', defaultValue: 'frequently asked questions.' },
          {
            key: 'faqItems',
            label: 'FAQ Items',
            type: 'repeater',
            itemLabel: 'FAQ',
            fields: [
              { key: 'question', label: 'Question', type: 'text', required: true },
              { key: 'answer', label: 'Answer', type: 'textarea', required: true },
            ],
          },
        ],
      },
    ],
    seo: { enabled: true },
  },
  about: {
    label: 'About Page',
    description: 'Company mission, background, and values content.',
    sections: [
      {
        key: 'header_background',
        label: 'Header Background',
        fields: [
          { key: 'headerBackground', label: 'Header Background', type: 'image', helperText: 'Background image for the header.' },
        ],
      },
      {
        key: 'video',
        label: 'Video Section',
        fields: [
          { key: 'videoUrl', label: 'Video URL', type: 'url', helperText: 'YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID) or direct video file URL' },
          { key: 'videoThumbnail', label: 'Video Thumbnail', type: 'image', helperText: 'Thumbnail image for the video player.' },
          { key: 'videoThumbnailAlt', label: 'Thumbnail Alt Text', type: 'text', defaultValue: 'About Three Star Foods' },
        ],
      },
      {
        key: 'stats',
        label: 'Statistics Section',
        fields: [
          {
            key: 'stats',
            label: 'Statistics',
            type: 'repeater',
            itemLabel: 'Stat',
            fields: [
              { key: 'value', label: 'Value', type: 'text', required: true, placeholder: '100' },
              { key: 'suffix', label: 'Suffix', type: 'text', placeholder: '+', helperText: 'Optional suffix (e.g., +, %, etc.)' },
              { key: 'label', label: 'Label', type: 'text', required: true, placeholder: 'Food Items' },
            ],
          },
        ],
      },
      {
        key: 'whoWeAre',
        label: 'Who We Are',
        fields: [
          { key: 'whoWeAreHeading', label: 'Heading', type: 'text', defaultValue: 'Who We Are' },
          { key: 'whoWeAreContent', label: 'Content', type: 'textarea', placeholder: 'Company description and mission.' },
          { key: 'whoWeAreImage', label: 'Image', type: 'image', helperText: 'Image displayed on the right side.' },
        ],
      },
      {
        key: 'whyChooseUs',
        label: 'Why Choose Us',
        fields: [
          { key: 'whyChooseUsHeading', label: 'Heading', type: 'text', defaultValue: 'Why Choose Us' },
          { key: 'whyChooseUsDescription', label: 'Description', type: 'textarea', placeholder: 'Brief description about why customers should choose you.' },
          { key: 'whyChooseUsTeamImage', label: 'Team Image', type: 'image', helperText: 'Team image displayed on the left side.' },
          {
            key: 'whyChooseUsFeatures',
            label: 'Feature Cards',
            type: 'repeater',
            itemLabel: 'Feature',
            fields: [
              { key: 'icon', label: 'Icon Image', type: 'image', helperText: 'Icon image for the feature (50x50px recommended).' },
              { key: 'title', label: 'Feature Title', type: 'text', required: true, placeholder: 'Uncompromising Quality' },
            ],
          },
        ],
      },
      {
        key: 'ourTeam',
        label: 'Our Team',
        fields: [
          {
            key: 'departments',
            label: 'Departments',
            type: 'repeater',
            itemLabel: 'Department',
            fields: [
              {
                key: 'name',
                label: 'Department Name',
                type: 'text',
                required: true,
                placeholder: 'Managing Directors',
              },
              {
                key: 'members',
                label: 'Team Members',
                type: 'repeater',
                itemLabel: 'Member',
                fields: [
                  {
                    key: 'name',
                    label: 'Full Name',
                    type: 'text',
                    required: true,
                  },
                  {
                    key: 'phone',
                    label: 'Phone Number',
                    type: 'text',
                    placeholder: '98XXXXXXXX',
                    helperText: 'Optional phone number for this team member.',
                  },
                  {
                    key: 'avatar',
                    label: 'Avatar Image',
                    type: 'image',
                    helperText: 'Optional avatar image (80x80px). Placeholder will be used if not provided.',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    seo: { enabled: true },
  },
  contact: {
    label: 'Contact Page',
    description: 'Contact details and map information.',
    fields: [
      { key: 'headerBackground', label: 'Header Background', type: 'image', helperText: 'Background image for the header.' },
      { key: 'heading', label: 'Heading', type: 'text', required: true, defaultValue: "Let's build Together" },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Introductory text for the contact page.' },
      { key: 'phone', label: 'Phone Number(s)', type: 'text', required: true, helperText: 'Comma-separated phone numbers (e.g., +977 14988879, 4963659)' },
      { key: 'email', label: 'Email Address(es)', type: 'text', required: true, helperText: 'Comma-separated email addresses (e.g., info@example.com, support@example.com)' },
      { key: 'address', label: 'Address', type: 'textarea', placeholder: 'Physical address details.' },
      { key: 'mapEmbedUrl', label: 'Map Embed URL', type: 'url', helperText: 'Google Maps iframe embed URL' },
    ],
    seo: { enabled: true },
  },
  products: {
    label: 'Products Landing Page',
    description: 'Hero content and highlights for the product catalogue.',
    fields: [
      { key: 'headerBackground', label: 'Header Background', type: 'image', helperText: 'Background image for the header.' },
      { key: 'heading', label: 'Heading', type: 'text', required: true, defaultValue: 'Our Products' },
      { key: 'subheading', label: 'Sub Heading', type: 'textarea', placeholder: 'Brief overview of product catalogue.' },
      { key: 'highlightTitle', label: 'Highlight Title', type: 'text', placeholder: 'E.g. Trending Categories' },
      { key: 'highlightDescription', label: 'Highlight Description', type: 'textarea', placeholder: 'Short description for highlighted section.' },
      { key: 'bannerImage', label: 'Banner Image', type: 'image', helperText: 'Optional promotional banner image.' },
    ],
    seo: { enabled: true },
  },
  dealers: {
    label: 'Our Dealers Page',
    description: 'Dealer locations and contact information.',
    sections: [
      {
        key: 'dealers',
        label: 'Dealers',
        fields: [
          { key: 'headerBackground', label: 'Header Background', type: 'image', helperText: 'Background image for the header.' },
          { key: 'heading', label: 'Page Heading', type: 'text', defaultValue: 'Find Our Dealers Near You' },
          { key: 'description', label: 'Page Description', type: 'textarea', placeholder: 'Brief description about dealers.' },
          {
            key: 'dealers',
            label: 'Dealers List',
            type: 'repeater',
            itemLabel: 'Dealer',
            fields: [
              { key: 'name', label: 'Dealer Name', type: 'text', required: true },
              { key: 'city', label: 'City', type: 'text', required: true },
              { key: 'address', label: 'Address', type: 'textarea' },
              { key: 'phone', label: 'Phone', type: 'text' },
              { key: 'email', label: 'Email', type: 'text' },
              { key: 'latitude', label: 'Latitude', type: 'text', required: true, helperText: 'Map coordinate (e.g., 27.7172)' },
              { key: 'longitude', label: 'Longitude', type: 'text', required: true, helperText: 'Map coordinate (e.g., 85.3240)' },
            ],
          },
        ],
      },
    ],
    seo: { enabled: true },
  },
}

export const PAGE_TEMPLATE_OPTIONS = Object.entries(PAGE_TEMPLATES).map(([value, template]) => ({
  value,
  label: template.label,
}))

export function getTemplateDefaultContent(templateKey: keyof typeof PAGE_TEMPLATES) {
  const template = PAGE_TEMPLATES[templateKey]
  if (!template) return {}
  
  const fields: PageFieldDefinition[] = []
  
  // Collect fields from sections if available, otherwise use fields
  if (template.sections) {
    template.sections.forEach(section => {
      fields.push(...section.fields)
    })
  } else if (template.fields) {
    fields.push(...template.fields)
  }
  
  return fields.reduce<Record<string, unknown>>((acc, field) => {
    if (field.type === 'repeater') {
      acc[field.key] = []
    } else if (field.defaultValue !== undefined) {
      acc[field.key] = field.defaultValue
    }
    return acc
  }, {})
}

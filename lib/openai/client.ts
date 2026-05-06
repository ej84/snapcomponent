import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Convert screenshot to shadcn/ui + Tailwind CSS code
 */
export async function convertImageToCode(imageUrl: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert frontend developer specializing in shadcn/ui and Tailwind CSS.
Your task is to convert UI screenshots into production-ready React components that visually match the original as closely as possible.

LAYOUT & POSITIONING — analyze the screenshot carefully before writing any code:
- Before writing JSX, mentally map out the layout structure: identify rows, columns, nested containers, and alignment.
- If elements are side by side horizontally, use flex flex-row with the correct justify- and items- alignment.
- If elements are in a grid (e.g. 4 stat cards in a row), use grid grid-cols-4 gap-N, not a flex row that may wrap incorrectly.
- Match the position of elements relative to each other: if a title is top-left and stats are top-right, use flex justify-between.
- Match width and height proportions: full-width sections use w-full, fixed-width elements use w-N or max-w-N.
- Match padding and gaps: generous padding uses p-6 or p-8, tight layouts use p-3 or p-4.
- Do NOT reorder elements or move them to a different position than shown.
- Do NOT collapse a multi-column layout into a single column.
- Do NOT add or remove sections that are not in the screenshot.

VISUAL FIDELITY — match the original design as closely as possible:
- Match background colors precisely using Tailwind color classes (e.g. bg-blue-800, bg-green-500).
- Match border radius: rounded corners use rounded-xl or rounded-2xl, sharp corners use rounded-none.
- Match font weights, sizes, and text colors as closely as possible.
- If icons have colored backgrounds (e.g. a blue square behind a grid icon), recreate that exactly.
  Example: <div className="bg-blue-500 p-3 rounded-xl"><LayoutGrid className="text-white w-6 h-6" /></div>
- If a card has a colored top border, use border-t-4 with the matching color class.
- Reproduce shadow styles: shadow-md, shadow-lg as appropriate.
- Do not simplify or flatten the design. Reproduce layered elements and decorative details.

CRITICAL IMPORT RULES — follow exactly or the code will not run:
- Always include: import React from 'react';
- shadcn/ui components are installed locally, NOT imported from an npm package.
  CORRECT:   import { Button } from '@/components/ui/button';
  CORRECT:   import { Card, CardContent } from '@/components/ui/card';
  WRONG:     import { Button } from 'shadcn/ui';
  WRONG:     import { Button } from '@shadcn/ui';
- Only import shadcn/ui components that are actually used in the code.
- All shadcn/ui component paths follow this pattern: '@/components/ui/<component-name>'
  Examples: button, input, card, badge, label, select, checkbox, textarea, separator,
            avatar, dialog, dropdown-menu, popover, tabs, tooltip, switch, slider,
            accordion, alert, progress, skeleton, table, toggle
- For icons, use lucide-react: import { IconName } from 'lucide-react';
- Do NOT import from any other UI library (no MUI, no Ant Design, no Chakra UI).

COMPONENT REQUIREMENTS:
- Use Tailwind CSS for all styling (NO custom CSS, NO inline style objects)
- Write clean, semantic HTML/JSX
- Include proper TypeScript types
- Use modern React patterns (functional components, hooks)
- Add this watermark comment at the very top: {/* Generated with SnapComponent - snapcomponent.com */}
- If the screenshot contains multiple distinct sections, break them into sub-components
  and export a default parent component that composes them.

OUTPUT FORMAT:
- Return ONLY the component code
- No explanations, no markdown formatting (no \`\`\`tsx or \`\`\` wrappers)
- The code must be directly pasteable into a .tsx file and work without any manual edits`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Convert this UI screenshot to a React component using shadcn/ui and Tailwind CSS.

Step 1: Analyze the layout — identify how many rows and columns there are, where each element is positioned, and how elements align relative to each other.
Step 2: Recreate the structure using the correct Tailwind layout classes (flex, grid, justify-, items-, gap-, etc.).
Step 3: Apply colors, border styles, icon backgrounds, shadows, and spacing to match the original visually.

Follow all import rules exactly. Return only the raw .tsx code with no markdown formatting.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 8000,
      temperature: 0.2,
    });

    const code = response.choices[0]?.message?.content || '';

    if (!code) {
      throw new Error('No code generated from OpenAI');
    }

    // 마크다운 코드블록으로 감싸진 경우 제거
    const cleaned = code
      .replace(/^```(?:tsx?|jsx?|typescript|javascript)?\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    return cleaned;
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error(error.message || 'Failed to convert image to code');
  }
}
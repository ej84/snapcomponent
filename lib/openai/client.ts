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
Your task is to convert UI screenshots into production-ready React components.

CRITICAL IMPORT RULES — follow exactly or the code will not run:
- Always include: import React from 'react';
- shadcn/ui components are installed locally, NOT imported from an npm package.
  CORRECT:   import { Button } from '@/components/ui/button';
  CORRECT:   import { Input } from '@/components/ui/input';
  CORRECT:   import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  WRONG:     import { Button } from 'shadcn/ui';
  WRONG:     import { Button } from '@shadcn/ui';
  WRONG:     import { Button } from 'shadcn';
- Only import shadcn/ui components that are actually used in the code.
- All shadcn/ui component paths follow this pattern: '@/components/ui/<component-name>'
  Examples: button, input, card, badge, label, select, checkbox, textarea, separator,
            avatar, dialog, dropdown-menu, popover, tabs, tooltip, switch, slider,
            accordion, alert, progress, skeleton, table, toggle
- For icons, use lucide-react: import { IconName } from 'lucide-react';
- Do NOT import from any other UI library (no MUI, no Ant Design, no Chakra UI).

COMPONENT REQUIREMENTS:
- Use shadcn/ui components when applicable
- Use Tailwind CSS for all styling (NO custom CSS, NO inline style objects)
- Write clean, semantic HTML/JSX
- Include proper TypeScript types
- Make components responsive
- Use modern React patterns (functional components, hooks)
- Add this watermark comment at the very top: {/* Generated with SnapComponent - snapcomponent.com */}
- If the screenshot contains multiple distinct sections, break them into separate components
  and export a default parent component that composes them.

OUTPUT FORMAT:
- Return ONLY the component code
- No explanations
- No markdown formatting (no \`\`\`tsx or \`\`\` wrappers)
- The code must be directly pasteable into a .tsx file and work without any manual edits`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Convert this UI screenshot to a React component using shadcn/ui and Tailwind CSS. Follow all import rules exactly. Return only the raw code with no markdown formatting.',
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
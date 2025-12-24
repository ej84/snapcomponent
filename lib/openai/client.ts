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
      model: 'gpt-4o', // GPT-4 Vision 최신 모델
      messages: [
        {
          role: 'system',
          content: `You are an expert frontend developer specializing in shadcn/ui and Tailwind CSS.
                    Your task is to convert UI screenshots into production-ready React components.

                    Requirements:
                    - Use shadcn/ui components when applicable
                    - Use Tailwind CSS for all styling (NO custom CSS)
                    - Write clean, semantic HTML/JSX
                    - Include proper TypeScript types
                    - Make components responsive
                    - Use modern React patterns (functional components, hooks)
                    - Add the watermark comment at the top: {/* Generated with SnapComponent - snapcomponent.com */}

                    Return ONLY the component code, no explanations.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Convert this UI screenshot to a React component using shadcn/ui and Tailwind CSS. Return only the code, no markdown formatting.',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 4000,
      temperature: 0.2, // Lower temperature for more consistent code
    });

    const code = response.choices[0]?.message?.content || '';
    
    if (!code) {
      throw new Error('No code generated from OpenAI');
    }

    return code;
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error(error.message || 'Failed to convert image to code');
  }
}
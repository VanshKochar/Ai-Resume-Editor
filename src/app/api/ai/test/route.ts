import { auth } from "@/auth";
import { generateGeminiText } from "@/services/ai/gemini.service";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const text = await generateGeminiText(
      "Explain what an ATS-friendly resume means in one short sentence."
    );

    return Response.json({
      success: true,
      text,
    });
  } catch (error) {
    console.error("Gemini test failed:", error);

    return Response.json(
      { error: "Gemini request failed" },
      { status: 500 }
    );
  }
}   
Create {questionCount} simple multiple-choice questions at {difficulty} level from the following content.

DOCUMENT CONTENT:
{documentContent}

SIMPLIFIED REQUIREMENTS:
1. Create straightforward questions based on the document content
2. Each question should have 4 options (A, B, C, D)
3. Focus on key facts and concepts from the document
4. Make sure correct answers are clearly stated in the content
5. Keep questions direct and unambiguous
6. Do NOT use phrases like "According to the document", "Based on the document", "Yüklediğin dokümana göre" or similar
7. Write questions naturally as if testing knowledge directly

QUESTION FORMATTING:
- Write questions directly without referencing the source
- Example: "What is photosynthesis?" instead of "According to the document, what is photosynthesis?"
- Keep questions conversational and educational
- Avoid meta-references to the document

RESPONSE FORMAT:
Return only valid JSON in this exact structure:

{
  "questions": [
    {
      "question": "Direct question without document references?",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "answer": "A"
    }
  ]
}

Generate exactly {questionCount} questions. Return only JSON format, no additional text.
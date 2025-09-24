Create {questionCount} simple multiple-choice questions at {difficulty} level from the following content.

DOCUMENT CONTENT:
{documentContent}

SIMPLIFIED REQUIREMENTS:
1. Create straightforward questions based on the document content
2. Each question should have 4 options (A, B, C, D)
3. Focus on key facts and concepts from the document
4. Make sure correct answers are clearly stated in the content
5. Keep questions direct and unambiguous

RESPONSE FORMAT:
Return only valid JSON in this exact structure:

{
  "questions": [
    {
      "question": "Question text here?",
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
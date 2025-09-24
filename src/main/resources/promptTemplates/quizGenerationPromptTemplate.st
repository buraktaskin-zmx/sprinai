Create {questionCount} multiple-choice questions at {difficulty} level from the following document content.

DOCUMENT CONTENT:
{documentContent}

COMPREHENSIVE QUIZ GENERATION GUIDELINES:

CONTENT REQUIREMENTS:
1. Questions must test SPECIFIC information from the document
2. Each question should be detailed and explanatory
3. The correct answer must be explicitly mentioned in the document
4. Wrong options should be plausible distractors that could confuse students
5. Avoid general knowledge questions - focus on document-specific content
6. Questions should cover different sections/topics from the document when possible

QUESTION QUALITY STANDARDS:
1. CLARITY: Questions should be unambiguous and clearly worded
2. DIFFICULTY: Adjust complexity based on the specified difficulty level:
   - Easy (kolay): Direct fact recall, definitions
   - Medium (orta): Application of concepts, relationships between ideas
   - Hard (zor): Analysis, synthesis, complex reasoning
3. RELEVANCE: Focus on the most important and educational content
4. DIVERSITY: Include different question types (definition, application, comparison, etc.)

ANSWER OPTION GUIDELINES:
1. Correct answer must be factually accurate based on document content
2. Distractors should be:
   - Related to the topic but incorrect
   - Similar in length and complexity to the correct answer
   - Not obviously wrong to someone who hasn't read the document
   - Based on common misconceptions or related concepts
3. Avoid "all of the above" or "none of the above" options
4. Ensure options are grammatically consistent with the question stem

FORMATTING REQUIREMENTS:
1. Return response in valid JSON format
2. Each question object must include:
   - "question": The question text
   - "options": Object with keys A, B, C, D and their corresponding text
   - "answer": Single letter indicating correct answer (A, B, C, or D)
3. Questions should be numbered implicitly through array order

EXAMPLE QUESTION STRUCTURE:
{
  "question": "According to the document, what is the primary function of [specific concept mentioned in document]?",
  "options": {
    "A": "Correct answer from document",
    "B": "Plausible but incorrect alternative",
    "C": "Another believable distractor",
    "D": "Final incorrect but reasonable option"
  },
  "answer": "A"
}

CONTENT VALIDATION:
- Ensure all questions can be answered solely from the provided document
- Verify that correct answers are explicitly stated or clearly derivable from the text
- Confirm that distractors are not accidentally correct based on document content
- Check that questions test understanding rather than just memorization when difficulty is medium or hard

Generate exactly {questionCount} high-quality questions following these guidelines. Return only valid JSON format.
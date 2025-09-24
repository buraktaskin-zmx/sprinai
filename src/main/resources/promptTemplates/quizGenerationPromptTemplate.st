Create {questionCount} multiple-choice questions at {difficulty} difficulty level from the following document content.

DOCUMENT CONTENT:
{documentContent}

COMPREHENSIVE QUIZ GENERATION GUIDELINES:

CONTENT REQUIREMENTS:
1. Questions must test SPECIFIC information from the document
2. Each question should be clear and direct
3. The correct answer must be explicitly mentioned in the document
4. Wrong options should be plausible distractors
5. Focus on document-specific content, avoid general knowledge questions
6. Questions should cover different sections/topics from the document when possible

QUESTION FORMATTING RULES:
1. Do NOT use phrases like "According to the document", "Based on the document", "Yüklediğin dokümana göre", or similar references
2. Write questions naturally as if testing knowledge directly
3. Make questions sound conversational and educational
4. Avoid meta-references to the document source

QUESTION QUALITY STANDARDS:
1. CLARITY: Questions should be unambiguous and clearly worded
2. DIFFICULTY: Adjust complexity based on the specified difficulty level:
   - kolay (easy): Direct fact recall, definitions, simple concepts
   - orta (medium): Application of concepts, relationships between ideas, cause and effect
   - zor (hard): Analysis, synthesis, complex reasoning, detailed comparisons
3. RELEVANCE: Focus on the most important and educational content
4. DIVERSITY: Include different question types (definition, application, comparison, process, etc.)

ANSWER OPTION GUIDELINES:
1. Correct answer must be factually accurate based on document content
2. Distractors should be:
   - Related to the topic but incorrect
   - Similar in length and complexity to the correct answer
   - Not obviously wrong to someone who hasn't read the document
   - Based on common misconceptions or related concepts
3. Avoid "all of the above" or "none of the above" options
4. Ensure options are grammatically consistent with the question stem

EXAMPLE QUESTION FORMATS (WITHOUT DOCUMENT REFERENCES):

GOOD EXAMPLES:
- "What is the primary function of mitochondria?"
- "Which process converts sunlight into chemical energy?"
- "How does DNA replication occur?"

BAD EXAMPLES (AVOID):
- "According to the document, what is the primary function of mitochondria?"
- "Yüklediğin dokümana göre, hangi süreç güneş ışığını kimyasal enerjiye dönüştürür?"
- "Based on the text, how does DNA replication occur?"

FORMATTING REQUIREMENTS:
1. Return response in valid JSON format
2. Each question object must include:
   - "question": The question text (without document references)
   - "options": Object with keys A, B, C, D and their corresponding text
   - "answer": Single letter indicating correct answer (A, B, C, or D)
3. Questions should be numbered implicitly through array order

JSON OUTPUT FORMAT:
{
  "questions": [
    {
      "question": "Clear, direct question without document references?",
      "options": {
        "A": "Correct answer from document",
        "B": "Plausible but incorrect alternative",
        "C": "Another believable distractor",
        "D": "Final incorrect but reasonable option"
      },
      "answer": "A"
    }
  ]
}

CONTENT VALIDATION:
- Ensure all questions can be answered solely from the provided document
- Verify that correct answers are explicitly stated or clearly derivable from the text
- Confirm that distractors are not accidentally correct based on document content
- Check that questions test understanding appropriately for the specified difficulty level
- Remove any references to "document", "text", "according to", or similar phrases

Generate exactly {questionCount} high-quality questions following these guidelines. Return only valid JSON format without any additional text or explanations.
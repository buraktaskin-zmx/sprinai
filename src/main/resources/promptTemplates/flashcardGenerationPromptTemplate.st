Create {cardCount} FlashCards from the uploaded document content. User request: "{userMessage}"

DOCUMENT CONTENT:
{documentContent}

FLASHCARD RULES:
1. Each flashcard must have "front" (front side) and "back" (back side) parts
2. Front part: Question, concept, formula name, or term
3. Back part: Explanation, definition, formula, or answer
4. Determine flashcard type based on user request (formula, word-meaning, question-answer, etc.)
5. All information must be taken from the document - do not use general knowledge
6. Keep it short and suitable for learning

FLASHCARD TYPE EXAMPLES:

FORMULA TYPE:
- Front: "Power Formula"
- Back: "P = V × I (Power = Voltage × Current)"

WORD-MEANING TYPE:
- Front: "Prokaryote"
- Back: "Cell type without nucleus, genetic material freely located in cytoplasm"

QUESTION-ANSWER TYPE:
- Front: "Where does photosynthesis occur?"
- Back: "Occurs in the chloroplasts of plants"

HISTORICAL TYPE:
- Front: "1453"
- Back: "The year Constantinople was conquered"

Create {cardCount} flashcards suitable for the user request and return in JSON format.
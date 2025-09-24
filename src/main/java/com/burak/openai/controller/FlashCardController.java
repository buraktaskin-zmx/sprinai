// src/main/java/com/burak/openai/controller/FlashCardController.java
package com.burak.openai.controller;

import com.burak.openai.model.FlashCardRequest;
import com.burak.openai.model.FlashCardResponse;
import com.burak.openai.rag.UserDocumentRetriever;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/flashcards")
@CrossOrigin(origins = "http://localhost:3000")
public class FlashCardController {
	
	private final ChatClient chatClient;
	private final ObjectMapper objectMapper;
	
	@Value("classpath:/promptTemplates/flashcardGenerationPromptTemplate.st")
	private Resource flashCardTemplate;
	
	public FlashCardController(@Qualifier("flashCardChatClient") ChatClient chatClient,
	                           ObjectMapper objectMapper) {
		this.chatClient = chatClient;
		this.objectMapper = objectMapper;
	}
	
	@PostMapping("/generate")
	public ResponseEntity<String> generateFlashCards(@RequestBody FlashCardRequest request) {
		String username = request.getUsername() != null ? request.getUsername() : "burak";
		String userMessage = request.getMessage();
		Integer cardCount = request.getCardCount() != null ? request.getCardCount() : 10;
		
		System.out.println("=== FLASHCARD GENERATION ===");
		System.out.println("Username: " + username);
		System.out.println("Request: " + userMessage);
		System.out.println("Card Count: " + cardCount);
		
		if (userMessage == null || userMessage.trim().isEmpty()) {
			return ResponseEntity.badRequest()
				.body("{\"error\": \"Message cannot be empty. Please specify what type of flashcard you want.\"}");
		}
		
		try {
			UserDocumentRetriever.setCurrentUsername(username);
			
			String contentQuery = "What topics, concepts, formulas, definitions and important information are in this document? List as detailed as possible.";
			
			String documentContent = chatClient.prompt()
				.user(contentQuery)
				.call()
				.content();
			
			System.out.println("Document content length: " + documentContent.length());
			
			// If document content is not found
			if (documentContent.length() < 100 ||
				documentContent.contains("The answer to this question") ||
				documentContent.contains("I don't know") ||
				documentContent.toLowerCase().contains("not found")) {
				
				System.out.println("ERROR: No valid document content found");
				return ResponseEntity.ok("{\"error\": \"Document content not found. Please upload a document first.\"}");
			}
			
			// Load template and create prompt
			String template = flashCardTemplate.getContentAsString(StandardCharsets.UTF_8);
			String flashCardPrompt = template
				.replace("{cardCount}", String.valueOf(cardCount))
				.replace("{userMessage}", userMessage)
				.replace("{documentContent}", documentContent);
			
			System.out.println("Generating flashcards...");
			
			// Create flashcard with structured output
			FlashCardResponse flashCardResponse = chatClient.prompt()
				.options(ChatOptions.builder()
					.temperature(0.5)
					.model("gpt-3.5-turbo")
					.build())
				.user(flashCardPrompt)
				.call()
				.entity(FlashCardResponse.class);
			
			System.out.println("FlashCards generated successfully with " + flashCardResponse.flashcards().size() + " cards");
			
			// Convert to JSON and return
			String jsonResponse = objectMapper.writeValueAsString(flashCardResponse);
			System.out.println("Final JSON length: " + jsonResponse.length());
			
			return ResponseEntity.ok(jsonResponse);
			
		} catch (Exception e) {
			System.err.println("=== FLASHCARD GENERATION ERROR ===");
			e.printStackTrace();
			return ResponseEntity.internalServerError()
				.body("{\"error\": \"Error while creating FlashCard: " + e.getMessage() + "\"}");
		} finally {
			UserDocumentRetriever.clearCurrentUsername();
		}
	}
}
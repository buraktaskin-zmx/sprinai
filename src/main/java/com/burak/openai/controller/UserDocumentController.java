package com.burak.openai.controller;

import com.burak.openai.rag.UserDocumentRetriever;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user-documents")
@CrossOrigin(origins = "http://localhost:3000")
public class UserDocumentController {
	
	private final ChatClient chatClient;
	
	public UserDocumentController(@Qualifier("userDocumentChatClient") ChatClient chatClient) {
		this.chatClient = chatClient;
	}
	
	@PostMapping("/chat")
	public ResponseEntity<String> chat(@RequestBody Map<String, String> request) {
		String message = request.get("message");
		String username = request.getOrDefault("username", "burak");
		
		if (message == null || message.trim().isEmpty()) {
			return ResponseEntity.badRequest().body("Mesaj boş olamaz");
		}
		
		try {
			// Set current username for retriever
			UserDocumentRetriever.setCurrentUsername(username);
			
			String response = chatClient.prompt()
				.user(message)
				.call()
				.content();
			
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.internalServerError()
				.body("Hata oluştu: " + e.getMessage());
		} finally {
			// Clear username
			UserDocumentRetriever.clearCurrentUsername();
		}
	}
}
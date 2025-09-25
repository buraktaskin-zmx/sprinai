package com.burak.openai.controller;

import com.burak.openai.tools.HelpDeskTools;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static org.springframework.ai.chat.memory.ChatMemory.CONVERSATION_ID;

@RestController
@RequestMapping("/api/tools")
@CrossOrigin(origins = "http://localhost:3000")
public class HelpDeskController {
	
	private final ChatClient chatClient;
	private final HelpDeskTools helpDeskTools;
	
	public HelpDeskController(@Qualifier("helpDeskChatClient") ChatClient chatClient,
	                          HelpDeskTools helpDeskTools) {
		this.chatClient = chatClient;
		this.helpDeskTools = helpDeskTools;
	}
	
	@GetMapping("/help-desk")
	public ResponseEntity<String> helpDesk(@RequestHeader("username") String username,
	                                       @RequestParam("message") String message) {
		try {
			System.out.println("=== HELP DESK REQUEST ===");
			System.out.println("Username: " + username);
			System.out.println("Message: " + message);
			
			String answer = chatClient.prompt()
				.advisors(a -> a.param(CONVERSATION_ID, username))
				.user(message)
				.tools(helpDeskTools)
				.toolContext(Map.of("username", username))
				.call().content();
			
			System.out.println("Help desk response: " + answer);
			return ResponseEntity.ok(answer);
		} catch (Exception e) {
			System.err.println("Help desk error: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.internalServerError()
				.body("❌ I'm experiencing technical difficulties right now. Please try again in a moment, or contact support directly if the issue persists.");
		}
	}
	
	/**
	 * Alternative POST endpoint for more complex help desk requests
	 */
	@PostMapping("/help-desk")
	public ResponseEntity<Map<String, Object>> helpDeskPost(@RequestBody Map<String, String> request) {
		try {
			String message = request.get("message");
			String username = request.getOrDefault("username", "burak");
			
			if (message == null || message.trim().isEmpty()) {
				return ResponseEntity.badRequest()
					.body(Map.of("error", "Message cannot be empty"));
			}
			
			System.out.println("=== HELP DESK POST REQUEST ===");
			System.out.println("Username: " + username);
			System.out.println("Message: " + message);
			
			String answer = chatClient.prompt()
				.advisors(a -> a.param(CONVERSATION_ID, username))
				.user(message)
				.tools(helpDeskTools)
				.toolContext(Map.of("username", username))
				.call().content();
			
			System.out.println("Help desk response: " + answer);
			
			return ResponseEntity.ok(Map.of(
				"response", answer,
				"username", username,
				"timestamp", System.currentTimeMillis()
			));
		} catch (Exception e) {
			System.err.println("Help desk POST error: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.internalServerError()
				.body(Map.of("error", "I'm experiencing technical difficulties right now. Please try again in a moment."));
		}
	}
}
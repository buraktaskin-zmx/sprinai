package com.burak.openai.controller;

import com.burak.openai.rag.UserDocumentRetriever;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static org.springframework.ai.chat.memory.ChatMemory.CONVERSATION_ID;

@RestController
@RequestMapping("/api/rag")
public class RAGController {
	
	private final ChatClient chatMemoryChatClient;
	private final ChatClient webSearchChatClient;
	private final ChatClient userDocumentChatClient;
	private final VectorStore vectorStore;
	
	@Value("classpath:/promptTemplates/systemPromptRandomDataTemplate.st")
	Resource promptTemplate;
	
	@Value("classpath:/promptTemplates/systemPromptTemplate.st")
	Resource hrSystemTemplate;
	
	public RAGController(@Qualifier("chatMemoryChatClient") ChatClient chatMemoryChatClient,
	                     @Qualifier("webSearchRAGChatClient") ChatClient webSearchChatClient,
	                     @Qualifier("userDocumentChatClient") ChatClient userDocumentChatClient,
	                     VectorStore vectorStore) {
		this.chatMemoryChatClient = chatMemoryChatClient;
		this.webSearchChatClient = webSearchChatClient;
		this.userDocumentChatClient = userDocumentChatClient;
		this.vectorStore = vectorStore;
	}
	
//	@GetMapping("/random/chat")
//	public ResponseEntity<String> randomChat(@RequestHeader("username") String username,
//	                                         @RequestParam("message") String message) {
//		String answer = chatMemoryChatClient.prompt()
//			.advisors(a -> a.param(CONVERSATION_ID, username))
//			.user(message)
//			.call().content();
//		return ResponseEntity.ok(answer);
//	}
	
	@GetMapping("/document/chat")
	public ResponseEntity<String> documentChat(@RequestHeader("username") String username,
	                                           @RequestParam("message") String message) {
		String answer = chatMemoryChatClient.prompt()
			.advisors(a -> a.param(CONVERSATION_ID, username))
			.user(message)
			.call().content();
		return ResponseEntity.ok(answer);
	}
	
//	@GetMapping("/web-search/chat")
//	public ResponseEntity<String> webSearchChat(@RequestHeader("username") String username,
//	                                            @RequestParam("message") String message) {
//		String answer = webSearchChatClient.prompt()
//			.advisors(a -> a.param(CONVERSATION_ID, username))
//			.user(message)
//			.call().content();
//		return ResponseEntity.ok(answer);
//	}
	
	/**
	 * New endpoint for querying user's uploaded documents
	 */
	@PostMapping("/user-documents/chat")
	public ResponseEntity<Map<String, Object>> userDocumentChat(
		@RequestHeader("username") String username,
		@RequestParam("message") String message) {

		try {
			UserDocumentRetriever.setCurrentUsername(username);

			String answer = userDocumentChatClient.prompt()
				.advisors(advisorSpec -> advisorSpec.param(CONVERSATION_ID, username))
				.user(message)
				.call().content();

			return ResponseEntity.ok(Map.of(
				"answer", answer,
				"username", username,
				"query", message
			));

		} finally {
			UserDocumentRetriever.clearCurrentUsername();
		}
	}
	

	
}
package com.burak.openai.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/mcp")
@CrossOrigin(origins = "http://localhost:3000")
public class MCPClientController {
	
	private final ChatClient chatClient;
	
	public MCPClientController(ChatClient.Builder chatClientBuilder,
	                           ToolCallbackProvider toolCallbackProvider) {
		this.chatClient = chatClientBuilder.defaultToolCallbacks(toolCallbackProvider)
			.defaultAdvisors(new SimpleLoggerAdvisor())
			.build();
	}
	
	@GetMapping("/chat")
	public String chat(@RequestHeader(value = "username", required = false) String username,
	                   @RequestParam("message") String message) {
		return chatClient.prompt().user(message + " My username is " + username)
			.call().content();
	}
	
	/**
	 * Search web resources using Tavily MCP server
	 */
	@PostMapping("/search")
	public ResponseEntity<Map<String, Object>> searchWebResources(@RequestBody Map<String, String> request) {
		try {
			String query = request.get("query");
			String username = request.getOrDefault("username", "burak");
			
			if (query == null || query.trim().isEmpty()) {
				return ResponseEntity.badRequest()
					.body(Map.of("error", "Query parameter is required"));
			}
			
			System.out.println("=== MCP WEB SEARCH ===");
			System.out.println("Query: " + query);
			System.out.println("Username: " + username);
			
			// Use Tavily MCP server for web search
			String searchPrompt = String.format(
				"Search for educational resources and study materials about: %s. " +
					"Focus on tutorials, explanations, and learning materials. " +
					"Provide detailed results with URLs and descriptions.",
				query
			);
			
			String searchResult = chatClient.prompt()
				.user(searchPrompt)
				.call()
				.content();
			
			return ResponseEntity.ok(Map.of(
				"query", query,
				"result", searchResult,
				"timestamp", System.currentTimeMillis(),
				"status", "success"
			));
			
		} catch (Exception e) {
			System.err.println("MCP search error: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.internalServerError()
				.body(Map.of(
					"error", "Search failed: " + e.getMessage(),
					"status", "error"
				));
		}
	}
	
	/**
	 * Save content to file using File MCP server
	 */
	@PostMapping("/save-file")
	public ResponseEntity<Map<String, String>> saveToFile(@RequestBody Map<String, Object> request) {
		try {
			String content = (String) request.get("content");
			String filename = (String) request.get("filename");
			String username = (String) request.getOrDefault("username", "burak");
			
			if (content == null || content.trim().isEmpty()) {
				return ResponseEntity.badRequest()
					.body(Map.of("error", "Content is required"));
			}
			
			// Generate filename if not provided
			if (filename == null || filename.trim().isEmpty()) {
				String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
				filename = String.format("studentmate_report_%s_%s.txt", username, timestamp);
			}
			
			System.out.println("=== MCP FILE SAVE ===");
			System.out.println("Filename: " + filename);
			System.out.println("Content length: " + content.length());
			System.out.println("Username: " + username);
			
			// Use File MCP server to save content
			String savePrompt = String.format(
				"Create a new file named '%s' with the following content:\n\n%s",
				filename, content
			);
			
			String saveResult = chatClient.prompt()
				.user(savePrompt)
				.call()
				.content();
			
			System.out.println("File save result: " + saveResult);
			
			return ResponseEntity.ok(Map.of(
				"message", "File saved successfully!",
				"filename", filename,
				"result", saveResult,
				"timestamp", LocalDateTime.now().toString(),
				"status", "success"
			));
			
		} catch (Exception e) {
			System.err.println("MCP file save error: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.internalServerError()
				.body(Map.of(
					"error", "File save failed: " + e.getMessage(),
					"status", "error"
				));
		}
	}
	
	/**
	 * List files in directory using File MCP server
	 */
	@GetMapping("/list-files")
	public ResponseEntity<Map<String, Object>> listFiles(@RequestParam(required = false) String directory) {
		try {
			String listPrompt = directory != null ?
				"List all files in the directory: " + directory :
				"List all files in the current directory";
			
			String listResult = chatClient.prompt()
				.user(listPrompt)
				.call()
				.content();
			
			return ResponseEntity.ok(Map.of(
				"directory", directory != null ? directory : "current",
				"files", listResult,
				"timestamp", System.currentTimeMillis(),
				"status", "success"
			));
			
		} catch (Exception e) {
			System.err.println("MCP list files error: " + e.getMessage());
			return ResponseEntity.internalServerError()
				.body(Map.of(
					"error", "List files failed: " + e.getMessage(),
					"status", "error"
				));
		}
	}
	
	/**
	 * General MCP integration endpoint for testing
	 */
	@PostMapping("/execute")
	public ResponseEntity<Map<String, Object>> executeMCPCommand(@RequestBody Map<String, String> request) {
		try {
			String command = request.get("command");
			String username = request.getOrDefault("username", "burak");
			
			if (command == null || command.trim().isEmpty()) {
				return ResponseEntity.badRequest()
					.body(Map.of("error", "Command is required"));
			}
			
			System.out.println("=== MCP EXECUTE COMMAND ===");
			System.out.println("Command: " + command);
			System.out.println("Username: " + username);
			
			String result = chatClient.prompt()
				.user(command + " (User: " + username + ")")
				.call()
				.content();
			
			return ResponseEntity.ok(Map.of(
				"command", command,
				"result", result,
				"username", username,
				"timestamp", System.currentTimeMillis(),
				"status", "success"
			));
			
		} catch (Exception e) {
			System.err.println("MCP execute error: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.internalServerError()
				.body(Map.of(
					"error", "Command execution failed: " + e.getMessage(),
					"status", "error"
				));
		}
	}
}
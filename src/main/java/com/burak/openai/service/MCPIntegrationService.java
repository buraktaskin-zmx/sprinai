package com.burak.openai.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MCPIntegrationService {
	
	@Autowired(required = false)
	@Qualifier("webSearchMCPClient")
	private ChatClient webSearchClient;
	
	@Autowired(required = false)
	@Qualifier("fileManagerMCPClient")
	private ChatClient fileManagerClient;
	
	@Autowired
	@Qualifier("fallbackMCPClient")
	private ChatClient fallbackClient;
	
	@Value("${mcp.integration.enabled:true}")
	private boolean mcpEnabled;
	
	/**
	 * Search web resources for given topics using Tavily MCP server
	 * Returns clean, structured resources with emojis and friendly tone
	 */
	public List<Map<String, Object>> searchWebResourcesForTopics(List<String> topics) {
		List<Map<String, Object>> allResources = new ArrayList<>();
		
		for (String topic : topics) {
			if (topic == null || topic.trim().isEmpty()) continue;
			
			try {
				System.out.println("🔍 Searching for topic: " + topic);
				
				Map<String, Object> resourceData = searchSingleTopic(topic);
				if (resourceData != null && !resourceData.isEmpty()) {
					allResources.add(resourceData);
				}
				
				// Limit to prevent too many requests
				if (allResources.size() >= 3) break;
				
			} catch (Exception e) {
				System.err.println("❌ Error searching for topic: " + topic + " - " + e.getMessage());
				// Add a simple fallback resource
				Map<String, Object> fallbackResource = createSimpleFallbackResource(topic);
				allResources.add(fallbackResource);
			}
		}
		
		return allResources;
	}
	
	/**
	 * Search for a single topic and return clean, formatted results
	 */
	private Map<String, Object> searchSingleTopic(String topic) {
		try {
			// Clean the topic for better search results
			String cleanTopic = cleanTopicForSearch(topic);
			
			ChatClient clientToUse = (webSearchClient != null && mcpEnabled) ? webSearchClient : fallbackClient;
			
			if (webSearchClient != null && mcpEnabled) {
				// Use MCP Tavily search with specific instructions
				String searchPrompt = String.format("""
					Search for educational resources about: %s
					
					Please find:
					- 2-3 YouTube educational videos
					- 2-3 educational websites or articles
					
					Focus on:
					- High-quality educational content
					- Clear explanations suitable for students
					- Reliable sources (universities, educational platforms)
					
					Return ONLY the URLs in your response. No descriptions, no explanations.
					Just provide the direct links to YouTube videos and educational websites.
					""", cleanTopic);
				
				String searchResult = clientToUse.prompt()
					.user(searchPrompt)
					.call()
					.content();
				
				return parseAndFormatSearchResults(topic, searchResult);
			} else {
				// Fallback without MCP
				return createEnhancedFallbackResource(topic);
			}
			
		} catch (Exception e) {
			System.err.println("Error in searchSingleTopic: " + e.getMessage());
			return createSimpleFallbackResource(topic);
		}
	}
	
	/**
	 * Clean topic text for better search results
	 */
	private String cleanTopicForSearch(String topic) {
		// Remove common question words and clean up
		String cleaned = topic.toLowerCase()
			.replaceAll("\\b(what|which|how|why|when|where|does|do|is|are|the|of|in|for|about)\\b", "")
			.replaceAll("\\s+", " ")
			.trim();
		
		// Take first meaningful words (limit length)
		String[] words = cleaned.split("\\s+");
		if (words.length > 4) {
			cleaned = String.join(" ", Arrays.copyOf(words, 4));
		}
		
		return cleaned.isEmpty() ? topic : cleaned;
	}
	
	/**
	 * Parse search results and format them cleanly - LINKS ONLY VERSION
	 */
	private Map<String, Object> parseAndFormatSearchResults(String topic, String searchResult) {
		Map<String, Object> resource = new HashMap<>();
		resource.put("topic", topic);
		
		// Extract URLs
		List<String> allUrls = extractUrls(searchResult);
		List<String> youtubeUrls = filterYouTubeUrls(allUrls);
		List<String> webUrls = filterWebUrls(allUrls);
		
		// Create clean, simple content - ONLY LINKS
		StringBuilder content = new StringBuilder();
		content.append("**").append(topic).append("**\n\n");
		
		// Add YouTube videos - NO DESCRIPTIONS
		if (!youtubeUrls.isEmpty()) {
			content.append("🎥 YouTube Videos:\n");
			for (int i = 0; i < Math.min(3, youtubeUrls.size()); i++) {
				content.append("• ").append(youtubeUrls.get(i)).append("\n");
			}
			content.append("\n");
		}
		
		// Add web resources - NO DESCRIPTIONS
		if (!webUrls.isEmpty()) {
			content.append("🌐 Educational Websites:\n");
			for (int i = 0; i < Math.min(3, webUrls.size()); i++) {
				content.append("• ").append(webUrls.get(i)).append("\n");
			}
		}
		
		resource.put("content", content.toString());
		resource.put("youtubeUrls", youtubeUrls.subList(0, Math.min(3, youtubeUrls.size())));
		resource.put("webUrls", webUrls.subList(0, Math.min(3, webUrls.size())));
		resource.put("type", "web_search");
		
		return resource;
	}
	
	/**
	 * Filter URLs to get YouTube links
	 */
	private List<String> filterYouTubeUrls(List<String> urls) {
		return urls.stream()
			.filter(url -> url.toLowerCase().contains("youtube.com") || url.toLowerCase().contains("youtu.be"))
			.limit(3)
			.toList();
	}
	
	/**
	 * Filter URLs to get educational website links
	 */
	private List<String> filterWebUrls(List<String> urls) {
		return urls.stream()
			.filter(url -> !url.toLowerCase().contains("youtube.com") && !url.toLowerCase().contains("youtu.be"))
			.filter(url -> isEducationalUrl(url))
			.limit(3)
			.toList();
	}
	
	/**
	 * Check if URL is from educational source
	 */
	private boolean isEducationalUrl(String url) {
		String lowerUrl = url.toLowerCase();
		return lowerUrl.contains("edu") ||
			lowerUrl.contains("khan") ||
			lowerUrl.contains("coursera") ||
			lowerUrl.contains("edx") ||
			lowerUrl.contains("mit") ||
			lowerUrl.contains("stanford") ||
			lowerUrl.contains("biology") ||
			lowerUrl.contains("science") ||
			lowerUrl.contains("learn") ||
			lowerUrl.contains("nationalgeographic") ||
			lowerUrl.contains("britannica") ||
			lowerUrl.contains("study.com");
	}
	
	/**
	 * Create enhanced fallback resource when MCP is not available
	 */
	private Map<String, Object> createEnhancedFallbackResource(String topic) {
		Map<String, Object> resource = new HashMap<>();
		resource.put("topic", topic);
		
		// Simple fallback with search suggestions
		StringBuilder content = new StringBuilder();
		content.append("**").append(topic).append("**\n\n");
		content.append("🎥 YouTube Videos:\n");
		content.append("• Search: \"").append(topic).append(" tutorial\"\n");
		content.append("• Search: \"").append(topic).append(" explained\"\n\n");
		content.append("🌐 Educational Websites:\n");
		content.append("• Khan Academy: ").append("https://www.khanacademy.org/search?page_search_query=").append(topic.replace(" ", "+")).append("\n");
		content.append("• Coursera: Search for \"").append(topic).append("\"\n");
		
		resource.put("content", content.toString());
		resource.put("youtubeUrls", List.of());
		resource.put("webUrls", List.of());
		resource.put("type", "fallback");
		
		return resource;
	}
	
	/**
	 * Create simple fallback resource for errors
	 */
	private Map<String, Object> createSimpleFallbackResource(String topic) {
		Map<String, Object> resource = new HashMap<>();
		resource.put("topic", topic);
		
		StringBuilder content = new StringBuilder();
		content.append("**").append(topic).append("**\n\n");
		content.append("🌐 Study Resources:\n");
		content.append("• Review this topic in your course materials\n");
		content.append("• Search online for additional explanations\n");
		
		resource.put("content", content.toString());
		resource.put("youtubeUrls", List.of());
		resource.put("webUrls", List.of());
		resource.put("type", "simple_fallback");
		return resource;
	}
	
	/**
	 * Generate comprehensive report content with friendly tone and emojis
	 */
	public String generateReportContent(Map<String, Object> reportData) {
		StringBuilder report = new StringBuilder();
		
		// Header with emojis
		report.append("📊 QUIZ ANALYSIS REPORT\n");
		report.append("========================\n\n");
		
		// Basic info
		String username = (String) reportData.get("username");
		Long timestamp = (Long) reportData.get("timestamp");
		
		LocalDateTime dateTime;
		if (timestamp != null) {
			dateTime = LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.systemDefault());
		} else {
			dateTime = LocalDateTime.now();
		}
		
		report.append("👤 Student: ").append(username != null ? username : "Unknown").append("\n");
		report.append("📅 Date: ").append(dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n\n");
		
		// Wrong answers section with friendly tone
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> wrongAnswers = (List<Map<String, Object>>) reportData.get("wrongAnswers");
		
		if (wrongAnswers != null && !wrongAnswers.isEmpty()) {
			report.append("❌ QUESTIONS TO REVIEW\n");
			report.append("----------------------\n\n");
			
			for (Map<String, Object> wrongAnswer : wrongAnswers) {
				report.append("🤔 Question ").append(wrongAnswer.get("questionNumber")).append(": ");
				report.append(wrongAnswer.get("questionText")).append("\n");
				report.append("📝 Your Answer: ").append(wrongAnswer.get("studentAnswer")).append("\n");
				report.append("✅ Correct Answer: ").append(wrongAnswer.get("correctAnswer")).append("\n\n");
			}
		} else {
			report.append("🎉 PERFECT SCORE!\n");
			report.append("------------------\n");
			report.append("Congratulations! You answered all questions correctly! 🏆\n\n");
		}
		
		// AI Analysis with friendly tone
		String analysis = (String) reportData.get("analysis");
		if (analysis != null && !analysis.isEmpty()) {
			report.append("🤖 AI STUDY RECOMMENDATIONS\n");
			report.append("-----------------------------\n");
			report.append(analysis).append("\n\n");
		}
		
		// Web resources with better formatting
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> webResources = (List<Map<String, Object>>) reportData.get("webResources");
		
		if (webResources != null && !webResources.isEmpty()) {
			report.append("🎯 ADDITIONAL STUDY RESOURCES\n");
			report.append("------------------------------\n\n");
			
			for (Map<String, Object> resource : webResources) {
				String content = (String) resource.get("content");
				report.append(content).append("\n");
			}
		}
		
		// Footer with emoji
		report.append("\n🚀 Keep studying and you'll master these topics! Generated by StudentMate AI - ");
		report.append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
		
		return report.toString();
	}
	
	/**
	 * Save report to file using File MCP server
	 */
	public String saveReportToFile(String username, String reportContent) {
		String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
		String filename = String.format("📊_quiz_analysis_%s_%s.txt", username, timestamp);
		
		try {
			if (fileManagerClient != null && mcpEnabled) {
				String saveCommand = "Create a file named '" + filename + "' with the following quiz analysis content:\n\n" + reportContent;
				
				String result = fileManagerClient.prompt()
					.user(saveCommand)
					.call()
					.content();
				
				System.out.println("✅ File save result: " + result);
				return "D:\\Users\\taskin\\Desktop\\Deneme\\" + filename;
			} else {
				System.out.println("⚠️ MCP File server not available.");
				throw new RuntimeException("File saving not available. MCP File server is not configured or not running.");
			}
			
		} catch (Exception e) {
			System.err.println("❌ Error saving report to file: " + e.getMessage());
			throw new RuntimeException("Failed to save report: " + e.getMessage());
		}
	}
	
	/**
	 * Extract URLs from text using regex
	 */
	private List<String> extractUrls(String text) {
		List<String> urls = new ArrayList<>();
		Pattern urlPattern = Pattern.compile("https?://[\\w\\-\\.]+[\\w/\\?&=%\\-\\.]*");
		Matcher matcher = urlPattern.matcher(text);
		
		while (matcher.find()) {
			String url = matcher.group();
			if (!urls.contains(url)) {
				urls.add(url);
			}
		}
		
		return urls;
	}
}
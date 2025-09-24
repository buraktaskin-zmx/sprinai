package com.burak.openai.controller;

import com.burak.openai.model.QuizResultRequest;
import com.burak.openai.model.QuizResultResponse;
import com.burak.openai.model.WrongAnswer;
import com.burak.openai.rag.UserDocumentRetriever;
import com.burak.openai.service.MCPIntegrationService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizResultController {
	
	private final ChatClient chatClient;
	private final MCPIntegrationService mcpIntegrationService;
	
	@Value("classpath:/promptTemplates/quizMistakeAnalysisWithWebResources.st")
	private Resource mistakeAnalysisTemplate;
	
	public QuizResultController(@Qualifier("quizChatClient") ChatClient chatClient,
	                            MCPIntegrationService mcpIntegrationService) {
		this.chatClient = chatClient;
		this.mcpIntegrationService = mcpIntegrationService;
	}
	
	@PostMapping("/evaluate")
	public ResponseEntity<QuizResultResponse> evaluateQuiz(@RequestBody QuizResultRequest request) {
		try {
			List<WrongAnswer> wrongAnswers = new ArrayList<>();
			
			// Identify incorrect answers
			for (int i = 0; i < request.getQuestions().size(); i++) {
				var question = request.getQuestions().get(i);
				Integer studentAnswer = request.getAnswers().get(i);
				
				if (studentAnswer == null || !studentAnswer.equals(question.getCorrectAnswer())) {
					WrongAnswer wrongAnswer = new WrongAnswer(
						i + 1,
						question.getQuestion(),
						getAnswerText(question.getOptions(), question.getCorrectAnswer()),
						studentAnswer != null ? getAnswerText(question.getOptions(), studentAnswer) : "Not answered"
					);
					wrongAnswers.add(wrongAnswer);
				}
			}
			
			// Calculate correct answer count
			int correctCount = request.getQuestions().size() - wrongAnswers.size();
			
			QuizResultResponse response = new QuizResultResponse(
				request.getQuestions().size(),
				correctCount,
				wrongAnswers.size(),
				wrongAnswers
			);
			
			return ResponseEntity.ok(response);
			
		} catch (Exception e) {
			System.err.println("❌ Quiz evaluation error: " + e.getMessage());
			return ResponseEntity.internalServerError().build();
		}
	}
	
	@PostMapping("/analyzeMistakes")
	public ResponseEntity<Map<String, Object>> analyzeMistakesWithWebResources(@RequestBody Map<String, Object> request) {
		try {
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> wrongAnswers = (List<Map<String, Object>>) request.get("wrongAnswers");
			String username = (String) request.getOrDefault("username", "burak");
			
			System.out.println("🔍 Starting enhanced mistake analysis for user: " + username);
			
			if (wrongAnswers == null || wrongAnswers.isEmpty()) {
				return ResponseEntity.ok(Map.of(
					"analysis", "🎉 Congratulations! You answered all questions correctly! Excellent performance! Keep up the great work! 🏆",
					"webResources", List.of(),
					"canSaveReport", true,
					"reportData", Map.of(
						"username", username,
						"wrongAnswers", List.of(),
						"analysis", "Perfect score achieved! 🌟",
						"webResources", List.of(),
						"timestamp", System.currentTimeMillis()
					)
				));
			}
			
			// Set current username for retriever
			UserDocumentRetriever.setCurrentUsername(username);
			
			// Build analysis prompt with friendly tone
			StringBuilder wrongAnswersText = new StringBuilder();
			List<String> topicsForWebSearch = new ArrayList<>();
			
			for (Map<String, Object> wrongAnswer : wrongAnswers) {
				String questionText = (String) wrongAnswer.get("questionText");
				wrongAnswersText.append("❌ Question ").append(wrongAnswer.get("questionNumber")).append(": ");
				wrongAnswersText.append(questionText).append("\n");
				wrongAnswersText.append("📝 Your Answer: ").append(wrongAnswer.get("studentAnswer")).append("\n");
				wrongAnswersText.append("✅ Correct Answer: ").append(wrongAnswer.get("correctAnswer")).append("\n\n");
				
				// Extract clean topic for web search
				String topic = extractCleanTopicFromQuestion(questionText);
				if (!topic.isEmpty()) {
					topicsForWebSearch.add(topic);
				}
			}
			
			// Generate friendly AI analysis
			String analysis = generateFriendlyAnalysis(wrongAnswersText.toString());
			
			// Get web resources for incorrect topics using MCP Tavily
			System.out.println("🌐 Searching for web resources for topics: " + topicsForWebSearch);
			List<Map<String, Object>> webResources = mcpIntegrationService.searchWebResourcesForTopics(topicsForWebSearch);
			
			System.out.println("✅ Analysis complete. Found " + webResources.size() + " web resources");
			
			return ResponseEntity.ok(Map.of(
				"analysis", analysis,
				"webResources", webResources,
				"canSaveReport", true,
				"reportData", Map.of(
					"username", username,
					"wrongAnswers", wrongAnswers,
					"analysis", analysis,
					"webResources", webResources,
					"timestamp", System.currentTimeMillis()
				)
			));
			
		} catch (Exception e) {
			System.err.println("❌ Enhanced mistake analysis error: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.internalServerError()
				.body(Map.of(
					"analysis", "⚠️ An error occurred during analysis, but don't worry! Review the questions you missed and keep studying! 💪",
					"webResources", List.of(),
					"canSaveReport", false
				));
		} finally {
			UserDocumentRetriever.clearCurrentUsername();
		}
	}
	
	/**
	 * Generate friendly, encouraging analysis with emojis
	 */
	private String generateFriendlyAnalysis(String wrongAnswersText) {
		try {
			// Use a simple, friendly analysis prompt instead of complex template
			String analysisPrompt = String.format("""
				You are a friendly AI tutor helping a student improve their quiz performance.
				Provide encouraging, helpful feedback about their mistakes.
				
				The student got these questions wrong:
				%s
				
				Please provide:
				1. 🎯 A brief, encouraging assessment (2-3 sentences)
				2. 📚 Specific study recommendations for the topics they missed
				3. 💡 Study tips and strategies
				4. 🌟 Motivational message to keep them going
				
				Use emojis, keep it friendly and supportive. No more than 10 sentences total.
				Focus on helping them improve, not dwelling on mistakes.
				""", wrongAnswersText);
			
			String analysis = chatClient.prompt()
				.user(analysisPrompt)
				.call()
				.content();
			
			return analysis;
			
		} catch (Exception e) {
			System.err.println("Error generating friendly analysis: " + e.getMessage());
			// Fallback friendly message
			return """
				🎯 Don't worry about the mistakes - they're learning opportunities!
				
				📚 Here's what to focus on:
				• Review the specific topics from your incorrect answers
				• Take your time to understand the concepts, not just memorize
				• Use the web resources below for additional explanations
				
				💡 Study Tips:
				• Break down complex topics into smaller parts
				• Practice with different examples
				• Don't hesitate to revisit your course materials
				
				🌟 You're doing great by analyzing your mistakes! This shows you're committed to learning.
				Keep up the excellent effort and you'll master these topics! 💪
				""";
		}
	}
	
	/**
	 * Extract clean topic from question for better web search
	 */
	private String extractCleanTopicFromQuestion(String questionText) {
		if (questionText == null || questionText.trim().isEmpty()) {
			return "";
		}
		
		// Simple topic extraction focusing on key scientific terms
		String lowerText = questionText.toLowerCase();
		
		// Look for key biological/scientific terms
		if (lowerText.contains("cell theory")) return "cell theory";
		if (lowerText.contains("mitochondria")) return "mitochondria cellular respiration";
		if (lowerText.contains("mendelian genetics")) return "mendelian genetics inheritance";
		if (lowerText.contains("photosynthesis")) return "photosynthesis";
		if (lowerText.contains("dna")) return "DNA structure function";
		if (lowerText.contains("protein")) return "protein synthesis";
		if (lowerText.contains("evolution")) return "evolution natural selection";
		
		// Generic extraction - take meaningful words
		String[] words = questionText.toLowerCase()
			.replaceAll("\\b(what|which|how|why|when|where|does|do|is|are|the|of|in|for|about|following|best|describes)\\b", "")
			.trim()
			.split("\\s+");
		
		List<String> meaningfulWords = new ArrayList<>();
		for (String word : words) {
			if (word.length() > 3 && !word.matches("\\d+")) {
				meaningfulWords.add(word);
				if (meaningfulWords.size() >= 3) break; // Max 3 words
			}
		}
		
		return String.join(" ", meaningfulWords);
	}
	
	@PostMapping("/saveReport")
	public ResponseEntity<Map<String, String>> saveQuizReport(@RequestBody Map<String, Object> request) {
		try {
			String username = (String) request.getOrDefault("username", "burak");
			@SuppressWarnings("unchecked")
			Map<String, Object> reportData = (Map<String, Object>) request.get("reportData");
			
			if (reportData == null) {
				return ResponseEntity.badRequest()
					.body(Map.of("error", "Report data is required"));
			}
			
			System.out.println("💾 Saving quiz report for user: " + username);
			
			// Generate report content
			String reportContent = mcpIntegrationService.generateReportContent(reportData);
			
			// Save report using MCP File Server
			String filePath = mcpIntegrationService.saveReportToFile(username, reportContent);
			
			return ResponseEntity.ok(Map.of(
				"message", "📊 Quiz analysis report saved successfully! 🎉",
				"filePath", filePath,
				"username", username
			));
			
		} catch (Exception e) {
			System.err.println("❌ Save report error: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.internalServerError()
				.body(Map.of("error", "Failed to save report: " + e.getMessage()));
		}
	}
	
	private String getAnswerText(Map<String, String> options, int answerIndex) {
		String[] keys = {"A", "B", "C", "D"};
		if (answerIndex >= 0 && answerIndex < keys.length) {
			String key = keys[answerIndex];
			return key + ") " + options.get(key);
		}
		return "Unknown answer";
	}
}
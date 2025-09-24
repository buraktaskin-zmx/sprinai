package com.burak.openai.controller;

import com.burak.openai.model.QuizMistakeAnalysis;
import com.burak.openai.model.QuizResultRequest;
import com.burak.openai.model.QuizResultResponse;
import com.burak.openai.model.WrongAnswer;
import com.burak.openai.rag.UserDocumentRetriever;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizResultController {
	
	private final ChatClient chatClient;
	
	@Value("classpath:/promptTemplates/quizMistakeAnalysis.st")
	private Resource mistakeAnalysisTemplate;
	
	public QuizResultController(@Qualifier("quizChatClient") ChatClient chatClient) {
		this.chatClient = chatClient;
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
						i + 1, // questionNumber (1-based)
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
			return ResponseEntity.internalServerError().build();
		}
	}
	
	@PostMapping("/analyzeMistakes")
	public ResponseEntity<QuizMistakeAnalysis> analyzeMistakes(@RequestBody Map<String, Object> request) {
		try {
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> wrongAnswers = (List<Map<String, Object>>) request.get("wrongAnswers");
			String username = (String) request.getOrDefault("username", "burak");
			
			if (wrongAnswers == null || wrongAnswers.isEmpty()) {
				return ResponseEntity.ok(new QuizMistakeAnalysis(
					"Congratulations! You answered all questions correctly. Excellent performance!"
				));
			}
			
			// Set current username for retriever
			UserDocumentRetriever.setCurrentUsername(username);
			
			// Build wrong answers text for template
			StringBuilder wrongAnswersText = new StringBuilder();
			for (Map<String, Object> wrongAnswer : wrongAnswers) {
				wrongAnswersText.append("Question ").append(wrongAnswer.get("questionNumber")).append(": ")
					.append(wrongAnswer.get("questionText")).append("\n");
				wrongAnswersText.append("Correct Answer: ").append(wrongAnswer.get("correctAnswer")).append("\n");
				wrongAnswersText.append("Student's Answer: ").append(wrongAnswer.get("studentAnswer")).append("\n\n");
			}
			
			// Load and use template
			String template = mistakeAnalysisTemplate.getContentAsString(StandardCharsets.UTF_8);
			String prompt = template.replace("{wrongAnswersText}", wrongAnswersText.toString());
			
			String analysis = chatClient.prompt()
				.user(prompt)
				.call()
				.content();
			
			return ResponseEntity.ok(new QuizMistakeAnalysis(analysis));
			
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError()
				.body(new QuizMistakeAnalysis("An error occurred during analysis. Please try again."));
		} finally {
			UserDocumentRetriever.clearCurrentUsername();
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
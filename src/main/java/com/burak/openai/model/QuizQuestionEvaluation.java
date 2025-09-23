package com.burak.openai.model;

import java.util.Map;

public class QuizQuestionEvaluation {
	private String question;
	private Map<String, String> options;
	private Integer correctAnswer;
	
	// Constructors
	public QuizQuestionEvaluation() {}
	
	public QuizQuestionEvaluation(String question, Map<String, String> options, Integer correctAnswer) {
		this.question = question;
		this.options = options;
		this.correctAnswer = correctAnswer;
	}
	
	// Getters and Setters
	public String getQuestion() {
		return question;
	}
	
	public void setQuestion(String question) {
		this.question = question;
	}
	
	public Map<String, String> getOptions() {
		return options;
	}
	
	public void setOptions(Map<String, String> options) {
		this.options = options;
	}
	
	public Integer getCorrectAnswer() {
		return correctAnswer;
	}
	
	public void setCorrectAnswer(Integer correctAnswer) {
		this.correctAnswer = correctAnswer;
	}
}
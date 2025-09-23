package com.burak.openai.model;

import java.util.List;
import java.util.Map;

public class QuizResultRequest {
	private List<QuizQuestionEvaluation> questions;
	private Map<Integer, Integer> answers; // questionIndex -> answerIndex
	
	// Constructors
	public QuizResultRequest() {}
	
	public QuizResultRequest(List<QuizQuestionEvaluation> questions, Map<Integer, Integer> answers) {
		this.questions = questions;
		this.answers = answers;
	}
	
	// Getters and Setters
	public List<QuizQuestionEvaluation> getQuestions() {
		return questions;
	}
	
	public void setQuestions(List<QuizQuestionEvaluation> questions) {
		this.questions = questions;
	}
	
	public Map<Integer, Integer> getAnswers() {
		return answers;
	}
	
	public void setAnswers(Map<Integer, Integer> answers) {
		this.answers = answers;
	}
}
package com.burak.openai.model;

import java.util.List;

public class QuizResultResponse {
	private int totalQuestions;
	private int correctAnswers;
	private int wrongAnswers;
	private List<WrongAnswer> wrongAnswersList;
	
	// Constructors
	public QuizResultResponse() {}
	
	public QuizResultResponse(int totalQuestions, int correctAnswers, int wrongAnswers, List<WrongAnswer> wrongAnswersList) {
		this.totalQuestions = totalQuestions;
		this.correctAnswers = correctAnswers;
		this.wrongAnswers = wrongAnswers;
		this.wrongAnswersList = wrongAnswersList;
	}
	
	// Getters and Setters
	public int getTotalQuestions() {
		return totalQuestions;
	}
	
	public void setTotalQuestions(int totalQuestions) {
		this.totalQuestions = totalQuestions;
	}
	
	public int getCorrectAnswers() {
		return correctAnswers;
	}
	
	public void setCorrectAnswers(int correctAnswers) {
		this.correctAnswers = correctAnswers;
	}
	
	public int getWrongAnswers() {
		return wrongAnswers;
	}
	
	public void setWrongAnswers(int wrongAnswers) {
		this.wrongAnswers = wrongAnswers;
	}
	
	public List<WrongAnswer> getWrongAnswersList() {
		return wrongAnswersList;
	}
	
	public void setWrongAnswersList(List<WrongAnswer> wrongAnswersList) {
		this.wrongAnswersList = wrongAnswersList;
	}
}
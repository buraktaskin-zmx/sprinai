package com.burak.openai.model;

public class QuizMistakeAnalysis {
	private String analysis;
	
	// Constructors
	public QuizMistakeAnalysis() {}
	
	public QuizMistakeAnalysis(String analysis) {
		this.analysis = analysis;
	}
	
	// Getters and Setters
	public String getAnalysis() {
		return analysis;
	}
	
	public void setAnalysis(String analysis) {
		this.analysis = analysis;
	}
}
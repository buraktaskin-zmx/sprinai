package com.burak.openai.model;

public class WrongAnswer {
	private int questionNumber;
	private String questionText;
	private String correctAnswer;
	private String studentAnswer;
	
	// Constructors
	public WrongAnswer() {}
	
	public WrongAnswer(int questionNumber, String questionText, String correctAnswer, String studentAnswer) {
		this.questionNumber = questionNumber;
		this.questionText = questionText;
		this.correctAnswer = correctAnswer;
		this.studentAnswer = studentAnswer;
	}
	
	// Getters and Setters
	public int getQuestionNumber() {
		return questionNumber;
	}
	
	public void setQuestionNumber(int questionNumber) {
		this.questionNumber = questionNumber;
	}
	
	public String getQuestionText() {
		return questionText;
	}
	
	public void setQuestionText(String questionText) {
		this.questionText = questionText;
	}
	
	public String getCorrectAnswer() {
		return correctAnswer;
	}
	
	public void setCorrectAnswer(String correctAnswer) {
		this.correctAnswer = correctAnswer;
	}
	
	public String getStudentAnswer() {
		return studentAnswer;
	}
	
	public void setStudentAnswer(String studentAnswer) {
		this.studentAnswer = studentAnswer;
	}
}
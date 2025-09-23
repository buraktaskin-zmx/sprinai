package com.burak.openai.model;

public record QuizQuestion(
	String question,
	QuizOptions options,
	String answer
) {
}
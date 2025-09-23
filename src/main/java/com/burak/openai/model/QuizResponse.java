package com.burak.openai.model;


import java.util.List;

public record QuizResponse(List<QuizQuestion> questions) {
}
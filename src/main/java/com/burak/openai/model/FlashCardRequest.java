package com.burak.openai.model;

public class FlashCardRequest {
	private String message;
	private String username;
	private Integer cardCount;
	
	// Constructors
	public FlashCardRequest() {}
	
	public FlashCardRequest(String message, String username, Integer cardCount) {
		this.message = message;
		this.username = username;
		this.cardCount = cardCount;
	}
	
	// Getters and Setters
	public String getMessage() {
		return message;
	}
	
	public void setMessage(String message) {
		this.message = message;
	}
	
	public String getUsername() {
		return username;
	}
	
	public void setUsername(String username) {
		this.username = username;
	}
	
	public Integer getCardCount() {
		return cardCount;
	}
	
	public void setCardCount(Integer cardCount) {
		this.cardCount = cardCount;
	}
}

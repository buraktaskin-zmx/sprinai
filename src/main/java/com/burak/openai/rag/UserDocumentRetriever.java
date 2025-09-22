package com.burak.openai.rag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.rag.Query;
import org.springframework.ai.rag.retrieval.search.DocumentRetriever;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.util.Assert;

import java.util.List;

/**
 * Custom document retriever that filters documents by username to ensure
 * users can only access their own uploaded documents.
 */
public class UserDocumentRetriever implements DocumentRetriever {
	
	private static final Logger logger = LoggerFactory.getLogger(UserDocumentRetriever.class);
	
	private final VectorStore vectorStore;
	private final int topK;
	private final double similarityThreshold;
	
	// ThreadLocal to store current user context
	private static final ThreadLocal<String> currentUsername = new ThreadLocal<>();
	
	private UserDocumentRetriever(VectorStore vectorStore, int topK, double similarityThreshold) {
		Assert.notNull(vectorStore, "vectorStore cannot be null");
		this.vectorStore = vectorStore;
		this.topK = topK;
		this.similarityThreshold = similarityThreshold;
	}
	
	/**
	 * Set username for current thread
	 */
	public static void setCurrentUsername(String username) {
		currentUsername.set(username);
	}
	
	/**
	 * Clear username for current thread
	 */
	public static void clearCurrentUsername() {
		currentUsername.remove();
	}
	
	@Override
	public List<Document> retrieve(Query query) {
		Assert.notNull(query, "query cannot be null");
		
		String queryText = query.text();
		String username = currentUsername.get();
		if(username == null) {
			username = "burak";
		}
		
		Assert.hasText(queryText, "query text cannot be empty");
		Assert.hasText(username, "username must be provided via setCurrentUsername()");
		
		logger.info("Retrieving documents for user: {} with query: {}", username, queryText);
		
		try {
			// Create filter to only search user's documents
			var filterExpression = new FilterExpressionBuilder()
				.eq("username", username)
				.build();
			
			SearchRequest searchRequest = SearchRequest.builder()
				.query(queryText)
				.topK(topK)
				.similarityThreshold(similarityThreshold)
				.filterExpression(filterExpression)
				.build();
			
			List<Document> documents = vectorStore.similaritySearch(searchRequest);
			
			logger.info("Found {} documents for user: {}", documents.size(), username);
			
			return documents;
			
		} catch (Exception e) {
			logger.error("Error retrieving documents for user: {}", username, e);
			return List.of();
		}
	}
	
	public static Builder builder() {
		return new Builder();
	}
	
	public static class Builder {
		private VectorStore vectorStore;
		private int topK = 5;
		private double similarityThreshold = 0.3;
		
		private Builder() {}
		
		public Builder vectorStore(VectorStore vectorStore) {
			this.vectorStore = vectorStore;
			return this;
		}
		
		public Builder topK(int topK) {
			if (topK <= 0) {
				throw new IllegalArgumentException("topK must be greater than 0");
			}
			this.topK = topK;
			return this;
		}
		
		public Builder similarityThreshold(double threshold) {
			if (threshold < 0.0 || threshold > 1.0) {
				throw new IllegalArgumentException("similarityThreshold must be between 0.0 and 1.0");
			}
			this.similarityThreshold = threshold;
			return this;
		}
		
		public UserDocumentRetriever build() {
			Assert.notNull(vectorStore, "vectorStore must be set");
			return new UserDocumentRetriever(vectorStore, topK, similarityThreshold);
		}
	}
}
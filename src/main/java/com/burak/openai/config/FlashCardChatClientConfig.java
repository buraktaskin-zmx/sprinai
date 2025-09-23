// src/main/java/com/burak/openai/config/FlashCardChatClientConfig.java
package com.burak.openai.config;

import com.burak.openai.advisor.TokenUsageAuditAdvisor;
import com.burak.openai.rag.PIIMaskingDocumentPostProcessor;
import com.burak.openai.rag.UserDocumentRetriever;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.client.advisor.api.Advisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.rag.advisor.RetrievalAugmentationAdvisor;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.util.List;

@Configuration
public class FlashCardChatClientConfig {
	
	@Value("classpath:/promptTemplates/flashCardSystemPromptTemplate.st")
	Resource flashCardSystemTemplate;
	
	@Bean("flashCardChatClient")
	public ChatClient flashCardChatClient(ChatClient.Builder chatClientBuilder,
	                                      ChatMemory chatMemory,
	                                      VectorStore vectorStore) {
//
//		Advisor loggerAdvisor = new SimpleLoggerAdvisor();
//		Advisor memoryAdvisor = MessageChatMemoryAdvisor.builder(chatMemory).build();
		
		// Create RAG advisor for flashcard generation
		var flashCardRAGAdvisor = RetrievalAugmentationAdvisor.builder()
			.documentRetriever(UserDocumentRetriever.builder()
				.vectorStore(vectorStore)
				.topK(15)  // More documents for flashcard generation
				.similarityThreshold(0.4)  // Lower threshold for more content
				.build())
			.documentPostProcessors(PIIMaskingDocumentPostProcessor.builder())
			.build();
		
		// Chat options optimized for flashcard generation
		ChatOptions chatOptions = ChatOptions.builder()
			.model("gpt-3.5-turbo")
			.temperature(0.4)  // Balanced creativity and consistency
			.build();
		
		return chatClientBuilder
			.defaultOptions(chatOptions)
			.defaultSystem(flashCardSystemTemplate)
			.defaultAdvisors(List.of( flashCardRAGAdvisor))
			.build();
	}
}
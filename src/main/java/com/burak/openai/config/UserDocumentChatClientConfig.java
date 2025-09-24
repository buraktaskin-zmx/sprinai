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
public class UserDocumentChatClientConfig {
	
	@Value("classpath:/promptTemplates/userDocumentSystemPromptTemplate.st")
	Resource userDocumentSystemTemplate;
	
	@Bean("userDocumentChatClient")
	public ChatClient userDocumentChatClient(ChatClient.Builder chatClientBuilder,
	                                         ChatMemory chatMemory,
	                                         VectorStore vectorStore) {
		
		Advisor memoryAdvisor = MessageChatMemoryAdvisor.builder(chatMemory).build();
		
		// Create RAG advisor with improved configuration
		var userDocumentRAGAdvisor = RetrievalAugmentationAdvisor.builder()
			.documentRetriever(UserDocumentRetriever.builder()
				.vectorStore(vectorStore)
				.topK(10)  // Daha fazla doküman getir
				.similarityThreshold(0.5)  // Threshold'u düşür
				.build())
			.documentPostProcessors(PIIMaskingDocumentPostProcessor.builder())
			.build();
		
		ChatOptions chatOptions = ChatOptions.builder()
			.model("gpt-4o-mini")  // GPT-4 kullan
			.temperature(0.5)  // Düşük temperature ile daha tutarlı sonuçlar
			.build();
		
		return chatClientBuilder
			.defaultOptions(chatOptions)
			.defaultSystem(userDocumentSystemTemplate)
			.defaultAdvisors(List.of( memoryAdvisor, userDocumentRAGAdvisor))
			.build();
	}
}
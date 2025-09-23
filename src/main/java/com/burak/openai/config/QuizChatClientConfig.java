package com.burak.openai.config;

import com.burak.openai.advisor.TokenUsageAuditAdvisor;
import com.burak.openai.rag.PIIMaskingDocumentPostProcessor;
import com.burak.openai.rag.UserDocumentRetriever;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.client.advisor.api.Advisor;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.rag.advisor.RetrievalAugmentationAdvisor;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.util.List;

@Configuration
public class QuizChatClientConfig {
	
	@Value("classpath:/promptTemplates/quizSystemPromptTemplate.st")
	Resource quizSystemTemplate;
	
	// VectorStore'u autowire et (UserDocumentChatClientConfig'de tanımlı)
	@Autowired
	private VectorStore vectorStore;
	
	@Bean("quizChatClient")
	public ChatClient quizChatClient(ChatClient.Builder chatClientBuilder) {
		
		
		var quizRAGAdvisor = RetrievalAugmentationAdvisor.builder()
			.documentRetriever(UserDocumentRetriever.builder()
				.vectorStore(vectorStore)
				.topK(20)  // Quiz için daha fazla doküman
				.similarityThreshold(0.5) //00.3  // Düşük threshold, daha
				// fazla
				// içerik
				.build())
			.documentPostProcessors(PIIMaskingDocumentPostProcessor.builder())
			.build();
		
		// Quiz için optimize edilmiş chat options
		ChatOptions quizChatOptions = ChatOptions.builder()
			.model("gpt-4")  // Hızlı ve ekonomik
			.temperature(0.1)        // Tutarlı JSON output için çok düşük
			.maxTokens(2500)         // Response token limitini kontrol et
			.topP(0.9)               // Daha deterministik sonuçlar
			.frequencyPenalty(0.0)   // Tekrar azaltma yok
			.presencePenalty(0.0)    // Yeni konu teşviki yok
			.build();
		
		return chatClientBuilder
			.defaultOptions(quizChatOptions)
			.defaultSystem(quizSystemTemplate)
			.defaultAdvisors(List.of( quizRAGAdvisor))
			.build();
	}
	
	/**
	 * Quiz fallback için minimal token kullanımlı client
	 */
	@Bean("quizFallbackChatClient")
	public ChatClient quizFallbackChatClient(ChatClient.Builder chatClientBuilder) {
		
		// Sadece temel advisor
		
		// Minimal token kullanımı için çok sınırlı options
		ChatOptions fallbackOptions = ChatOptions.builder()
			.model("gpt-3.5-turbo")
			.temperature(0.5)        // Maximum deterministic
			.maxTokens(10000)         // Çok düşük limit
			.topP(0.8)
			.build();
		
		return chatClientBuilder
			.defaultOptions(fallbackOptions)
			.defaultSystem("""
                You are a quiz generator. Create simple multiple choice questions in JSON format.
                Always return valid JSON structure.
                """)
			.build();
	}
	
	/**
	 * Quiz içerik analizi için özel client (doküman özetleme)
	 */
	@Bean("quizContentAnalyzerClient")
	public ChatClient quizContentAnalyzerClient(ChatClient.Builder chatClientBuilder) {
		
		// İçerik analizi için RAG advisor
		var contentAnalyzerRAGAdvisor = RetrievalAugmentationAdvisor.builder()
			.documentRetriever(UserDocumentRetriever.builder()
				.vectorStore(vectorStore)
				.topK(15)  // Orta seviye doküman getirme
				.similarityThreshold(0.4)
				.build())
			.build();
		
		// İçerik özetleme için optimize options
		ChatOptions contentOptions = ChatOptions.builder()
			.model("gpt-3.5-turbo")
			.temperature(0.5)
			.maxTokens(1500)  // Özetler için yeterli
			.build();
		
		return chatClientBuilder
			.defaultOptions(contentOptions)
			.defaultSystem("""
                You are a document content analyzer for quiz generation.
                Summarize document content focusing on key facts, concepts,
                definitions, processes, and important details that can be
                used for quiz questions. Be concise and structured.
                """)
			.defaultAdvisors(List.of(contentAnalyzerRAGAdvisor))
			.build();
	}
}
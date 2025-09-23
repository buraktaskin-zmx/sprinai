// src/main/java/com/burak/openai/controller/FlashCardController.java
package com.burak.openai.controller;

import com.burak.openai.model.FlashCardRequest;
import com.burak.openai.model.FlashCardResponse;
import com.burak.openai.rag.UserDocumentRetriever;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/flashcards")
@CrossOrigin(origins = "http://localhost:3000")
public class FlashCardController {
	
	private final ChatClient chatClient;
	private final ObjectMapper objectMapper;
	
	public FlashCardController(@Qualifier("userDocumentChatClient") ChatClient chatClient,
	                           ObjectMapper objectMapper) {
		this.chatClient = chatClient;
		this.objectMapper = objectMapper;
	}
	
	@PostMapping("/generate")
	public ResponseEntity<String> generateFlashCards(@RequestBody FlashCardRequest request) {
		String username = request.getUsername() != null ? request.getUsername() : "burak";
		String userMessage = request.getMessage();
		Integer cardCount = request.getCardCount() != null ? request.getCardCount() : 10;
		
		System.out.println("=== FLASHCARD GENERATION ===");
		System.out.println("Username: " + username);
		System.out.println("Request: " + userMessage);
		System.out.println("Card Count: " + cardCount);
		
		if (userMessage == null || userMessage.trim().isEmpty()) {
			return ResponseEntity.badRequest()
				.body("{\"error\": \"Mesaj boş olamaz. Lütfen ne tür flashcard istediğinizi belirtin.\"}");
		}
		
		try {
			// Set current username for retriever
			UserDocumentRetriever.setCurrentUsername(username);
			
			// İlk olarak doküman içeriğini alalım
			String contentQuery = "Bu dokümanda hangi konular, kavramlar, formüller, tanımlar ve önemli bilgiler var? Mümkün olduğunce detaylı listele.";
			
			String documentContent = chatClient.prompt()
				.user(contentQuery)
				.call()
				.content();
			
			System.out.println("Document content length: " + documentContent.length());
			
			// Eğer doküman içeriği bulunamadıysa
			if (documentContent.length() < 100 ||
				documentContent.contains("Bu sorunun cevabı") ||
				documentContent.contains("I don't know") ||
				documentContent.toLowerCase().contains("bulunmuyor")) {
				
				System.out.println("ERROR: No valid document content found");
				return ResponseEntity.ok("{\"error\": \"Doküman içeriği bulunamadı. Lütfen önce bir doküman yükleyin.\"}");
			}
			
			// FlashCard generation prompt
			String flashCardPrompt = String.format("""
                Yüklenen doküman içeriğinden %d adet FlashCard oluştur. Kullanıcı talebi: "%s"
                
                DOKÜMAN İÇERİĞİ:
                %s
                
                FLASHCARD KURALLARI:
                1. Her flashcard'ın "front" (ön yüz) ve "back" (arka yüz) kısmı olmalı
                2. Front kısmı: Soru, kavram, formül adı veya terim olacak
                3. Back kısmı: Açıklama, tanım, formül veya cevap olacak
                4. Kullanıcının talebine göre flashcard tipini belirle (formül, kelime-anlam, soru-cevap vs.)
                5. Tüm bilgiler dokümandan alınmalı - genel bilgi kullanma
                6. Kısa ve öğrenmeye uygun olmalı
                
                FLASHCARD TİP ÖRNEKLERİ:
                
                FORMÜL TİPİ:
                - Front: "Güç Formülü"
                - Back: "P = V × I (Güç = Gerilim × Akım)"
                
                KELİME-ANLAM TİPİ:
                - Front: "Prokaryot"
                - Back: "Çekirdeği olmayan, genetik materyali sitoplazmada serbest bulunan hücre tipi"
                
                SORU-CEVAP TİPİ:
                - Front: "Fotosentez nerede gerçekleşir?"
                - Back: "Bitkilerin kloroplastlarında gerçekleşir"
                
                TARİH TİPİ:
                - Front: "1453"
                - Back: "İstanbul'un fethedildiği yıl"
                
                Kullanıcı talebine uygun %d adet flashcard oluştur ve JSON formatında döndür.
                """, cardCount, userMessage, documentContent, cardCount);
			
			System.out.println("Generating flashcards...");
			
			// Structured output ile flashcard oluştur
			FlashCardResponse flashCardResponse = chatClient.prompt()
				.options(ChatOptions.builder()
					.temperature(0.3)
					.model("gpt-3.5-turbo")
					.build())
				.user(flashCardPrompt)
				.call()
				.entity(FlashCardResponse.class);
			
			System.out.println("FlashCards generated successfully with " + flashCardResponse.flashcards().size() + " cards");
			
			// JSON'a çevir ve döndür
			String jsonResponse = objectMapper.writeValueAsString(flashCardResponse);
			System.out.println("Final JSON length: " + jsonResponse.length());
			
			return ResponseEntity.ok(jsonResponse);
			
		} catch (Exception e) {
			System.err.println("=== FLASHCARD GENERATION ERROR ===");
			e.printStackTrace();
			return ResponseEntity.internalServerError()
				.body("{\"error\": \"FlashCard oluşturulurken hata: " + e.getMessage() + "\"}");
		} finally {
			UserDocumentRetriever.clearCurrentUsername();
		}
	}
}
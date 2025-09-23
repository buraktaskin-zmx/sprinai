package com.burak.openai.controller;

import com.burak.openai.model.QuizResponse;
import com.burak.openai.rag.UserDocumentRetriever;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizController {
	
	private final ChatClient chatClient;
	private final ObjectMapper objectMapper;
	
	public QuizController(@Qualifier("userDocumentChatClient") ChatClient chatClient,
	                      ObjectMapper objectMapper) {
		this.chatClient = chatClient;
		this.objectMapper = objectMapper;
	}
	
	@PostMapping("/generate-structured")
	public ResponseEntity<String> generateStructuredQuiz(@RequestBody Map<String, Object> request) {
		String username = (String) request.getOrDefault("username", "burak");
		Integer questionCount = (Integer) request.getOrDefault("questionCount", 5);
		String difficulty = (String) request.getOrDefault("difficulty", "orta");
		
		System.out.println("=== ENHANCED STRUCTURED QUIZ GENERATION ===");
		System.out.println("Username: " + username);
		System.out.println("Question Count: " + questionCount);
		
		try {
			// Set current username for retriever
			UserDocumentRetriever.setCurrentUsername(username);
			
			// İlk olarak doküman içeriğini alalım
			String contentQuery = "Bu dokümanda hangi konular anlatılıyor? Tüm önemli bilgileri, tanımları, süreçleri, sayıları ve detayları listele. Mümkün olduğunca kapsamlı bil.";
			
			String documentContent = chatClient.prompt()
				.user(contentQuery)
				.call()
				.content();
			
			System.out.println("Document content length: " + documentContent.length());
			System.out.println("First 300 chars: " + documentContent.substring(0, Math.min(300, documentContent.length())));
			
			// Eğer doküman içeriği bulunamadıysa
			if (documentContent.length() < 100 ||
				documentContent.contains("Bu sorunun cevabı") ||
				documentContent.contains("I don't know") ||
				documentContent.toLowerCase().contains("bulunmuyor")) {
				
				System.out.println("ERROR: No valid document content found");
				return ResponseEntity.ok("{\"error\": \"Doküman içeriği bulunamadı. Lütfen önce bir doküman yükleyin.\"}");
			}
			
			// GELİŞTİRİLMİŞ PROMPT - ÖRNEK SORULARLA
			String enhancedQuizPrompt = String.format("""
				Aşağıdaki GERÇEK doküman içeriğinden %d adet %s seviyesinde DETAYLI çoktan seçmeli sorular oluştur.
				
				DOKÜMAN İÇERİĞİ:
				%s
				
				KALİTE KURALLARI:
				1. Sorular dokümandaki SPESİFİK bilgileri test etmeli - genel kültür değil
				2. Her soru UZUN ve DETAYLI olmalı - açıklayıcı cümleler içermeli
				3. Doğru cevap kesinlikle dokümanda geçmeli
				4. Yanlış şıklar da dokümandaki diğer bilgilerden alınmalı (mantıklı yanıltmaca)
				5. "Kavram 1", "Seçenek A" gibi generic ifadeler YASAK
				
				İDEAL SORU ÖRNEKLERİ:
				
				ÖRNEK 1 (Bilimsel/Teknik Doküman için):
				{
				  "question": "Prokaryot hücrelerle ilgili olarak, bu hücre tipinin yapısal özelliklerinden hangisi ökaryot hücrelerden ayıran temel farklılıktır ve bu durum hücrenin hangi işlevsel özelliğini doğrudan etkiler?",
				  "options": {
				    "A": "Çekirdek zarının bulunmaması ve genetik materyalin sitoplazmada serbest halde bulunması",
				    "B": "Mitokondri organelinin varlığı ve ATP üretim sürecinin farklı olması",
				    "C": "Hücre duvarının kimyasal yapısı ve çevre koşullarına dayanıklılığı",
				    "D": "Ribozomların boyutsal farklılığı ve protein sentez mekanizmasının değişkenliği"
				  },
				  "answer": "A"
				}
				
				ÖRNEK 2 (İş/Politika Dokümanı için):
				{
				  "question": "Şirkettin esnek çalışma saatleri politikasına göre, standart 2:00 PM - 11:00 PM mesai saatleri dışında çalışmak isteyen bir çalışanın hangi süreci takip etmesi gerekir ve bu durumda hangi yükümlülükleri vardır?",
				  "options": {
				    "A": "Yönetici onayı alması gerekir ve geç geliş/erken ayrılış durumlarını önceden bildirmelidir",
				    "B": "İnsan kaynakları departmanına başvurması ve haftalık çalışma saatlerini yeniden planlaması gerekir",
				    "C": "Doğrudan esnek saatlere geçebilir ancak toplam haftalık çalışma süresini korumalıdır",
				    "D": "Sadece Pazartesi-Cuma günleri için geçerli olan bu düzenlemeyi weekend mesailerine de uygulamalıdır"
				  },
				  "answer": "A"
				}
				
				SORU YAZIM KURALLARI:
				- Sorular minimum 20-25 kelime olmalı
				- "Hangi durumda", "Ne şekilde", "Nasıl bir süreç" gibi detay soran ifadeler kullan
				- Şıklar dokümandaki gerçek terimler/kavramlar içermeli
				- Her şık 8-15 kelime arası olmalı
				- Doğru cevap açık ve kesin olmalı
				
				%d soru oluştur. JSON formatında döndür.
				""", questionCount, difficulty, documentContent, questionCount);
			
			System.out.println("Generating enhanced quiz with examples...");
			
			// Structured output ile quiz oluştur
			QuizResponse quizResponse = chatClient.prompt()
				.options(ChatOptions.builder()
					.temperature(0.2)  // Biraz daha yaratıcılık için artırdık
					.model("gpt-4")    // Daha iyi model
					.build())
				.user(enhancedQuizPrompt)
				.call()
				.entity(QuizResponse.class);
			
			System.out.println("Enhanced quiz generated successfully with " + quizResponse.questions().size() + " questions");
			
			// JSON'a çevir ve döndür
			String jsonResponse = objectMapper.writeValueAsString(quizResponse);
			System.out.println("Final enhanced JSON length: " + jsonResponse.length());
			
			return ResponseEntity.ok(jsonResponse);
			
		} catch (Exception e) {
			System.err.println("=== ENHANCED QUIZ GENERATION ERROR ===");
			e.printStackTrace();
			return ResponseEntity.internalServerError()
				.body("{\"error\": \"Quiz oluşturulurken hata: " + e.getMessage() + "\"}");
		} finally {
			UserDocumentRetriever.clearCurrentUsername();
		}
	}
	
	// Diğer endpoint'ler
	@PostMapping("/generate-rag")
	public ResponseEntity<String> generateQuizWithRAG(@RequestBody Map<String, Object> request) {
		return generateStructuredQuiz(request);
	}
	
	@PostMapping("/generate")
	public ResponseEntity<String> generateQuiz(@RequestBody Map<String, Object> request) {
		return generateStructuredQuiz(request);
	}
	
	
	
	
	
}
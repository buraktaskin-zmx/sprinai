package com.burak.openai.service;

import com.burak.openai.entity.UserDocument;
import com.burak.openai.repository.UserDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TextSplitter;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {
	
	private final VectorStore vectorStore;
	private final UserDocumentRepository userDocumentRepository;
	
	public String uploadDocument(String username, MultipartFile file) {
		try {
			log.info("Uploading document for user: {}, filename: {}, size: {} bytes",
				username, file.getOriginalFilename(), file.getSize());
			
			// Generate unique document ID
			String documentId = UUID.randomUUID().toString();
			
			// Save document metadata to database
			UserDocument userDocument = UserDocument.builder()
				.documentId(documentId)
				.username(username)
				.originalFilename(file.getOriginalFilename())
				.contentType(file.getContentType())
				.fileSize(file.getSize())
				.uploadDate(LocalDateTime.now())
				.build();
			
			userDocumentRepository.save(userDocument);
			
			// Process document with Tika
			ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
				@Override
				public String getFilename() {
					return file.getOriginalFilename();
				}
			};
			
			TikaDocumentReader tikaReader = new TikaDocumentReader(resource);
			List<Document> documents = tikaReader.get();
			
			log.info("Tika extracted {} documents from file", documents.size());
			
			// Log original content
			for (int i = 0; i < documents.size(); i++) {
				Document doc = documents.get(i);
				log.info("Original document {}: length={}, preview={}",
					i, doc.getText().length(),
					doc.getText().substring(0, Math.min(200, doc.getText().length())));
			}
			
			// Add metadata to each document chunk
			documents.forEach(doc -> {
				doc.getMetadata().put("username", username);
				doc.getMetadata().put("documentId", documentId);
				doc.getMetadata().put("originalFilename", file.getOriginalFilename());
				doc.getMetadata().put("uploadDate", LocalDateTime.now().toString());
				doc.getMetadata().put("contentType", file.getContentType());
			});
			
			TextSplitter textSplitter = TokenTextSplitter.builder()
				.withChunkSize(300)
				// 1000'e)
				     // Chunk'lar arası overlap ekle
				.withMaxNumChunks(5000)
				.withKeepSeparator(true)
				.build();
			
			List<Document> splitDocuments = textSplitter.split(documents);
			
			log.info("Text splitting resulted in {} chunks", splitDocuments.size());
			
			// Her chunk'u logla (debug için)
			for (int i = 0; i < Math.min(5, splitDocuments.size()); i++) {
				Document chunk = splitDocuments.get(i);
				log.info("Chunk {}: length={}, content={}",
					i, chunk.getText().length(),
					chunk.getText().substring(0, Math.min(150, chunk.getText().length())));
			}
			
			// Store in vector database
			vectorStore.add(splitDocuments);
			
			log.info("Document processing completed successfully. DocumentId: {}, Original docs: {}, Final chunks: {}",
				documentId, documents.size(), splitDocuments.size());
			
			return documentId;
			
		} catch (IOException e) {
			log.error("Error processing document for user: {}", username, e);
			throw new RuntimeException("Error processing document: " + e.getMessage());
		} catch (Exception e) {
			log.error("Unexpected error processing document for user: {}", username, e);
			throw new RuntimeException("Unexpected error: " + e.getMessage());
		}
	}
	
	public List<UserDocument> getUserDocuments(String username) {
		log.info("Fetching documents for user: {}", username);
		return userDocumentRepository.findByUsernameOrderByUploadDateDesc(username);
	}
	
	public void deleteDocument(String username, String documentId) {
		log.info("Deleting document: {} for user: {}", documentId, username);
		
		UserDocument document = userDocumentRepository.findByUsernameAndDocumentId(username, documentId)
			.orElseThrow(() -> new RuntimeException("Document not found or access denied"));
		
		userDocumentRepository.delete(document);
		
		
		log.info("Document deleted successfully: {}", documentId);
	}
}
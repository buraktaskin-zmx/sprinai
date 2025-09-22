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
			log.info("Uploading document for user: {}, filename: {}", username, file.getOriginalFilename());
			
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
			
			// Add metadata to each document chunk
			documents.forEach(doc -> {
				doc.getMetadata().put("username", username);
				doc.getMetadata().put("documentId", documentId);
				doc.getMetadata().put("originalFilename", file.getOriginalFilename());
				doc.getMetadata().put("uploadDate", LocalDateTime.now().toString());
			});
			
			// Split documents into chunks
			TextSplitter textSplitter = TokenTextSplitter.builder()
				.withChunkSize(200)
				.withMaxNumChunks(400)
				.build();
			
			List<Document> splitDocuments = textSplitter.split(documents);
			
			// Store in vector database
			vectorStore.add(splitDocuments);
			
			log.info("Document processed successfully. DocumentId: {}, Chunks: {}",
				documentId, splitDocuments.size());
			
			return documentId;
			
		} catch (IOException e) {
			log.error("Error processing document for user: {}", username, e);
			throw new RuntimeException("Error processing document: " + e.getMessage());
		}
	}
	
	public List<UserDocument> getUserDocuments(String username) {
		log.info("Fetching documents for user: {}", username);
		return userDocumentRepository.findByUsernameOrderByUploadDateDesc(username);
	}
	
	public void deleteDocument(String username, String documentId) {
		log.info("Deleting document: {} for user: {}", documentId, username);
		
		// Verify document belongs to user
		UserDocument document = userDocumentRepository.findByUsernameAndDocumentId(username, documentId)
			.orElseThrow(() -> new RuntimeException("Document not found or access denied"));
		
		// Delete from database
		userDocumentRepository.delete(document);
		
		// Note: Qdrant doesn't have a direct way to delete by metadata filter
		// For production, you might want to implement a more sophisticated cleanup strategy
		log.info("Document deleted successfully: {}", documentId);
	}
}
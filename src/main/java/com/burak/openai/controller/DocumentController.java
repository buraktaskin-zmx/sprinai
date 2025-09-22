package com.burak.openai.controller;

import com.burak.openai.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {
	
	private final DocumentService documentService;
	
	public DocumentController(DocumentService documentService) {
		this.documentService = documentService;
	}
	
	@PostMapping("/upload")
	public ResponseEntity<Map<String, String>> uploadDocument(
		@RequestHeader(value = "username", defaultValue = "burak") String username,
		@RequestParam("file") MultipartFile file) {
		
		String documentId = documentService.uploadDocument(username, file);
		
		return ResponseEntity.ok(Map.of(
			"message", "Document uploaded successfully",
			"documentId", documentId,
			"filename", file.getOriginalFilename()
		));
	}
	
	@GetMapping("/user-documents")
	public ResponseEntity<Map<String, Object>> getUserDocuments(
		@RequestHeader("username") String username) {
		
		var documents = documentService.getUserDocuments(username);
		
		return ResponseEntity.ok(Map.of(
			"username", username,
			"documents", documents
		));
	}
	
	@DeleteMapping("/{documentId}")
	public ResponseEntity<Map<String, String>> deleteDocument(
		@RequestHeader("username") String username,
		@PathVariable String documentId) {
		
		documentService.deleteDocument(username, documentId);
		
		return ResponseEntity.ok(Map.of(
			"message", "Document deleted successfully",
			"documentId", documentId
		));
	}
}
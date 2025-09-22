package com.burak.openai.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_documents")
public class UserDocument {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "document_id", unique = true, nullable = false)
	private String documentId;
	
	@Column(name = "username", nullable = false)
	private String username;
	
	@Column(name = "original_filename", nullable = false)
	private String originalFilename;
	
	@Column(name = "content_type")
	private String contentType;
	
	@Column(name = "file_size")
	private Long fileSize;
	
	@Column(name = "upload_date", nullable = false)
	private LocalDateTime uploadDate;
	
	@Column(name = "status")
	private String status = "ACTIVE"; // ACTIVE, DELETED
}
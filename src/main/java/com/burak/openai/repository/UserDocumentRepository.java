package com.burak.openai.repository;

import com.burak.openai.entity.UserDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDocumentRepository extends JpaRepository<UserDocument, Long> {
	
	List<UserDocument> findByUsernameOrderByUploadDateDesc(String username);
	
	Optional<UserDocument> findByUsernameAndDocumentId(String username, String documentId);
	
	List<UserDocument> findByDocumentId(String documentId);
	
	void deleteByDocumentId(String documentId);
}
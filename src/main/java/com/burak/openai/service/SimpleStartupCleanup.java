package com.burak.openai.service;

import com.burak.openai.repository.HelpDeskTicketRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
public class SimpleStartupCleanup {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(SimpleStartupCleanup.class);
	
	private final HelpDeskTicketRepository helpDeskTicketRepository;
	
	@PostConstruct
	public void removeTestTicket() {
		try {
			LOGGER.info("🧹 Removing test login ticket...");
			
			// Spesifik test ticket'ını sil
			String testIssue = "User is unable to log in to their account.";
			helpDeskTicketRepository.deleteByIssue(testIssue);
			
			LOGGER.info("✅ Test ticket cleanup completed");
			
		} catch (Exception e) {
			LOGGER.warn("⚠️ Could not delete test ticket: {}", e.getMessage());
			// Hata durumunda uygulama çökmemeli, sadece log at
		}
	}
}
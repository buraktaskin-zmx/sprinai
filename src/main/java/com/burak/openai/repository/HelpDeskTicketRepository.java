package com.burak.openai.repository;

import com.burak.openai.entity.HelpDeskTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HelpDeskTicketRepository extends JpaRepository<HelpDeskTicket, Long> {
	
	List<HelpDeskTicket> findByUsername(String username);
}
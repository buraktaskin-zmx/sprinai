package com.burak.openai.repository;

import com.burak.openai.entity.HelpDeskTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface HelpDeskTicketRepository extends JpaRepository<HelpDeskTicket, Long> {
	
	List<HelpDeskTicket> findByUsername(String username);
	
	// New methods for cleanup operations
	List<HelpDeskTicket> findByIssue(String issue);
	
	List<HelpDeskTicket> findByCreatedAtBefore(LocalDateTime date);
	
	List<HelpDeskTicket> findByUsernameAndIssue(String username, String issue);
	
	@Query("SELECT h FROM HelpDeskTicket h WHERE LOWER(h.issue) LIKE LOWER(CONCAT('%', :pattern, '%'))")
	List<HelpDeskTicket> findByIssueContainingIgnoreCase(@Param("pattern") String pattern);
	
	@Query("SELECT h FROM HelpDeskTicket h WHERE h.status = :status AND h.createdAt < :date")
	List<HelpDeskTicket> findByStatusAndCreatedAtBefore(@Param("status") String status, @Param("date") LocalDateTime date);
	
	// Delete methods
	void deleteByIssue(String issue);
	
	void deleteByUsernameAndIssue(String username, String issue);
	
	@Query("DELETE FROM HelpDeskTicket h WHERE LOWER(h.issue) LIKE LOWER(CONCAT('%', :pattern, '%'))")
	void deleteByIssueContainingIgnoreCase(@Param("pattern") String pattern);
}
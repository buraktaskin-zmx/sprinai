package com.burak.openai.tools;

import com.burak.openai.entity.HelpDeskTicket;
import com.burak.openai.model.TicketRequest;
import com.burak.openai.service.HelpDeskTicketService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
public class HelpDeskTools {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(HelpDeskTools.class);
	
	private final HelpDeskTicketService service;
	
	@Tool(name = "createSupportTicket",
		description = "Create a support ticket for technical issues, bugs, or feature requests. Use this when the user reports a problem that needs technical attention.")
	String createTicket(@ToolParam(description = "Detailed description of the issue or problem reported by the user")
	                    String issueDescription, ToolContext toolContext) {
		String username = (String) toolContext.getContext().get("username");
		LOGGER.info("Creating support ticket for user: {} with issue: {}", username, issueDescription);
		
		try {
			TicketRequest ticketRequest = new TicketRequest(issueDescription);
			HelpDeskTicket savedTicket = service.createTicket(ticketRequest, username);
			
			LOGGER.info("Ticket created successfully. Ticket ID: {}, Username: {}", savedTicket.getId(), savedTicket.getUsername());
			
			String eta = savedTicket.getEta() != null ?
				savedTicket.getEta().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) :
				"within 7 days";
			
			return String.format("""
				✅ Support ticket created successfully!
				
				🎫 **Ticket #%d**
				👤 **User:** %s
				📝 **Issue:** %s
				📅 **Created:** %s
				⏰ **Estimated Resolution:** %s
				
				Our technical team will review your issue and get back to you soon.
				You can check your ticket status anytime by asking me about it! 😊
				""",
				savedTicket.getId(),
				savedTicket.getUsername(),
				savedTicket.getIssue(),
				savedTicket.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
				eta
			);
		} catch (Exception e) {
			LOGGER.error("Error creating ticket for user: {}", username, e);
			return "❌ I encountered an error while creating your support ticket. Please try again or contact support directly.";
		}
	}
	
	@Tool(name = "checkTicketStatus",
		description = "Check the current status of all support tickets for the user. Use this when user asks about their ticket status or wants to see their existing tickets.")
	String getTicketStatus(ToolContext toolContext) {
		String username = (String) toolContext.getContext().get("username");
		LOGGER.info("Fetching tickets for user: {}", username);
		
		try {
			List<HelpDeskTicket> tickets = service.getTicketsByUsername(username);
			LOGGER.info("Found {} tickets for user: {}", tickets.size(), username);
			
			if (tickets.isEmpty()) {
				return """
					📋 **Your Support Tickets**
					
					You don't have any support tickets yet.
					If you're experiencing any issues with the app, feel free to let me know and I'll create a ticket for you! 😊
					""";
			}
			
			StringBuilder response = new StringBuilder();
			response.append("📋 **Your Support Tickets**\n\n");
			
			for (HelpDeskTicket ticket : tickets) {
				String statusEmoji = getStatusEmoji(ticket.getStatus());
				String eta = ticket.getEta() != null ?
					ticket.getEta().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) :
					"TBD";
				
				response.append(String.format("""
					🎫 **Ticket #%d** %s
					📝 **Issue:** %s
					📅 **Created:** %s
					⏰ **ETA:** %s
					
					""",
					ticket.getId(),
					statusEmoji,
					ticket.getIssue(),
					ticket.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
					eta
				));
			}
			
			response.append("Need help with any of these tickets? Just let me know! 😊");
			return response.toString();
			
		} catch (Exception e) {
			LOGGER.error("Error fetching tickets for user: {}", username, e);
			return "❌ I couldn't retrieve your ticket information right now. Please try again in a moment.";
		}
	}
	
	/**
	 * Helper method to get appropriate emoji for ticket status
	 */
	private String getStatusEmoji(String status) {
		return switch (status.toUpperCase()) {
			case "OPEN" -> "🟡 **OPEN**";
			case "IN_PROGRESS" -> "🟠 **IN PROGRESS**";
			case "CLOSED" -> "🟢 **CLOSED**";
			case "RESOLVED" -> "✅ **RESOLVED**";
			default -> "⚪ **" + status + "**";
		};
	}
}
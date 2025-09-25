package com.burak.openai.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration

public class MCPConfig {
	
	@Value("${mcp.integration.enabled:true}")
	private boolean mcpIntegrationEnabled;
	
	@Value("${mcp.tavily.search.max-results:5}")
	private int tavilyMaxResults;
	
	@Value("${mcp.file.save.base-path:D:/Users/taskin/Desktop/Deneme}")
	private String fileBasePath;
	
	// ChatModel'i autowire ediyoruz
	@Autowired
	private ChatModel chatModel;
	
	/**
	 * Enhanced MCP Chat Client for quiz analysis and file operations
	 * ToolCallbackProvider'ı optional yapıyoruz çünkü MCP aktif değilse olmayabilir
	 */
	@Bean("mcpEnhancedChatClient")
	@ConditionalOnProperty(name = "mcp.integration.enabled", havingValue = "true", matchIfMissing = true)
	public ChatClient mcpEnhancedChatClient(@Autowired(required = false) ToolCallbackProvider toolCallbackProvider) {
		ChatClient.Builder builder = ChatClient.builder(chatModel);
		
		if (!mcpIntegrationEnabled || toolCallbackProvider == null) {
			// Return a basic client if MCP is disabled or ToolCallbackProvider is not available
			return builder
				.defaultAdvisors(new SimpleLoggerAdvisor())
				.defaultSystem("""
                    You are a helpful AI assistant for educational purposes.
                    You can help with quiz analysis and provide study recommendations.
                    """)
				.build();
		}
		
		return builder
			.defaultToolCallbacks(toolCallbackProvider)
			.defaultAdvisors(new SimpleLoggerAdvisor())
			.defaultSystem("""
                You are an AI assistant with access to web search and file management capabilities.
                
                For web searches:
                - Use Tavily to find educational resources, tutorials, and study materials
                - Focus on high-quality, educational content
                - Provide URLs and detailed descriptions when available
                - Limit results to most relevant and helpful resources
                
                For file operations:
                - Save files with descriptive names including timestamps
                - Create well-formatted text reports
                - Organize content clearly with headers and sections
                - Include metadata like creation date and user information
                
                Always prioritize helpful, educational content and maintain professional formatting.
                """)
			.build();
	}
	
	/**
	 * Specialized Web Search Client using Tavily MCP
	 * Sadece MCP aktifse ve ToolCallbackProvider mevcutsa oluşturulur
	 */
	@Bean("webSearchMCPClient")
	@ConditionalOnProperty(name = "mcp.integration.enabled", havingValue = "true")
	public ChatClient webSearchMCPClient(@Autowired(required = false) ToolCallbackProvider toolCallbackProvider) {
		ChatClient.Builder builder = ChatClient.builder(chatModel);
		
		if (toolCallbackProvider == null) {
			// Fallback to basic search client
			return builder
				.defaultAdvisors(new SimpleLoggerAdvisor())
				.defaultSystem("""
                    You are a web search assistant. While you don't have direct web access,
                    you can provide guidance on where to find educational resources and study materials.
                    """)
				.build();
		}
		
		return builder
			.defaultToolCallbacks(toolCallbackProvider)
			.defaultSystem("""
                You are a specialized web search assistant using Tavily search capabilities.
                Your primary function is to find educational resources and study materials.
                
                Search Guidelines:
                - Focus on educational websites, tutorials, and learning resources
                - Prioritize authoritative sources like universities, educational platforms
                - Include both free and premium resources when relevant
                - Provide clear descriptions of what each resource offers
                - Always include URLs when available
                - Limit to the most relevant and helpful results
                
                Return search results in a structured, easy-to-read format.
                """)
			.build();
	}
	
	/**
	 * Specialized File Management Client using File MCP
	 * Sadece MCP aktifse ve ToolCallbackProvider mevcutsa oluşturulur
	 */
	@Bean("fileManagerMCPClient")
	@ConditionalOnProperty(name = "mcp.integration.enabled", havingValue = "true")
	public ChatClient fileManagerMCPClient(@Autowired(required = false) ToolCallbackProvider toolCallbackProvider) {
		ChatClient.Builder builder = ChatClient.builder(chatModel);
		
		if (toolCallbackProvider == null) {
			// Fallback to basic client that can't save files
			return builder
				.defaultAdvisors(new SimpleLoggerAdvisor())
				.defaultSystem("""
                    You are a file management assistant. While you don't have direct file system access,
                    you can help format content for saving and provide file organization suggestions.
                    """)
				.build();
		}
		
		return builder
			.defaultToolCallbacks(toolCallbackProvider)
			.defaultSystem("""
                You are a file management assistant with access to local file system operations.
                
                File Operations:
                - Create well-formatted text reports and documents
                - Use clear, descriptive filenames with timestamps
                - Organize content with proper headers and sections
                - Include metadata like creation date, user, and purpose
                - Ensure files are saved in the correct directory
                - Provide confirmation of successful operations
                
                Default save location: """ + fileBasePath + """
                
                Always confirm file operations and provide full file paths in responses.
                """)
			.build();
	}
	
	/**
	 * Fallback Chat Client - MCP olmasa bile çalışır
	 */
	@Bean("fallbackMCPClient")
	public ChatClient fallbackMCPClient() {
		return ChatClient.builder(chatModel)
			.defaultAdvisors(new SimpleLoggerAdvisor())
			.defaultSystem("""
                You are an educational AI assistant. You can help with quiz analysis,
                study recommendations, and content formatting even without external tool access.
                """)
			.build();
	}
	
	// Configuration getters for other components
	public boolean isMcpIntegrationEnabled() {
		return mcpIntegrationEnabled;
	}
	
	public int getTavilyMaxResults() {
		return tavilyMaxResults;
	}
	
	public String getFileBasePath() {
		return fileBasePath;
	}
}
package com.burak.openai.controller;

import com.burak.openai.model.CountryCities;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.converter.ListOutputConverter;
import org.springframework.ai.converter.MapOutputConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class StructuredOutputController {
	private final ChatClient openAiChatClient;
	
//	public StructuredOutputController (@Qualifier("openAiChatClient") ChatClient openAiChatClient) {
//		this.openAiChatClient = openAiChatClient;
//	}
	public StructuredOutputController(ChatClient.Builder chatClientBuilder ){
		this.openAiChatClient= chatClientBuilder.build ();
	}
	
	
	
	
	@GetMapping("/chat-bean")
	public ResponseEntity<CountryCities> chatBean(@RequestParam("message") String message) {
		CountryCities countryCities = openAiChatClient
			.prompt()
			.user(message)
			.call().entity(CountryCities.class);
		return ResponseEntity.ok(countryCities);
	}
	
	@GetMapping("/chat-list")
	public ResponseEntity<List<String>> chatList(@RequestParam("message") String message) {
		List<String> countryCities = openAiChatClient
			.prompt()
			.user(message)
			.call().entity(new ListOutputConverter ());
		return ResponseEntity.ok(countryCities);
	}
	
	@GetMapping("/chat-map")
	public ResponseEntity<Map<String,Object>> chatMap(@RequestParam("message") String message) {
		Map<String, Object> countryCities = openAiChatClient
			.prompt()
			.user(message)
			.call().entity(new MapOutputConverter ());
		return ResponseEntity.ok(countryCities);
	}
	
	@GetMapping("/chat-bean-list")
	public ResponseEntity<List<CountryCities>> chatBeanList(@RequestParam("message") String message) {
		List<CountryCities> countryCities = openAiChatClient
			.prompt()
			.user(message)
			.call().entity(new ParameterizedTypeReference<List<CountryCities>> () {
			});
		return ResponseEntity.ok(countryCities);
	}

}

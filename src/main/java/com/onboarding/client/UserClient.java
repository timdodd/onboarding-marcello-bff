package com.onboarding.client;

import com.onboarding.api.UserDto;
import lombok.Setter;
import org.springframework.stereotype.Component;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.GenericType;
import java.util.List;
import java.util.UUID;

public class UserClient {

	@Setter
	private String baseUri;

	private Client client = ClientBuilder.newClient();

	public UserDto create(UserDto dto) {
		return userTarget()
				.request()
				.post(Entity.json(dto), UserDto.class);
	}

	public UserDto update(UserDto dto) {
		return userTarget(dto.getUserId())
				.request()
				.put(Entity.json(dto), UserDto.class);
	}

	public void delete(UUID userId) {
		userTarget(userId)
				.request()
				.delete(Void.class);
	}

	public UserDto get(UUID userId) {
		return userTarget(userId)
				.request()
				.get(UserDto.class);
	}

	public List<UserDto> findAll() {
		return userTarget()
				.request()
				.get(new GenericType<List<UserDto>>() {
				});
	}

	private WebTarget userTarget(UUID userId) {
		return userTarget()
				.path(userId.toString());
	}

	private WebTarget userTarget() {
		return client.target(baseUri)
				.path("api")
				.path("v1")
				.path("users");
	}
}

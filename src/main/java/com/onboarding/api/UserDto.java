package com.onboarding.api;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Accessors(chain = true)
public class UserDto {

	private UUID userId;
	private String firstName;
	private String lastName;
	private String username;
	private String email;
	//fixme when you add phones
	private List<PhoneDto> phones = new ArrayList<PhoneDto>();
}

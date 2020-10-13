package com.onboarding.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.ws.rs.BadRequestException;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;

@RestControllerAdvice
public class ApplicationControllerAdvice {

	@Autowired
	private ObjectMapper objectMapper;

	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<Object> handleValidationException(BadRequestException ex) {
		try (InputStream is = (InputStream) ex.getResponse().getEntity()) {
			return ResponseEntity.badRequest()
					.body(objectMapper.readValue(is, Object.class));
		} catch (IOException e) {
			throw new UncheckedIOException(e);
		}
	}
}

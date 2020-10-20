package com.onboarding.client;

import com.onboarding.api.PhoneDto;
import com.onboarding.api.PhoneVerificationDto;
import lombok.Setter;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.GenericType;
import java.util.List;
import java.util.UUID;


public class PhoneClient {

    @Setter
    private String baseUri;

    private Client client = ClientBuilder.newClient();

    public PhoneDto create(PhoneDto dto) {
        return phoneTarget()
                .resolveTemplate("userId", dto.getUserId())
                .request()
                .post(Entity.json(dto), PhoneDto.class);
    }

    public PhoneDto update(PhoneDto dto) {
        return phoneTarget(dto.getPhoneId())
                .resolveTemplate("userId", dto.getUserId())
                .request()
                .put(Entity.json(dto), PhoneDto.class);
    }

    public void delete(UUID phoneId, UUID userId) {
        phoneTarget(phoneId)
                .resolveTemplate("userId", userId)
                .request()
                .delete(Void.class);
    }

    public PhoneDto get(UUID phoneId, UUID userId) {
        return phoneTarget(phoneId)
                .resolveTemplate("userId", userId)
                .request()
                .get(PhoneDto.class);
    }

    public PhoneDto makePrimary(PhoneDto dto) {
        return phoneTarget()
                .path("/makePrimary")
                .path("/{phoneId}")
                .resolveTemplate("userId", dto.getUserId())
                .resolveTemplate("phoneId", dto.getPhoneId())
                .request()
                .put(Entity.json(dto), PhoneDto.class);
    }

    public void sendVerification(@RequestParam("phoneId") UUID phoneId, @RequestParam("userId") UUID userId) {
        phoneTarget(phoneId)
                .path("sendVerification")
                .resolveTemplate("phoneId", phoneId)
                .resolveTemplate("userId", userId)
                .request()
                .post(Entity.json(null));
    }

    public void verify(UUID phoneId, PhoneVerificationDto dto) {
        phoneTarget(phoneId)
                .path("verify")
                .request()
                .post(Entity.json(dto));
    }

    public List<PhoneDto> findByUserId(@PathVariable("userId") UUID userId) {
        return phoneTarget()
                .resolveTemplate("userId", userId)
                .request()
                .get(new GenericType<List<PhoneDto>>(){});
//        return baseTarget()
//                .path(userId.toString())
//                .path("phones")
//                .request()
//                .get(new GenericType<List<PhoneDto>>(){});
    }

    private WebTarget phoneTarget(UUID phoneId) {
        return phoneTarget()
                .path(phoneId.toString());
    }

    private WebTarget phoneTarget() {
        return client.target(baseUri)
                .path("api")
                .path("v1")
                .path("users")
                .path("{userId}")
                .path("phones");
    }

    private WebTarget baseTarget() {
        return client.target(baseUri)
                .path("api")
                .path("v1")
                .path("users");

    }
}

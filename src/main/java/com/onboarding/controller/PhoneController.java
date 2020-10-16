package com.onboarding.controller;

import com.onboarding.api.PhoneDto;
import com.onboarding.api.PhoneVerificationDto;
import com.onboarding.client.PhoneClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users/{userId}/phones")
public class PhoneController {

    @Autowired
    private PhoneClient phoneClient;

    @GetMapping("/{phoneId}")
    public PhoneDto get(@PathVariable("userId") UUID userId,
                        @PathVariable("phoneId") UUID phoneId) {
        return phoneClient.get(phoneId, userId);
    }

    @PostMapping()
    @ResponseStatus(HttpStatus.CREATED)
    public PhoneDto create(@RequestBody PhoneDto dto) {

        return phoneClient.create(dto);
    }

    @DeleteMapping("/{phoneId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("phoneId") UUID phoneId,
                       @PathVariable("userId") UUID userId) {
        phoneClient.delete(phoneId, userId);
    }

    @PutMapping("/{phoneId}")
    public PhoneDto update(
            @PathVariable("userId") UUID userId,
            @PathVariable("phoneId") UUID phoneId,
            @RequestBody PhoneDto dto) {

        dto.setUserId(userId).setPhoneId(phoneId);
        return phoneClient.update(dto);
    }

    @PutMapping("/makePrimary/{phoneId}")
    public PhoneDto makePrimary(@PathVariable("phoneId") UUID phoneId,
                                @PathVariable("userId") UUID userId) {

        return phoneClient.makePrimary(phoneClient.get(phoneId, userId));
    }

    @GetMapping()
    public List<PhoneDto> findByUserId(@RequestParam("userId") UUID userId) {
        return phoneClient.findByUserId(userId);
    }


    @PostMapping("/{phoneId}/sendVerification")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void sendVerification(@PathVariable("phoneId") UUID phoneId, @PathVariable("userId") UUID userId) {
        phoneClient.sendVerification(phoneId, userId);
    }

    @PostMapping("/{phoneId}/verify")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void verify(@PathVariable("phoneId") UUID phoneId, @RequestBody PhoneVerificationDto dto) {
        phoneClient.verify(phoneId, dto);
    }

//    @GetMapping("/primaryPhone")
//    public List<PhoneDto> findByPrimaryPhone(@RequestParam("userId") UUID userId) {
//        return phoneService.findByPrimaryPhone(userId);
//    }

}

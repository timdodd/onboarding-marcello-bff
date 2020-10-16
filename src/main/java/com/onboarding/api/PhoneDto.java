package com.onboarding.api;

import lombok.Data;
import lombok.experimental.Accessors;

import java.sql.Timestamp;
import java.util.UUID;

@Data
@Accessors(chain = true)
public class PhoneDto {
    private UUID phoneId;
    private UUID userId;
    private String phoneNumber;
    private boolean primary;
    private boolean verified;
    private String verificationCode;
    private Timestamp time;
}

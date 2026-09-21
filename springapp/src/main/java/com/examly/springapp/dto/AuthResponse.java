package com.examly.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String message;
    private String role;
    private String email;
    private String name;
    private String employeeId;

    public AuthResponse(String token, String message) {
        this.token = token;
        this.message = message;
    }

    public AuthResponse(String token, String message, String role, String email, String name) {
        this.token = token;
        this.message = message;
        this.role = role;
        this.email = email;
        this.name = name;
    }
}
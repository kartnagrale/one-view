package com.neml.agrianalytix.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    @GetMapping("/me")
    public Map<String,Object> me(Authentication auth) {
        var roles = auth.getAuthorities().stream().map(a -> a.getAuthority().replace("ROLE_", "")).sorted().toList();
        return Map.of("username", auth.getName(), "roles", roles, "internal", true);
    }
}

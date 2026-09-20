package com.sportx.controller;

import com.sportx.dto.*;
import com.sportx.entity.User;
import com.sportx.service.AuthService;
import com.sportx.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Tokens are stateless, so logout is handled by the browser discarding the token.
     * This endpoint exists so the frontend has a single place to call.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiMessage> logout() {
        return ResponseEntity.ok(ApiMessage.ok("Signed out"));
    }

    /** Returns the profile behind the current token — used to restore the session on page load. */
    @GetMapping("/me")
    public ResponseEntity<User> me(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiMessage> changePassword(Authentication authentication,
                                                     @RequestBody Map<String, String> body) {
        userService.changePassword(authentication.getName(),
                body.get("currentPassword"), body.get("newPassword"));
        return ResponseEntity.ok(ApiMessage.ok("Password updated"));
    }
}

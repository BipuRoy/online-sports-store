package com.sportx.controller;

import com.sportx.dto.UserProfileRequest;
import com.sportx.entity.User;
import com.sportx.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> list() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/me")
    public ResponseEntity<User> me(Authentication auth) {
        User user = userService.findByEmail(auth.getName());
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> byId(@PathVariable Long id) {
        User user = userService.findById(id);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    /** Customers update only their own profile; the path id is ignored for non-admins. */
    @PutMapping("/{id}")
    public ResponseEntity<User> update(Authentication auth, @PathVariable Long id,
                                       @Valid @RequestBody UserProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), request));
    }
}

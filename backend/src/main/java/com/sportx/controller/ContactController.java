package com.sportx.controller;

import com.sportx.dto.ApiMessage;
import com.sportx.exception.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    /**
     * Accepts a message from the Contact page. For this project the message is logged
     * rather than emailed, which keeps the demo free of external mail configuration.
     */
    @PostMapping
    public ResponseEntity<ApiMessage> submit(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String message = body.get("message");

        if (name == null || name.isBlank()) throw new BadRequestException("Name is required");
        if (email == null || !email.contains("@")) throw new BadRequestException("Enter a valid email address");
        if (message == null || message.isBlank()) throw new BadRequestException("Write a message before sending");

        System.out.println("[CONTACT] " + name + " <" + email + ">: " + message);
        return ResponseEntity.ok(ApiMessage.ok("Thanks — we'll reply within 24 hours"));
    }
}

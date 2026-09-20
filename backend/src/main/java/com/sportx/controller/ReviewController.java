package com.sportx.controller;

import com.sportx.dto.ReviewRequest;
import com.sportx.entity.Review;
import com.sportx.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<Review> create(Authentication auth, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.save(auth.getName(), request));
    }
}

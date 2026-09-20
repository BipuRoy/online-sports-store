package com.sportx.controller;

import com.sportx.dto.ApiMessage;
import com.sportx.entity.WishlistItem;
import com.sportx.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<WishlistItem>> items(Authentication auth) {
        return ResponseEntity.ok(wishlistService.items(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<WishlistItem> add(Authentication auth, @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(wishlistService.add(auth.getName(), body.get("productId")));
    }

    /** id here is the product id, so the frontend can toggle without tracking wishlist rows. */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiMessage> remove(Authentication auth, @PathVariable Long id) {
        wishlistService.remove(auth.getName(), id);
        return ResponseEntity.ok(ApiMessage.ok("Removed from wishlist"));
    }
}

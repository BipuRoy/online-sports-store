package com.sportx.controller;

import com.sportx.dto.ApiMessage;
import com.sportx.dto.CartItemRequest;
import com.sportx.dto.CartSummary;
import com.sportx.entity.CartItem;
import com.sportx.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<List<CartItem>> items(Authentication auth) {
        return ResponseEntity.ok(cartService.items(auth.getName()));
    }

    /** GET /api/cart/summary?coupon=SPORT10 — totals for the cart and checkout pages. */
    @GetMapping("/summary")
    public ResponseEntity<CartSummary> summary(Authentication auth,
                                               @RequestParam(required = false) String coupon) {
        return ResponseEntity.ok(cartService.summary(auth.getName(), coupon));
    }

    @PostMapping
    public ResponseEntity<CartItem> add(Authentication auth, @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.add(auth.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartItem> update(Authentication auth, @PathVariable Long id,
                                           @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(
                cartService.updateQuantity(auth.getName(), id, body.getOrDefault("quantity", 1)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiMessage> remove(Authentication auth, @PathVariable Long id) {
        cartService.remove(auth.getName(), id);
        return ResponseEntity.ok(ApiMessage.ok("Removed from cart"));
    }

    @DeleteMapping
    public ResponseEntity<ApiMessage> clear(Authentication auth) {
        cartService.clear(auth.getName());
        return ResponseEntity.ok(ApiMessage.ok("Cart emptied"));
    }
}

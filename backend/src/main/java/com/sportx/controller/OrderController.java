package com.sportx.controller;

import com.sportx.dto.ApiMessage;
import com.sportx.dto.OrderRequest;
import com.sportx.entity.Order;
import com.sportx.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<Order> place(Authentication auth, @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.placeOrder(auth.getName(), request));
    }

    /** A customer sees their own orders; an admin sees every order. */
    @GetMapping
    public ResponseEntity<List<Order>> list(Authentication auth) {
        boolean admin = isAdmin(auth);
        return ResponseEntity.ok(admin ? orderService.allOrders() : orderService.myOrders(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> byId(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.findForUser(id, auth.getName(), isAdmin(auth)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(orderService.updateStatus(id, body.get("status")));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancel(Authentication auth, @PathVariable Long id) {
        if (isAdmin(auth)) {
            return ResponseEntity.ok(orderService.updateStatus(id, "CANCELLED"));
        }
        return ResponseEntity.ok(orderService.cancelOwnOrder(id, auth.getName()));
    }

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
